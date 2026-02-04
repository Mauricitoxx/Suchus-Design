import React, { useState, useEffect } from "react";
import "../assets/style/Home.css";
import { Link, useNavigate } from "react-router-dom";
import CardImpresion from "../components/CardImpresion";
import CardProducto from "../components/CardProducto";
import Navbar from "./Navbar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar con carrito y menú de usuario */}
      <Navbar showLinks={false} showAuth={true} showCart={true} />

      {/* Contenido */}
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
