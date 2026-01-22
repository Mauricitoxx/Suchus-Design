import React, { useState } from "react";
import '../assets/style/Login.css';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Iniciando login con:', email);
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log('Login exitoso:', data);
      navigate('/home');
    } catch (err) {
      console.error('Error en login:', err);
      setError(typeof err === 'string' ? err : err.detail || err.message || 'Error al iniciar sesión. Verifica tus credenciales')
    } finally {
      setLoading(false);
    }
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
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                            <div className="form-group">
                                <label htmlFor="email">Correo electronico</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="Ingrese su correo"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Contraseña</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Ingrese su contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="forgot-password">
                                <button type="button" className="btn-forgot-password">Olvidaste tu contraseña?</button>
                            </div>
                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                            </button>
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