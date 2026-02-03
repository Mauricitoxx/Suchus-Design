import React from "react";
import "../assets/style/Home.css";
import { Link } from "react-router-dom";
import CardImpresion from "../components/CardImpresion";
import CardProducto from "../components/CardProducto";

// imágenes
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-inner">
          <img src={logo} alt="Logo Suchus" className="logo" />
          <img src={brand} alt="Suchus Copy and Design" className="brand" />
        </div>
      </header>

      {/* Menú de navegación */}
      <nav className="home-menu">
        <ul>
          <li><Link to="/perfil">Perfil</Link></li>
          <li><Link to="/servicios">Servicios</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
          <li><Link to="/">Cerrar sesión</Link></li>
        </ul>
      </nav>

      {/* Contenido */}
      <section className="home-content">
        <h2>Selecciona una opción del menú</h2>
        <CardImpresion />
        <CardProducto />
      </section>

      {/* Footer */}
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
            <ul>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} Suchus Design. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;
