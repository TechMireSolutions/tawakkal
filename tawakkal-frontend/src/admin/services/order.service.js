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
  }
};
