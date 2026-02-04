import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import "../assets/style/Pedido.css";
import Navbar from "./Navbar";
import api from "../services/api";

const Pedido = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================
  // CARGAR CARRITO
  // ==========================
  useEffect(() => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    setProductos(carrito);
  }, []);

  const actualizarCarrito = (nuevoCarrito) => {
    setProductos(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  // ==========================
  // ACCIONES CARRITO
  // ==========================
  const aumentarCantidad = (id) => {
    const nuevoCarrito = productos.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
    );
    actualizarCarrito(nuevoCarrito);
  };

  const disminuirCantidad = (id) => {
    const nuevoCarrito = productos.map(p =>
      p.id === id
        ? { ...p, cantidad: Math.max(p.cantidad - 1, 1) }
        : p
    );
    actualizarCarrito(nuevoCarrito);
  };

  const eliminarProducto = (id) => {
    const nuevoCarrito = productos.filter(p => p.id !== id);
    actualizarCarrito(nuevoCarrito);
  };

  // ==========================
  // TOTAL
  // ==========================
  const totalGeneral = productos.reduce(
    (acc, p) => acc + p.precioUnitario * p.cantidad,
    0
  );

  // ==========================
  // MERCADO PAGO
  // ==========================
  const confirmarCompra = async () => {
    if (productos.length === 0) {
      message.warning("El carrito está vacío");
      return;
    }

    setLoading(true);

    try {
      // Se envían los productos actuales para que el backend genere la preferencia real
      const response = await api.post(
        "/mercadopago/crear-preferencia/",
        { productos: productos } 
      );

      if (!response.data?.init_point) {
        throw new Error("No se recibió init_point");
      }

      // Redirección al Checkout Pro
      window.location.href = response.data.init_point;
    } catch (error) {
      console.error("Error Mercado Pago:", error);
      message.error("Error al iniciar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pedido-page-container">
      <Navbar
        showLinks={false}
        showAuth={true}
        showCart={false}
        showBackButton={true}
      />

      <div className="pedido-container">
        <h2>Tu Pedido</h2>

        {productos.length === 0 ? (
          <p>No hay productos en el carrito</p>
        ) : (
          <>
            <div className="pedido-table-wrapper">
              <table className="pedido-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>
                        <Button onClick={() => disminuirCantidad(p.id)}>
                          -
                        </Button>
                        <span style={{ margin: "0 10px" }}>
                          {p.cantidad}
                        </span>
                        <Button onClick={() => aumentarCantidad(p.id)}>
                          +
                        </Button>
                      </td>
                      <td>${p.precioUnitario.toFixed(2)}</td>
                      <td>
                        ${(p.precioUnitario * p.cantidad).toFixed(2)}
                      </td>
                      <td>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => eliminarProducto(p.id)}
                        />
                      </td>
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
                loading={loading}
                onClick={confirmarCompra}
              >
                Pagar con Mercado Pago
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Pedido;