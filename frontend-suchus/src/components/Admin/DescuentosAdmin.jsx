import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, Space, message, Card, Tag, Spin } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, PercentageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usuariostipoAPI } from '../../services/api'; 

const DescuentosAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    setLoading(true);
    try {
      const data = await usuariostipoAPI.getTipos(); 
      // Si la API devuelve el objeto de paginación de Django, tomamos .results
      const lista = Array.isArray(data) ? data : (data.results || []);
      setTipos(lista);
    } catch (error) {
      message.error('Error al cargar tipos de usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingTipo) {
        await usuariostipoAPI.updateTipo(editingTipo.id, values);
        message.success('Tipo de usuario actualizado');
      } else {
        await usuariostipoAPI.createTipo(values);
        message.success('Nuevo tipo creado correctamente');
      }
      setIsModalVisible(false);
      fetchTipos();
    } catch (error) {
      message.error('Error al guardar los cambios');
    }
  };

  const columns = [
    {
      title: 'Descripción (Tipo)',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
      // Filtro dinámico seguro
      filters: (tipos || []).map(t => ({ text: t.descripcion, value: t.descripcion })),
      onFilter: (value, record) => record.descripcion === value,
    },
    {
      title: 'Descuento Aplicado',
      dataIndex: 'descuento',
      key: 'descuento',
      sorter: (a, b) => a.descuento - b.descuento,
      render: (dto) => (
        <Tag color={dto > 0 ? 'green' : 'orange'} style={{ borderRadius: '4px' }}>
          {dto > 0 ? `${dto}% OFF` : 'Sin Descuento'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Button 
          type="text"
          icon={<EditOutlined />} 
          onClick={() => {
            setEditingTipo(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space size="middle">
            <Button 
              icon={<ArrowLeftOutlined />} 
              // CAMBIO CLAVE: navigate(-1) vuelve exactamente de donde vino el usuario
              onClick={() => navigate(-1)} 
              shape="circle"
            />
            <div>
              <h2 style={{ margin: 0 }}>Tipos y Descuentos</h2>
              <span style={{ color: '#8c8c8c' }}>Gestiona los beneficios por categoría</span>
            </div>
          </Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingTipo(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            size="large"
          >
            Nuevo Tipo
          </Button>
        </div>
      </Card>

      <Card style={{ borderRadius: '12px' }}>
        <Spin spinning={loading}>
          <Table 
            dataSource={tipos} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No hay tipos de usuario configurados' }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingTipo ? "Modificar Tipo" : "Crear Nuevo Tipo"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item 
            name="descripcion" 
            label="Nombre de la Categoría" 
            rules={[{ required: true, message: 'Ej: Alumno' }]}
          >
            <Input placeholder="Nombre del tipo de usuario" />
          </Form.Item>
          
          <Form.Item 
            name="descuento" 
            label="Porcentaje de Descuento"
            initialValue={0}
            rules={[{ required: true, message: 'Define un valor (puedes ser 0)' }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              style={{ width: '100%' }}
              prefix={<PercentageOutlined />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DescuentosAdmin;