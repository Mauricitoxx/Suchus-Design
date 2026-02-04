import React, { useState, useEffect } from "react";
import { Card, Button, Input, List, Modal, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { pedidosAPI } from "../services/api";
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

  useEffect(() => {
    // Obtener datos del usuario al cargar el componente
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
      message.error('Error al cargar el historial de pedidos');
      setPedidos([]);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleChangePassword = () => {
    setVisible(true);
  };

  const handleOk = () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      message.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      message.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Aquí iría la lógica real para cambiar la contraseña
    message.success('Contraseña actualizada correctamente');
    setVisible(false);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
  };

  const handleCancel = () => {
    setVisible(false);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          <Button type="link" onClick={handleChangePassword} style={{ marginLeft: 8 }}>
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
        <div style={{ marginBottom: 16 }}>
          <label>Contraseña Actual:</label>
          <Input.Password
            placeholder="Tu contraseña actual"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            style={{ marginTop: 8 }}
          />
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
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>

      <Card title="Historial de pedidos" bordered style={{ marginTop: 24 }}>
        <Spin spinning={loadingPedidos}>
          {pedidos.length > 0 ? (
            <List
              dataSource={pedidos}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={`Pedido #${item.id}`}
                    description={`Fecha: ${new Date(item.created_at || item.fecha_pedido).toLocaleDateString('es-AR')} | Estado: ${item.estado}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              No hay pedidos en tu historial
            </p>
          )}
        </Spin>
      </Card>
    </div>
    </div>
  );
};

export default PerfilMenu;