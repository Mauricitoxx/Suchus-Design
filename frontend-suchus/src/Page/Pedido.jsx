import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button, message, Spin, Divider, Empty, 
  Card, InputNumber, Typography 
} from "antd";
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  ArrowLeftOutlined,
  SendOutlined,
  FilePdfOutlined 
} from "@ant-design/icons";
import "../assets/style/Pedido.css";
import Navbar from "./Navbar";
import api, { usuariosAPI } from "../services/api";
import { getFileFromBuffer } from "../services/fileBuffer";

const { Text, Title } = Typography;

const Pedido = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [fetchingDiscount, setFetchingDiscount] = useState(true); 
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

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
      } catch (e) { 
        console.error("Error obteniendo descuento:", e); 
      }

      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      
      // REHIDRATAMOS LOS ARCHIVOS DESDE EL BUFFER
      const listaConArchivos = carrito.map(p => ({
        ...p,
        file: p.esImpresion ? getFileFromBuffer(p.id) : null
      }));

      setProductos(listaConArchivos);
      setFetchingDiscount(false);
    };
    inicializar();
  }, []);

  const verArchivo = (file) => {
    if (!file) {
      message.warning("Archivo no disponible. Intenta subirlo de nuevo.");
      return;
    }
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const cambiarCantidad = (id, valor) => {
    if (valor === null || valor < 1) return;
    const nuevaLista = productos.map(p => p.id === id ? { ...p, cantidad: valor } : p);
    setProductos(nuevaLista);
    localStorage.setItem("carrito", JSON.stringify(nuevaLista));
    window.dispatchEvent(new Event("storage"));
  };

  const eliminarProducto = (id) => {
    const nuevaLista = productos.filter(p => p.id !== id);
    setProductos(nuevaLista);
    localStorage.setItem("carrito", JSON.stringify(nuevaLista));
    window.dispatchEvent(new Event("storage"));
  };

  const enviarPedido = async () => {
    if (productos.length === 0) return;
    
    // Verificación de archivos antes de enviar
    const impresionesSinArchivo = productos.filter(p => p.esImpresion && !p.file);
    if (impresionesSinArchivo.length > 0) {
      return message.error("Hay impresiones sin archivo cargado. Por favor, vuelve a subirlos.");
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // 1. Datos generales
      formData.append('observacion', "Pedido realizado desde la web");

      // 2. Separar productos e impresiones
      const soloProductos = productos.filter(p => !p.esImpresion);
      const soloImpresiones = productos.filter(p => p.esImpresion);

      // 3. Formatear Detalles de Productos (Catálogo)
      const detallesJSON = soloProductos.map(p => ({
        fk_producto: p.id,
        cantidad: p.cantidad
      }));
      formData.append('detalles', JSON.stringify(detallesJSON));

      // 4. Formatear Detalles de Impresiones + Archivos Binarios
      const impresionesMetadata = soloImpresiones.map((imp, index) => {
        // Adjuntamos el archivo binario al FormData con la llave que espera el backend
        if (imp.file) {
          formData.append(`archivo_impresion_${index}`, imp.file);
        }

        // Importante: El subtotal individual es necesario para el total_bruto del backend
        const subtotalIndividual = imp.cantidad * imp.precioUnitario;

        return {
          nombre_archivo: imp.nombre || `archivo_${index}.pdf`,
          formato: imp.tipoHoja || 'A4',
          color: imp.color === 'color' ? 'color' : 'bn',
          copias: imp.cantidad,
          subtotal: subtotalIndividual // <--- Vital para el backend
        };
      });
      
      formData.append('impresiones', JSON.stringify(impresionesMetadata));

      // 5. Envío al servidor
      await api.post("pedidos/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success("¡Pedido enviado correctamente!");
      localStorage.removeItem("carrito");
      // Opcional: limpiar los buffers de archivos aquí
      navigate("/mis-pedidos");

    } catch (error) {
      console.error("Error al enviar pedido:", error.response?.data || error.message);
      message.error(error.response?.data?.error || "Error al procesar el pedido. Revisa los datos.");
    } finally { 
      setLoading(false); 
    }
  };

  const resumen = obtenerResumen(productos);

  if (fetchingDiscount) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Cargando resumen..." />
      </div>
    );
  }

  return (
    <div className="pedido-page-container">
      <Navbar showLinks={false} showAuth={true} showCart={false} showBackButton={true} />
      <div className="pedido-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}><ShoppingCartOutlined /> Confirmar Pedido</Title>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}>Volver al inicio</Button>
        </div>

        {productos.length === 0 ? (
          <Empty description="No tienes productos en el carrito" style={{ marginTop: 50 }} />
        ) : (
          <div className="pedido-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
            {/* TABLA DE PRODUCTOS */}
            <div className="pedido-items-list">
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Descripción</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Cant.</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Subtotal</th>
                    <th style={{ padding: '16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id} className="pedido-row" style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Text strong>{p.nombre}</Text>
                          {p.esImpresion && (
                            p.file ? (
                              <Button type="link" size="small" icon={<FilePdfOutlined />} onClick={() => verArchivo(p.file)} style={{ padding: 0, textAlign: 'left', height: 'auto', fontSize: '12px' }}>
                                Ver archivo adjunto
                              </Button>
                            ) : (
                              <Text type="danger" style={{ fontSize: '11px' }}>⚠️ Error: El archivo se perdió al recargar. Quita este item y vuelve a subirlo.</Text>
                            )
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <InputNumber min={1} value={p.cantidad} onChange={(v) => cambiarCantidad(p.id, v)} style={{ width: '60px' }} />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Text strong>${(p.cantidad * p.precioUnitario).toFixed(2)}</Text>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => eliminarProducto(p.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARD DE RESUMEN */}
            <div className="pedido-summary">
              <Card 
                title={<Title level={4} style={{ margin: 0 }}>Total de la compra</Title>} 
                bordered={false} 
                style={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text type="secondary">Suma total:</Text>
                  <Text>$ {resumen.bruto.toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text type="secondary">Descuento ({descuentoPorcentaje}%):</Text>
                  <Text type="success" strong>- $ {resumen.ahorro.toFixed(2)}</Text>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Title level={4} style={{ margin: 0 }}>A pagar:</Title>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>${resumen.final.toFixed(2)}</Title>
                </div>
                <Button 
                  type="primary" 
                  block 
                  size="large" 
                  icon={<SendOutlined />} 
                  onClick={enviarPedido} 
                  loading={loading} 
                  style={{ height: '54px', borderRadius: '10px', fontSize: '17px', fontWeight: 'bold' }}
                >
                  CONFIRMAR Y ENVIAR
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