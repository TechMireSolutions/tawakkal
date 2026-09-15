import api from './admin/services/axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

const inFlightRequests = new Map();
const requestCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

const CACHEABLE_ENDPOINTS = [
  '/settings/site/',
  '/settings/system/',
  '/catalog/categories/',
  '/catalog/brands/',
  '/catalog/badges/',
  '/cms/pages/'
];

export const deduplicatedGet = async (url, config = {}) => {
  // Never cache authenticated, personalized, or volatile data requests
  if (config.headers?.Authorization || !config.skipAuth || url.includes('/orders') || url.includes('/cart') || url.includes('/auth') || url.includes('/checkout')) {
    return api.get(url, config);
  }

  const isCacheable = CACHEABLE_ENDPOINTS.some(endpoint => url.includes(endpoint));
  const cacheKey = url + JSON.stringify(config.params || {});

  // 1. Check TTL Cache
  if (isCacheable && requestCache.has(cacheKey)) {
    const { data, timestamp } = requestCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    requestCache.delete(cacheKey);
  }

  // 2. Check In-Flight Deduplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Make Request
  const requestPromise = api.get(url, config)
    .then(data => {
      if (isCacheable) {
        requestCache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    })
    .catch(error => {
      inFlightRequests.delete(cacheKey);
      throw error;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    baseUrl = '';
  } else {
    if (baseUrl.includes('/api/v1/admin')) {
      baseUrl = baseUrl.replace('/api/v1/admin', '');
    }
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const fetchProducts = async (params = {}) => {
  const finalParams = { ...params };
  if (!window.location.pathname.startsWith('/admin')) {
    finalParams.status = 'ACTIVE';
  }
  if (finalParams.category === 'All') {
    delete finalParams.category;
  }
  const res = await deduplicatedGet('/catalog/products/', { params: finalParams, skipAuth: true });
  return ensureArray(res);
};

export const fetchCategories = async () => {
  const res = await deduplicatedGet('/catalog/categories/', { skipAuth: true });
  return ensureArray(res);
};

export const fetchBrands = async () => {
  const res = await deduplicatedGet('/catalog/brands/', { skipAuth: true });
  return ensureArray(res);
};

export const fetchBadges = async () => {
  const res = await deduplicatedGet('/catalog/badges/', { skipAuth: true });
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
  const res = await api.get(`/catalog/products/${id}/`, { skipAuth: true });
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
  let BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/admin';
  
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    BASE_URL = '/api/v1/admin';
  }
  
  const STOREFRONT_URL = BASE_URL.replace('/admin', '/storefront');
  const res = await axios.post(`${STOREFRONT_URL}/orders/checkout/`, orderData);
  return res.data;
};

export const validateCoupon = async (couponCode) => {
  let BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/admin';
  
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    BASE_URL = '/api/v1/admin';
  }
  
  const STOREFRONT_URL = BASE_URL.replace('/admin', '/storefront');
  const res = await axios.post(`${STOREFRONT_URL}/orders/coupon/validate/`, { coupon_code: couponCode });
  return res.data;
};

export const fetchPages = async () => {
  const res = await deduplicatedGet('/cms/pages/', { skipAuth: true });
  return ensureArray(res);
};

export const fetchBlogPosts = async () => {
  const res = await api.get('/cms/blog-posts/?status=PUBLISHED', { skipAuth: true });
  return ensureArray(res);
};

export const fetchBlogPost = async (id) => {
  const res = await api.get(`/cms/blog-posts/${id}/`, { skipAuth: true });
  return res;
};

export const fetchFaqs = async () => {
  const res = await api.get('/cms/faqs/?status=PUBLISHED', { skipAuth: true });
  return ensureArray(res);
};

export const fetchOrders = async () => {
  const res = await api.get('/orders/orders/');
  return ensureArray(res);
};


export const fetchHeroBanners = async () => {
  const res = await deduplicatedGet('/cms/hero-banners/', { skipAuth: true }); // fixed from /cms/projects/
  return ensureArray(res);
};

export const fetchTikTokReels = async () => {
  const res = await deduplicatedGet('/cms/social-links/', { skipAuth: true }); // fixed from /cms/testimonials/
  return ensureArray(res);
};

export const fetchTestimonials = async () => {
  const res = await deduplicatedGet('/cms/testimonials/', { skipAuth: true });
  return ensureArray(res);
};

export const fetchSiteSettings = async () => {
  const res = await deduplicatedGet('/settings/site/', { skipAuth: true });
  return res;
};

export const updateSiteSettings = async (id, settingsData) => {
  const res = await api.patch(`/settings/site/`, settingsData); // Site settings is a singleton, no id needed
  return res;
};

export const fetchSystemConfig = async () => {
  const res = await deduplicatedGet('/settings/system/', { skipAuth: true });
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
  const res = await api.get('/cms/policies/', { skipAuth: true });
  return ensureArray(res);
};

export const fetchContactInfo = async () => {
  const res = await api.get('/cms/contact-info/', { skipAuth: true });
  return ensureArray(res);
};

export const submitContactForm = async (data) => {
  return await api.post('/cms/inquiries/', data, { skipAuth: true });
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
