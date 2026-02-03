import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Input, Modal, message, Spin } from "antd";
import { UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";

const Admin = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener datos del usuario al cargar el componente
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      message.error('No hay sesión iniciada');
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

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
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
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

      <Card title="Panel de Administración" bordered style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => navigate("/admin/usuarios")}
              style={{ textAlign: "center", height: "100%" }}
            >
              <UserOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
              <h3>Gestión de Usuarios</h3>
              <p>Administra usuarios, permisos y accesos</p>
              <Button type="primary" size="large" style={{ marginTop: 16 }}>
                Ir a Usuarios
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => navigate("/admin/productos")}
              style={{ textAlign: "center", height: "100%" }}
            >
              <ShoppingOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
              <h3>Gestión de Productos</h3>
              <p>Administra productos, precios y stock</p>
              <Button type="primary" size="large" style={{ marginTop: 16 }}>
                Ir a Productos
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Admin;
