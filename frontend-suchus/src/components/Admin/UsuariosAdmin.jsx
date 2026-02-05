import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Spin, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, LockOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { usuariosAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom'; // Agregar esta importación
const { Option } = Select;

const UsuariosAdmin = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
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
      const data = {
        ...values,
        tipo_usuario: values.usuarioTipo,
      };
      delete data.usuarioTipo;

      if (editingUser) {
        await usuariosAPI.update(editingUser.id, data);
        message.success('Usuario actualizado');
      } else {
        await usuariosAPI.create(data);
        message.success('Usuario creado');
      }
      setIsModalVisible(false);
      fetchUsuarios();
    } catch (error) {
      // 1. Extraer los datos del error de la respuesta (Axios guarda esto en error.response.data)
      const backendErrors = error.response?.data;

      if (backendErrors && typeof backendErrors === 'object') {
        // 2. Mapear errores a los campos del formulario de Ant Design
        const formErrors = Object.keys(backendErrors).map(field => ({
          name: field === 'tipo_usuario' ? 'usuarioTipo' : field, // Ajuste por el nombre que usas en el form
          errors: Array.isArray(backendErrors[field]) ? backendErrors[field] : [backendErrors[field]]
        }));
        
        form.setFields(formErrors);
        message.error('Revisa los campos marcados en rojo');
      } else {
        message.error('Error: ' + (error.message || 'Error inesperado'));
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await usuariosAPI.delete(id);
      message.success('Usuario eliminado');
      fetchUsuarios();
    } catch (error) {
      message.error('Error al eliminar: ' + (error.error || error.message || 'Error desconocido'));
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
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
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
      width: 120, // Agregamos un ancho fijo para que no "baile" la columna
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Cliente', value: 'Cliente' },
        { text: 'Frecuente', value: 'Frecuente' },
        { text: 'Alumno', value: 'Alumno' },
      ],
      // Esta función es la que hace la magia del filtrado
      onFilter: (value, record) => record.tipo_usuario === value,
      render: (tipo) => {
        let color = 'blue';
        if (tipo === 'Admin') color = 'red';
        if (tipo === 'Frecuente') color = 'purple';
        if (tipo === 'Alumno') color = 'orange';
        
        return (
          <Tag color={color} key={tipo}>
            {tipo?.toUpperCase() || 'S/T'}
          </Tag>
        );
      },
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

  const usuariosFiltrados = usuarios.filter(usuario => {
    const term = searchText.toLowerCase();
    
    // Verificamos cada campo, asegurándonos de que no sean nulos
    const emailMatch = (usuario.email || '').toLowerCase().includes(term);
    const nombreMatch = (usuario.nombre || '').toLowerCase().includes(term);
    const apellidoMatch = (usuario.apellido || '').toLowerCase().includes(term);
    
    // Opcional: Combinar nombre y apellido para buscar "Juan Perez" completo
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase();
    const nombreCompletoMatch = nombreCompleto.includes(term);

    return emailMatch || nombreMatch || apellidoMatch || nombreCompletoMatch;
  });

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
                Gestión de Usuarios
              </h1>
              <p style={{ color: '#666', margin: 0 }}>Administra los usuarios del sistema</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
            size="large"
            allowClear
          />
          
          {/* --- NUEVO BOTÓN DE DESCUENTOS --- */}
          <Button 
            onClick={() => navigate('/admin/descuentos')}
            size="large"
            style={{ backgroundColor: '#52c41a', color: 'white', fontWeight: 'bold' }}
          >
            Gestionar Descuentos
          </Button>
          {/* -------------------------------- */}

          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
            size="large"
            style={{ fontWeight: 'bold' }}
          >
            Nuevo Usuario
          </Button>
        </div>
      </Card>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={usuariosFiltrados} 
          rowKey="id"
          pagination={{ 
            defaultPageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} usuarios`,
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
              <Option value="Frecuente">Frecuente</Option>
              <Option value="Alumno">Alumno</Option>
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
