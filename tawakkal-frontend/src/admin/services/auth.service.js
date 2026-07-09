import api from './axios';

export const authService = {
  login: async (credentials) => {
    const tokens = await api.post('/auth/token/', credentials);
    const { access, refresh } = tokens || {};
    localStorage.setItem('admin_access_token', access);
    localStorage.setItem('admin_refresh_token', refresh);
    localStorage.setItem('isAdminAuthenticated', 'true');
    return tokens;
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('admin_refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.setItem('isAdminAuthenticated', 'false');
      window.location.href = '/admin-login';
    }
  },

  me: async () => {
    // response will be unwrapped to the user object directly
    return await api.get('/auth/me/');
  }
};
