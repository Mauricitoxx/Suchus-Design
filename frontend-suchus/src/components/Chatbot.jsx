import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

// Lee cookie por nombre (simple util)
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Intenta obtener nombre/id probando varias claves comunes
function getUserFromCookies() {
  const name = getCookie('nombre') || getCookie('name') || getCookie('username') || 'Invitado';
  const id = getCookie('id') || getCookie('userId') || getCookie('dni') || '0';
  return { name, id };
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola 👋 ¿En qué puedo ayudarte hoy?' }
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleToggle = () => setOpen(v => !v);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    const { name, id } = getUserFromCookies();

    // Añadimos mensaje localmente
    setMessages(prev => [...prev, { from: 'user', text: messageText }]);
    setText('');
    setLoading(true);

    // Enviar al webhook externo (id, mensaje, nombre)
    const webhookUrl = 'https://primary-production-6510e.up.railway.app/webhook/chat';
    const webhookPayload = { id, message: messageText, name };

    // Mantener formato antiguo para la petición interna (si existe)
    const internalPayload = [name, id, messageText];

    console.log('Chatbot webhook payload:', webhookPayload);

    try {
      // Enviamos al webhook externo y esperamos su respuesta para usarla como principal
      let webhookReply = null;
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        });

        if (webhookRes.ok) {
          try {
            const webhookData = await webhookRes.json();

            const extractReply = (value) => {
              if (value == null) return null;
              if (typeof value === 'string') {
                // Try to parse stringified JSON
                const trimmed = value.trim();
                if ((trimmed.startsWith('{') || trimmed.startsWith('[') || (trimmed.startsWith('"') && trimmed.endsWith('"')))) {
                  try {
                    return extractReply(JSON.parse(trimmed));
                  } catch (e) {
                    // not JSON, return as-is without surrounding quotes
                    return trimmed.replace(/^"|"$/g, '');
                  }
                }
                return value.replace(/^"|"$/g, '');
              }

              if (Array.isArray(value)) {
                if (value.length === 0) return null;
                // Try first element
                const first = extractReply(value[0]);
                if (first) return first;
                // Join string elements
                const strings = value.filter(v => typeof v === 'string');
                if (strings.length) return strings.join('\n');
                return JSON.stringify(value);
              }

              if (typeof value === 'object') {
                // Common keys where text might live
                const keys = ['respondOutput', 'reply', 'message', 'response', 'output', 'text', 'body', 'result'];
                for (const k of keys) {
                  if (k in value && value[k] != null) return extractReply(value[k]);
                }
                // n8n sometimes wraps in { json: { ... } }
                if (value.json) return extractReply(value.json);
                // If object has simple string values, pick the first
                const vals = Object.values(value);
                for (const v of vals) {
                  const ex = extractReply(v);
                  if (ex) return ex;
                }
                return JSON.stringify(value);
              }

              return String(value);
            };

            webhookReply = extractReply(webhookData);
          } catch (jsonErr) {
            const text = await webhookRes.text();
            webhookReply = text ? text.replace(/^\[|\]$/g, '') : null;
          }
        } else {
          console.warn('Webhook returned non-ok status:', webhookRes.status);
        }
      } catch (webErr) {
        console.warn('Webhook POST failed:', webErr);
      }

      if (webhookReply) {
        setMessages(prev => [...prev, { from: 'bot', text: webhookReply }]);
        setLoading(false);
        return;
      }

      // Si no hubo respuesta útil del webhook, usamos el endpoint local /api/chat como respaldo
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(internalPayload)
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data?.reply || JSON.stringify(data);
        setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      } else {
        const simulated = `Respuesta automática: recibí tu mensaje "${messageText}".`;
        setTimeout(() => setMessages(prev => [...prev, { from: 'bot', text: simulated }]), 800);
      }
    } catch (err) {
      setTimeout(() => setMessages(prev => [...prev, { from: 'bot', text: 'Lo siento, no puedo contactar el servidor ahora mismo.' }]), 800);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
  };

  return (
    <div className={`chatbot-root ${open ? 'open' : ''}`}>
      <div className="chatbot-button" onClick={handleToggle} aria-label="Abrir chat">
        <img
          src="/media/unnamed.jpg"
          className="button-avatar"
          alt="chatbot"
          onLoad={(e) => console.log('Chatbot avatar loaded:', e.currentTarget.src)}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            console.warn('Chatbot avatar failed to load:', e.currentTarget.src);
          }}
        />
        <span className="chatbot-badge">1</span>
      </div>

      <div className="chatbot-window" role="dialog" aria-hidden={!open}>
        <div className="chatbot-header">
          <div className="header-left">
            <img
              src="/media/unnamed.jpg"
              className="chatbot-avatar"
              alt="chatbot"
              onLoad={(e) => console.log('Chatbot avatar loaded:', e.currentTarget.src)}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.warn('Chatbot avatar failed to load:', e.currentTarget.src);
              }}
            />
            <strong>Asistente Virtual</strong>
          </div>
          <button className="chatbot-close" onClick={handleToggle} aria-label="Cerrar">✕</button>
        </div>

        <div className="chatbot-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from === 'user' ? 'user' : 'bot'}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot">
              <div className="bubble typing">Escribiendo…</div>
            </div>
          )}
        </div>

        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input
            placeholder="Escribí tu mensaje..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Mensaje"
          />
          <button type="submit" className="send-btn">➤</button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
