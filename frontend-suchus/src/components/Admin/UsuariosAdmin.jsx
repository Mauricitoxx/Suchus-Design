import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import { usuariosAPI } from '../../services/api';

const { Option } = Select;

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuariosAPI.getAll();
      // La API devuelve { count, results } por paginación
      const usuarios = data.results || data;
      setUsuarios(Array.isArray(usuarios) ? usuarios : []);
    } catch (error) {
      message.error('Error al cargar usuarios: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      email: record.email,
      nombre: record.nombre,
      apellido: record.apellido,
      telefono: record.telefono,
      usuarioTipo: record.tipo_usuario,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingUser) {
        // Transformar usuarioTipo a tipo_usuario para el backend
        const updateData = {
          ...values,
          tipo_usuario: values.usuarioTipo,
        };
        delete updateData.usuarioTipo;
        await usuariosAPI.update(editingUser.id, updateData);
        message.success('Usuario actualizado correctamente');
      } else {
        const createData = {
          ...values,
          tipo_usuario: values.usuarioTipo,
        };
        delete createData.usuarioTipo;
        await usuariosAPI.create(createData);
        message.success('Usuario creado correctamente');
      }
      setIsModalVisible(false);
      fetchUsuarios();
    } catch (error) {
      message.error('Error al guardar: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await usuariosAPI.desactivar(id);
      message.success('Usuario desactivado');
      fetchUsuarios();
    } catch (error) {
      message.error('Error al desactivar: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      if (record.activo) {
        await usuariosAPI.desactivar(record.id);
        message.success('Usuario desactivado');
      } else {
        await usuariosAPI.activar(record.id);
        message.success('Usuario activado');
      }
      fetchUsuarios();
    } catch (error) {
      message.error('Error: ' + (error.error || error.message || 'Error desconocido'));
      console.error('Error:', error);
    }
  };

  const handleChangePassword = (record) => {
    setEditingUser(record);
    passwordForm.resetFields();
    setIsPasswordModalVisible(true);
  };

  const handlePasswordSave = async (values) => {
    try {
      await usuariosAPI.cambiarPassword(editingUser.id, values);
      message.success('Contraseña actualizada correctamente');
      setIsPasswordModalVisible(false);
    } catch (error) {
      message.error('Error al cambiar contraseña: ' + (error.error || error.message || 'Error desconocido'));
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_usuario',
      key: 'tipo_usuario',
      render: (tipo) => (
        <Tag color={tipo === 'Admin' ? 'red' : 'blue'}>
          {tipo}
        </Tag>
      ),
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
              icon={<LockOutlined />}
              size="small"
              onClick={() => handleChangePassword(record)}
            >
              Contraseña
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
              title="¿Estás seguro de desactivar este usuario?"
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
        <h1>Gestión de Usuarios</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          size="large"
        >
          Nuevo Usuario
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={usuarios} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'El email es requerido' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input placeholder="usuario@example.com" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Juan" />
          </Form.Item>

          <Form.Item
            name="apellido"
            label="Apellido"
            rules={[{ required: true, message: 'El apellido es requerido' }]}
          >
            <Input placeholder="Pérez" />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
          >
            <Input placeholder="221-123-4567" />
          </Form.Item>

          <Form.Item
            name="usuarioTipo"
            label="Tipo de Usuario"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select placeholder="Selecciona un tipo">
              <Option value="Cliente">Cliente</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <>
              <Form.Item
                name="contraseña"
                label="Contraseña"
                rules={[
                  { required: true, message: 'La contraseña es requerida' },
                  { min: 6, message: 'Mínimo 6 caracteres' }
                ]}
              >
                <Input.Password placeholder="Mínimo 6 caracteres" />
              </Form.Item>

              <Form.Item
                name="confirmar_contraseña"
                label="Confirmar Contraseña"
                dependencies={['contraseña']}
                rules={[
                  { required: true, message: 'Confirma la contraseña' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('contraseña') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Repetir contraseña" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="Cambiar Contraseña"
        open={isPasswordModalVisible}
        onCancel={() => setIsPasswordModalVisible(false)}
        onOk={() => passwordForm.submit()}
        okText="Cambiar"
        cancelText="Cancelar"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSave}
        >
          <Form.Item
            name="contraseña_nueva"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'La contraseña es requerida' },
              { min: 6, message: 'Mínimo 6 caracteres' }
            ]}
          >
            <Input.Password placeholder="Mínimo 6 caracteres" />
          </Form.Item>

          <Form.Item
            name="confirmar_contraseña"
            label="Confirmar Contraseña"
            dependencies={['contraseña_nueva']}
            rules={[
              { required: true, message: 'Confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('contraseña_nueva') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Repetir contraseña" />
          </Form.Item>

          <Form.Item
            name="contraseña_actual"
            label="Contraseña Actual (para confirmar)"
            rules={[
              { required: true, message: 'Ingresa tu contraseña actual' }
            ]}
          >
            <Input.Password placeholder="Tu contraseña actual" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;
