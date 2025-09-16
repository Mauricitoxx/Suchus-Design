import React from "react";
import "./Home.css";
import { Link } from "react-router-dom"; // Si usas React Router

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
      </header>
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
            <Link to="/">Cerrar sesión</Link>
          </li>
        </ul>
      </nav>
      <section className="home-content">
        <h2>Selecciona una opción del menú</h2>
      </section>
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Suchus Design. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;