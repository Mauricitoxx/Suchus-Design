import axios from 'axios';
import Cookies from 'js-cookie';

// Usa la variable de entorno Vite si está disponible, si no, apunta al backend en render
const API_URL = import.meta.env.VITE_API_URL || 'https://suchus-design.onrender.com/api/';

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}register/`, {
        email: userData.email,
        contraseña: userData.password,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono || '',
        direccion: userData.direccion || '',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}login/`, {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      // Guardar tokens en cookies (en vez de localStorage)
      Cookies.set('access_token', access, { expires: 1 / 24 }); // 1 hora
      Cookies.set('refresh_token', refresh, { expires: 1 }); // 1 día

      // Guardar cada campo del usuario en su propia cookie: user_<campo>
      // Ejemplo: user_nombre, user_apellido, user_email, user_id, user_tipo
      Object.keys(user).forEach((k) => {
        const value = user[k] === null || user[k] === undefined ? '' : user[k];
        const cookieValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        Cookies.set(`user_${k}`, cookieValue, { expires: 1 });
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = Cookies.get('access_token');
      if (token) {
        // Notificamos al backend para blacklistear el token si es necesario
        await axios.post(`${API_URL}logout/`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      // 1. Borrado forzado especificando el path
      const cookieOptions = { path: '/' }; 
      Cookies.remove('access_token', cookieOptions);
      Cookies.remove('refresh_token', cookieOptions);

      // Borrar todas las cookies de usuario que tengan prefijo user_
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((name) => {
        if (name.startsWith('user_')) {
          Cookies.remove(name, cookieOptions);
        }
      });

      // 2. Limpieza de seguridad adicional para cookies persistentes
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 3. HARD REDIRECT: Esto mata el error "Broken pipe" y detiene las peticiones automáticas
      // En lugar de navegar con el router, reiniciamos el estado de la app
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => {
    // Reconstruir objeto `user` a partir de cookies `user_<campo>`
    const all = Cookies.get();
    const user = {};
    Object.keys(all).forEach((name) => {
      if (name.startsWith('user_')) {
        const key = name.replace(/^user_/, '');
        const val = all[name];
        try {
          user[key] = JSON.parse(val);
        } catch (e) {
          user[key] = val;
        }
      }
    });
    return Object.keys(user).length ? user : null;
  },

  isAuthenticated: () => {
    return !!Cookies.get('access_token');
  },

  refreshToken: async () => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      Cookies.set('access_token', access, { expires: 1 / 24 }); // 1 hora
      return access;
    } catch (error) {
      authService.logout();
      throw error;
    }
  },
};

export default authService;
