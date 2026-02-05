import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, message, Card, Typography, Space, Modal, Descriptions, Divider, Spin, Input } from 'antd';
import { EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
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
  
  // Estado para la búsqueda
  const [searchText, setSearchText] = useState('');

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const response = await pedidosAPI.getAll();
      if (response && response.results) {
        setPedidos(response.results);
      } else if (Array.isArray(response)) {
        setPedidos(response);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      message.error("Error al conectar con el servidor.");
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
      message.success(`Pedido #${id} actualizado`);
      fetchPedidos(); 
    } catch (error) {
      message.error("No se pudo actualizar el estado");
    }
  };

  // Lógica de filtrado por nombre/apellido
  // Ubicación: Justo antes de la definición de 'columns'
    const pedidosFiltrados = pedidos.filter(pedido => {
    const nombreCompleto = `${pedido.usuario_nombre} ${pedido.usuario_apellido}`.toLowerCase();
    const idPedido = pedido.id.toString(); // Convertimos el ID a texto para comparar
    const busqueda = searchText.toLowerCase();

    return nombreCompleto.includes(busqueda) || idPedido.includes(busqueda);
    });

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 100,
      sorter: (a, b) => a.id - b.id, // Flechitas para ordenar
      defaultSortOrder: 'descend',
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
      sorter: (a, b) => a.total - b.total,
      render: (total) => <strong>${Number(total).toLocaleString()}</strong>,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      // Filtros rápidos en la columna
      filters: [
        { text: 'En revisión', value: 'En revisión' },
        { text: 'En proceso', value: 'En proceso' },
        { text: 'Preparado', value: 'Preparado' },
        { text: 'Retirado', value: 'Retirado' },
        { text: 'Cancelado', value: 'Cancelado' },
      ],
      onFilter: (value, record) => record.estado === value,
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
            onClick={(e) => e.stopPropagation()} // Evita conflictos de clicks
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
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/admin")} 
              style={{ fontSize: '20px' }}
            />
            <Title level={2} style={{ margin: 0 }}>Gestión de Pedidos</Title>
            
            {/* Buscador de Clientes */}
            <Input
              placeholder="Buscar por cliente..."
              prefix={<SearchOutlined />}
              style={{ width: 300, marginLeft: '20px' }}
              allowClear
              onChange={e => setSearchText(e.target.value)}
            />

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
            dataSource={pedidosFiltrados} // Usamos la lista filtrada
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No se encontraron pedidos' }}
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
                { title: 'Producto', dataIndex: 'fk_producto_nombre' },
                { title: 'Cantidad', dataIndex: 'cantidad', align: 'center' },
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