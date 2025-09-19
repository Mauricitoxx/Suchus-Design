import React, { useState } from "react";
import { Card, Button, Select, InputNumber, Image } from "antd";
import "./CardServicio.css";

const { Option } = Select;

const productos = [
  {
    id: 1,
    nombre: "Resma de hojas A4",
    precio: 2500,
    imagen: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    nombre: "Lápiz",
    precio: 150,
    imagen: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    nombre: "Cuaderno",
    precio: 800,
    imagen: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    nombre: "Carpeta",
    precio: 300,
    imagen: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
];

const CardServicio = () => {
  const [cantidades, setCantidades] = useState({});
  const [impresion, setImpresion] = useState({
    cantidad: 0,
    tipoHoja: "A4",
    color: "blanco y negro",
  });

  const precioPorHoja = {
    "A4": { "blanco y negro": 20, color: 40 },
    "A3": { "blanco y negro": 30, color: 60 },
  };

  const handleAgregar = (id) => {
    setCantidades({ ...cantidades, [id]: (cantidades[id] || 0) + 1 });
  };

  const handleQuitar = (id) => {
    setCantidades({ ...cantidades, [id]: Math.max((cantidades[id] || 0) - 1, 0) });
  };

  const handleImpresionChange = (field, value) => {
    setImpresion({ ...impresion, [field]: value });
  };

  return (
    <div className="servicios-container">
      <h2>Servicios de Impresión</h2>
      <Card className="servicio-card" title="Impresión">
        <div className="impresion-opciones">
          <span>Tipo de hoja: </span>
          <Select
            value={impresion.tipoHoja}
            onChange={v => handleImpresionChange("tipoHoja", v)}
            style={{ width: 100, marginRight: 12 }}
          >
            <Option value="A4">A4</Option>
            <Option value="A3">A3</Option>
          </Select>
          <span>Color: </span>
          <Select
            value={impresion.color}
            onChange={v => handleImpresionChange("color", v)}
            style={{ width: 140, marginRight: 12 }}
          >
            <Option value="blanco y negro">Blanco y negro</Option>
            <Option value="color">Color</Option>
          </Select>
          <span>Cantidad: </span>
          <InputNumber
            min={0}
            value={impresion.cantidad}
            onChange={v => handleImpresionChange("cantidad", v)}
            style={{ width: 70, marginRight: 12 }}
          />
          <span>
            Precio por hoja: ${precioPorHoja[impresion.tipoHoja][impresion.color]}
          </span>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button type="primary">Agregar al pedido</Button>
        </div>
      </Card>

      <h2 style={{ marginTop: 32 }}>Productos</h2>
      <div className="productos-lista">
        {productos.map(producto => (
          <Card
            key={producto.id}
            className="servicio-card"
            cover={<Image src={producto.imagen} alt={producto.nombre} height={160} width={160} style={{ objectFit: "cover" }} preview={false} />}
            title={producto.nombre}
            extra={<span>${producto.precio}</span>}
          >
            <div className="producto-acciones">
              <Button onClick={() => handleQuitar(producto.id)}>-</Button>
              <span style={{ margin: "0 10px" }}>{cantidades[producto.id] || 0}</span>
              <Button onClick={() => handleAgregar(producto.id)}>+</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardServicio;