import React, { useState, useEffect } from 'react';
import { Card, Spin, Button } from 'antd';
import { FileTextOutlined, EditOutlined, BookOutlined, FolderOutlined, ShoppingOutlined, ScissorOutlined, HighlightOutlined, TagsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productosAPI } from '../services/api';
import authService from '../services/auth';

const obtenerIcono = (nombreProducto) => {
  const nombre = nombreProducto.toLowerCase();
  
  if (nombre.includes('hoja') || nombre.includes('resma') || nombre.includes('papel')) 
    return <FileTextOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('lápiz') || nombre.includes('lapiz') || nombre.includes('lapicera') || nombre.includes('birome'))
    return <EditOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('cuaderno') || nombre.includes('libreta'))
    return <BookOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('carpeta'))
    return <FolderOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('tijera'))
    return <ScissorOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('marcador') || nombre.includes('resaltador'))
    return <HighlightOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  if (nombre.includes('etiqueta'))
    return <TagsOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
  
  return <ShoppingOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
};

const ProductoLanding = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.activos();
      const todosProductos = response.results || response;
      
      // Clasificar productos por categoría según su nombre
      const categorias = {
        'Papelería': null,
        'Escritura': null,
        'Libretas': null,
        'Organización': null
      };
      
      todosProductos.forEach(producto => {
        const nombre = producto.nombre.toLowerCase();
        
        if (!categorias['Papelería'] && (nombre.includes('hoja') || nombre.includes('resma') || nombre.includes('papel'))) {
          categorias['Papelería'] = producto;
        } else if (!categorias['Escritura'] && (nombre.includes('lápiz') || nombre.includes('lapiz') || nombre.includes('lapicera') || nombre.includes('birome') || nombre.includes('marcador'))) {
          categorias['Escritura'] = producto;
        } else if (!categorias['Libretas'] && (nombre.includes('cuaderno') || nombre.includes('libreta') || nombre.includes('anotador'))) {
          categorias['Libretas'] = producto;
        } else if (!categorias['Organización'] && (nombre.includes('carpeta') || nombre.includes('archivador') || nombre.includes('folder'))) {
          categorias['Organización'] = producto;
        }
      });
      
      // Filtrar solo las categorías que tienen productos
      const productosSeleccionados = Object.values(categorias).filter(p => p !== null);
      setProductos(productosSeleccionados);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 2rem', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
          Nuestros Productos
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Productos de papelería de alta calidad para todas tus necesidades
        </p>
        
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {productos.map((producto) => (
            <Card 
              key={producto.id}
              hoverable
              style={{ 
                width: '250px',
                textAlign: 'center',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                {obtenerIcono(producto.nombre)}
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#333' }}>
                {producto.nombre}
              </h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
                ${producto.precioUnitario}
              </p>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => {
              if (authService.isAuthenticated()) {
                navigate('/home');
              } else {
                navigate('/login');
              }
            }}
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              padding: '0.8rem 2rem',
              height: 'auto',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.borderColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1890ff';
              e.target.style.borderColor = '#1890ff';
            }}
          >
            Ver todos los productos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductoLanding;
