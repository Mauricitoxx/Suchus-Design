import axios from 'axios';

// URL base del backend (usa la variable Vite si está definida)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <--- importante para enviar cookies automáticamente
});

// Interceptor para manejar errores 401 y refresco (opcional si backend lo maneja con cookies)
// Interceptor para agregar el token a cada request
api.interceptors.request.use(
  (config) => {
    // Tomar JWT de la cookie 'access_token'
    const cookies = document.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ========== PRODUCTOS ==========
const productosAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('productos/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`productos/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('productos/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`productos/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`productos/${id}/`);
    return response.data;
  },
  activar: async (id) => {
    const response = await api.patch(`productos/${id}/activar/`);
    return response.data;
  },
  desactivar: async (id) => {
    const response = await api.patch(`productos/${id}/desactivar/`);
    return response.data;
  },
  actualizarPrecio: async (id, data) => {
    const response = await api.patch(`productos/${id}/actualizar_precio/`, data);
    return response.data;
  },
  activos: async (params = {}) => {
    const response = await api.get('productos/activos/', { params });
    return response.data;
  },
};

// ========== USUARIOS ==========
const usuariosAPI = {
  getAll: async (params = {}) => {
    const queryParams = { ...params, page_size: 1000 };
    const response = await api.get('usuarios/', { params: queryParams });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`usuarios/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('usuarios/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`usuarios/${id}/`, data);
    return response.data;
  },
  cambiarPassword: async (id, data) => {
    const response = await api.post(`usuarios/${id}/cambiar_contraseña/`, data);
    return response.data;
  },
  activar: async (id) => {
    const response = await api.post(`usuarios/${id}/activar/`);
    return response.data;
  },
  desactivar: async (id) => {
    const response = await api.post(`usuarios/${id}/desactivar/`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`usuarios/${id}/`);
    return response.data;
  },
  buscar: async (query) => {
    const response = await api.get('usuarios/buscar/', { params: { q: query } });
    return response.data;
  },
  // NUEVO MÉTODO PARA EL CARRITO
  getDescuento: async () => {
    const response = await api.get('usuarios/mi_descuento/');
    return response.data; // Esto devolverá { tipo: "Alumno", descuento: 10 }
  },
};

// ========== PEDIDOS ==========
const pedidosAPI = {
  getAll: async (params = {}) => {
    const queryParams = { ...params, page_size: 500 };
    const response = await api.get('pedidos/', { params: queryParams });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`pedidos/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('pedidos/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`pedidos/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`pedidos/${id}/`);
    return response.data;
  },
  cambiarEstado: async (id, estado, motivo_correccion = null) => {
    const data = motivo_correccion ? { estado, motivo_correccion } : { estado };
    const response = await api.patch(`pedidos/${id}/cambiar_estado/`, data);
    return response.data;
  },
  misPedidos: async (params = {}) => {
    const response = await api.get('pedidos/mis_pedidos/', { params });
    return response.data;
  },
  corregirArchivos: async (id, formData) => {
    const response = await api.post(`pedidos/${id}/corregir_archivos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ========== IMPRESIONES ==========
const impresionesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('impresiones/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`impresiones/${id}/`);
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('impresiones/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`impresiones/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`impresiones/${id}/`);
    return response.data;
  },
  descargar: async (id) => {
    const response = await api.get(`impresiones/${id}/descargar/`, { responseType: 'blob' });
    return response.data;
  },
  misImpresiones: async (params = {}) => {
    const response = await api.get('impresiones/mis_impresiones/', { params });
    return response.data;
  },
  limpiarAntiguas: async (dias = 30) => {
    const response = await api.post('impresiones/limpiar_antiguas/', { dias });
    return response.data;
  },
};
// Dentro de tu archivo de api.js
// CORREGIDO: Sin el "/" al principio para que use la baseURL correctamente
const usuariostipoAPI = {
  getTipos: () => api.get('usuario-tipos/').then(res => res.data),
  createTipo: (data) => api.post('usuario-tipos/', data),
  updateTipo: (id, data) => api.patch(`usuario-tipos/${id}/`, data), // Usamos patch para ser consistentes con tus otros métodos
  deleteTipo: (id) => api.delete(`usuario-tipos/${id}/`),
};

// ========== REPORTES ==========
const reportesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('reportes/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`reportes/${id}/`);
    return response.data;
  },
  create: async (data) => {
    // data contiene { titulo, fecha_inicio, fecha_fin, fk_usuario_creador }
    const response = await api.post('reportes/', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`reportes/${id}/`);
    return response.data;
  },
};

export { productosAPI, usuariosAPI, pedidosAPI, impresionesAPI,usuariostipoAPI,reportesAPI };
export default api;
