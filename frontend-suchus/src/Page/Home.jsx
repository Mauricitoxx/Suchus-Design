import React, { useEffect } from "react";
import "../assets/style/Home.css";
import { useNavigate } from "react-router-dom";
import { message } from "antd"; // Importamos message para notificaciones visuales
import CardImpresion from "../components/CardImpresion";
import CardProducto from "../components/CardProducto";
import Navbar from "./Navbar";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extraemos los parámetros que Mercado Pago envía en la URL al volver
    const query = new URLSearchParams(window.location.search);
    const status = query.get("status");
    const paymentId = query.get("payment_id");

    // 2. Lógica según el estado del pago
    if (status === "approved") {
      // El pago fue exitoso: Limpiamos el carrito del almacenamiento local
      localStorage.removeItem("carrito");
      
      // Mostramos una notificación al usuario
      message.success(`¡Pago aprobado! ID de operación: ${paymentId}`);
      
      // Limpiamos los parámetros de la URL para que se vea: http://localhost:5173/
      navigate("/", { replace: true });
    } 
    
    else if (status === "failure") {
      message.error("El pago ha fallado o fue cancelado. Intenta nuevamente.");
      navigate("/", { replace: true });
    }

    else if (status === "pending") {
      message.warning("Tu pago está pendiente de acreditación.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar configurado para mostrar carrito y autenticación */}
      <Navbar showLinks={false} showAuth={true} showCart={true} />

      {/* Contenido Principal */}
      <section className="home-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '40px 20px',
        flex: 1,
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2>Selecciona una opción del menú</h2>
        <CardImpresion />
        <CardProducto />
      </section>

      {/* Footer / Pie de página */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="contact-info">
            <h3>Contacto</h3>
            <p>Email: contacto@suchusdesign.com</p>
            <p>Teléfono: +1 234 567 890</p>
            <p>Dirección: Calle Ficticia 123, Ciudad, País</p>
          </div>
          <div className="social-media">
            <h3>Síguenos</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          <p>&copy; {new Date().getFullYear()} Suchus Design. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;