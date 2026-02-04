import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

// Importar imágenes
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="landing-header navbar-animated-bg">
      {/* Contenedor para LOGO y NOMBRE juntos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src={logo} alt="Logo Suchus" className="logo" />
        <img src={brand} alt="Suchus Copy & Design" className="navbar-brand" />
      </div>

      {/* Botón Hamburguesa */}
      <div className="menu-icon" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      {/* Menú de Navegación */}
      <nav className={`navbar-links ${isOpen ? "active" : ""}`}>
        <a href="#services" onClick={() => setIsOpen(false)}>Servicios</a>
        <a href="#products" onClick={() => setIsOpen(false)}>Productos</a>
        <a href="#orders" onClick={() => setIsOpen(false)}>Pedidos</a>
        <a href="#contact" onClick={() => setIsOpen(false)}>Contacto</a>
        <button 
          className="login-button" 
          onClick={() => {
            setIsOpen(false);
            navigate("/login");
          }}
        >
          Iniciar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
