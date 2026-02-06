import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag, Spin, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DollarOutlined, SearchOutlined,ArrowLeftOutlined  } from '@ant-design/icons';
import { productosAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';


const { TextArea } = Input;

const ProductosAdmin = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
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
      await productosAPI.delete(id);
      message.success('Producto eliminado');
      fetchProductos();
    } catch (error) {
      message.error('Error al eliminar: ' + (error.error || error.message || 'Error desconocido'));
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
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
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
      sorter: (a, b) => a.precioUnitario - b.precioUnitario,
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
      sorter: (a, b) => {
        const aText = a.activo ? 'Activo' : 'Inactivo';
        const bText = b.activo ? 'Activo' : 'Inactivo';
        return aText.localeCompare(bText);
      },
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

  const productosFiltrados = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            {/* Este es el botón de la flecha */}
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin')} 
              style={{ marginTop: '5px' }}
            />
            
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Gestión de Productos
              </h1>
              <p style={{ color: '#666', margin: 0 }}>Administra los productos del sistema</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por nombre..."
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
            style={{ fontWeight: 'bold' }}
          >
            Nuevo Producto
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={productosFiltrados} 
          rowKey="id"
          pagination={{ 
            defaultPageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} productos`,
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
