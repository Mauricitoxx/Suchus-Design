import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Button, message, Card, Typography, Space, Modal, Descriptions, Divider, Spin, Input, InputNumber, Tabs, Form, DatePicker } from 'antd';
import { EyeOutlined, ClockCircleOutlined, ArrowLeftOutlined, SearchOutlined, PlusOutlined, DeleteOutlined, ShoppingOutlined, PrinterOutlined, FilePdfOutlined, FileImageOutlined, UserAddOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pedidosAPI, usuariosAPI, productosAPI, usuariostipoAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PedidoAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  // Modal motivo corrección
  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);
  const [motivoCorreccion, setMotivoCorreccion] = useState('');
  const [pedidoMotivoId, setPedidoMotivoId] = useState(null);
  
  // Estado para la búsqueda
  const [searchText, setSearchText] = useState('');
  const [rangoFechas, setRangoFechas] = useState(null);

  // Estados para Crear Pedido
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [pasoActual, setPasoActual] = useState(1); // 1: Seleccionar Cliente, 2: Agregar Items
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [itemsEnPedido, setItemsEnPedido] = useState([]); // Productos e impresiones juntos
  const [observaciones, setObservaciones] = useState('');
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  
  // Estados para impresiones
  const [archivosImpresion, setArchivosImpresion] = useState([]);

  // Modal Registrar nuevo cliente (dentro de Crear Pedido)
  const [modalNuevoClienteVisible, setModalNuevoClienteVisible] = useState(false);
  const [formNuevoCliente] = Form.useForm();
  const [loadingNuevoCliente, setLoadingNuevoCliente] = useState(false);
  const [tiposUsuario, setTiposUsuario] = useState([]);

  // Modal confirmar cancelar pedido
  const [confirmCancelarVisible, setConfirmCancelarVisible] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState(null);

  const precioPorHoja = {
    A4: { 'blanco y negro': 20, color: 40 },
    A3: { 'blanco y negro': 30, color: 60 },
  };

  const getColorEstado = (estado) => {
    const colores = {
      'Pendiente': 'orange',
      'En proceso': 'blue',
      'Preparado': 'purple',
      'Retirado': 'green',
      'Cancelado': 'default',
      'Requiere Corrección': 'red',
    };
    return colores[estado] ?? 'default';
  };

  const fetchPedidos = async (rangoOverride = null) => {
    setLoading(true);
    try {
      const params = {};
      const range = rangoOverride !== undefined && rangoOverride !== null ? rangoOverride : rangoFechas;
      if (range && range[0] && range[1]) {
        params.fecha_desde = range[0].format('YYYY-MM-DD');
        params.fecha_hasta = range[1].format('YYYY-MM-DD');
      }
      const response = await pedidosAPI.getAll(params);
      const lista = (response && response.results) ? response.results : (Array.isArray(response) ? response : []);
      setPedidos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      message.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const cargarTiposUsuario = async () => {
    try {
      const data = await usuariostipoAPI.getTipos();
      const lista = Array.isArray(data) ? data : (data.results || []);
      setTiposUsuario(lista);
    } catch (error) {
      console.error('Error al cargar tipos de usuario:', error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    cargarClientes();
    cargarProductos();
    cargarTiposUsuario();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await usuariosAPI.getAll({ activo: true });
      const clientesData = response.results || response || [];
      // Filtrar solo clientes válidos con ID
      const clientesValidos = Array.isArray(clientesData) 
        ? clientesData.filter(c => c && c.id)
        : [];
      setClientes(clientesValidos);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      message.error('Error al cargar clientes');
      setClientes([]);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await productosAPI.activos();
      console.log('Productos recibidos:', response);
      
      // El endpoint activos() puede devolver un array directamente o un objeto con results
      let productosData = [];
      if (Array.isArray(response)) {
        productosData = response;
      } else if (response && response.results) {
        productosData = response.results;
      } else if (response && Array.isArray(response.data)) {
        productosData = response.data;
      }
      
      console.log('Productos procesados:', productosData);
      
      // Filtrar solo productos válidos con ID y precio
      const productosValidos = productosData.filter(p => p && p.id && p.precioUnitario != null);
      console.log('Productos válidos:', productosValidos);
      
      setProductos(productosValidos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      message.error('Error al cargar productos');
      setProductos([]);
    }
  };

  const handleAbrirModalCrear = () => {
    setModalCrearVisible(true);
    setPasoActual(1);
    setClienteSeleccionado(null);
    setItemsEnPedido([]);
    setObservaciones('');
    setBusquedaCliente('');
  };

  const handleCerrarModalCrear = () => {
    setModalCrearVisible(false);
    setPasoActual(1);
    setClienteSeleccionado(null);
    setItemsEnPedido([]);
    setObservaciones('');
    setBusquedaCliente('');
    setProductoSeleccionado(null);
    setCantidadProducto(1);
    // Limpiar archivos de impresión
    archivosImpresion.forEach(arc => {
      if (arc.previewUrl) URL.revokeObjectURL(arc.previewUrl);
    });
    setArchivosImpresion([]);
  };

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setPasoActual(2);
  };

  const handleAbrirNuevoCliente = () => {
    formNuevoCliente.resetFields();
    setModalNuevoClienteVisible(true);
  };

  const handleCerrarNuevoCliente = () => {
    setModalNuevoClienteVisible(false);
    formNuevoCliente.resetFields();
  };

  const handleGuardarNuevoCliente = async (values) => {
    setLoadingNuevoCliente(true);
    try {
      const data = {
        email: values.email,
        contraseña: values.contraseña,
        confirmar_contraseña: values.confirmar_contraseña,
        nombre: values.nombre,
        apellido: values.apellido,
        telefono: values.telefono || '',
        tipo_usuario: values.tipo_usuario || 'Cliente'
      };
      const response = await usuariosAPI.create(data);
      const usuarioCreado = response.usuario || response;
      message.success('Cliente registrado correctamente');
      await cargarClientes();
      setClienteSeleccionado(usuarioCreado);
      setPasoActual(2);
      handleCerrarNuevoCliente();
    } catch (error) {
      const backendErrors = error.response?.data;
      if (backendErrors && typeof backendErrors === 'object') {
        const formErrors = Object.keys(backendErrors).map(field => ({
          name: field === 'tipo_usuario' ? 'tipo_usuario' : field,
          errors: Array.isArray(backendErrors[field]) ? backendErrors[field] : [backendErrors[field]]
        }));
        formNuevoCliente.setFields(formErrors);
        message.error('Revisa los campos marcados');
      } else {
        message.error(error.response?.data?.error || error.message || 'Error al crear el cliente');
      }
    } finally {
      setLoadingNuevoCliente(false);
    }
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado) {
      message.warning('Selecciona un producto');
      return;
    }
    if (cantidadProducto <= 0) {
      message.warning('La cantidad debe ser mayor a 0');
      return;
    }

    const itemExistente = itemsEnPedido.find(item => 
      !item.esImpresion && item.id === productoSeleccionado.id
    );
    if (itemExistente) {
      message.warning('Este producto ya fue agregado');
      return;
    }

    const precioUnitario = Number(productoSeleccionado.precioUnitario) || 0;
    const nuevoItem = {
      ...productoSeleccionado,
      cantidad: cantidadProducto,
      subtotal: precioUnitario * cantidadProducto,
      esImpresion: false,
      tipo: 'Producto'
    };

    setItemsEnPedido([...itemsEnPedido, nuevoItem]);
    setProductoSeleccionado(null);
    setCantidadProducto(1);
    message.success('Producto agregado');
  };

  // Función para obtener páginas de PDF (igual que en CardImpresion)
  const obtenerPaginasPDF = (file) => {
    return new Promise((resolve) => {
      if (file.type !== 'application/pdf') {
        resolve(1);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = function() {
        const contenido = reader.result;
        const matches = contenido.match(/\/Count\s+(\d+)/g);
        if (matches) {
          const num = matches[matches.length - 1].match(/\d+/)[0];
          resolve(parseInt(num));
        } else {
          const paginas = (contenido.match(/\/Type\s*\/Page\b/g) || []).length;
          resolve(paginas > 0 ? paginas : 1);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleArchivoChange = async (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = [];

    for (const file of files) {
      const paginas = await obtenerPaginasPDF(file);
      nuevosArchivos.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        hojas: paginas,
        previewUrl: URL.createObjectURL(file),
        type: file.type,
        tipoHoja: 'A4',
        color: 'blanco y negro',
        cantidad: 1
      });
    }

    setArchivosImpresion(prev => [...prev, ...nuevosArchivos]);
    e.target.value = null;
  };

  const updateArchivoConfig = (id, field, value) => {
    setArchivosImpresion(prev => prev.map(arc => 
      arc.id === id ? { ...arc, [field]: value } : arc
    ));
  };

  const handleEliminarArchivo = (id) => {
    setArchivosImpresion(prev => {
      const arc = prev.find(a => a.id === id);
      if (arc) URL.revokeObjectURL(arc.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleAgregarImpresionesAlPedido = () => {
    if (archivosImpresion.length === 0) {
      message.warning('Selecciona al menos un archivo');
      return;
    }

    const nuevasImpresiones = archivosImpresion.map(arc => {
      const precioH = precioPorHoja[arc.tipoHoja][arc.color];
      const precioUnitario = arc.hojas * precioH;
      const subtotal = precioUnitario * arc.cantidad;

      return {
        id: `IMP-${Date.now()}-${arc.id}`,
        nombre: arc.name,
        cantidad: arc.cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotal,
        esImpresion: true,
        tipo: 'Impresión',
        detalles: {
          hojas: arc.hojas,
          formato: arc.tipoHoja,
          color: arc.color
        }
      };
    });

    setItemsEnPedido([...itemsEnPedido, ...nuevasImpresiones]);
    // Limpiar archivos después de agregar
    archivosImpresion.forEach(arc => {
      if (arc.previewUrl) URL.revokeObjectURL(arc.previewUrl);
    });
    setArchivosImpresion([]);
    message.success(`${nuevasImpresiones.length} impresión(es) agregada(s)`);
  };

  const handleEliminarItem = (itemId) => {
    setItemsEnPedido(itemsEnPedido.filter(item => item.id !== itemId));
    message.info('Item eliminado');
  };

  const calcularTotal = () => {
    return itemsEnPedido.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
  };

  const handleConfirmarPedido = async () => {
    if (itemsEnPedido.length === 0) {
      message.warning('Agrega al menos un item al pedido');
      return;
    }

    if (!clienteSeleccionado || !clienteSeleccionado.id) {
      message.error('Error: Cliente no seleccionado');
      return;
    }

    setLoadingCrear(true);
    try {
      const productos = itemsEnPedido.filter(item => !item.esImpresion);
      const impresiones = itemsEnPedido.filter(item => item.esImpresion);

      const detallesProductos = productos.map(p => ({
        fk_producto: Number(p.id),
        cantidad: Number(p.cantidad) || 1,
        precio_unitario: Number(p.precioUnitario) || 0
      }));

      const detallesImpresiones = impresiones.map(imp => ({
        nombre_archivo: imp.nombre,
        hojas: imp.detalles.hojas,
        formato: imp.detalles.formato,
        color: imp.detalles.color,
        copias: imp.cantidad,
        precio_unitario: imp.precioUnitario
      }));

      // LA CLAVE: Convertimos los arrays a STRING porque tu backend hace json.loads()
      const data = {
        fk_usuario: Number(clienteSeleccionado.id),
        detalles: JSON.stringify(detallesProductos), 
        impresiones: JSON.stringify(detallesImpresiones),
        observacion: observaciones || ''
      };

      await pedidosAPI.create(data);
      message.success('Pedido creado exitosamente');
      handleCerrarModalCrear();
      fetchPedidos();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      message.error(error.response?.data?.error || 'Error al crear el pedido');
    } finally {
      setLoadingCrear(false);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    if (!c) return false;
    const nombre = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const busqueda = busquedaCliente.toLowerCase();
    return nombre.includes(busqueda) || email.includes(busqueda);
  });

  const handleCambiarEstado = async (id, nuevoEstado, motivo = null) => {
    try {
      await pedidosAPI.cambiarEstado(id, nuevoEstado, motivo);
      message.success(`Pedido #${id} actualizado`);
      fetchPedidos();
    } catch (error) {
      message.error("No se pudo actualizar el estado");
    }
  };

  // Lógica de filtrado por nombre/apellido
  // Ubicación: Justo antes de la definición de 'columns'
    const pedidosFiltrados = pedidos.filter(pedido => {
    const nombreCompleto = `${pedido.usuario_nombre} ${pedido.usuario_apellido}`.toLowerCase();
    const idPedido = pedido.id.toString(); // Convertimos el ID a texto para comparar
    const busqueda = searchText.toLowerCase();

    return nombreCompleto.includes(busqueda) || idPedido.includes(busqueda);
    });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_, record) => `${record.usuario_nombre || ''} ${record.usuario_apellido || ''}`,
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
      // Filtros rápidos en la columna
      filters: [
        { text: 'Pendiente', value: 'Pendiente' },
        { text: 'En proceso', value: 'En proceso' },
        { text: 'Preparado', value: 'Preparado' },
        { text: 'Retirado', value: 'Retirado' },
        { text: 'Cancelado', value: 'Cancelado' },
        { text: 'Requiere Corrección', value: 'Requiere Corrección' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado) => <Tag color={getColorEstado(estado)}>{estado?.toUpperCase() || 'S/E'}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setPedidoSeleccionado(record);
                setModalVisible(true);
              }}
            >
              Detalles
            </Button>
          </Space>
          <Space size="small">
            <Select
              value={record.estado}
              size="small"
              style={{ width: 170 }}
              onChange={(value) => {
                if (value === 'Cancelado') {
                  setPedidoACancelar(record.id);
                  setConfirmCancelarVisible(true);
                } else if (value === 'Requiere Corrección') {
                  setPedidoMotivoId(record.id);
                  setMotivoCorreccion('');
                  setModalMotivoVisible(true);
                } else {
                  handleCambiarEstado(record.id, value);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Option value="Pendiente">Pendiente</Option>
              <Option value="En proceso">En proceso</Option>
              <Option value="Preparado">Preparado</Option>
              <Option value="Retirado">Retirado</Option>
              <Option value="Cancelado">Cancelado</Option>
              <Option value="Requiere Corrección">Requiere Corrección</Option>
            </Select>
          </Space>
        </Space>
      ),
    },
  ];

  const handleEnviarMotivo = async () => {
    if (!motivoCorreccion.trim()) {
      message.warning('Debes ingresar un motivo de corrección');
      return;
    }
    await handleCambiarEstado(pedidoMotivoId, 'Requiere Corrección', motivoCorreccion);
    setModalMotivoVisible(false);
    setMotivoCorreccion('');
    setPedidoMotivoId(null);
  };

  const handleCancelarMotivo = () => {
    setModalMotivoVisible(false);
    setMotivoCorreccion('');
    setPedidoMotivoId(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin')} 
              style={{ marginTop: '5px' }}
            />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                Gestión de Pedidos
              </h1>
              <p style={{ color: '#666', margin: 0 }}>Administra los pedidos del sistema</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Buscar por cliente o ID..."
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
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAbrirModalCrear}
            size="large"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 'bold' }}
          >
            Crear Pedido
          </Button>
        </div>
      </Card>

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

      {/* Modal motivo corrección */}
      <Modal
        title="Motivo de corrección requerido"
        open={modalMotivoVisible}
        onCancel={handleCancelarMotivo}
        footer={[
          <Button key="cancel" onClick={handleCancelarMotivo}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleEnviarMotivo}>
            Enviar motivo
          </Button>
        ]}
        width="min(600px, 95vw)"
        style={{ top: 16 }}
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' } }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 12, color: '#595959' }}>
            Por favor, ingresa el motivo por el cual el archivo requiere corrección. Este mensaje será visible para el cliente.
          </p>
          <Input.TextArea
            value={motivoCorreccion}
            onChange={e => setMotivoCorreccion(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="Describe el motivo de la corrección..."
            showCount
            style={{ resize: 'none' }}
          />
        </div>
      </Modal>

      {/* Modal confirmar cancelar pedido */}
      <Modal
        title="¿Cancelar pedido?"
        open={confirmCancelarVisible}
        onOk={() => {
          if (pedidoACancelar) {
            handleCambiarEstado(pedidoACancelar, 'Cancelado');
          }
          setConfirmCancelarVisible(false);
          setPedidoACancelar(null);
        }}
        onCancel={() => {
          setConfirmCancelarVisible(false);
          setPedidoACancelar(null);
        }}
        okText="Sí, cancelar pedido"
        cancelText="No"
        okButtonProps={{ danger: true }}
      >
        <p>¿Está seguro de dar de baja este pedido? El estado pasará a &quot;Cancelado&quot;.</p>
      </Modal>

      {/* Modal de Detalles de Pedido */}
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
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <div style={{ minWidth: 320 }}>
                <Descriptions title="Información del Cliente" bordered column={2} size="small">
                  <Descriptions.Item label="Nombre Completo">
                    <span style={{ whiteSpace: 'nowrap' }}>{pedidoSeleccionado.usuario_nombre} {pedidoSeleccionado.usuario_apellido}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <span style={{ whiteSpace: 'nowrap' }}>{pedidoSeleccionado.usuario_email}</span>
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
                  </div>
                )}
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
                      {
                        title: 'Estado de archivo',
                        key: 'estado_archivo',
                        render: (imp) =>
                          imp.estado === 'Requiere Corrección' ? (
                            <Tag color="orange">Requiere Corrección</Tag>
                          ) : (
                            <Tag color="green">OK</Tag>
                          ),
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

      {/* Modal de Crear Pedido */}
      <Modal
        title={pasoActual === 1 ? "Crear Pedido - Seleccionar Cliente" : "Crear Pedido - Agregar Productos"}
        open={modalCrearVisible}
        onCancel={handleCerrarModalCrear}
        width={800}
        footer={null}
      >
        {pasoActual === 1 ? (
          // PASO 1: Seleccionar Cliente
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <Input
                placeholder="Buscar cliente por nombre o email..."
                prefix={<SearchOutlined />}
                size="large"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                size="large"
                onClick={handleAbrirNuevoCliente}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Registrar nuevo cliente
              </Button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(cliente => (
                  <Card
                    key={cliente.id}
                    hoverable
                    style={{ marginBottom: '10px' }}
                    onClick={() => handleSeleccionarCliente(cliente)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{cliente.nombre || ''} {cliente.apellido || ''}</strong>
                        <br />
                        <span style={{ color: '#666' }}>{cliente.email || 'Sin email'}</span>
                        <br />
                        <Tag color="blue">
                          {cliente.usuarioTipo && typeof cliente.usuarioTipo === 'object' 
                            ? cliente.usuarioTipo.descripcion 
                            : 'Cliente'}
                        </Tag>
                      </div>
                      <Button type="primary">Seleccionar</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No se encontraron clientes
                </div>
              )}
            </div>
          </div>
        ) : (
          // PASO 2: Agregar Items
          <div>
            <Card style={{ marginBottom: '20px', backgroundColor: '#f0f9ff' }}>
              <strong>Cliente seleccionado:</strong> {clienteSeleccionado?.nombre || ''} {clienteSeleccionado?.apellido || ''}
              <br />
              <span style={{ color: '#666' }}>{clienteSeleccionado?.email || 'Sin email'}</span>
              <Button 
                type="link" 
                onClick={() => setPasoActual(1)}
                style={{ float: 'right' }}
              >
                Cambiar cliente
              </Button>
            </Card>

            <Tabs defaultActiveKey="productos" style={{ marginBottom: '20px' }}>
              {/* TAB DE PRODUCTOS */}
              <Tabs.TabPane 
                tab={<span><ShoppingOutlined /> Productos</span>} 
                key="productos"
              >
                {productos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <ShoppingOutlined style={{ fontSize: '48px', marginBottom: '10px' }} />
                    <p>No hay productos disponibles</p>
                  </div>
                ) : (
                  <Space style={{ width: '100%', marginBottom: '20px' }} size="middle" wrap>
                    <Select
                      showSearch
                      placeholder="Seleccionar producto"
                      style={{ width: 300 }}
                      value={productoSeleccionado?.id}
                      onChange={(value) => {
                        const producto = productos.find(p => p && p.id === value);
                        setProductoSeleccionado(producto || null);
                      }}
                      filterOption={(input, option) =>
                        (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {productos.map(p => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.nombre} - ${Number(p.precioUnitario).toLocaleString()}
                        </Select.Option>
                      ))}
                    </Select>
                    <InputNumber
                      min={1}
                      value={cantidadProducto}
                      onChange={setCantidadProducto}
                      placeholder="Cantidad"
                      style={{ width: 100 }}
                    />
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAgregarProducto}
                      disabled={!productoSeleccionado}
                    >
                      Agregar Producto
                    </Button>
                  </Space>
                )}
              </Tabs.TabPane>

              {/* TAB DE IMPRESIONES */}
              <Tabs.TabPane 
                tab={<span><PrinterOutlined /> Impresiones</span>} 
                key="impresiones"
              >
                <div className="upload-container" style={{ 
                  border: '2px dashed #40a9ff', 
                  padding: '20px', 
                  textAlign: 'center', 
                  borderRadius: '8px', 
                  marginBottom: 20,
                  backgroundColor: '#fafafa'
                }}>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleArchivoChange} 
                    accept=".pdf,image/*" 
                    id="file-input-impresion" 
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="file-input-impresion" style={{ cursor: 'pointer', color: '#1890ff' }}>
                    <PrinterOutlined style={{ fontSize: '32px', marginBottom: '10px' }} />
                    <br />
                    <strong>+ Seleccionar Archivos</strong>
                    <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>
                      Podrás configurar cada uno por separado
                    </p>
                  </label>
                </div>

                <div className="lista-archivos-config">
                  {archivosImpresion.map((arc) => (
                    <Card key={arc.id} size="small" style={{ marginBottom: 10, backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {arc.type === 'application/pdf' ? 
                            <FilePdfOutlined style={{color: 'red', fontSize: '20px'}}/> : 
                            <FileImageOutlined style={{color: 'blue', fontSize: '20px'}}/>
                          }
                          <a 
                            href={arc.previewUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              fontWeight: '500', 
                              maxWidth: '200px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {arc.name}
                          </a>
                          <Tag color="blue">{arc.hojas} {arc.hojas === 1 ? 'pág' : 'págs'}</Tag>
                        </div>
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleEliminarArchivo(arc.id)} 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Select 
                          size="small" 
                          value={arc.tipoHoja} 
                          onChange={v => updateArchivoConfig(arc.id, 'tipoHoja', v)} 
                          style={{ width: 70 }}
                        >
                          <Select.Option value="A4">A4</Select.Option>
                          <Select.Option value="A3">A3</Select.Option>
                        </Select>

                        <Select 
                          size="small" 
                          value={arc.color} 
                          onChange={v => updateArchivoConfig(arc.id, 'color', v)} 
                          style={{ width: 120 }}
                        >
                          <Select.Option value="blanco y negro">B&N</Select.Option>
                          <Select.Option value="color">Color</Select.Option>
                        </Select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <small>Copias:</small>
                          <InputNumber 
                            size="small" 
                            min={1} 
                            value={arc.cantidad} 
                            onChange={v => updateArchivoConfig(arc.id, 'cantidad', v)} 
                            style={{ width: 60 }} 
                          />
                        </div>

                        <div style={{ marginLeft: 'auto', fontWeight: 'bold', color: '#1890ff' }}>
                          ${(arc.hojas * precioPorHoja[arc.tipoHoja][arc.color] * arc.cantidad).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {archivosImpresion.length > 0 && (
                  <>
                    <div style={{ 
                      marginTop: 20, 
                      padding: 15, 
                      backgroundColor: '#e6f7ff', 
                      borderRadius: 8 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Total a agregar ({archivosImpresion.length} archivos):</span>
                        <strong style={{ fontSize: '18px', color: '#1890ff' }}>
                          ${archivosImpresion.reduce((acc, arc) => 
                            acc + (arc.hojas * precioPorHoja[arc.tipoHoja][arc.color] * arc.cantidad), 0
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <Button 
                      type="primary" 
                      block 
                      size="large" 
                      onClick={handleAgregarImpresionesAlPedido} 
                      style={{ marginTop: 15 }}
                      icon={<PlusOutlined />}
                    >
                      Agregar {archivosImpresion.length} impresión(es) al pedido
                    </Button>
                  </>
                )}
              </Tabs.TabPane>
            </Tabs>

            <Divider orientation="left">Items en el Pedido</Divider>

            {itemsEnPedido.length > 0 ? (
              <Table
                dataSource={itemsEnPedido}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { 
                    title: 'Tipo', 
                    dataIndex: 'tipo', 
                    key: 'tipo',
                    width: 100,
                    render: (tipo) => (
                      <Tag color={tipo === 'Producto' ? 'blue' : 'green'}>
                        {tipo}
                      </Tag>
                    )
                  },
                  { 
                    title: 'Nombre/Descripción', 
                    dataIndex: 'nombre', 
                    key: 'nombre',
                    render: (nombre, record) => (
                      <div>
                        {nombre || 'Sin nombre'}
                        {record.esImpresion && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.detalles.formato} - {record.detalles.color} - {record.detalles.hojas} hojas
                          </div>
                        )}
                      </div>
                    )
                  },
                  { 
                    title: 'Cantidad', 
                    dataIndex: 'cantidad', 
                    key: 'cantidad', 
                    align: 'center',
                    width: 100,
                    render: (cantidad) => cantidad || 0
                  },
                  { 
                    title: 'Precio Unit.', 
                    dataIndex: 'precioUnitario', 
                    key: 'precioUnitario',
                    width: 120,
                    render: (precio) => `$${Number(precio || 0).toLocaleString()}`
                  },
                  { 
                    title: 'Subtotal', 
                    dataIndex: 'subtotal', 
                    key: 'subtotal',
                    width: 120,
                    render: (subtotal) => <strong>${Number(subtotal || 0).toLocaleString()}</strong>
                  },
                  {
                    title: 'Acción',
                    key: 'accion',
                    width: 80,
                    render: (_, record) => (
                      <Button 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleEliminarItem(record.id)}
                      />
                    )
                  }
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No hay items agregados al pedido
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '18px' }}>
              <strong>TOTAL: ${calcularTotal().toLocaleString()}</strong>
            </div>

            <Divider />

            <Input.TextArea
              placeholder="Observaciones (opcional)"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              style={{ marginBottom: '20px' }}
            />

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCerrarModalCrear}>
                  Cancelar
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleConfirmarPedido}
                  loading={loadingCrear}
                  disabled={itemsEnPedido.length === 0}
                >
                  Confirmar Pedido
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Registrar nuevo cliente */}
      <Modal
        title="Registrar nuevo cliente"
        open={modalNuevoClienteVisible}
        onCancel={handleCerrarNuevoCliente}
        onOk={() => formNuevoCliente.submit()}
        okText="Crear y usar como cliente"
        cancelText="Cancelar"
        width={500}
        confirmLoading={loadingNuevoCliente}
      >
        <Form
          form={formNuevoCliente}
          layout="vertical"
          onFinish={handleGuardarNuevoCliente}
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

          <Form.Item name="telefono" label="Teléfono">
            <Input placeholder="2211234567" />
          </Form.Item>

          <Form.Item
            name="tipo_usuario"
            label="Tipo de usuario"
            initialValue="Cliente"
            rules={[{ required: true, message: 'El tipo es requerido' }]}
          >
            <Select placeholder="Selecciona un tipo" showSearch optionFilterProp="children">
              {tiposUsuario.map((t) => (
                <Option key={t.id} value={t.descripcion}>
                  {t.descripcion}{t.descuento != null && t.descuento > 0 ? ` (${t.descuento}% desc.)` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
            label="Confirmar contraseña"
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
        </Form>
      </Modal>
    </div>
  );
};

export default PedidoAdmin;