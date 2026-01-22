import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Page/Login"
import Register from "./components/Register"
import LandingPage  from './Page/LandingPage';
import Home from "./Page/Home";
import Perfil from "./Page/PerfilMenu";
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </Router>
  )
}

export default App
