import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Spin, Button, Modal, List, Divider, message } from 'antd';
import { 
  EyeOutlined, 
  ShoppingCartOutlined, 
  FileTextOutlined, 
  HistoryOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { pedidosAPI } from '../services/api'; // Importación corregida según tu api.js
import Navbar from './Navbar';

const { Title, Text } = Typography;

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      // Usamos el método específico que definiste en api.js
      const data = await pedidosAPI.misPedidos();
      
      // Manejamos si la respuesta viene con paginación (results) o es un array directo
      const listaFinal = Array.isArray(data) ? data : (data.results || []);
      setPedidos(listaFinal);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      message.error("No se pudieron cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'En revisión': 'orange',
      'Aceptado': 'blue',
      'En preparación': 'purple',
      'Listo para retirar': 'green',
      'Entregado': 'gray',
      'Cancelado': 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Orden',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <Tag color={getStatusColor(estado)} icon={<ClockCircleOutlined />}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>${parseFloat(total).toLocaleString()}</Text>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Button 
          type="primary"
          icon={<EyeOutlined />} 
          onClick={() => {
            setPedidoSeleccionado(record);
            setModalVisible(true);
          }}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="mis-pedidos-container" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={2}>Mis Pedidos</Title>
          <Text type="secondary">Historial de tus solicitudes y compras realizadas.</Text>
          <Divider />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" tip="Cargando historial..." />
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={pedidos} 
              rowKey="id" 
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: 'Aún no has realizado pedidos' }}
            />
          )}
        </Card>

        {/* Modal de Detalle Extendido */}
        <Modal
          title={`Detalle del Pedido #${pedidoSeleccionado?.id}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
              Entendido
            </Button>
          ]}
          width={700}
        >
          {pedidoSeleccionado && (
            <div style={{ padding: '10px 0' }}>
              {/* Sección de Productos */}
              <Title level={5}><ShoppingCartOutlined /> Productos en este pedido</Title>
              <List
                itemLayout="horizontal"
                dataSource={pedidoSeleccionado.detalles}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.fk_producto_nombre}
                      description={`Cantidad: ${item.cantidad} x $${item.fk_producto_precio}`}
                    />
                    <Text strong>${item.subtotal}</Text>
                  </List.Item>
                )}
              />

              {/* Sección de Impresiones */}
              {pedidoSeleccionado.detalle_impresiones?.length > 0 && (
                <>
                  <Divider />
                  <Title level={5}><FileTextOutlined /> Documentos para imprimir</Title>
                  <List
                    itemLayout="horizontal"
                    dataSource={pedidoSeleccionado.detalle_impresiones}
                    renderItem={(imp) => (
                      <List.Item>
                        <List.Item.Meta
                          title={imp.nombre_archivo}
                          description={`${imp.formato} - ${imp.color} (${imp.cantidadCopias} copias)`}
                        />
                        <Text strong>${imp.subtotal}</Text>
                      </List.Item>
                    )}
                  />
                </>
              )}

              <Divider />

              {/* Resumen Final */}
              <div style={{ textAlign: 'right', background: '#fafafa', padding: '15px', borderRadius: '8px' }}>
                <Text type="secondary" italic style={{ display: 'block', marginBottom: '5px' }}>
                  "{pedidoSeleccionado.observacion || 'Sin observaciones'}"
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  Total Final: ${pedidoSeleccionado.total}
                </Title>
              </div>

              {/* Línea de tiempo de estados */}
              <Divider />
              <Title level={5}><HistoryOutlined /> Seguimiento del pedido</Title>
              <List
                size="small"
                dataSource={pedidoSeleccionado.historial_estados}
                renderItem={(h) => (
                  <List.Item>
                    <Text type="secondary">{new Date(h.fecha).toLocaleString()}</Text>
                    <Tag color="blue" style={{ marginLeft: '10px' }}>{h.estado}</Tag>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MisPedidos;