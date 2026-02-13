import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag, Spin, Card, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DollarOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { TextArea } = Input;

const ImpresionesAdmin = () => {
  const navigate = useNavigate();
  const [impresiones, setImpresiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
  const [editingImpresion, setEditingImpresion] = useState(null);
  const [form] = Form.useForm();
  const [priceForm] = Form.useForm();

  // Opciones de formato disponibles
  const formatosDisponibles = [
    { value: 'A0', label: 'A0 (841 × 1189 mm)' },
    { value: 'A1', label: 'A1 (594 × 841 mm)' },
    { value: 'A2', label: 'A2 (420 × 594 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A5', label: 'A5 (148 × 210 mm)' },
    { value: 'A6', label: 'A6 (105 × 148 mm)' },
  ];

  useEffect(() => {
    fetchImpresiones();
  }, []);

  const fetchImpresiones = async () => {
    setLoading(true);
    try {
      const response = await api.get('tipo-impresion/');
      const data = response.data;
      const impresiones = data.results || data;
      setImpresiones(Array.isArray(impresiones) ? impresiones : []);
    } catch (error) {
      message.error('Error al cargar impresiones: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
      setImpresiones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingImpresion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingImpresion(record);
    form.setFieldsValue({
      formato: record.formato,
      color: record.color,
      descripcion: record.descripcion,
      precio: record.precio,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingImpresion) {
        await api.patch(`tipo-impresion/${editingImpresion.id}/`, values);
        message.success('Impresión actualizada correctamente');
      } else {
        await api.post('tipo-impresion/', values);
        message.success('Impresión creada correctamente');
      }
      setIsModalVisible(false);
      fetchImpresiones();
    } catch (error) {
      message.error('Error al guardar: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`tipo-impresion/${id}/`);
      message.success('Impresión eliminada');
      fetchImpresiones();
    } catch (error) {
      message.error('Error al eliminar: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      const endpoint = record.activo ? 'desactivar' : 'activar';
      await api.patch(`tipo-impresion/${record.id}/${endpoint}/`);
      message.success(record.activo ? 'Impresión desactivada' : 'Impresión activada');
      fetchImpresiones();
    } catch (error) {
      message.error('Error: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleChangePrice = (record) => {
    setEditingImpresion(record);
    priceForm.setFieldsValue({
      precio: record.precio,
    });
    setIsPriceModalVisible(true);
  };

  const handlePriceSave = async (values) => {
    try {
      await api.patch(`tipo-impresion/${editingImpresion.id}/actualizar_precio/`, values);
      message.success('Precio actualizado correctamente');
      setIsPriceModalVisible(false);
      fetchImpresiones();
    } catch (error) {
      message.error('Error al actualizar precio: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Formato',
      dataIndex: 'formato',
      key: 'formato',
      sorter: (a, b) => a.formato.localeCompare(b.formato),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <Tag color={color ? 'blue' : 'default'}>
          {color ? 'Color' : 'Blanco y Negro'}
        </Tag>
      ),
      sorter: (a, b) => {
        const aText = a.color ? 'Color' : 'Blanco y Negro';
        const bText = b.color ? 'Color' : 'Blanco y Negro';
        return aText.localeCompare(bText);
      },
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      render: (precio) => `$${precio.toFixed(2)}`,
      sorter: (a, b) => a.precio - b.precio,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              Editar
            </Button>
            <Button 
              icon={<DollarOutlined />}
              size="small"
              onClick={() => handleChangePrice(record)}
            >
              Precio
            </Button>
          </Space>
          <Space size="small">
            <Button 
              size="small"
              onClick={() => handleToggleActive(record)}
            >
              {record.activo ? 'Desactivar' : 'Activar'}
            </Button>
            <Popconfirm
              title="¿Estás seguro de eliminar esta impresión?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} size="small">
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      ),
    },
  ];

  const impresionesFiltradas = impresiones.filter(impresion => 
    impresion.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
    impresion.formato.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin')} 
              style={{ marginTop: '5px' }}
            />
            
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Gestión de Impresiones
              </h1>
              <p style={{ color: '#666', margin: 0 }}>Administra las tarifas de impresión del sistema</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por descripción o formato..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
            size="large"
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
            size="large"
            style={{ fontWeight: 'bold', backgroundColor: '#13c2c2', borderColor: '#13c2c2' }}
          >
            Nueva Tarifa
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={impresionesFiltradas} 
          rowKey="id"
          pagination={{ 
            defaultPageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} tarifas`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            triggerDesc: 'Click para ordenar descendente',
            triggerAsc: 'Click para ordenar ascendente',
            cancelSort: 'Click para cancelar ordenamiento'
          }}
        />
      </Spin>

      <Modal
        title={editingImpresion ? 'Editar Tarifa de Impresión' : 'Nueva Tarifa de Impresión'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="formato"
            label="Formato"
            rules={[{ required: true, message: 'El formato es requerido' }]}
          >
            <Select
              placeholder="Selecciona el formato"
              options={formatosDisponibles}
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="Tipo de Impresión"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select
              placeholder="Selecciona el tipo"
              options={[
                { value: true, label: 'A Color' },
                { value: false, label: 'Blanco y Negro' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'La descripción es requerida' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Descripción de la tarifa de impresión"
            />
          </Form.Item>

          <Form.Item
            name="precio"
            label="Precio"
            rules={[
              { required: true, message: 'El precio es requerido' },
              { type: 'number', min: 0, message: 'El precio debe ser mayor a 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="$"
              placeholder="0.00"
              precision={2}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Actualizar Precio"
        open={isPriceModalVisible}
        onCancel={() => setIsPriceModalVisible(false)}
        onOk={() => priceForm.submit()}
        okText="Actualizar"
        cancelText="Cancelar"
      >
        <Form
          form={priceForm}
          layout="vertical"
          onFinish={handlePriceSave}
        >
          <Form.Item
            name="precio"
            label="Nuevo Precio"
            rules={[
              { required: true, message: 'El precio es requerido' },
              { type: 'number', min: 0, message: 'El precio debe ser mayor a 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="$"
              placeholder="0.00"
              precision={2}
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ImpresionesAdmin;
