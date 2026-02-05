import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Input, Modal, message, Spin } from "antd";
import { 
  UserOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined, 
  FileTextOutlined, 
  PercentageOutlined 
} from "@ant-design/icons";
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

  // Estilo común para alinear botones al fondo
  const cardStyle = {
    textAlign: "center",
    height: "100%",
    display: 'flex',
    flexDirection: 'column'
  };

  const cardBodyStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px'
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/")} 
          style={{ fontSize: '20px', marginRight: 12 }}
        />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Panel Administrativo</h1>
      </div>
      
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

      <Card title="Panel de Administración" bordered style={{ marginTop: 24 }}>
        <Row gutter={[24, 24]}>
          
          {/* Usuarios */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate("/admin/usuarios")}
              style={cardStyle}
              bodyStyle={cardBodyStyle}
            >
              <div>
                <UserOutlined style={{ fontSize: 50, color: "#1890ff", marginBottom: 16 }} />
                <h3>Usuarios</h3>
                <p>Administra usuarios y permisos</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16 }}>
                Gestionar
              </Button>
            </Card>
          </Col>

          {/* Productos */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate("/admin/productos")}
              style={cardStyle}
              bodyStyle={cardBodyStyle}
            >
              <div>
                <ShoppingOutlined style={{ fontSize: 50, color: "#52c41a", marginBottom: 16 }} />
                <h3>Productos</h3>
                <p>Administra precios y stock</p>
              </div>
              <Button 
                type="primary" 
                block 
                size="large"
                style={{ marginTop: 16, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Gestionar
              </Button>
            </Card>
          </Col>

          {/* Pedidos */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate("/admin/pedidos")}
              style={cardStyle}
              bodyStyle={cardBodyStyle}
            >
              <div>
                <FileTextOutlined style={{ fontSize: 50, color: "#faad14", marginBottom: 16 }} />
                <h3>Pedidos</h3>
                <p>Control de ventas y estados</p>
              </div>
              <Button 
                type="primary" 
                block 
                size="large"
                style={{ marginTop: 16, backgroundColor: '#faad14', borderColor: '#faad14' }}
              >
                Gestionar
              </Button>
            </Card>
          </Col>

          {/* Gestión de Descuentos (NUEVO) */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              onClick={() => navigate("/admin/descuentos")}
              style={cardStyle}
              bodyStyle={cardBodyStyle}
            >
              <div>
                <PercentageOutlined style={{ fontSize: 50, color: "#eb2f96", marginBottom: 16 }} />
                <h3>Descuentos</h3>
                <p>Configura beneficios por tipo de usuario</p>
              </div>
              <Button 
                type="primary" 
                block 
                size="large"
                style={{ marginTop: 16, backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}
              >
                Gestionar
              </Button>
            </Card>
          </Col>
          
        </Row>
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
    </div>
  );
};

export default Admin;