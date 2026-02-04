import React, { useState, useEffect } from "react";
import "../assets/style/Home.css";
import { Link, useNavigate } from "react-router-dom";
import CardImpresion from "../components/CardImpresion";
import CardProducto from "../components/CardProducto";
import authService from "../services/auth";
import { FileTextOutlined, ShoppingOutlined } from '@ant-design/icons';

// imágenes
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Home = () => {
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  useEffect(() => {
    actualizarCantidadCarrito();

    // Escuchar cambios en localStorage para actualizar cantidad al agregar productos
    window.addEventListener("storage", actualizarCantidadCarrito);
    return () => {
      window.removeEventListener("storage", actualizarCantidadCarrito);
    };
  }, []);

  const actualizarCantidadCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    setCantidadCarrito(total);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

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
          <li>
            <Link to="/perfil">Perfil</Link>
          </li>
          <li>
            <Link to="/servicios">Servicios</Link>
          </li>
          <li>
            <Link to="/contacto">Contacto</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </li>
          {/* Icono de pedidos/carrito */}
          <li
            className="menu-list-icon"
            onClick={() => navigate('/pedidos')}
            style={{
              display: 'inline-block',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              marginLeft: '100px',
              position: 'relative'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FileTextOutlined style={{ fontSize: '22px', color: '#fff' }} />
            {cantidadCarrito > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '12px'
                }}
              >
                {cantidadCarrito}
              </span>
            )}
          </li>
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
