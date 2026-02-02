import React, { useState } from "react"; // 1. Importamos useState
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  // 2. Estado para controlar si el menú está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Función para invertir el estado al hacer clic
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header 
      className="landing-header navbar-animated-bg" 
      style={{ 
        position: "relative", // Necesario para que el menú móvil se posicione bien
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "1rem 2rem"
      }}
    >
      <h1 style={{ color: "white", margin: 0, zIndex: 11, fontSize: "2rem" }}>
      <b>
        <Link to="/" >Suchus Copy & Design</Link>
      </b>
      </h1>

      {/* 3. Botón Hamburguesa (Visible solo en móvil gracias al CSS) */}
      <div className="menu-icon" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      {/* 4. Menú de Navegación */}
      {/* Si isOpen es true, agregamos la clase "active" */}
      <nav className={`navbar-links ${isOpen ? "active" : ""}`} style={{ zIndex: 10 }}>
        
        <a href="#services" onClick={() => setIsOpen(false)} style={linkStyle}>Servicios</a>
        
        <a href="#products" onClick={() => setIsOpen(false)} style={linkStyle}>Productos</a>
        
        <a href="#orders" onClick={() => setIsOpen(false)} style={linkStyle}>Pedidos</a>
        
        {/* El último sin borde derecho para escritorio */}
        <a href="#contact" onClick={() => setIsOpen(false)} style={{...linkStyle, borderRight: "none"}}>Contacto</a>
      
      </nav>
    </header>
  );
};

// Estilos base para los links (en Desktop se ven con borde, en Mobile el CSS lo quita)
const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "1.2rem",
  paddingRight: "20px",
  borderRight: "1px solid rgba(255,255,255,0.5)" // Tu separador tipo borde
};

export default Navbar;