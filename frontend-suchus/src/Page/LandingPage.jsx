import React from "react";
import Navbar from "./Navbar";
import Chatbot from "../components/Chatbot";
import ProductoLanding from "../components/ProductoLanding";
import "../assets/style/LandingPage.css";
import imagen1 from "./ImagenFondo1.jpg"; // Asegúrate que la ruta es correcta (case-sensitive for deployment)

const LandingPage = () => {
  return (
    // Quitamos los estilos globales que pusimos antes en el contenedor principal
    <div className="landing-container">
      <Navbar />

      {/* --- HERO SECTION MODIFICADA --- */}
      {/* 1. Le damos posición relativa para contener la imagen de fondo */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* 2. DIV "OVERLAY" PARA LA IMAGEN DE FONDO */}
        {/* Este div se posiciona absolutamente detrás del texto solo en esta sección */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${imagen1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Aplicamos el desenfoque y oscurecimiento
            filter: 'blur(6px) brightness(0.3)',
            // Escalamos un poco para evitar bordes blancos por el blur
            transform: 'scale(1.1)',
            // Lo mandamos al fondo de la sección
            zIndex: 0
          }}
        />

        {/* 3. EL CONTENIDO DE TEXTO */}
        {/* Es importante ponerle posición relativa y zIndex mayor para que quede SOBRE la imagen */}
<div 
  className="hero-text" 
  style={{ 
    position: 'relative', 
    zIndex: 1, 
    color: 'white',
    // Estas 3 líneas hacen la magia del centrado perfecto:
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, 7%)', 
    // Esto centra el texto dentro del bloque:
    textAlign: 'center',
    width: '100%',
    padding: '0 20px' // Para que no pegue a los bordes en celulares
  }}
>
  <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '20px' }}>
    Impresión y Servicios de Papelería de Calidad
  </h2>
  <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
    Gestioná tus pedidos de forma rápida y segura desde nuestra web.
    <br /> {/* Salto de línea opcional para que se vea mejor */}
    Archivos, impresiones, productos y más, todo en un solo lugar.
  </p>
  <a href="#orders" className="btn-primary">Realizar Pedido</a>
</div>
        {/* Ya no necesitamos el div "hero-image" antiguo aquí */}

      </section>

      {/* --- El resto de secciones vuelven a tener su fondo normal --- */}

      {/* Services Section */}
      <section id="services" className="services-section">
        <h2>Nuestros Servicios</h2>
        <div className="services-cards">
          <div className="card">
            <h3>Impresión</h3>
            <p>Blanco y negro, color, tamaños y formatos diversos.</p>
          </div>
          <div className="card">
            <h3>Escaneo y Digitalización</h3>
            <p>Transformá tus documentos físicos en digitales con facilidad.</p>
          </div>
          <div className="card">
            <h3>Plastificado y Encuadernado</h3>
            <p>Protegé y presentá tus trabajos de forma profesional.</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductoLanding />

      {/* Orders Section */}
      <section id="orders" className="orders-section">
        <h2>Realizá tu Pedido</h2>
        <p>Registrate y subí tus archivos o seleccioná los productos que necesites.</p>
        <a href="/Login" className="btn-secondary">Iniciar Sesión / Registrarse</a>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contacto</h2>
        <p>¿Consultas rápidas? Hablá con nuestro asistente virtual o contactanos directamente.</p>
        <div className="contact-methods">
          <p>Email: contacto@suchuscopy.com</p>
          <p>WhatsApp: +54 9 221 123-4567</p>
          <p>Teléfono: 221-123-4567</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 Suchus Copy & Design. Todos los derechos reservados.</p>
      </footer>

      {/* Chatbot */}
      {/* Componente flotante para chat */}
      <Chatbot />
    </div>
  );
};

export default LandingPage;