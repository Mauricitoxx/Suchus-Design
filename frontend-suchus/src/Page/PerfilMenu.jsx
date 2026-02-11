import React, { useState, useEffect } from "react";
import { Card, Button, Input, List, Modal, message, Spin, Badge, Space, Alert } from "antd";
import { BellOutlined, ClockCircleOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import { pedidosAPI, usuariosAPI } from "../services/api";
import Navbar from "./Navbar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

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

        {/* Panel de Notificaciones */}
        <Card 
          bordered 
          style={{ marginTop: 24 }}
          title={
            <Space>
              <BellOutlined style={{ fontSize: 18 }} />
              <span>Notificaciones de Pedidos</span>
            </Space>
          }
        >
          {loadingPedidos ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : (() => {
            const ahora = dayjs();
            const pedidosRecientes = pedidos.filter(p => {
              const ultimaActualizacion = dayjs(p.updated_at);
              return ahora.diff(ultimaActualizacion, 'hour') <= 48;
            });

            if (pedidosRecientes.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: 20, color: '#8c8c8c' }}>
                  <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No tenés actualizaciones recientes en tus pedidos</p>
                </div>
              );
            }

            return (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Alert
                  icon={<MailOutlined />}
                  message={
                    <span>
                      <strong>{pedidosRecientes.length}</strong> {pedidosRecientes.length === 1 ? 'pedido actualizado' : 'pedidos actualizados'}
                    </span>
                  }
                  description="Se enviaron notificaciones por email con los detalles de cada cambio"
                  type="info"
                  showIcon
                />
                
                <List
                  size="small"
                  dataSource={pedidosRecientes.slice(0, 5)}
                  renderItem={pedido => {
                    const tiempo = dayjs(pedido.updated_at).fromNow();
                    return (
                      <List.Item
                        style={{ 
                          padding: '12px 0',
                          cursor: 'pointer',
                          borderRadius: 4,
                        }}
                        onClick={() => navigate('/mis-pedidos')}
                      >
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <Badge status="processing" />
                            <span><strong>Pedido #{pedido.id}</strong></span>
                            <span style={{ color: '#722ed1' }}>• {pedido.estado}</span>
                          </Space>
                          <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                            {tiempo}
                          </span>
                        </Space>
                      </List.Item>
                    );
                  }}
                />
                
                {pedidosRecientes.length > 5 && (
                  <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <Button type="link" onClick={() => navigate('/mis-pedidos')}>
                      Ver todos los pedidos actualizados ({pedidosRecientes.length})
                    </Button>
                  </div>
                )}
              </Space>
            );
          })()}
        </Card>

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