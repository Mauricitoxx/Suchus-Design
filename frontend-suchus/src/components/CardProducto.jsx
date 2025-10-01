import React, { useState } from 'react';
import { Card, Button, Image } from 'antd';
import '../assets/style/CardProducto.css';

const productos = [
  {
    id: 1,
    nombre: 'Resma de hojas A4',
    precio: 2500,
    imagen: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    nombre: 'Lápiz',
    precio: 150,
    imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    nombre: 'Cuaderno',
    precio: 800,
    imagen: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    nombre: 'Carpeta',
    precio: 300,
    imagen: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
];

const CardProducto = () => {
  const [cantidades, setCantidades] = useState({});

  const handleAgregar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleQuitar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  return (
    <div className="productos-lista">
      {productos.map((producto) => (
        <Card key={producto.id} className="producto-card">
          {/* Imagen */}
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            className="producto-imagen"
            preview={false}
          />

          {/* Precio debajo de la imagen */}
          <div className="producto-precio">${producto.precio}</div>

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
