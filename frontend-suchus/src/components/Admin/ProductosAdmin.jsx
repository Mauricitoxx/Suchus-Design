import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DollarOutlined } from '@ant-design/icons';
import { productosAPI } from '../../services/api';

const { TextArea } = Input;

const ProductosAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [priceForm] = Form.useForm();

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const data = await productosAPI.getAll();
      const productos = data.results || data;
      setProductos(Array.isArray(productos) ? productos : []);
    } catch (error) {
      message.error('Error al cargar productos: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      nombre: record.nombre,
      descripcion: record.descripcion,
      precioUnitario: record.precioUnitario,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingProduct) {
        await productosAPI.update(editingProduct.id, values);
        message.success('Producto actualizado correctamente');
      } else {
        await productosAPI.create(values);
        message.success('Producto creado correctamente');
      }
      setIsModalVisible(false);
      fetchProductos();
    } catch (error) {
      message.error('Error al guardar: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productosAPI.desactivar(id);
      message.success('Producto desactivado');
      fetchProductos();
    } catch (error) {
      message.error('Error al desactivar: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      if (record.activo) {
        await productosAPI.desactivar(record.id);
        message.success('Producto desactivado');
      } else {
        await productosAPI.activar(record.id);
        message.success('Producto activado');
      }
      fetchProductos();
    } catch (error) {
      message.error('Error: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleChangePrice = (record) => {
    setEditingProduct(record);
    priceForm.setFieldsValue({
      precioUnitario: record.precioUnitario,
    });
    setIsPriceModalVisible(true);
  };

  const handlePriceSave = async (values) => {
    try {
      await productosAPI.actualizarPrecio(editingProduct.id, values);
      message.success('Precio actualizado correctamente');
      setIsPriceModalVisible(false);
      fetchProductos();
    } catch (error) {
      message.error('Error al actualizar precio: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
    },
    {
      title: 'Precio',
      dataIndex: 'precioUnitario',
      key: 'precioUnitario',
      render: (precio) => `$${precio.toFixed(2)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo) => (
        <Tag color={activo ? 'green' : 'default'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
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
              title="¿Estás seguro de desactivar este producto?"
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Productos</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          size="large"
        >
          Nuevo Producto
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={productos} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Nombre del producto" />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'La descripción es requerida' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Descripción detallada del producto"
            />
          </Form.Item>

          <Form.Item
            name="precioUnitario"
            label="Precio Unitario"
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
            name="precioUnitario"
            label="Nuevo Precio Unitario"
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

export default ProductosAdmin;
