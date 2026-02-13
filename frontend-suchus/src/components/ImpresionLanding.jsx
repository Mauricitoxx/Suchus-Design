import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import { PrinterOutlined, FileTextOutlined, FileImageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import api from '../services/api';

const ImpresionLanding = () => {
  const navigate = useNavigate();
  const [opcionesImpresion, setOpcionesImpresion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiposImpresion();
  }, []);

  const fetchTiposImpresion = async () => {
    setLoading(true);
    try {
      const response = await api.get('tipo-impresion/activos/');
      const tipos = response.data;
      
      // Mapear los datos del backend a la estructura del componente
      const opcionesFormateadas = tipos.map((tipo) => ({
        id: tipo.id,
        nombre: `${tipo.formato} ${tipo.color ? 'Color' : 'Blanco y Negro'}`,
        formato: tipo.formato,
        color: tipo.color,
        precio: tipo.precio,
        icono: getIcono(tipo.formato, tipo.color),
        descripcion: tipo.descripcion
      }));
      
      setOpcionesImpresion(opcionesFormateadas);
    } catch (error) {
      console.error('Error al cargar tipos de impresión:', error);
      // Fallback a datos estáticos si hay error
      setOpcionesImpresion([
        {
          id: 1,
          nombre: 'A4 Blanco y Negro',
          formato: 'A4',
          color: false,
          precio: 50,
          icono: <FileTextOutlined style={{ fontSize: '60px', color: '#1890ff' }} />,
          descripcion: 'Ideal para documentos y trabajos universitarios'
        },
        {
          id: 2,
          nombre: 'A4 Color',
          formato: 'A4',
          color: true,
          precio: 100,
          icono: <FileImageOutlined style={{ fontSize: '60px', color: '#52c41a' }} />,
          descripcion: 'Perfecta para presentaciones con imágenes'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIcono = (formato, color) => {
    // Iconos según formato y tipo
    if (formato === 'A4' && !color) {
      return <FileTextOutlined style={{ fontSize: '60px', color: '#1890ff' }} />;
    } else if (formato === 'A4' && color) {
      return <FileImageOutlined style={{ fontSize: '60px', color: '#52c41a' }} />;
    } else if (formato === 'A3' && color) {
      return <PrinterOutlined style={{ fontSize: '60px', color: '#fa8c16' }} />;
    } else if (formato === 'A3' && !color) {
      return <PrinterOutlined style={{ fontSize: '60px', color: '#595959' }} />;
    } else {
      // Para otros formatos (A5, A2, etc.)
      return <PrinterOutlined style={{ fontSize: '60px', color: color ? '#52c41a' : '#595959' }} />;
    }
  };

  const handleImprimir = () => {
    if (authService.isAuthenticated()) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <section id="impresiones" className="services-section" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9', scrollMarginTop: '80px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
        Servicios de Impresión
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
        Elegí el formato y tipo de impresión que necesitás
      </p>
      
      <Spin spinning={loading} tip="Cargando servicios...">
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: '40px',
          minHeight: loading ? '300px' : 'auto'
        }}>
        {opcionesImpresion.map((opcion) => (
          <Card
            key={opcion.id}
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
            <div style={{ marginBottom: '16px' }}>
              {opcion.icono}
            </div>
            
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '12px 0',
              color: '#333',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {opcion.nombre}
            </h3>
            
            <p style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1890ff',
              margin: '8px 0'
            }}>
              ${opcion.precio}
            </p>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#666',
              minHeight: '40px',
              margin: '8px 0'
            }}>
              {opcion.descripcion}
            </p>
          </Card>
        ))}
      </div>
      </Spin>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleImprimir}
          style={{
            padding: '12px 40px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1890ff'}
        >
          Imprimir Ahora
        </button>
      </div>
    </section>
  );
};

export default ImpresionLanding;
