import React, { useState } from "react";
import { Card, Button, Input, List, Modal } from "antd";

const mockUser = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan.perez@email.com",
  // La contraseña no se muestra, solo se puede cambiar
};

const mockPedidos = [
  { id: 1, nombre: "impresion 01", fecha: "2024-05-10", estado: "Entregado" },
  { id: 2, nombre: "impresion 01", fecha: "2024-06-02", estado: "Enviado" },
  { id: 3, nombre: "productos01 + impresion 03", fecha: "2024-07-15", estado: "Entregado" },
];

const PerfilMenu = () => {
  const [visible, setVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    setVisible(true);
  };

  const handleOk = () => {
    // Aquí iría la lógica real para cambiar la contraseña
    setVisible(false);
    setNewPassword("");
  };

  const handleCancel = () => {
    setVisible(false);
    setNewPassword("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
      <Card title="Perfil de Usuario" bordered>
        <p><strong>Nombre:</strong> {mockUser.nombre}</p>
        <p><strong>Apellido:</strong> {mockUser.apellido}</p>
        <p><strong>Email:</strong> {mockUser.email}</p>
        <p>
          <strong>Contraseña:</strong> ********
          <Button type="link" onClick={handleChangePassword} style={{ marginLeft: 8 }}>
            Cambiar contraseña
          </Button>
        </p>
      </Card>

      <Modal
        title="Cambiar contraseña"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Input.Password
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
      </Modal>

      <Card title="Historial de pedidos" bordered style={{ marginTop: 24 }}>
        <List
          dataSource={mockPedidos}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.nombre}
                description={`Fecha: ${item.fecha} | Estado: ${item.estado}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default PerfilMenu;