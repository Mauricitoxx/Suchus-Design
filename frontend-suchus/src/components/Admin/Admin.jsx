import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Input, Modal, message, Spin, Form } from "antd";
import { 
  UserOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined, 
  FileTextOutlined, 
  PercentageOutlined,
  BarChartOutlined,
  PrinterOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth";
import { usuariosAPI } from "../../services/api";

const Admin = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado para marcar error en la contraseña actual (Backend)
  const [currentPasswordError, setCurrentPasswordError] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log("DEBUG - Usuario cargado en Admin:", currentUser);
    
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

  const handleCancel = () => {
    setVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPasswordError(false);
  };

  const handleOk = async () => {
    console.log("--- Iniciando proceso de cambio de contraseña ---");
    setCurrentPasswordError(false);

    // 1. Validaciones básicas
    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error('Por favor completa todos los campos');
      return;
    }

    // 2. VALIDACIÓN DE COINCIDENCIA (Frontend)
    if (newPassword !== confirmPassword) {
      console.error("BLOQUEADO: Las contraseñas nuevas no coinciden.");
      message.error('Las contraseñas no coinciden. Verificá los campos en rojo.');
      return; 
    }

    if (newPassword.length < 6) {
      message.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const payload = {
        contraseña_actual: currentPassword,
        contraseña_nueva: newPassword,
        confirmar_contraseña: confirmPassword
      };

      console.log("Enviando al backend para ID:", user.id, payload);
      
      const response = await usuariosAPI.cambiarPassword(user.id, payload);
      
      console.log("¡Éxito! Contraseña actualizada.");
      message.success(response.mensaje || 'Contraseña actualizada correctamente');
      handleCancel();
    } catch (error) {
      console.error("DEBUG - Error 400 u otro del servidor:", error.response?.data);
      
      const errorData = error.response?.data || {};
      const msg = errorData.error || 'Error: La contraseña actual es incorrecta';
      
      // Si el error es de la contraseña actual, activamos el rojo
      if (msg.toLowerCase().includes("actual") || msg.toLowerCase().includes("incorrecta")) {
        setCurrentPasswordError(true);
      }
      
      message.error(msg);
    }
  };

  // Función para determinar si mostrar error en rojo en el input de confirmación
  const getConfirmValidationStatus = () => {
    if (confirmPassword.length > 0 && confirmPassword !== newPassword) {
      return {
        validateStatus: 'error',
        help: 'Las contraseñas no coinciden'
      };
    }
    if (confirmPassword.length > 0 && confirmPassword === newPassword) {
      return { validateStatus: 'success' };
    }
    return {};
  };

  // Función para el estado de la contraseña actual (viniendo del backend)
  const getCurrentValidationStatus = () => {
    if (currentPasswordError) {
      return {
        validateStatus: 'error',
        help: 'La contraseña actual es incorrecta'
      };
    }
    return {};
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;

  const cardStyle = { textAlign: "center", height: "100%", display: 'flex', flexDirection: 'column' };
  const cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' };

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
          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/usuarios")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <UserOutlined style={{ fontSize: 50, color: "#1890ff", marginBottom: 16 }} />
                <h3>Usuarios</h3>
                <p>Administra usuarios y permisos</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16 }}>Gestionar</Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/productos")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <ShoppingOutlined style={{ fontSize: 50, color: "#52c41a", marginBottom: 16 }} />
                <h3>Productos</h3>
                <p>Administra precios y stock</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16, backgroundColor: '#52c41a', borderColor: '#52c41a' }}>Gestionar</Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/impresiones")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <PrinterOutlined style={{ fontSize: 50, color: "#13c2c2", marginBottom: 16 }} />
                <h3>Impresiones</h3>
                <p>Administra impresiones y sus valores</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16, backgroundColor: '#13c2c2', borderColor: '#13c2c2' }}>Gestionar</Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/pedidos")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <FileTextOutlined style={{ fontSize: 50, color: "#faad14", marginBottom: 16 }} />
                <h3>Pedidos</h3>
                <p>Control de ventas y estados</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16, backgroundColor: '#faad14', borderColor: '#faad14' }}>Gestionar</Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/descuentos")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <PercentageOutlined style={{ fontSize: 50, color: "#eb2f96", marginBottom: 16 }} />
                <h3>Descuentos</h3>
                <p>Configura beneficios por tipo de usuario</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16, backgroundColor: '#eb2f96', borderColor: '#eb2f96' }}>Gestionar</Button>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card hoverable onClick={() => navigate("/admin/reportes")} style={cardStyle} bodyStyle={cardBodyStyle}>
              <div>
                <BarChartOutlined style={{ fontSize: 50, color: "#722ed1", marginBottom: 16 }} />
                <h3>Reportes</h3>
                <p>Análisis integral de ventas y métricas</p>
              </div>
              <Button type="primary" block size="large" style={{ marginTop: 16, backgroundColor: '#722ed1', borderColor: '#722ed1' }}>Gestionar</Button>
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
        <Form layout="vertical">
          {/* CAMPO CON VALIDACIÓN DE BACKEND */}
          <Form.Item 
            label="Contraseña Actual"
            {...getCurrentValidationStatus()}
          >
            <Input.Password
              placeholder="Tu contraseña actual"
              value={currentPassword}
              onChange={e => {
                setCurrentPassword(e.target.value);
                if (currentPasswordError) setCurrentPasswordError(false);
              }}
            />
          </Form.Item>

          <Form.Item label="Nueva Contraseña">
            <Input.Password
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item 
            label="Confirmar Nueva Contraseña"
            {...getConfirmValidationStatus()}
          >
            <Input.Password
              placeholder="Repetir nueva contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;