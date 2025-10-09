import React, { useState } from "react";
import '../assets/style/Login.css';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { useNavigate } from "react-router-dom"; // 👈 Importar navegación

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate(); // 👈 Hook de react-router-dom

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita refresco de la página
    // Aquí podrías validar el login si quieres
    navigate("/home"); // 👈 Redirige a /home
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Suchus Design</h2>

        <div>
          <label>Email:</label>
          <input type="email" required />
        </div>

        <div className="password-wrapper">
          <label>Contraseña:</label>
          <Input.Password
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            required
          />
        </div>

        <Button className="submit" type="primary" htmlType="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
