import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from '@ant-design/icons';
import "../assets/style/Pedido.css";
import logo from "../../media/logo.png";
import brand from "../../media/nombre.png";

const Pedido = () => {
  const navigate = useNavigate();

  const productos = [
    { id: 1, nombre: "Impresión A4 Color", cantidad: 2, precio: 150 },
    { id: 2, nombre: "Plastificado", cantidad: 1, precio: 250 },
    { id: 3, nombre: "Encuadernado", cantidad: 1, precio: 400 },
  ];

  const dataConTotal = productos.map(p => ({
    ...p,
    total: p.cantidad * p.precio
  }));

  const totalGeneral = dataConTotal.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="pedido-page-container">
      {/* Header igual al de Home */}
      <header className="home-header">
        <div className="header-inner">
          <img src={logo} alt="Logo Suchus" className="logo" />
          <img src={brand} alt="Suchus Copy and Design" className="brand" />
          <div className="header-actions">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              onClick={() => navigate('/home')}
            />
          </div>
        </div>
      </header>

      {/* Contenido del pedido */}
      <div className="pedido-container">
        <h2>Tu Pedido</h2>
        <p className="pedido-intro">Revisá tu pedido antes de confirmar la compra.</p>

        <div className="pedido-table-wrapper">
          <table className="pedido-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {dataConTotal.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>${p.precio.toFixed(2)}</td>
                  <td>${p.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pedido-total">
          <h3>Total a Pagar: ${totalGeneral.toFixed(2)}</h3>
        </div>

        <div className="pedido-actions">
          <Button
            type="primary"
            size="large"
            onClick={() => alert("Compra confirmada!")}
          >
            Confirmar Compra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pedido;
