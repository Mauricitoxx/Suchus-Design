import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Tag, Space, Spin, Divider, Empty, Card } from "antd";
import { 
  DeleteOutlined, 
  PercentageOutlined, 
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  CreditCardOutlined 
} from "@ant-design/icons";
import "../assets/style/Pedido.css";
import Navbar from "./Navbar";
import api, { usuariosAPI } from "../services/api"; // Importamos api para Mercado Pago y usuariosAPI para descuento

const Pedido = () => {
  const navigate = useNavigate();
  
  // ESTADOS
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false); // Para el botón de Mercado Pago
  const [fetchingDiscount, setFetchingDiscount] = useState(true); 
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

  // 1. CARGA INICIAL: Productos y Descuento
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
    setProductos(carritoGuardado);

    const obtenerBeneficio = async () => {
      try {
        const data = await usuariosAPI.getDescuento();
        setDescuentoPorcentaje(data.descuento || 0);
      } catch (error) {
        console.error("Error obteniendo descuento:", error);
        setDescuentoPorcentaje(0);
      } finally {
        setFetchingDiscount(false);
      }
    };

    obtenerBeneficio();
  }, []);

  // 2. FUNCIONES DEL CARRITO
  const actualizarCarrito = (nuevoCarrito) => {
    setProductos(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    window.dispatchEvent(new Event("storage"));
  };

  const eliminarProducto = (id) => {
    actualizarCarrito(productos.filter(p => p.id !== id));
    message.success("Producto eliminado");
  };

  // 3. CÁLCULOS
  const subtotalGeneral = productos.reduce((acc, p) => acc + (p.precioUnitario * p.cantidad), 0);
  const totalConDescuento = subtotalGeneral * (1 - descuentoPorcentaje / 100);
  const ahorroTotal = subtotalGeneral - totalConDescuento;

  // 4. LÓGICA DE MERCADO PAGO (Recuperada)
  const confirmarCompra = async () => {
    if (productos.length === 0) return message.warning("El carrito está vacío");
    
    setLoading(true);
    try {
      // Enviamos los productos y el descuento aplicado para que MP cobre lo correcto
      const response = await api.post("/mercadopago/crear-preferencia/", { 
        productos: productos, 
        descuento: descuentoPorcentaje 
      });

      if (response.data && response.data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = response.data.init_point;
      } else {
        message.error("No se pudo generar el link de pago");
      }
    } catch (error) {
      console.error("Error en Mercado Pago:", error);
      message.error("Error al procesar el pago con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDiscount) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Validando tus beneficios de usuario...</p>
      </div>
    );
  }

  return (
    <div className="pedido-page-container">
      <Navbar showLinks={false} showAuth={true} showCart={false} showBackButton={true} />

      <div className="pedido-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h2 style={{ margin: 0 }}><ShoppingCartOutlined /> Tu Pedido</h2>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Seguir comprando</Button>
        </div>

        {productos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '40px' }}>
            <Empty description="Carrito vacío" />
            <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>Ver Productos</Button>
          </Card>
        ) : (
          <div className="pedido-content">
            <table className="pedido-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px' }}>Precio Base</th>
                  <th style={{ padding: '12px' }}>Subtotal</th>
                  <th style={{ padding: '12px' }}></th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => {
                  const subTotalFila = p.precioUnitario * p.cantidad;
                  const filaConDto = subTotalFila * (1 - descuentoPorcentaje / 100);
                  
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '15px' }}>
                        <span style={{ fontWeight: 600 }}>{p.nombre}</span>
                        <br />
                        <small style={{ color: '#8c8c8c' }}>Cantidad: {p.cantidad}</small>
                      </td>
                      <td style={{ padding: '15px' }}>${p.precioUnitario.toFixed(2)}</td>
                      <td style={{ padding: '15px' }}>
                        {descuentoPorcentaje > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ textDecoration: 'line-through', color: '#bfbfbf', fontSize: '12px' }}>
                              ${subTotalFila.toFixed(2)}
                            </span>
                            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                              ${filaConDto.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 'bold' }}>${subTotalFila.toFixed(2)}</span>
                        )}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => eliminarProducto(p.id)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="resumen-seccion" style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
              <Card style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span>Subtotal:</span>
                  <span>${subtotalGeneral.toFixed(2)}</span>
                </div>

                {descuentoPorcentaje > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#52c41a' }}>
                    <span>Descuento Usuario ({descuentoPorcentaje}%):</span>
                    <span>-${ahorroTotal.toFixed(2)}</span>
                  </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Final:</span>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: descuentoPorcentaje > 0 ? '#52c41a' : '#1890ff' }}>
                    ${totalConDescuento.toFixed(2)}
                  </span>
                </div>

                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  icon={<CreditCardOutlined />}
                  onClick={confirmarCompra}
                  loading={loading}
                  style={{ height: '50px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#009EE3', borderColor: '#009EE3' }}
                >
                  PAGAR CON MERCADO PAGO
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pedido;