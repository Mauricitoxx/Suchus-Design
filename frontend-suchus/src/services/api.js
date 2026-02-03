import axios from 'axios';
import authService from './auth';

// TODO: Reemplazar con la URL del backend en producción
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para renovar token si expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ========== PRODUCTOS ==========

const productosAPI = {
  // Listar todos los productos
  getAll: async (params = {}) => {
    try {
      const response = await api.get('productos/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener producto por ID
  getById: async (id) => {
    try {
      const response = await api.get(`productos/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear producto
  create: async (data) => {
    try {
      const response = await api.post('productos/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar producto
  update: async (id, data) => {
    try {
      const response = await api.patch(`productos/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar producto
  delete: async (id) => {
    try {
      const response = await api.delete(`productos/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Activar producto
  activar: async (id) => {
    try {
      const response = await api.patch(`productos/${id}/activar/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Desactivar producto
  desactivar: async (id) => {
    try {
      const response = await api.patch(`productos/${id}/desactivar/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar precio
  actualizarPrecio: async (id, data) => {
    try {
      const response = await api.patch(`productos/${id}/actualizar_precio/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Productos activos
  activos: async (params = {}) => {
    try {
      const response = await api.get('productos/activos/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ========== USUARIOS ==========

const usuariosAPI = {
  // Listar todos los usuarios
  getAll: async (params = {}) => {
    try {
      const response = await api.get('usuarios/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      const response = await api.get(`usuarios/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear usuario
  create: async (data) => {
    try {
      const response = await api.post('usuarios/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar usuario
  update: async (id, data) => {
    try {
      const response = await api.patch(`usuarios/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar contraseña
  cambiarPassword: async (id, data) => {
    try {
      const response = await api.post(`usuarios/${id}/cambiar_contraseña/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Activar usuario
  activar: async (id) => {
    try {
      const response = await api.post(`usuarios/${id}/activar/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Desactivar usuario
  desactivar: async (id) => {
    try {
      const response = await api.post(`usuarios/${id}/desactivar/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    try {
      const response = await api.delete(`usuarios/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Buscar usuarios
  buscar: async (query) => {
    try {
      const response = await api.get('usuarios/buscar/', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ========== PEDIDOS ==========

const pedidosAPI = {
  // Listar todos los pedidos
  getAll: async (params = {}) => {
    try {
      const response = await api.get('pedidos/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener pedido por ID
  getById: async (id) => {
    try {
      const response = await api.get(`pedidos/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear pedido
  create: async (data) => {
    try {
      const response = await api.post('pedidos/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar pedido
  update: async (id, data) => {
    try {
      const response = await api.patch(`pedidos/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar pedido
  delete: async (id) => {
    try {
      const response = await api.delete(`pedidos/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cambiar estado del pedido
  cambiarEstado: async (id, estado) => {
    try {
      const response = await api.post(`pedidos/${id}/cambiar_estado/`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mis pedidos (del usuario autenticado)
  misPedidos: async (params = {}) => {
    try {
      const response = await api.get('pedidos/mis_pedidos/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ========== IMPRESIONES ==========

const impresionesAPI = {
  // Listar todas las impresiones
  getAll: async (params = {}) => {
    try {
      const response = await api.get('impresiones/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener impresión por ID
  getById: async (id) => {
    try {
      const response = await api.get(`impresiones/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear impresión (subir archivo)
  create: async (formData) => {
    try {
      const response = await api.post('impresiones/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar impresión
  update: async (id, data) => {
    try {
      const response = await api.patch(`impresiones/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar impresión
  delete: async (id) => {
    try {
      const response = await api.delete(`impresiones/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Descargar archivo
  descargar: async (id) => {
    try {
      const response = await api.get(`impresiones/${id}/descargar/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mis impresiones
  misImpresiones: async (params = {}) => {
    try {
      const response = await api.get('impresiones/mis_impresiones/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Limpiar impresiones antiguas
  limpiarAntiguas: async (dias = 30) => {
    try {
      const response = await api.post('impresiones/limpiar_antiguas/', { dias });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export { productosAPI, usuariosAPI, pedidosAPI, impresionesAPI };
export default api;
