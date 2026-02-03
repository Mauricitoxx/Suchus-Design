import React, { useState } from "react"; // 1. Importamos useState
import "./Navbar.css";
import { Link } from "react-router-dom";

// Importar imágenes
import logo from "../../media/logo.png";  // Corazón o logo pequeño
import brand from "../../media/nombre.png"; // Nombre grande

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header 
      className="landing-header navbar-animated-bg" 
      style={{ 
        position: "relative",
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "1rem 2rem"
      }}
    >
      {/* LOGO */}
      <img src={logo} alt="Logo Suchus" className="logo" />

      {/* NOMBRE */}
      <img src={brand} alt="Suchus Copy & Design" className="brand" />

      {/* Botón Hamburguesa */}
      <div className="menu-icon" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      {/* Menú de Navegación */}
      <nav className={`navbar-links ${isOpen ? "active" : ""}`} style={{ zIndex: 10 }}>
        <a href="#services" onClick={() => setIsOpen(false)} style={linkStyle}>Servicios</a>
        <a href="#products" onClick={() => setIsOpen(false)} style={linkStyle}>Productos</a>
        <a href="#orders" onClick={() => setIsOpen(false)} style={linkStyle}>Pedidos</a>
        <a href="#contact" onClick={() => setIsOpen(false)} style={{...linkStyle, borderRight: "none"}}>Contacto</a>
      </nav>
    </header>
  );
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "1.2rem",
  paddingRight: "20px",
  borderRight: "1px solid rgba(255,255,255,0.5)"
};

export default Navbar;
