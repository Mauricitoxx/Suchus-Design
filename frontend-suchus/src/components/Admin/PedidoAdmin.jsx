import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, message, Card, Typography, Space, Modal, Descriptions, Divider, Spin } from 'antd';
import { EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pedidosAPI } from '../../services/api'; 

const { Title } = Typography;
const { Option } = Select;

const PedidoAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await pedidosAPI.getAll();
      
      // Ajuste para la paginación de Django: los datos están en response.results
      if (response && response.results) {
        setPedidos(response.results);
      } else if (Array.isArray(response)) {
        setPedidos(response);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      message.error("Error al conectar con el servidor. Verifica tu sesión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await pedidosAPI.cambiarEstado(id, nuevoEstado);
      message.success(`Pedido #${id} actualizado a ${nuevoEstado}`);
      fetchPedidos(); 
    } catch (error) {
      message.error("No se pudo actualizar el estado del pedido");
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80 
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_, record) => `${record.usuario_nombre || ''} ${record.usuario_apellido || ''}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <strong>${Number(total).toLocaleString()}</strong>,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        let color = 'blue';
        if (estado === 'Cancelado') color = 'volcano';
        if (estado === 'Retirado') color = 'green';
        if (estado === 'Preparado') color = 'gold';
        return <Tag color={color}>{estado?.toUpperCase() || 'S/E'}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setPedidoSeleccionado(record);
              setModalVisible(true);
            }}
          >
            Detalles
          </Button>
          <Select
            value={record.estado}
            style={{ width: 160 }}
            onChange={(value) => handleCambiarEstado(record.id, value)}
          >
            <Option value="En revisión">En revisión</Option>
            <Option value="En proceso">En proceso</Option>
            <Option value="Preparado">Preparado</Option>
            <Option value="Retirado">Retirado</Option>
            <Option value="Cancelado">Cancelado</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/admin")} 
              style={{ fontSize: '20px', marginRight: 16 }}
            />
            <Title level={2} style={{ margin: 0 }}>Gestión de Pedidos</Title>
            <Button 
              type="primary" 
              onClick={fetchPedidos} 
              icon={<ClockCircleOutlined />}
              style={{ marginLeft: 'auto' }}
              loading={loading}
            >
              Actualizar
            </Button>
          </div>

          <Table 
            columns={columns} 
            dataSource={pedidos} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No hay pedidos disponibles' }}
          />
        </Card>
      </div>

      <Modal
        title={`Detalles del Pedido #${pedidoSeleccionado?.id}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>Cerrar</Button>
        ]}
        width={800}
      >
        {pedidoSeleccionado ? (
          <>
            <Descriptions title="Información del Cliente" bordered column={2}>
              <Descriptions.Item label="Nombre Completo">
                {pedidoSeleccionado.usuario_nombre} {pedidoSeleccionado.usuario_apellido}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {pedidoSeleccionado.usuario_email}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {pedidoSeleccionado.observacion || "Sin observaciones adicionales"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos Solicitados</Divider>
            
            <Table
              dataSource={pedidoSeleccionado.detalles || []}
              pagination={false}
              rowKey="id"
              size="small"
              columns={[
                { 
                  title: 'Producto', 
                  dataIndex: 'fk_producto_nombre', 
                  key: 'name' 
                },
                { 
                  title: 'Cantidad', 
                  dataIndex: 'cantidad', 
                  key: 'qty', 
                  align: 'center' 
                },
                { 
                  title: 'Precio Unitario', 
                  dataIndex: 'fk_producto_precio', 
                  render: (p) => `$${Number(p).toLocaleString()}` 
                },
                { 
                  title: 'Subtotal', 
                  dataIndex: 'subtotal', 
                  render: (s) => <strong>${Number(s).toLocaleString()}</strong> 
                },
              ]}
            />

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Title level={3}>TOTAL: ${Number(pedidoSeleccionado.total).toLocaleString()}</Title>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PedidoAdmin;