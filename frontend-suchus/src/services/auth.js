import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8000/api/';

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
      Cookies.set('user', JSON.stringify(user), { expires: 1 });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const token = Cookies.get('access_token');
      if (token) {
        await axios.post(`${API_URL}logout/`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
    }
  },

  getCurrentUser: () => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
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
