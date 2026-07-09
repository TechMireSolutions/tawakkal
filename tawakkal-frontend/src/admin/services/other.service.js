import api from './axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const otherService = {
  getDashboardStats: async () => api.get('/analytics/dashboard-stats/'),
  getRecentActivity: async () => api.get('/analytics/recent-activity/'),
  getAnalyticsData: async () => api.get('/analytics/overview/'),
  
  getMessages: async () => {
    try {
      const res = await api.get('/cms/contact-info/');
      return ensureArray(res);
    } catch { return []; }
  },
  markAsRead: async (id) => api.patch(`/cms/contact-info/${id}/read/`),
  replyToMessage: async (id, reply) => api.post(`/cms/contact-info/${id}/reply/`, { reply }),

  getNotifications: async () => {
    try {
      const res = await api.get('/notifications/notifications/');
      return ensureArray(res);
    } catch { return []; }
  },
  markAllNotificationsRead: async () => api.post('/notifications/notifications/mark-all-read/'),

  getBlogs: async () => {
    try {
      const res = await api.get('/cms/blog-posts/');
      return ensureArray(res);
    } catch { return []; }
  },
  createBlog: async (data) => api.post('/cms/blog-posts/', data),
  updateBlog: async (id, data) => api.put(`/cms/blog-posts/${id}/`, data),
  deleteBlog: async (id) => api.delete(`/cms/blog-posts/${id}/`),

  getFaqs: async () => {
    try {
      const res = await api.get('/cms/faqs/');
      return ensureArray(res);
    } catch { return []; }
  },
  createFaq: async (data) => api.post('/cms/faqs/', data),
  updateFaq: async (id, data) => api.put(`/cms/faqs/${id}/`, data),
  deleteFaq: async (id) => api.delete(`/cms/faqs/${id}/`),

  getStores: async () => {
    try {
      const res = await api.get('/stores/branches/');
      return ensureArray(res);
    } catch { return []; }
  },
  createStore: async (data) => api.post('/stores/branches/', data),
  updateStore: async (id, data) => api.put(`/stores/branches/${id}/`, data),
  deleteStore: async (id) => api.delete(`/stores/branches/${id}/`),

  getSurveys: async () => {
    try {
      const res = await api.get('/surveys/surveys/');
      return ensureArray(res);
    } catch { return []; }
  },
  getSurveyAnalytics: async () => api.get('/surveys/analytics/'),

  getSettings: async () => api.get('/settings/site/'),
  updateSettings: async (section, data) => api.put(`/settings/${section}/`, data),
  getSystemConfig: async () => api.get('/settings/system/'),
  updateSystemConfig: async (data) => api.put('/settings/system/', data)
};
