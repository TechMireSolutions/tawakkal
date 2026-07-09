import api from './axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const customerService = {
  getCustomers: async (params = {}) => {
    try {
      const res = await api.get('/customers/customers/', { params });
      return ensureArray(res);
    } catch { return []; }
  },
  getCustomer: async (id) => {
    return await api.get(`/customers/customers/${id}/`);
  }
};
