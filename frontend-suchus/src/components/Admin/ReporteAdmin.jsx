import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, DatePicker, Space, message, 
  Card, Typography, Row, Col, Statistic, Divider, Input, Spin, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, ArrowLeftOutlined, DownloadOutlined, 
  EyeOutlined, BarChartOutlined, DollarOutlined, 
  CalendarOutlined, DeleteOutlined, SearchOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { reportesAPI } from '../../services/api'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReporteAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [searchText, setSearchText] = useState(''); // Estado para el buscador
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    setLoading(true);
    try {
      const data = await reportesAPI.getAll();
      const lista = data.results || data;
      setReportes(Array.isArray(lista) ? lista : []);
    } catch (error) {
      message.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado dinámico
  const reportesFiltrados = reportes.filter(reporte => {
    const titulo = reporte.titulo?.toLowerCase() || '';
    const creador = reporte.nombre_creador?.toLowerCase() || '';
    const busqueda = searchText.toLowerCase();
    return titulo.includes(busqueda) || creador.includes(busqueda);
  });

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      const payload = {
        titulo: values.titulo,
        fecha_inicio: values.rango[0].format('YYYY-MM-DD'),
        fecha_fin: values.rango[1].format('YYYY-MM-DD'),
        fk_usuario_creador: 1 // TODO: Obtener del contexto de usuario logueado
      };
      await reportesAPI.create(payload);
      message.success('Reporte generado correctamente');
      setIsModalVisible(false);
      form.resetFields();
      fetchReportes();
    } catch (error) {
      message.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reportesAPI.delete(id);
      message.success('Reporte eliminado');
      fetchReportes();
    } catch (error) {
      message.error('No se pudo eliminar el reporte');
    }
  };

  const exportToExcel = async (reporte) => {
    try {
      const { datos_reporte } = reporte;
      if (!datos_reporte) {
        message.warning('Este reporte no contiene datos');
        return;
      }

      // Intentar cargar dinámicamente xlsx para evitar errores de bundling
      try {
        const mod = await import('xlsx');
        const XLSX = mod?.default || mod;

        const wb = XLSX.utils.book_new();
        const ws_resumen = XLSX.utils.json_to_sheet([
          { Concepto: 'Monto Total', Valor: datos_reporte.resumen_general?.monto_total_periodo },
          { Concepto: 'Cantidad Pedidos', Valor: datos_reporte.resumen_general?.cantidad_total_pedidos },
          { Concepto: 'Ticket Promedio', Valor: datos_reporte.resumen_general?.promedio_por_venta }
        ]);
        XLSX.utils.book_append_sheet(wb, ws_resumen, 'Resumen');
        XLSX.writeFile(wb, `${reporte.titulo}.xlsx`);
        return;
      } catch (xlsxErr) {
        console.warn('xlsx dynamic import failed, falling back to JSON download', xlsxErr);
      }

      // Fallback: descargar los datos como JSON si xlsx no está disponible
      const blob = new Blob([JSON.stringify(datos_reporte, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reporte.titulo}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report', err);
      message.error('Error al exportar');
    }
  };

  const columns = [
    {
      title: 'Fecha Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    {
      title: 'Rango Analizado',
      key: 'rango',
      render: (_, r) => `${dayjs(r.fecha_inicio).format('DD/MM/YY')} al ${dayjs(r.fecha_fin).format('DD/MM/YY')}`,
    },
    { title: 'Generado por', dataIndex: 'nombre_creador', key: 'nombre_creador' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => { setReporteSeleccionado(record); setDetalleVisible(true); }}
          >
            Dashboard
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            type="primary" 
            ghost 
            onClick={() => exportToExcel(record)}
          />
          <Popconfirm title="¿Eliminar reporte?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Space size="large">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
              <Title level={3} style={{ margin: 0 }}>Reportes de Gestión</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar por título o creador..."
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                Nuevo Reporte
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={reportesFiltrados} 
            rowKey="id" 
          />
        </Spin>
      </Card>

      {/* MODAL CREAR REPORTE */}
      <Modal
        title="Generar Nuevo Reporte Integral"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="titulo" label="Nombre del Reporte" rules={[{ required: true }]}>
            <Input placeholder="Ej: Reporte Trimestral Suchus" />
          </Form.Item>
          <Form.Item name="rango" label="Periodo" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL DASHBOARD */}
      <Modal
        title={`Dashboard: ${reporteSeleccionado?.titulo}`}
        open={detalleVisible}
        onCancel={() => setDetalleVisible(false)}
        width={900}
        footer={[<Button key="close" onClick={() => setDetalleVisible(false)}>Cerrar</Button>]}
      >
        {reporteSeleccionado?.datos_reporte ? (
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <Card style={{ background: '#fafafa' }}>
                  <Statistic 
                    title="Ventas Totales" 
                    value={reporteSeleccionado.datos_reporte.resumen_general?.monto_total_periodo} 
                    prefix="$" 
                    precision={2}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card style={{ background: '#fafafa' }}>
                  <Statistic 
                    title="Cantidad Pedidos" 
                    value={reporteSeleccionado.datos_reporte.resumen_general?.cantidad_total_pedidos} 
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card style={{ background: '#fafafa' }}>
                  <Statistic 
                    title="Ticket Promedio" 
                    value={reporteSeleccionado.datos_reporte.resumen_general?.promedio_por_venta} 
                    prefix="$" 
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>
            
            <Divider orientation="left">Monto por Estado</Divider>
            <Table 
              dataSource={reporteSeleccionado.datos_reporte.finanzas_por_estado || []}
              pagination={false}
              size="small"
              columns={[
                { title: 'Estado', dataIndex: 'estado' },
                { title: 'Monto Subtotal', dataIndex: 'monto_subtotal', render: (v) => `$${v.toLocaleString()}` }
              ]}
            />
          </div>
        ) : <Text>Sin datos procesados.</Text>}
      </Modal>
    </div>
  );
};

export default ReporteAdmin;