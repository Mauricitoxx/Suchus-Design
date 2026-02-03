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

    // Payload solicitado: ["Nombre", "ID", "Mensaje"]
    const payload = [name, id, messageText];

    // Log payload para depuración (ver estructura que se envía)
    console.log('Chatbot payload:', payload);

    try {
      // Intentamos enviar al endpoint /api/chat (ajusta según tu backend)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        // Espera que el backend devuelva { reply: '...' } o similar
        const reply = data?.reply || JSON.stringify(data);
        setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      } else {
        // Si no hay backend o falla, simulamos una respuesta tras esperar
        const simulated = `Respuesta automática: recibí tu mensaje \"${messageText}\".`;
        setTimeout(() => setMessages(prev => [...prev, { from: 'bot', text: simulated }]), 800);
      }
    } catch (err) {
      // En caso de error de red devolvemos respuesta simulada
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
