import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from 'antd';
import { PrinterOutlined, ScanOutlined, FileProtectOutlined, ShoppingCartOutlined, FileAddOutlined, UserAddOutlined, MailOutlined, WhatsAppOutlined, PhoneOutlined, RobotOutlined } from '@ant-design/icons';
import Navbar from "./Navbar";
import Chatbot from "../components/Chatbot";
import ProductoLanding from "../components/ProductoLanding";
import ImpresionLanding from "../components/ImpresionLanding";
import authService from "../services/auth";
import "../assets/style/LandingPage.css";
import imagen1 from "./ImagenFondo1.jpg"; // Asegúrate que la ruta es correcta (case-sensitive for deployment)

const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  // Forzar scroll al top al cargar/recargar la página
  useEffect(() => {
    // Desactivar la restauración automática del scroll del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Forzar scroll al top de forma inmediata
    window.scrollTo(0, 0);
  }, []);

  const handlePedidoClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/home');
    } else {
      document.querySelector('#orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };
  return (
    // Quitamos los estilos globales que pusimos antes en el contenedor principal
    <div className="landing-container">
      <Navbar />

      {/* --- HERO SECTION MODIFICADA --- */}
      {/* 1. Le damos posición relativa para contener la imagen de fondo */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* 2. DIV "OVERLAY" PARA LA IMAGEN DE FONDO */}
        {/* Este div se posiciona absolutamente detrás del texto solo en esta sección */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${imagen1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Aplicamos el desenfoque y oscurecimiento
            filter: 'blur(6px) brightness(0.3)',
            // Escalamos un poco para evitar bordes blancos por el blur
            transform: 'scale(1.1)',
            // Lo mandamos al fondo de la sección
            zIndex: 0
          }}
        />

        {/* 3. EL CONTENIDO DE TEXTO */}
        {/* Es importante ponerle posición relativa y zIndex mayor para que quede SOBRE la imagen */}
<div 
  className="hero-text" 
  style={{ 
    position: 'relative', 
    zIndex: 1, 
    color: 'white',
    // Estas 3 líneas hacen la magia del centrado perfecto:
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, 7%)', 
    // Esto centra el texto dentro del bloque:
    textAlign: 'center',
    width: '100%',
    padding: '0 20px' // Para que no pegue a los bordes en celulares
  }}
>
  <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '20px' }}>
    Impresión y Servicios de Papelería de Calidad
  </h2>
  <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
    Gestioná tus pedidos de forma rápida y segura desde nuestra web.
    <br /> {/* Salto de línea opcional para que se vea mejor */}
    Archivos, impresiones, productos y más, todo en un solo lugar.
  </p>
  <a href="javascript:void(0)" className="btn-primary" onClick={handlePedidoClick}>Realizar Pedido</a>
</div>
        {/* Ya no necesitamos el div "hero-image" antiguo aquí */}

      </section>

      {/* --- El resto de secciones vuelven a tener su fondo normal --- */}

      {/* Services Section */}
      <section id="services" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9', scrollMarginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
          Nuestros Servicios
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
          Ofrecemos soluciones completas para todas tus necesidades
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Card
            hoverable
            style={{ 
              width: 300,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <PrinterOutlined style={{ fontSize: '60px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Impresión
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Blanco y negro, color, tamaños y formatos diversos.
            </p>
          </Card>

          <Card
            hoverable
            style={{ 
              width: 300,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <ScanOutlined style={{ fontSize: '60px', color: '#52c41a', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Escaneo y Digitalización
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Transformá tus documentos físicos en digitales con facilidad.
            </p>
          </Card>

          <Card
            hoverable
            style={{ 
              width: 300,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <FileProtectOutlined style={{ fontSize: '60px', color: '#fa8c16', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Plastificado y Encuadernado
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Protegé y presentá tus trabajos de forma profesional.
            </p>
          </Card>
        </div>
      </section>

      {/* Impresiones Section */}
      <ImpresionLanding />

      {/* Products Section */}
      <ProductoLanding />

      {/* Orders Section */}
      <section id="orders" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9', scrollMarginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
          Pasos para realizar un pedido
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
          Registrate y comenzá a gestionar tus pedidos en simples pasos
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          justifyContent: 'center',
          maxWidth: '1000px',
          margin: '0 auto 40px'
        }}>
          <Card
            hoverable
            style={{ 
              width: 280,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <UserAddOutlined style={{ fontSize: '60px', color: '#52c41a', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              1. Registrate
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Creá tu cuenta en pocos segundos y accedé a todos nuestros servicios.
            </p>
          </Card>

          <Card
            hoverable
            style={{ 
              width: 280,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <FileAddOutlined style={{ fontSize: '60px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              2. Subí tus archivos
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Cargá los documentos que querés imprimir o elegí productos de papelería.
            </p>
          </Card>

          <Card
            hoverable
            style={{ 
              width: 280,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <ShoppingCartOutlined style={{ fontSize: '60px', color: '#fa8c16', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              3. Confirmá tu pedido
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Revisá tu pedido, elegí la forma de pago y retirá en nuestra sucursal.
            </p>
          </Card>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a 
            href="/Login" 
            onClick={handleLoginClick}
            style={{
              display: 'inline-block',
              padding: '12px 40px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1890ff'}
          >
            Realizar Pedido
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '60px 20px', backgroundColor: '#f9f9f9', scrollMarginTop: '80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
          Contacto
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1.1rem' }}>
          ¿Tenés consultas? Usá nuestro chatbot o contactanos directamente
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Card
            hoverable
            style={{ 
              width: 260,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <RobotOutlined style={{ fontSize: '60px', color: '#722ed1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Chatbot
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              Asistente virtual disponible 24/7 en la esquina inferior derecha
            </p>
          </Card>

          <Card
            hoverable
            onClick={() => window.location.href = 'mailto:contacto@suchuscopy.com'}
            style={{ 
              width: 260,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <MailOutlined style={{ fontSize: '60px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Email
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              contacto@suchuscopy.com
            </p>
          </Card>

          <Card
            hoverable
            onClick={() => window.open('https://wa.me/5492215410023', '_blank')}
            style={{ 
              width: 260,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <WhatsAppOutlined style={{ fontSize: '60px', color: '#25D366', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              WhatsApp
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              +5492215410023
            </p>
          </Card>

          <Card
            hoverable
            onClick={() => window.location.href = 'tel:5492215410023'}
            style={{ 
              width: 260,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '32px' }}
          >
            <PhoneOutlined style={{ fontSize: '60px', color: '#fa8c16', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              Teléfono
            </h3>
            <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
              +5492215410023
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 Suchus Copy & Design. Todos los derechos reservados.</p>
      </footer>

      {/* Chatbot */}
      {/* Componente flotante para chat */}
      <Chatbot />
    </div>
  );
};

export default LandingPage;