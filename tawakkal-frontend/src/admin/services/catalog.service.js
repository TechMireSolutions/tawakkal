import api from './axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const catalogService = {
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/catalog/products/', { params });
      return ensureArray(res);
    } catch { return []; }
  },
  getProduct: async (id) => {
    return await api.get(`/catalog/products/${id}/`);
  },
  createProduct: async (data) => {
    return await api.post('/catalog/products/', data);
  },
  updateProduct: async (id, data) => {
    return await api.put(`/catalog/products/${id}/`, data);
  },
  deleteProduct: async (id) => {
    return await api.delete(`/catalog/products/${id}/`);
  },
  duplicateProduct: async (id) => {
    return await api.post(`/catalog/products/${id}/duplicate/`);
  },

  getCategories: async () => {
    try {
      const res = await api.get('/catalog/categories/');
      return ensureArray(res);
    } catch { return []; }
  },
  createCategory: async (data) => {
    return await api.post('/catalog/categories/', data);
  },
  updateCategory: async (id, data) => {
    return await api.patch(`/catalog/categories/${id}/`, data);
  },
  deleteCategory: async (id) => {
    return await api.delete(`/catalog/categories/${id}/`);
  }
};
