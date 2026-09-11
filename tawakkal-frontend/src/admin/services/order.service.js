import api from './axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const orderService = {
  getOrders: async (params = {}) => {
    try {
      const res = await api.get('/orders/orders/', { params });
      return ensureArray(res);
    } catch { return []; }
  },
  getOrder: async (id) => {
    return await api.get(`/orders/orders/${id}/`);
  },
  updateOrderStatus: async (id, status) => {
    return await api.patch(`/orders/orders/${id}/status/`, { status });
  },
  deleteOrder: async (id) => api.delete(`/orders/orders/${id}/`),
  
  // Sales Employees
  getSalesEmployees: async (params = {}) => {
    try {
      const res = await api.get('/orders/sales-employees/', { params });
      return ensureArray(res);
    } catch { return []; }
  },
  createSalesEmployee: async (data) => {
    return await api.post('/orders/sales-employees/', data);
  },
  updateSalesEmployee: async (id, data) => {
    return await api.patch(`/orders/sales-employees/${id}/`, data);
  },
  deleteSalesEmployee: async (id) => {
    return await api.delete(`/orders/sales-employees/${id}/`);
  }
};
