import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message } from 'antd';
import { FileTextOutlined, EditOutlined, BookOutlined, FolderOutlined, ShoppingOutlined, ScissorOutlined, HighlightOutlined, TagsOutlined } from '@ant-design/icons';
import '../assets/style/CardProducto.css';
import { productosAPI } from '../services/api';

const obtenerIcono = (nombreProducto) => {
  const nombre = nombreProducto.toLowerCase();
  
  if (nombre.includes('hoja') || nombre.includes('resma') || nombre.includes('papel')) 
    return <FileTextOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('lápiz') || nombre.includes('lapiz') || nombre.includes('lapicera') || nombre.includes('birome'))
    return <EditOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('cuaderno') || nombre.includes('libreta'))
    return <BookOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('carpeta'))
    return <FolderOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('tijera'))
    return <ScissorOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('marcador') || nombre.includes('resaltador'))
    return <HighlightOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  if (nombre.includes('etiqueta'))
    return <TagsOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
  
  // Icono por defecto para productos que no matcheen
  return <ShoppingOutlined style={{ fontSize: '80px', color: '#1890ff' }} />;
};

const CardProducto = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.activos();
      setProductos(response.results || response);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      message.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleQuitar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <ShoppingOutlined style={{ fontSize: '60px', color: '#ccc' }} />
        <p>No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="productos-lista">
      {productos.map((producto) => (
        <Card key={producto.id} className="producto-card">
          {/* Icono según nombre del producto */}
          <div className="producto-icono">
            {obtenerIcono(producto.nombre)}
          </div>

          {/* Precio debajo del icono */}
          <div className="producto-precio">${producto.precioUnitario}</div>

          {/* Nombre */}
          <h3 className="producto-nombre">{producto.nombre}</h3>

          {/* Botones de cantidad */}
          <div className="producto-acciones">
            <Button onClick={() => handleQuitar(producto.id)}>-</Button>
            <span>{cantidades[producto.id] || 0}</span>
            <Button onClick={() => handleAgregar(producto.id)}>+</Button>
          </div>

          {/* Botón agregar al carrito */}
          <Button type="primary" className="agregar-carrito">
            Agregar al carrito
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default CardProducto;
