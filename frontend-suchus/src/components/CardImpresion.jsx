import React, { useState } from 'react';
import { Card, Select, InputNumber, Button, Tag, message } from 'antd';
import { DeleteOutlined, PrinterOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import '../assets/style/CardImpresion.css';
import { saveFileToBuffer } from '../services/filebuffer';

const { Option } = Select;

const CardImpresion = () => {
  const [archivos, setArchivos] = useState([]);

  const precioPorHoja = {
    A4: { 'blanco y negro': 20, color: 40 },
    A3: { 'blanco y negro': 30, color: 60 },
  };

  const obtenerPaginasPDF = (file) => {
    return new Promise((resolve) => {
      if (file.type !== 'application/pdf') {
        resolve(1);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = function() {
        const contenido = reader.result;
        const matches = contenido.match(/\/Count\s+(\d+)/g);
        if (matches) {
          const num = matches[matches.length - 1].match(/\d+/)[0];
          resolve(parseInt(num));
        } else {
          const paginas = (contenido.match(/\/Type\s*\/Page\b/g) || []).length;
          resolve(paginas > 0 ? paginas : 1);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleArchivoChange = async (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = [];

    for (const file of files) {
      const paginas = await obtenerPaginasPDF(file);
      nuevosArchivos.push({
        id: Math.random().toString(36).substr(2, 9),
        file, 
        name: file.name,
        hojas: paginas,
        previewUrl: URL.createObjectURL(file),
        type: file.type,
        tipoHoja: 'A4',
        color: 'blanco y negro',
        cantidad: 1
      });
    }

    setArchivos(prev => [...prev, ...nuevosArchivos]);
    e.target.value = null; 
  };

  const updateArchivoConfig = (id, field, value) => {
    setArchivos(prev => prev.map(arc => 
      arc.id === id ? { ...arc, [field]: value } : arc
    ));
  };

  const handleEliminarArchivo = (id) => {
    setArchivos(prev => {
      const arc = prev.find(a => a.id === id);
      if (arc) URL.revokeObjectURL(arc.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleAgregarAlCarrito = () => {
    if (archivos.length === 0) {
      message.warning('Por favor, selecciona al menos un archivo');
      return;
    }

    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const nuevosItemsParaCarrito = archivos.map((arc, index) => {
      const precioH = precioPorHoja[arc.tipoHoja][arc.color];
      const idUnico = `IMP-${Date.now()}-${index}`;

      // GUARDAMOS EL BINARIO EN EL PUENTE
      saveFileToBuffer(idUnico, arc.file);

      return {
        id: idUnico,
        nombre: arc.name,
        cantidad: arc.cantidad,
        precioUnitario: arc.hojas * precioH,
        esImpresion: true, // Importante para Pedido.jsx
        tipo: 'impresion',
        tipoHoja: arc.tipoHoja,
        color: arc.color,
        hojas: arc.hojas
      };
    });

    localStorage.setItem('carrito', JSON.stringify([...carritoActual, ...nuevosItemsParaCarrito]));
    window.dispatchEvent(new Event('storage')); 
    
    message.success(`${archivos.length} archivos agregados al carrito`);
    setArchivos([]);
  };

  return (
    <Card className="card-impresion" title={<span><PrinterOutlined /> Servicio de Impresiones</span>}>
      <div className="upload-container" style={{ border: '2px dashed #40a9ff', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: 20 }}>
        <input type="file" multiple onChange={handleArchivoChange} accept=".pdf,image/*" id="file-input" style={{ display: 'none' }} />
        <label htmlFor="file-input" style={{ cursor: 'pointer', color: '#1890ff' }}>
          <strong>+ Seleccionar Archivos</strong>
          <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>Podrás configurar cada uno por separado</p>
        </label>
      </div>

      <div className="lista-archivos-config">
        {archivos.map((arc) => (
          <Card key={arc.id} size="small" style={{ marginBottom: 10, backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {arc.type === 'application/pdf' ? <FilePdfOutlined style={{color: 'red'}}/> : <FileImageOutlined style={{color: 'blue'}}/>}
                <a href={arc.previewUrl} target="_blank" rel="noreferrer" style={{ fontWeight: '500', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {arc.name}
                </a>
                <Tag color="blue">{arc.hojas} págs</Tag>
              </div>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleEliminarArchivo(arc.id)} />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Select size="small" value={arc.tipoHoja} onChange={v => updateArchivoConfig(arc.id, 'tipoHoja', v)} style={{ width: 70 }}>
                <Option value="A4">A4</Option>
                <Option value="A3">A3</Option>
              </Select>

              <Select size="small" value={arc.color} onChange={v => updateArchivoConfig(arc.id, 'color', v)} style={{ width: 110 }}>
                <Option value="blanco y negro">B&N</Option>
                <Option value="color">Color</Option>
              </Select>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <small>Copias:</small>
                <InputNumber size="small" min={1} value={arc.cantidad} onChange={v => updateArchivoConfig(arc.id, 'cantidad', v)} style={{ width: 50 }} />
              </div>

              <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                ${arc.hojas * precioPorHoja[arc.tipoHoja][arc.color] * arc.cantidad}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button 
        type="primary" 
        block 
        size="large" 
        onClick={handleAgregarAlCarrito} 
        style={{ marginTop: 15 }}
        disabled={archivos.length === 0}
      >
        Agregar {archivos.length > 0 ? `(${archivos.length})` : ''} al Carrito
      </Button>
    </Card>
  );
};

export default CardImpresion;