import React, { useState } from 'react';
import { Card, Select, InputNumber, Button } from 'antd';
import '../assets/style/CardImpresion.css';  // Importa el CSS para este componente

const { Option } = Select;

const CardImpresion = () => {
  const [impresion, setImpresion] = useState({
    cantidad: 0,
    tipoHoja: 'A4',
    color: 'blanco y negro',
  });

  const precioPorHoja = {
    A4: { 'blanco y negro': 20, color: 40 },
    A3: { 'blanco y negro': 30, color: 60 },
  };

  const handleImpresionChange = (field, value) => {
    setImpresion({ ...impresion, [field]: value });
  };

  return (
    <Card className="card-impresion" title="Impresión">
      <div className="impresion-opciones">
        <span>Tipo de hoja: </span>
        <Select
          value={impresion.tipoHoja}
          onChange={(v) => handleImpresionChange('tipoHoja', v)}
          style={{ width: 100, marginRight: 12 }}
        >
          <Option value="A4">A4</Option>
          <Option value="A3">A3</Option>
        </Select>
        <span>Color: </span>
        <Select
          value={impresion.color}
          onChange={(v) => handleImpresionChange('color', v)}
          style={{ width: 140, marginRight: 12 }}
        >
          <Option value="blanco y negro">Blanco y negro</Option>
          <Option value="color">Color</Option>
        </Select>
        <span>Cantidad: </span>
        <InputNumber
          min={0}
          value={impresion.cantidad}
          onChange={(v) => handleImpresionChange('cantidad', v)}
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
  );
};

export default CardImpresion;
