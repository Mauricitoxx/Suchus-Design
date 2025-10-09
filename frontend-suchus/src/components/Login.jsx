import React from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom"

const Login = () => {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <>
            <div className="login-page">
                <div className="header">
                    <h1>
                        <Link to="/" className="header-link">Suchus Copy & Design</Link>
                    </h1>
                </div>
                <div className="login-container">
                    <h2>Iniciar Sesión</h2>
                    <div className="formulario">
                        <form>
                            <div className="form-group">
                                <label htmlFor="email">Correo electronico</label>
                                <input type="email" id="email" placeholder="Ingrese su correo"></input>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input type="password" id="password" placeholder="Ingrese su contraseña"></input>
                            </div>
                            <div className="forgot-password">
                                <button type="button" className="btn-forgot-password">Olvidaste tu contraseña?</button>
                            </div>
                            <button type="submit" className="btn-login">Iniciar Sesión</button>
                            <div className="divider">
                                <span>o</span>
                            </div>
                            <button type="button" className="btn-register" onClick={handleRegisterClick}>Registrarse</button>
                        </form>
                    </div>
                </div>
                <footer className="footer">
                    <p>© 2025 Suchus Copy & Design. Todos los derechos reservados.</p>
                </footer>
            </div>
        </>
    )
}

export default Login;