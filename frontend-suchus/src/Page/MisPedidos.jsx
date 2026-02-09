
import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Spin, Button, Modal, Descriptions, Divider, Input, DatePicker, Space, message } from 'antd';
import { EyeOutlined, ClockCircleOutlined, SearchOutlined, FilePdfOutlined, CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { pedidosAPI } from '../services/api';
import Navbar from './Navbar';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MisPedidos = () => {

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [rangoFechas, setRangoFechas] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);


  const fetchPedidos = async (rangoOverride = null) => {
    try {
      setLoading(true);
      const params = {};
      const range = rangoOverride !== undefined && rangoOverride !== null ? rangoOverride : rangoFechas;
      if (range && range[0] && range[1]) {
        params.fecha_desde = range[0].format('YYYY-MM-DD');
        params.fecha_hasta = range[1].format('YYYY-MM-DD');
      }
      const data = await pedidosAPI.misPedidos(params);
      const listaFinal = Array.isArray(data) ? data : (data.results || []);
      setPedidos(listaFinal);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      message.error("No se pudieron cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };


  const getColorEstado = (estado) => {
    const colores = {
      'Pendiente': 'orange',
      'En proceso': 'blue',
      'Preparado': 'purple',
      'Retirado': 'green',
      'Cancelado': 'red',
      'Aceptado': 'blue',
      'En preparación': 'purple',
      'Listo para retirar': 'green',
      'Entregado': 'gray',
    };
    return colores[estado] ?? 'default';
  };


  const pedidosFiltrados = pedidos.filter(pedido => {
    const idPedido = pedido.id?.toString() || '';
    const busqueda = searchText.toLowerCase();
    return idPedido.includes(busqueda);
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'descend',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 120,
      sorter: (a, b) => (a.fecha || '').localeCompare(b.fecha || ''),
      render: (fecha) => fecha ? dayjs(fecha).format('DD/MM/YYYY') : '-',
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
      filters: [
        { text: 'Pendiente', value: 'Pendiente' },
        { text: 'En proceso', value: 'En proceso' },
        { text: 'Preparado', value: 'Preparado' },
        { text: 'Retirado', value: 'Retirado' },
        { text: 'Cancelado', value: 'Cancelado' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado) => <Tag color={getColorEstado(estado)}>{estado?.toUpperCase() || 'S/E'}</Tag>,
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
          Detalles
        </Button>
      ),
    },
  ];


  return (
    <div className="mis-pedidos-container" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/perfil')} 
              style={{ marginTop: '5px' }}
            />
            <div>
              <Title level={2} style={{ margin: 0 }}>Mis Pedidos</Title>
              <Text type="secondary">Historial de tus solicitudes y compras realizadas.</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Input
              placeholder="Buscar por ID..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
              size="large"
              allowClear
            />
            <RangePicker
              placeholder={['Desde', 'Hasta']}
              value={rangoFechas}
              onChange={(dates) => {
                const newRange = dates && dates.length === 2 ? dates : null;
                setRangoFechas(newRange);
                fetchPedidos(newRange);
              }}
              size="large"
              style={{ minWidth: 240 }}
              allowClear
            />
            <Button
              icon={<CalendarOutlined />}
              size="large"
              onClick={() => {
                setRangoFechas(null);
                fetchPedidos(null);
              }}
            >
              Limpiar fechas
            </Button>
            <Button
              type="primary"
              onClick={fetchPedidos}
              icon={<ClockCircleOutlined />}
              size="large"
              loading={loading}
              style={{ fontWeight: 'bold' }}
            >
              Actualizar
            </Button>
          </div>

          <Spin spinning={loading}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <Table
                columns={columns}
                dataSource={pedidosFiltrados}
                rowKey="id"
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total: ${total} pedidos`,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: 'No se encontraron pedidos',
                  triggerDesc: 'Click para ordenar descendente',
                  triggerAsc: 'Click para ordenar ascendente',
                  cancelSort: 'Click para cancelar ordenamiento'
                }}
              />
            </div>
          </Spin>
        </Card>

        <Modal
          title={`Detalles del Pedido #${pedidoSeleccionado?.id}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>Cerrar</Button>
          ]}
          width="min(800px, 95vw)"
          style={{ top: 16 }}
          styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' } }}
        >
          {pedidoSeleccionado ? (
            <div style={{ minWidth: 0 }}>
              {/* Motivo de corrección y grilla de archivos a corregir */}
              {pedidoSeleccionado.estado === 'Requiere Corrección' && pedidoSeleccionado.motivo_correccion && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    background: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: 6,
                    padding: 16,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <span style={{ fontSize: 22, color: '#faad14' }}>⚠️</span>
                    <div>
                      <b>Motivo de corrección:</b><br />
                      {pedidoSeleccionado.motivo_correccion}
                    </div>
                  </div>
                  <Table
                    dataSource={(pedidoSeleccionado.detalle_impresiones || []).filter(imp => imp.estado === 'Requiere Corrección')}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      { title: 'Archivo', dataIndex: 'nombre_archivo' },
                      {
                        title: 'Nuevo archivo',
                        key: 'nuevo_archivo',
                        render: () => (
                          <input type="file" disabled style={{ opacity: 0.5 }} title="Próximamente" />
                        ),
                      },
                      {
                        title: 'Estado',
                        key: 'estado',
                        render: () => <Tag color="orange">Pendiente de corrección</Tag>,
                      },
                    ]}
                  />
                  <Button type="primary" disabled style={{ marginTop: 12 }}>
                    Enviar archivos corregidos (Próximamente)
                  </Button>
                </div>
              )}
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <div style={{ minWidth: 320 }}>
                  <Descriptions title="Información del Pedido" bordered column={2} size="small">
                    <Descriptions.Item label="ID">{pedidoSeleccionado.id}</Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      <Tag color={getColorEstado(pedidoSeleccionado.estado)}>{pedidoSeleccionado.estado}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Observaciones" span={2}>
                      {pedidoSeleccionado.observacion || "Sin observaciones adicionales"}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              <Divider orientation="left">Productos Solicitados</Divider>

              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <Table
                  dataSource={pedidoSeleccionado.detalles || []}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: 'Producto', dataIndex: 'fk_producto_nombre', ellipsis: true },
                    { title: 'Cantidad', dataIndex: 'cantidad', align: 'center', width: 80 },
                    {
                      title: 'Precio Unit.',
                      dataIndex: 'fk_producto_precio',
                      width: 100,
                      render: (p) => `$${Number(p).toLocaleString()}`
                    },
                    {
                      title: 'Subtotal',
                      dataIndex: 'subtotal',
                      width: 100,
                      render: (s) => <strong>${Number(s).toLocaleString()}</strong>
                    },
                  ]}
                />
              </div>

              {(pedidoSeleccionado.detalle_impresiones && pedidoSeleccionado.detalle_impresiones.length > 0) && (
                <>
                  <Divider orientation="left">Impresiones</Divider>
                  <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                    <Table
                      dataSource={pedidoSeleccionado.detalle_impresiones}
                      pagination={false}
                      rowKey="id"
                      size="small"
                      scroll={{ x: 'max-content' }}
                      columns={[
                        {
                          title: 'Archivo',
                          key: 'archivo',
                          render: (_, imp) => (
                            <Space>
                              {imp.fk_impresion_data?.url ? (
                                <Button
                                  type="link"
                                  icon={<FilePdfOutlined />}
                                  href={imp.fk_impresion_data.url}
                                  target="_blank"
                                  style={{ padding: 0 }}
                                >
                                  {imp.fk_impresion_data.nombre_archivo || 'Ver archivo'}
                                </Button>
                              ) : (
                                <span>{imp.nombre_archivo}</span>
                              )}
                            </Space>
                          )
                        },
                        { title: 'Formato', dataIndex: 'formato', width: 80 },
                        { title: 'Color', dataIndex: 'color', width: 120 },
                        { title: 'Copias', dataIndex: 'cantidadCopias', align: 'center', width: 80 },
                        {
                          title: 'Subtotal',
                          dataIndex: 'subtotal',
                          width: 100,
                          render: (s) => <strong>${Number(s).toLocaleString()}</strong>
                        },
                      ]}
                    />
                  </div>
                </>
              )}

              <Divider orientation="left">Historial de estados</Divider>
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <Table
                  dataSource={pedidoSeleccionado.historial_estados || []}
                  pagination={false}
                  rowKey={(r) => r.id ?? `estado-${r.fecha}`}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: 'Fecha y hora',
                      dataIndex: 'fecha',
                      key: 'fecha',
                      width: 140,
                      render: (f) => f ? dayjs(f).format('DD/MM/YYYY HH:mm') : '-'
                    },
                    {
                      title: 'Estado',
                      dataIndex: 'estado',
                      key: 'estado',
                      render: (estado) => <Tag color={getColorEstado(estado)}>{estado}</Tag>
                    },
                  ]}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '24px' }}>
                <Title level={3}>TOTAL: ${Number(pedidoSeleccionado.total).toLocaleString()}</Title>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MisPedidos;