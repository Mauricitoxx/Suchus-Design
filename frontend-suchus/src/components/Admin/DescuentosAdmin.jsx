import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, Space, message, Card, Tag, Spin } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, PercentageOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usuariostipoAPI } from '../../services/api';

const DescuentosAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [searchText, setSearchText] = useState('');
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Descripción (Tipo)',
      dataIndex: 'descripcion',
      key: 'descripcion',
      sorter: (a, b) => (a.descripcion || '').localeCompare(b.descripcion || ''),
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
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
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              setEditingTipo(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  const tiposFiltrados = tipos.filter(tipo => {
    const term = searchText.toLowerCase();
    const descripcion = (tipo.descripcion || '').toLowerCase();
    return descripcion.includes(term);
  });

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
                Gestión de Descuentos
              </h1>
              <p style={{ color: '#666', margin: 0 }}>Administra los beneficios por tipo de usuario</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por tipo..."
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
            onClick={() => {
              setEditingTipo(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            size="large"
            style={{ fontWeight: 'bold' }}
          >
            Nuevo Tipo
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Table 
          dataSource={tiposFiltrados} 
          columns={columns} 
          rowKey="id"
          pagination={{ 
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} tipos`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No hay tipos de usuario configurados',
            triggerDesc: 'Click para ordenar descendente',
            triggerAsc: 'Click para ordenar ascendente',
            cancelSort: 'Click para cancelar ordenamiento'
          }}
        />
      </Spin>

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