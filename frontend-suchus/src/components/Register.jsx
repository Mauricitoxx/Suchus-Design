import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        if (error) setError("");
    };

    const handleSubmit= async (e) => {
        e.preventDefault();
        setError("");

        // Validaciones
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
            setError("Por favor completa todos los campos obligatorios");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            await authService.register({
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                password: formData.password,
                telefono: formData.telefono
            });

            // Registro exitoso - redirigir al login
            alert("Cuenta creada exitosamente. Por favor inicia sesión.");
            navigate("/login");
        } catch (err) {
            console.error("Error al registrar:", err);
            // Mostrar mensaje de error específico
            if (err.email) {
                setError(err.email[0]);
            } else if (err.contraseña) {
                setError(err.contraseña[0]);
            } else if (err.detail) {
                setError(err.detail);
            } else {
                setError("Error al crear la cuenta. Intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

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
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                color: "red",
                                marginBottom: "15px",
                                padding: "10px",
                                backgroundColor: "#ffe6e6",
                                borderRadius: "5px"
                            }}>
                                {error}
                            </div>
                        )}
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre *</label>
                                <input 
                                    type="text" 
                                    id="nombre" 
                                    placeholder="Ingrese su nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido *</label>
                                <input 
                                    type="text" 
                                    id="apellido" 
                                    placeholder="Ingrese su apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="Ingrese su correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input 
                                type="tel" 
                                id="telefono" 
                                placeholder="Ingrese su número de teléfono"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Contraseña *</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Cree una contraseña (mín. 6 caracteres)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirme su contraseña *</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                placeholder="Confirme su contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn-register"
                            disabled={loading}
                        >
                            {loading ? "Creando cuenta..." : "Crear Cuenta"}
                        </button>
                        
                        <p style={{ marginTop: "15px", textAlign: "center" }}>
                            ¿Ya tienes cuenta? <Link to="/login" style={{ color: "#007bff" }}>Inicia sesión</Link>
                        </p>
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