import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import "./Navbar.css";

// Importar imágenes
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsOpen(false);
    setUserMenuOpen(false);
    navigate("/");
    // Forzar recarga para limpiar el estado de todos los componentes
    window.location.reload();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setUserMenuOpen(false);
    setIsOpen(false);
  };

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
        
        {user ? (
          <div className="user-menu">
            <div className="user-dropdown">
              <span className="user-greeting" onClick={toggleUserMenu}>
                Hola, {user.nombre} ▼
              </span>
              {userMenuOpen && (
                <div className="dropdown-content">
                  <button onClick={() => handleNavigate('/perfil')}>
                    Ver Perfil
                  </button>
                  <button onClick={() => handleNavigate('/pedidos')}>
                    Ver Carrito
                  </button>
                  <button onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            className="login-button" 
            onClick={() => {
              setIsOpen(false);
              navigate("/login", { state: { from: window.location.pathname } });
            }}
          >
            Iniciar Sesión
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
