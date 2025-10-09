// LandingPage.jsx
import React from "react";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <h1>Suchus Copy & Design</h1>
        <nav>
          <a href="#services">Servicios</a>
          <a href="#products">Productos</a>
          <a href="#orders">Pedidos</a>
          <a href="#contact">Contacto</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h2>Impresión y Servicios de Papelería de Calidad</h2>
          <p>
            Gestioná tus pedidos de forma rápida y segura desde nuestra web.
            Archivos, impresiones, productos y más, todo en un solo lugar.
          </p>
          <a href="#orders" className="btn-primary">Realizar Pedido</a>
        </div>
        <div className="hero-image">
          <img src="https://cdn11.bigcommerce.com/s-ydriczk/images/stencil/1500x1500/products/90847/101604/Cartman-mooning-South-Park-Lifesize-Cardboard-Cutout-buy-now-at-starstills__01937.1750329558.jpg?c=2" alt="Impresión de documentos"/>
        </div>
      </section>

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
      <section id="products" className="products-section">
        <h2>Productos Disponibles</h2>
        <ul>
          <li>Hojas y sobres</li>
          <li>Carpetas y archivadores</li>
          <li>Materiales gráficos</li>
        </ul>
      </section>

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
    </div>
  );
};

export default LandingPage;
