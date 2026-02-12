import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { ShoppingCartOutlined } from '@ant-design/icons';
import "./Navbar.css";

// Importar imágenes
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Navbar = ({ showLinks = true, showAuth = true, showCart = false, showBackButton = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const navigate = useNavigate();
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (showCart) {
      actualizarCantidadCarrito();
      // Escuchar cambios en localStorage
      window.addEventListener("storage", actualizarCantidadCarrito);
      // Evento personalizado para actualizar desde el mismo componente
      window.addEventListener("carritoActualizado", actualizarCantidadCarrito);
      return () => {
        window.removeEventListener("storage", actualizarCantidadCarrito);
        window.removeEventListener("carritoActualizado", actualizarCantidadCarrito);
      };
    }
  }, [showCart]);

  const actualizarCantidadCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    setCantidadCarrito(total);
  };

  const handleLogout = async () => { // <--- Agregamos async
    try {
      // 1. Esperamos a que el servicio borre las cookies y avise al backend
      await authService.logout(); 
      
      // 2. Limpiamos estados locales
      setUser(null);
      setIsOpen(false);
      setUserMenuOpen(false);
      
      // 3. Redirección forzada
      // Usar window.location.href es mejor que navigate + reload 
      // porque garantiza que el ciclo de vida de React se detenga por completo.
      window.location.href = "/"; 
    } catch (error) {
      console.error("Error en el proceso de logout:", error);
      // En caso de error, igual forzamos la salida
      window.location.href = "/";
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setUserMenuOpen(false);
    setIsOpen(false);
  };

  return (
    <header className="landing-header navbar-animated-bg">
      {/* Contenedor para LOGO y NOMBRE juntos - clickeable para volver al inicio */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="Logo Suchus" className="logo" />
        <img src={brand} alt="Suchus Copy & Design" className="navbar-brand" />
      </div>

      {/* Botón Hamburguesa - solo si hay links */}
      {showLinks && (
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      )}
      
      {/* Menú de Navegación - solo si hay links o auth */}
      {(showLinks || showAuth || (!showLinks && !showAuth)) && (
        <nav className={`navbar-links ${isOpen ? "active" : ""}`}>
          {/* Si no hay links, mostrar solo "Inicio" */}
          {!showLinks && (
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Inicio</a>
          )}
          
          {showLinks && (
            <>
              <a href="#services" onClick={() => setIsOpen(false)}>Servicios</a>
              <a href="#products" onClick={() => setIsOpen(false)}>Productos</a>
              <a href="#orders" onClick={() => setIsOpen(false)}>Pedidos</a>
              <a href="#contact" onClick={() => setIsOpen(false)}>Contacto</a>
            </>
          )}
          
          {/* Ícono del carrito */}
          {showCart && (
            <div
              className="cart-icon"
              onClick={() => navigate('/pedidos')}
              style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 20px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <ShoppingCartOutlined style={{ fontSize: '22px', color: '#fff' }} />
              {cantidadCarrito > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '8px',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {cantidadCarrito}
                </span>
              )}
            </div>
          )}

          {/* Botón Atrás */}
          {showBackButton && (
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate(-1); 
              }}
              style={{
                color: 'white',
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '0 18px 0 5px',
                transition: 'opacity 0.3s',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.7'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Atrás
            </a>
          )}
          
          {showAuth && (
            user ? (
              <div className="user-menu">
                <div className="user-dropdown">
                  <span className="user-greeting" onClick={toggleUserMenu}>
                    Hola, {user.nombre} ▼
                  </span>
                  {userMenuOpen && (
                    <div className="dropdown-content">
                      {/* --- NUEVO BOTÓN: SOLO PARA ADMINS --- */}
                      {user?.tipo === 'Admin' && (
                        <button 
                          onClick={() => handleNavigate('/admin')}
                          style={{ color: '#1890ff', fontWeight: 'bold', borderBottom: '1px solid #eee' }}
                        >
                          Panel de Control
                        </button>
                      )}
                      {/* -------------------------------------- */}
                      <button onClick={() => handleNavigate('/mis-pedidos')}>Ver Pedidos</button>
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
            )
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
