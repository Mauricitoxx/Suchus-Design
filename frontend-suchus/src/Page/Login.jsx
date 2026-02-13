import React, { useState } from "react";
import { Card, Input, Button, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserAddOutlined, WhatsAppOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../services/auth";
import Navbar from "./Navbar";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      
      // Extraemos el usuario que devuelve el servicio
      const user = data.user;

      // REDIRECCIÓN SEGÚN ROL
      // Usamos 'tipo' que es como viene en tu objeto de consola
      if (user?.tipo === 'Admin') {
        navigate('/admin');
      } else {
        // Si es Cliente o cualquier otro, va a /home o de donde venía
        const from = location.state?.from || '/home';
        // Evitamos que 'from' sea la landing si queremos forzar /home
        navigate(from === '/' ? '/home' : from);
      }

    } catch (err) {
      console.error('Error en login:', err);
      setError(typeof err === 'string' ? err : err.detail || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9f9f9', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Navbar sin links ni auth */}
      <Navbar showLinks={false} showAuth={false} />

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: '450px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '28px', 
            marginBottom: '10px',
            color: '#333'
          }}>
            Iniciar Sesión
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '30px' 
          }}>
            Ingresá a tu cuenta para continuar
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <Alert 
                message={error} 
                type="error" 
                showIcon 
                style={{ marginBottom: '20px' }}
                closable
                onClose={() => setError('')}
              />
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333',
                fontWeight: '500'
              }}>
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                prefix={<MailOutlined style={{ color: '#999' }} />}
                size="large"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333',
                fontWeight: '500'
              }}>
                Contraseña
              </label>
              <Input.Password
                placeholder="Tu contraseña"
                prefix={<LockOutlined style={{ color: '#999' }} />}
                size="large"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ 
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                height: '45px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>

            <div style={{ 
              textAlign: 'center', 
              margin: '20px 0',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                height: '1px', 
                backgroundColor: '#e0e0e0' 
              }}></div>
              <span style={{ 
                position: 'relative', 
                backgroundColor: 'white', 
                padding: '0 15px',
                color: '#999',
                fontSize: '14px'
              }}>
                o
              </span>
            </div>

            <Button
              type="default"
              size="large"
              block
              icon={<UserAddOutlined />}
              onClick={handleRegisterClick}
              style={{ 
                height: '45px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '24px'
              }}
            >
              Crear una cuenta nueva
            </Button>

            {/* Información de recuperación de contraseña */}
            <div style={{
              backgroundColor: '#f0f7ff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #d6e4ff',
              marginTop: '20px'
            }}>
              <p style={{
                margin: '0 0 12px 0',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                ¿Olvidó su contraseña? Contáctese con un administrador
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <a 
                  href="mailto:contacto@suchuscopy.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1890ff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <MailOutlined />
                  Email
                </a>
                
                <a 
                  href="https://wa.me/5492215410023"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#25D366',
                    textDecoration: 'none',
                    fontSize: '13px',
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <WhatsAppOutlined />
                  WhatsApp
                </a>
                
                <a 
                  href="tel:5492215410023"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1890ff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    padding: '6px 12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <PhoneOutlined />
                  Teléfono
                </a>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        textAlign: 'center', 
        padding: '20px',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0 }}>
          © 2025 Suchus Copy & Design. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Login;