import React, { useState, useEffect } from "react";
import { Card, Button, Input, List, Modal, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { pedidosAPI, usuariosAPI } from "../services/api";
import Navbar from "./Navbar";

const PerfilMenu = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Estado para marcar error en la contraseña actual (viniendo del backend)
  const [currentPasswordError, setCurrentPasswordError] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchPedidos(currentUser.id);
    } else {
      message.error('No hay sesión iniciada');
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const fetchPedidos = async (usuarioId) => {
    setLoadingPedidos(true);
    try {
      const data = await pedidosAPI.getAll({ usuario_id: usuarioId });
      const pedidosArray = data.results || data;
      setPedidos(Array.isArray(pedidosArray) ? pedidosArray : []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setPedidos([]);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleOk = async () => {
    // Resetear error del backend al intentar de nuevo
    setCurrentPasswordError(false);

    if (!newPassword || !confirmPassword || !currentPassword) {
      message.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const payload = {
        contraseña_actual: currentPassword,
        contraseña_nueva: newPassword,
        confirmar_contraseña: confirmPassword
      };

      await usuariosAPI.cambiarPassword(user.id, payload);
      
      message.success('Contraseña actualizada correctamente');
      setVisible(false);
      resetFields();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al actualizar';
      
      // Si el backend dice que la contraseña actual es incorrecta, activamos el rojo
      if (errorMsg.toLowerCase().includes("actual") || errorMsg.toLowerCase().includes("incorrecta")) {
        setCurrentPasswordError(true);
      }
      
      message.error(errorMsg);
    }
  };

  const resetFields = () => {
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
    setCurrentPasswordError(false);
  };

  const handleCancel = () => {
    setVisible(false);
    resetFields();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}><Spin size="large" /></div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar showLinks={false} showAuth={true} showCart={false} showBackButton={true} />
      <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, flex: 1 }}>
        
        <Card title="Perfil de Usuario" bordered>
          <p><strong>Nombre:</strong> {user.nombre}</p>
          <p><strong>Apellido:</strong> {user.apellido}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p>
            <strong>Contraseña:</strong> ********
            <Button type="link" onClick={() => setVisible(true)} style={{ marginLeft: 8 }}>
              Cambiar contraseña
            </Button>
          </p>
        </Card>

        <Modal
          title="Cambiar contraseña"
          open={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Guardar"
          cancelText="Cancelar"
        >
          {/* CAMPO CONTRASEÑA ACTUAL CON VALIDACIÓN DE BACKEND */}
          <div style={{ marginBottom: 16 }}>
            <label>Contraseña Actual:</label>
            <Input.Password
              placeholder="Tu contraseña actual"
              value={currentPassword}
              onChange={e => {
                setCurrentPassword(e.target.value);
                if(currentPasswordError) setCurrentPasswordError(false); // Limpia el rojo al escribir
              }}
              style={{ 
                marginTop: 8,
                borderColor: currentPasswordError ? '#ff4d4f' : '' 
              }}
            />
            {currentPasswordError && (
              <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: '12px' }}>
                La contraseña actual no es correcta
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label>Nueva Contraseña:</label>
            <Input.Password
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <label>Confirmar Nueva Contraseña:</label>
            <Input.Password
              placeholder="Repetir nueva contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ 
                marginTop: 8, 
                borderColor: confirmPassword && newPassword !== confirmPassword ? '#ff4d4f' : '' 
              }}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: '12px' }}>
                Las contraseñas no coinciden
              </div>
            )}
          </div>
        </Modal>

        <Card bordered style={{ marginTop: 24, textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={() => navigate('/mis-pedidos')}>
            Ver historial de pedidos
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PerfilMenu;