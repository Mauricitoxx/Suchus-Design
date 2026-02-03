import { Result, Button } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { FrownOutlined } from '@ant-design/icons';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header similar al de Login */}
      <div style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          <Link to="/" style={{ color: '#333', textDecoration: 'none', fontWeight: 'bold' }}>
            Suchus Copy & Design
          </Link>
        </h1>
      </div>

      {/* Contenido 404 */}
      <div style={{ 
        flex: 1,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem'
      }}>
        <Result
          status="404"
          icon={<FrownOutlined style={{ fontSize: '72px', color: '#333' }} />}
          title={<span style={{ color: '#333', fontSize: '48px', fontWeight: 'bold' }}>404</span>}
          subTitle={<span style={{ color: '#666', fontSize: '18px' }}>Lo sentimos, la página que buscas no existe.</span>}
          extra={
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  padding: '0.8rem 1.5rem'
                }}
              >
                Volver al Inicio
              </Button>
              <Button 
                size="large"
                onClick={() => navigate(-1)}
                style={{
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #ddd',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  padding: '0.8rem 1.5rem'
                }}
              >
                Volver Atrás
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default NotFound;
