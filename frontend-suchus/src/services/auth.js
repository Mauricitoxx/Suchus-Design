import axios from 'axios';

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

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: async () => {
        try {
            const token = localStorage.getItem('access_token');
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_URL}token/refresh/`, {
                refresh: refreshToken,
            });

            const { access } = response.data;
            localStorage.setItem('access_token', access);
            return access;
        } catch (error) {
            authService.logout();
            throw error;
        }
    },
};

export default authService;
