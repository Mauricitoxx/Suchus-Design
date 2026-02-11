
import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Spin, Button, Modal, Descriptions, Divider, Input, DatePicker, Space, message, Upload, Select, InputNumber, Alert } from 'antd';
import { EyeOutlined, ClockCircleOutlined, SearchOutlined, FilePdfOutlined, CalendarOutlined, ArrowLeftOutlined, UploadOutlined, BellOutlined } from '@ant-design/icons';
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
  
  // Estados para corrección de archivos
  const [archivosCorreccion, setArchivosCorreccion] = useState({}); // {impresionId: {file, formato, color, copias}}
  const [enviandoCorreccion, setEnviandoCorreccion] = useState(false);
  
  // Precios por hoja
  const precioPorHoja = {
    A4: { 'blanco y negro': 20, color: 40 },
    A3: { 'blanco y negro': 30, color: 60 },
  };

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
      'Requiere Corrección': 'red',
      'Aceptado': 'blue',
      'En preparación': 'purple',
      'Listo para retirar': 'green',
      'Entregado': 'gray',
    };
    return colores[estado] ?? 'default';
  };


  const handleFileChange = (impresionId, file) => {
    setArchivosCorreccion(prev => ({
      ...prev,
      [impresionId]: {
        file: file,
        formato: prev[impresionId]?.formato || 'A4',
        color: prev[impresionId]?.color || 'blanco y negro',
        copias: prev[impresionId]?.copias || 1
      }
    }));
    return false; // Prevenir upload automático
  };

  const handleChangeFormatoCorreccion = (impresionId, formato) => {
    setArchivosCorreccion(prev => ({
      ...prev,
      [impresionId]: {
        ...prev[impresionId],
        formato: formato
      }
    }));
  };

  const handleChangeColorCorreccion = (impresionId, color) => {
    setArchivosCorreccion(prev => ({
      ...prev,
      [impresionId]: {
        ...prev[impresionId],
        color: color
      }
    }));
  };

  const handleChangeCopiasCorreccion = (impresionId, copias) => {
    setArchivosCorreccion(prev => ({
      ...prev,
      [impresionId]: {
        ...prev[impresionId],
        copias: copias
      }
    }));
  };

  const calcularSubtotal = (formato, color, copias) => {
    const precioBase = precioPorHoja[formato]?.[color] || 20;
    return precioBase * copias;
  };

  const handleEnviarCorreccion = async () => {
    if (Object.keys(archivosCorreccion).length === 0) {
      message.warning('Debes seleccionar al menos un archivo para corregir');
      return;
    }

    // Validar que todos tengan archivo
    const sinArchivo = Object.entries(archivosCorreccion).filter(([id, data]) => !data.file);
    if (sinArchivo.length > 0) {
      message.warning('Todos los archivos seleccionados deben tener un archivo adjunto');
      return;
    }

    setEnviandoCorreccion(true);
    try {
      const formData = new FormData();
      
      // Preparar metadata de archivos corregidos
      const archivos_corregidos = Object.entries(archivosCorreccion).map(([impresionId, data]) => ({
        impresion_id: parseInt(impresionId),
        formato: data.formato,
        color: data.color,
        copias: data.copias
      }));
      
      formData.append('archivos_corregidos', JSON.stringify(archivos_corregidos));
      
      // Agregar cada archivo con su índice
      Object.entries(archivosCorreccion).forEach(([impresionId, data], index) => {
        formData.append(`archivo_${index}`, data.file);
      });
      
      await pedidosAPI.corregirArchivos(pedidoSeleccionado.id, formData);
      
      message.success('Archivos corregidos enviados correctamente. El precio ha sido recalculado.');
      setArchivosCorreccion({});
      setModalVisible(false);
      fetchPedidos();
      
    } catch (error) {
      console.error('Error al enviar archivos corregidos:', error);
      message.error(error.response?.data?.error || 'Error al enviar los archivos');
    } finally {
      setEnviandoCorreccion(false);
    }
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
        { text: 'Requiere Corrección', value: 'Requiere Corrección' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado, record) => {
        // Verificar si el pedido fue actualizado en las últimas 48 horas
        const ahora = dayjs();
        const ultimaActualizacion = dayjs(record.updated_at);
        const esReciente = ahora.diff(ultimaActualizacion, 'hour') <= 48;
        
        return (
          <Space direction="vertical" size="small">
            <Tag color={getColorEstado(estado)}>{estado?.toUpperCase() || 'S/E'}</Tag>
            {esReciente && (
              <Tag color="gold" style={{ fontSize: 11 }}>
                ⚠️ Actualizado
              </Tag>
            )}
          </Space>
        );
      },
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
          
          {/* Alerta de pedidos con actualizaciones recientes */}
          {(() => {
            const ahora = dayjs();
            const pedidosActualizados = pedidos.filter(p => {
              const ultimaActualizacion = dayjs(p.updated_at);
              return ahora.diff(ultimaActualizacion, 'hour') <= 48;
            });
            
            if (pedidosActualizados.length > 0) {
              return (
                <Alert
                  message={`¡Tenés ${pedidosActualizados.length} pedido${pedidosActualizados.length > 1 ? 's' : ''} con actualizaciones recientes!`}
                  description="Los pedidos marcados con ⚠️ fueron actualizados en las últimas 48 horas. Revisá tu email para más detalles."
                  type="info"
                  icon={<BellOutlined />}
                  showIcon
                  closable
                  style={{ marginBottom: 20 }}
                />
              );
            }
            return null;
          })()}
          
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
          onCancel={() => {
            setModalVisible(false);
            setArchivosCorreccion({});
          }}
          footer={[
            <Button key="close" onClick={() => {
              setModalVisible(false);
              setArchivosCorreccion({});
            }}>Cerrar</Button>
          ]}
          width="min(800px, 95vw)"
          style={{ top: 16 }}
          styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' } }}
        >
          {pedidoSeleccionado ? (
            <div style={{ minWidth: 0 }}>
              {/* Motivo de corrección y grilla de archivos a corregir */}
              {pedidoSeleccionado.estado === 'Requiere Corrección' && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    background: '#fff2e8',
                    border: '2px solid #ff7a45',
                    borderRadius: 8,
                    padding: 20,
                    marginBottom: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 28, color: '#ff7a45' }}>⚠️</span>
                      <Title level={4} style={{ margin: 0, color: '#ff7a45' }}>
                        Este pedido requiere corrección
                      </Title>
                    </div>
                    {pedidoSeleccionado.motivo_correccion ? (
                      <div style={{ 
                        background: 'white', 
                        padding: 12, 
                        borderRadius: 6,
                        marginBottom: 16,
                        border: '1px solid #ffbb96'
                      }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                          Motivo de la corrección:
                        </Text>
                        <Text style={{ fontSize: 14 }}>
                          {pedidoSeleccionado.motivo_correccion}
                        </Text>
                      </div>
                    ) : (
                      <Text style={{ display: 'block', marginBottom: 16 }}>
                        Por favor, revisa los archivos y sube las versiones corregidas.
                      </Text>
                    )}
                    
                    <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 15 }}>
                      📤 Sube los archivos corregidos y ajusta las configuraciones si es necesario:
                    </Text>
                    
                    <Table
                      dataSource={pedidoSeleccionado.detalle_impresiones || []}
                      rowKey={(record) => record.id}
                      pagination={false}
                      size="small"
                      bordered
                      scroll={{ x: 'max-content' }}
                      style={{ marginBottom: 16 }}
                      columns={[
                        { 
                          title: 'Archivo original', 
                          key: 'archivo_original',
                          width: 200,
                          render: (_, imp) => (
                            <Space direction="vertical" size="small">
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
                                <span>{imp.fk_impresion_data?.nombre_archivo || 'Archivo'}</span>
                              )}
                              <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Original: {imp.fk_impresion_data?.formato || '?'} • {imp.fk_impresion_data?.color ? 'Color' : 'B/N'} • {imp.cantidadCopias} cop.
                                </Text>
                              </div>
                            </Space>
                          )
                        },
                        {
                          title: '📎 Nuevo archivo',
                          key: 'nuevo_archivo',
                          width: 180,
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            return (
                              <Upload
                                beforeUpload={(file) => handleFileChange(impresionId, file)}
                                maxCount={1}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                showUploadList={{
                                  showRemoveIcon: true
                                }}
                                onRemove={() => {
                                  setArchivosCorreccion(prev => {
                                    const newState = {...prev};
                                    delete newState[impresionId];
                                    return newState;
                                  });
                                }}
                              >
                                <Button icon={<UploadOutlined />} size="small" style={{ fontSize: 12 }}>
                                  {archivosCorreccion[impresionId]?.file ? 'Cambiar' : 'Seleccionar'}
                                </Button>
                              </Upload>
                            );
                          }
                        },
                        {
                          title: 'Formato',
                          key: 'formato',
                          width: 100,
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            const defaultFormato = imp.fk_impresion_data?.formato || 'A4';
                            return (
                              <Select
                                size="small"
                                style={{ width: '100%' }}
                                value={archivosCorreccion[impresionId]?.formato || defaultFormato}
                                onChange={(value) => handleChangeFormatoCorreccion(impresionId, value)}
                                disabled={!archivosCorreccion[impresionId]?.file}
                              >
                                <Select.Option value="A4">A4</Select.Option>
                                <Select.Option value="A3">A3</Select.Option>
                              </Select>
                            );
                          }
                        },
                        {
                          title: 'Color',
                          key: 'color',
                          width: 140,
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            const defaultColor = imp.fk_impresion_data?.color ? 'color' : 'blanco y negro';
                            return (
                              <Select
                                size="small"
                                style={{ width: '100%' }}
                                value={archivosCorreccion[impresionId]?.color || defaultColor}
                                onChange={(value) => handleChangeColorCorreccion(impresionId, value)}
                                disabled={!archivosCorreccion[impresionId]?.file}
                              >
                                <Select.Option value="blanco y negro">Blanco y Negro</Select.Option>
                                <Select.Option value="color">Color</Select.Option>
                              </Select>
                            );
                          }
                        },
                        {
                          title: 'Copias',
                          key: 'copias',
                          width: 80,
                          align: 'center',
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            const defaultCopias = imp.cantidadCopias || 1;
                            return (
                              <InputNumber
                                size="small"
                                min={1}
                                max={100}
                                value={archivosCorreccion[impresionId]?.copias || defaultCopias}
                                onChange={(value) => handleChangeCopiasCorreccion(impresionId, value)}
                                disabled={!archivosCorreccion[impresionId]?.file}
                                style={{ width: '100%' }}
                              />
                            );
                          }
                        },
                        {
                          title: 'Subtotal nuevo',
                          key: 'subtotal_nuevo',
                          width: 110,
                          align: 'right',
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            const archivo = archivosCorreccion[impresionId];
                            if (!archivo?.file) {
                              return <Text type="secondary">-</Text>;
                            }
                            const subtotal = calcularSubtotal(archivo.formato, archivo.color, archivo.copias);
                            return <Text strong style={{ color: '#1890ff' }}>${subtotal}</Text>;
                          }
                        },
                        {
                          title: 'Estado',
                          key: 'estado_upload',
                          width: 130,
                          align: 'center',
                          render: (_, imp) => {
                            const impresionId = imp.fk_impresion_data?.id || imp.fk_impresion;
                            return archivosCorreccion[impresionId]?.file ? (
                              <Tag color="green" style={{ fontSize: 11 }}>
                                ✓ Listo
                              </Tag>
                            ) : (
                              <Tag color="orange" style={{ fontSize: 11 }}>
                                Pendiente
                              </Tag>
                            );
                          }
                        },
                      ]}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<UploadOutlined />}
                        onClick={handleEnviarCorreccion}
                        loading={enviandoCorreccion}
                        disabled={Object.keys(archivosCorreccion).length === 0}
                        style={{ 
                          height: 45,
                          fontSize: 16,
                          fontWeight: 'bold'
                        }}
                      >
                        Enviar archivos corregidos ({Object.keys(archivosCorreccion).length})
                      </Button>
                      {Object.keys(archivosCorreccion).length === 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Selecciona al menos un archivo para continuar
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                  <Divider />
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