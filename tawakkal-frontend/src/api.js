import api from './admin/services/axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const fetchProducts = async (params = {}) => {
  const finalParams = { ...params };
  if (!window.location.pathname.startsWith('/admin')) {
    finalParams.status = 'ACTIVE';
  }
  if (finalParams.category) {
    if (finalParams.category !== 'All') {
      finalParams.category__name = finalParams.category;
    }
    delete finalParams.category;
  }
  const res = await api.get('/catalog/products/', { params: finalParams });
  return ensureArray(res);
};

export const fetchCategories = async () => {
  const res = await api.get('/catalog/categories/');
  return ensureArray(res);
};

export const createCategory = async (categoryData) => {
  const res = await api.post('/catalog/categories/', categoryData);
  return res;
};

export const updateCategory = async (id, categoryData) => {
  const res = await api.patch(`/catalog/categories/${id}/`, categoryData);
  return res;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/catalog/categories/${id}/`);
  return res;
};

export const fetchProductDetail = async (id) => {
  const res = await api.get(`/catalog/products/${id}/`);
  return res;
};



export const createProduct = async (productData) => {
  const res = await api.post('/catalog/products/', productData);
  return res;
};

export const updateProduct = async (id, productData) => {
  const res = await api.patch(`/catalog/products/${id}/`, productData);
  return res;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/catalog/products/${id}/`);
  return res;
};

import axios from 'axios';

export const createOrder = async (orderData) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/admin';
  const STOREFRONT_URL = BASE_URL.replace('/admin', '/storefront');
  
  const res = await axios.post(`${STOREFRONT_URL}/orders/checkout/`, orderData);
  return res.data;
};

export const fetchPages = async () => {
  const res = await api.get('/cms/pages/');
  return ensureArray(res);
};

export const fetchBlogPosts = async () => {
  const res = await api.get('/cms/blog-posts/?status=PUBLISHED');
  return ensureArray(res);
};

export const fetchBlogPost = async (id) => {
  const res = await api.get(`/cms/blog-posts/${id}/`);
  return res;
};

export const fetchFaqs = async () => {
  const res = await api.get('/cms/faqs/?status=PUBLISHED');
  return ensureArray(res);
};

export const fetchOrders = async () => {
  const res = await api.get('/orders/orders/');
  return ensureArray(res);
};


export const fetchHeroBanners = async () => {
  const res = await api.get('/cms/hero-banners/'); // fixed from /cms/projects/
  return ensureArray(res);
};

export const fetchTikTokReels = async () => {
  const res = await api.get('/cms/social-links/'); // fixed from /cms/testimonials/
  return ensureArray(res);
};

export const fetchTestimonials = async () => {
  const res = await api.get('/cms/testimonials/');
  return ensureArray(res);
};

export const fetchSiteSettings = async () => {
  const res = await api.get('/settings/site/', { skipAuth: true });
  return res;
};

export const updateSiteSettings = async (id, settingsData) => {
  const res = await api.patch(`/settings/site/`, settingsData); // Site settings is a singleton, no id needed
  return res;
};

export const fetchSystemConfig = async () => {
  const res = await api.get('/settings/system/');
  return res;
};

export const updateSystemConfig = async (configData) => {
  const res = await api.patch('/settings/system/', configData);
  return res;
};

export const fetchDashboardStats = async () => {
  const res = await api.get('/analytics/dashboard-stats/'); // fixed from /analytics/dashboard/stats/
  return res;
};


export const fetchPolicies = async () => {
  const res = await api.get('/cms/policies/');
  return ensureArray(res);
};

export const fetchContactInfo = async () => {
  const res = await api.get('/cms/contact-info/');
  return ensureArray(res);
};

export const uploadMedia = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/media/upload/', formData, {
    onUploadProgress
  });
  return res;
};

export default api;
