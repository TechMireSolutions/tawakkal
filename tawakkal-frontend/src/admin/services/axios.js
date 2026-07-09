import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/admin';

// Force production URL if running on Vercel (to override misconfigured/empty env vars)
if (window.location.hostname.includes('vercel.app')) {
  API_BASE_URL = 'https://tawakkal-backend-teal.vercel.app/api/v1/admin';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }

  const token = localStorage.getItem('admin_access_token');
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    // 1. If backend uses { success, message, data } standard wrapper
    let unwrapped = response.data;
    if (unwrapped && typeof unwrapped === 'object' && 'success' in unwrapped) {
      unwrapped = unwrapped.data;
    }

    // 2. If it's a paginated response { count, results }
    if (unwrapped && typeof unwrapped === 'object' && 'results' in unwrapped) {
      unwrapped = unwrapped.results;
    }

    return unwrapped;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Trigger global toast (suppress for 404 and 401)
    if (error.response?.status !== 404 && error.response?.status !== 401) {
      if (error.response?.data) {
        console.error("EXACT HTTP ERROR RESPONSE:", JSON.stringify(error.response.data, null, 2));
      }
      let message = error.response?.data?.message || error.response?.data?.errors?.detail || error.message || 'An error occurred';
      
      // If there are validation errors, append them to the message for visibility
      const validationErrors = error.response?.data?.errors;
      
      const flattenErrors = (obj, prefix = '') => {
        let messages = [];
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              messages = messages.concat(flattenErrors(item, `${prefix}[${index}]`));
            } else if (typeof item === 'string') {
              messages.push(`${prefix}:\n${item}`);
            }
          });
        } else if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([key, value]) => {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            messages = messages.concat(flattenErrors(value, newPrefix));
          });
        } else if (typeof obj === 'string') {
          messages.push(`${prefix}:\n${obj}`);
        }
        return messages;
      };

      if (validationErrors && typeof validationErrors === 'object' && !validationErrors.detail) {
        const fieldErrors = flattenErrors(validationErrors).join('\n\n');
        if (fieldErrors) {
          message = `${message}\n\n${fieldErrors}`;
        }
      }

      window.dispatchEvent(new CustomEvent('global-toast', { 
        detail: { type: 'error', title: 'API Error', message }
      }));
    }

    // Handle Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/token/') {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
        const access = res.data?.data?.access || res.data?.access;
        
        localStorage.setItem('admin_access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('isAdminAuthenticated');
        window.dispatchEvent(new CustomEvent('auth-logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
