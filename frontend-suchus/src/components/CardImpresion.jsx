import React, { useState } from 'react';
import { Card, Select, InputNumber, Button, Tag } from 'antd';
import '../assets/style/CardImpresion.css';

const { Option } = Select;

const CardImpresion = () => {
  const [impresion, setImpresion] = useState({
    cantidad: 1,
    tipoHoja: 'A4',
    color: 'blanco y negro',
    archivos: [], // lista de archivos
  });

  const precioPorHoja = {
    A4: { 'blanco y negro': 20, color: 40 },
    A3: { 'blanco y negro': 30, color: 60 },
  };

  const handleImpresionChange = (field, value) => {
    setImpresion({ ...impresion, [field]: value });
  };

  const handleArchivoChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImpresion({ ...impresion, archivos: [...impresion.archivos, ...nuevosArchivos] });
    e.target.value = null; // permite seleccionar nuevamente el mismo archivo
  };

  const handleEliminarArchivo = (index) => {
    const archivosActualizados = impresion.archivos.filter((_, i) => i !== index);
    setImpresion({ ...impresion, archivos: archivosActualizados });
  };

  const handleAgregarPedido = () => {
    if (impresion.archivos.length === 0) {
      alert('Debes seleccionar al menos un archivo antes de agregar al pedido.');
      return;
    }

    console.log('Agregar al pedido:', impresion);
    alert(`Pedido iniciado con ${impresion.archivos.length} archivo(s).`);
  };

  return (
    <Card className="card-impresion" title="Impresión">
      <div className="impresion-opciones">
        <span>Tipo de hoja: </span>
        <Select
          value={impresion.tipoHoja}
          onChange={(v) => handleImpresionChange('tipoHoja', v)}
          style={{ width: 100 }}
        >
          <Option value="A4">A4</Option>
          <Option value="A3">A3</Option>
        </Select>

        <span>Color: </span>
        <Select
          value={impresion.color}
          onChange={(v) => handleImpresionChange('color', v)}
          style={{ width: 140 }}
        >
          <Option value="blanco y negro">Blanco y negro</Option>
          <Option value="color">Color</Option>
        </Select>

        <span>Cantidad: </span>
        <InputNumber
          min={1}
          value={impresion.cantidad}
          onChange={(v) => handleImpresionChange('cantidad', v)}
          style={{ width: 70 }}
        />
      </div>

      {/* Input de archivos */}
      <div className="input-archivo-wrapper" style={{ marginTop: 12 }}>
        <label className="input-archivo-label">
          Seleccionar archivo(s)
          <input type="file" multiple onChange={handleArchivoChange} />
        </label>
      </div>

      {/* Lista de archivos con link y opción de eliminar */}
      {impresion.archivos.length > 0 && (
        <div className="archivos-listado" style={{ marginTop: 12 }}>
          {impresion.archivos.map((item, index) => (
            <Tag
              key={index}
              color="blue"
              closable
              onClose={() => handleEliminarArchivo(index)}
              style={{ marginBottom: 6 }}
            >
              <a
                href={item.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="archivo-link"
              >
                {item.file.name}
              </a>
            </Tag>
          ))}
        </div>
      )}

      {/* Precio y botón */}
      <div className="footer-impresion" style={{ marginTop: 12 }}>
        <span className="precio-por-hoja">
          Precio por hoja: ${precioPorHoja[impresion.tipoHoja][impresion.color]}
        </span>
        <Button
          type="primary"
          style={{ marginLeft: 20 }}
          onClick={handleAgregarPedido}
        >
          Agregar al pedido
        </Button>
      </div>
    </Card>
  );
};

export default CardImpresion;
