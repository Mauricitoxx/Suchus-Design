import React from "react";
import "./Register.css";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <>
            <div className="header">
                <h1>
                    <Link to="/" className="header-link">Suchus Copy & Design</Link>
                </h1>
            </div>
            <div className="register-container">
                <h2>Registrarse</h2>
                <div className="formulario">
                    <form>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input type="text" id="nombre" placeholder="Ingrese su nombre"></input>
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido</label>
                                <input type="text" id="apellido" placeholder="Ingrese su apellido"></input>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" placeholder="Ingrese su correo electrónico"></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="telefono">Telefono</label>
                            <input type="tel" id="telefono" placeholder="Ingrese su número de teléfono"></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input type="password" id="password" placeholder="Cree una contraseña"></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirme su contraseña</label>
                            <input type="password" id="confirmPassword" placeholder="Confirme su contraseña"></input>
                        </div>
                        <button type="submit" className="btn-register">Crear Cuenta</button>
                    </form>
                </div>
            </div>
            <footer className="footer">
                <p>© 2025 Suchus Copy & Design. Todos los derechos reservados.</p>
            </footer>
        </>
    )
}

export default Register;