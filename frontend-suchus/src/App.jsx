import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Page/Login"
import Register from "./components/Register"
import LandingPage  from './Page/LandingPage';
import Home from "./Page/Home";
import Perfil from "./Page/PerfilMenu";
import Admin from "./components/Admin/Admin";
import UsuariosAdmin from "./components/Admin/UsuariosAdmin";
import ProductosAdmin from "./components/Admin/ProductosAdmin";
import NotFound from "./Page/NotFound";
import Pedido from "./Page/Pedido"
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
