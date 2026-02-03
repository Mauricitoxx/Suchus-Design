const authService = {
  login: (email, password) => {
    // Implementar login
    return Promise.resolve({ token: 'mock-token' });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    // Implementar refresh
    return 'new-token';
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },
};

export default authService;
