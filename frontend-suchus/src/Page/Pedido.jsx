import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Spin, Divider, Empty, Card, InputNumber } from "antd";
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  SendOutlined 
} from "@ant-design/icons";
import "../assets/style/Pedido.css";
import Navbar from "./Navbar";
import api, { usuariosAPI } from "../services/api";

const Pedido = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [fetchingDiscount, setFetchingDiscount] = useState(true); 
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

  // FUNCIÓN MAESTRA DE CÁLCULO
  const obtenerResumen = (lista) => {
    const bruto = lista.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);
    const ahorro = bruto * (descuentoPorcentaje / 100);
    const final = bruto - ahorro;
    return { bruto, ahorro, final };
  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        const data = await usuariosAPI.getDescuento();
        setDescuentoPorcentaje(data.descuento || 0);
      } catch (e) { console.error("Error cargando descuento:", e); }

      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      setProductos(carrito.map(p => ({
        ...p,
        cantidad: Number(p.cantidad) || 1,
        precioUnitario: Number(p.precioUnitario) || 0
      })));
      setFetchingDiscount(false);
    };
    inicializar();
  }, []);

  const cambiarCantidad = (id, valor) => {
    if (valor === null || valor < 1) return;
    const nuevaLista = productos.map(p => 
      p.id === id ? { ...p, cantidad: Number(valor) } : p
    );
    
    const totales = obtenerResumen(nuevaLista);
    localStorage.setItem("carrito", JSON.stringify(nuevaLista));
    localStorage.setItem("totales_pedido", JSON.stringify(totales));
    
    setProductos(nuevaLista);
    window.dispatchEvent(new Event("storage"));
  };

  const eliminarProducto = (id) => {
    const nuevaLista = productos.filter(p => p.id !== id);
    const totales = obtenerResumen(nuevaLista);
    setProductos(nuevaLista);
    localStorage.setItem("carrito", JSON.stringify(nuevaLista));
    localStorage.setItem("totales_pedido", JSON.stringify(totales));
    window.dispatchEvent(new Event("storage"));
    message.info("Producto eliminado del carrito");
  };

  // --- FUNCIÓN PARA ENVIAR AL BACKEND (CON DESCUENTO APLICADO) ---
  const enviarPedido = async () => {
    if (productos.length === 0) return;
    
    setLoading(true);
    try {
      // Calculamos los totales actuales justo antes de enviar
      const { final } = obtenerResumen(productos);
      
      const soloProductos = productos.filter(p => !p.esImpresion);
      const soloImpresiones = productos.filter(p => p.esImpresion);

      const payload = {
        // AQUÍ SE APLICA EL DESCUENTO: enviamos el valor 'final' que ya tiene la resta
        total: parseFloat(final.toFixed(2)), 
        observacion: "Pedido realizado desde la web",
        detalles: soloProductos.map(p => ({
          fk_producto: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precioUnitario
        })),
        impresiones: soloImpresiones.map(imp => ({
          nombre_archivo: imp.nombre || "archivo.pdf",
          formato: imp.formato || "A4",
          color: imp.color === 'color' ? 'color' : 'bn',
          copias: imp.cantidad,
          precio_unitario: imp.precioUnitario || 0
        }))
      };

      await api.post("pedidos/", payload);
      
      message.success("¡Pedido realizado con éxito!");
      
      localStorage.removeItem("carrito");
      localStorage.removeItem("totales_pedido");
      setProductos([]);
      window.dispatchEvent(new Event("storage"));
      
      navigate("/mis-pedidos");
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      const msgError = error.response?.data?.error || "Error al procesar el pedido";
      message.error(msgError);
    } finally {
      setLoading(false);
    }
  };

  const resumen = obtenerResumen(productos);

  if (fetchingDiscount) return <div style={{textAlign:'center', marginTop:100}}><Spin size="large" tip="Cargando beneficio..." /></div>;

  return (
    <div className="pedido-page-container">
      <Navbar showLinks={false} showAuth={true} showCart={false} showBackButton={true} />
      <div className="pedido-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
          <h2 style={{ margin: 0 }}><ShoppingCartOutlined /> Confirmar Pedido</h2>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}>Volver al Catálogo</Button>
        </div>

        {productos.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="No hay productos para procesar" />
            <Button type="primary" style={{ marginTop: 20 }} onClick={() => navigate('/home')}>Ir a comprar</Button>
          </Card>
        ) : (
          <div className="pedido-content">
            <table className="pedido-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ background: '#2d3436', color: '#fff' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Cantidad</th>
                  <th style={{ padding: '12px' }}>Subtotal</th>
                  <th style={{ padding: '12px' }}></th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>{p.nombre}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <InputNumber 
                        min={1} 
                        value={p.cantidad} 
                        onChange={(val) => cambiarCantidad(p.id, val)} 
                      />
                    </td>
                    <td style={{ padding: '15px' }}>
                      <InputNumber 
                        value={(p.cantidad * p.precioUnitario).toFixed(2)} 
                        readOnly 
                        bordered={false}
                        style={{ fontWeight: 'bold', width: '120px' }}
                        prefix="$"
                      />
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => eliminarProducto(p.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
              <Card title="Cómputo de Totales" style={{ width: '100%', maxWidth: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: 15 }}>
                  <span>Total Bruto</span>
                  <InputNumber 
                    value={resumen.bruto.toFixed(2)} 
                    readOnly 
                    prefix="$" 
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: 15 }}>
                  <span>Descuento aplicado ({descuentoPorcentaje}%)</span>
                  <InputNumber 
                    value={resumen.ahorro.toFixed(2)} 
                    readOnly 
                    prefix="-$" 
                    style={{ width: '100%', color: '#52c41a' }}
                  />
                </div>

                <Divider />

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontWeight: 'bold' }}>TOTAL FINAL</span>
                  <InputNumber 
                    value={resumen.final.toFixed(2)} 
                    readOnly 
                    prefix="$" 
                    size="large"
                    style={{ width: '100%', fontWeight: 'bold' }}
                    status="warning"
                  />
                </div>

                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  icon={<SendOutlined />} 
                  onClick={enviarPedido}
                  loading={loading}
                  style={{ height: '50px', fontSize: '16px', borderRadius: '8px' }}
                >
                  SOLICITAR PEDIDO
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