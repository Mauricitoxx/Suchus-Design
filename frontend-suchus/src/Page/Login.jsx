import React, { useState } from "react";
import { Card, Input, Button, Alert } from 'antd';
import { MailOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';
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
    e.stopPropagation();
    
    console.log('Iniciando login con:', email);
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log('Login exitoso:', data);
      
      // Si viene de la landing (/) o no tiene estado previo, quedarse en landing
      // Si viene de cualquier otro lado, ir a home
      const from = location.state?.from;
      if (from === '/' || !from) {
        navigate('/');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(typeof err === 'string' ? err : err.detail || err.message || 'Error al iniciar sesión. Verifica tus credenciales')
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

            <div style={{ marginBottom: '12px' }}>
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

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Button 
                type="link" 
                style={{ padding: 0, color: '#1890ff' }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
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
                fontWeight: 'bold'
              }}
            >
              Crear una cuenta nueva
            </Button>
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