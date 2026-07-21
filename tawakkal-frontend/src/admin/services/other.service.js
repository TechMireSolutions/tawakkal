import api from './axios';

const ensureArray = (res) => Array.isArray(res) ? res : (res?.results || []);

export const otherService = {
  getDashboardStats: async () => api.get('/analytics/dashboard-stats/'),
  getRecentActivity: async () => api.get('/analytics/recent-activity/'),
  getAnalyticsData: async () => api.get('/analytics/overview/'),
  
  getMessages: async () => {
    try {
      const res = await api.get('/cms/inquiries/');
      return ensureArray(res);
    } catch { return []; }
  },
  clearMessages: async () => api.delete('/cms/inquiries/clear-all/'),
  markAsRead: async (id) => api.patch(`/cms/inquiries/${id}/`, { status: 'read' }),
  replyToMessage: async (id, reply) => api.patch(`/cms/inquiries/${id}/`, { status: 'replied', reply: reply }),

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
      const res = await api.get('/cms/inquiries/');
      const data = ensureArray(res);
      const feedback = data.filter(msg => msg.subject && msg.subject.startsWith('Feedback -'));
      return feedback.map(msg => {
        let rating = 5;
        const ratingMatch = msg.message && msg.message.match(/Rating:\s*(\d+)/);
        if (ratingMatch) rating = parseInt(ratingMatch[1]);
        return {
          id: msg.id,
          customer: msg.name,
          rating: rating,
          feedback: msg.message,
          category: msg.subject.replace('Feedback - ', ''),
          createdAt: msg.created_at
        };
      });
    } catch { return []; }
  },
  getSurveyAnalytics: async () => {
    const surveys = await otherService.getSurveys();
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    
    surveys.forEach(s => {
      if (s.rating >= 1 && s.rating <= 5) {
        distribution[s.rating]++;
        totalRating += s.rating;
      }
    });
    
    return {
      totalResponses: surveys.length,
      averageRating: surveys.length ? totalRating / surveys.length : 0,
      distribution
    };
  },

  getSettings: async () => api.get('/settings/site/'),
  updateSettings: async (section, data) => api.put(`/settings/${section}/`, data),
  getSystemConfig: async () => api.get('/settings/system/'),
  updateSystemConfig: async (data) => api.put('/settings/system/', data)
};
