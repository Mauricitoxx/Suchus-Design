import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Agregamos Navigate
import Login from "./Page/Login"
import Register from "./components/Register"
import LandingPage  from './Page/LandingPage';
import Home from "./Page/Home";
import Perfil from "./Page/PerfilMenu";
import Admin from "./components/Admin/Admin";
import UsuariosAdmin from "./components/Admin/UsuariosAdmin";
import ProductosAdmin from "./components/Admin/ProductosAdmin";
import NotFound from "./Page/NotFound";
import Pedido from "./Page/Pedido";
import authService from './services/auth';// Importamos tu authService
import PedidoAdmin from "./components/Admin/PedidoAdmin";
import DescuentosAdmin from './components/Admin/DescuentosAdmin';
import ReporteAdmin from './components/Admin/ReporteAdmin';
import MisPedidos from "./Page/MisPedidos";
// 1. Componente para proteger rutas de Admin
const AdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  // Verificamos el campo "tipo" que vimos en consola
  if (!user || user.tipo !== 'Admin') {
    return <Navigate to="*" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        
        {/* 2. Protegemos las rutas de administración */}
        <Route path="/admin" element={
          <AdminRoute> <Admin /> </AdminRoute>
        } />
        <Route path="/admin/usuarios" element={
          <AdminRoute> <UsuariosAdmin /> </AdminRoute>
        } />
        <Route path="/admin/productos" element={
          <AdminRoute> <ProductosAdmin /> </AdminRoute>
        } />
        <Route path="/admin/pedidos" element={
          <AdminRoute> <PedidoAdmin /> </AdminRoute>
        } />
        <Route path="/admin/descuentos" element={<AdminRoute> <DescuentosAdmin/> </AdminRoute>} />
        
        <Route path="/admin/reportes" element={<AdminRoute> <ReporteAdmin/> </AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App;