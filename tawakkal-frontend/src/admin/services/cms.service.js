import api from './axios';

// CMS Pages
export const getPages = async (params = {}) => {
  const res = await api.get('/cms/pages/', { params });
  return Array.isArray(res) ? res : res.results || [];
};

export const getPage = async (id) => {
  return await api.get(`/cms/pages/${id}/`);
};

export const createPage = async (data) => {
  return await api.post('/cms/pages/', data);
};

export const updatePage = async (id, data) => {
  return await api.patch(`/cms/pages/${id}/`, data);
};

export const deletePage = async (id) => {
  return await api.delete(`/cms/pages/${id}/`);
};

// Blogs
export const getBlogs = async (params = {}) => {
  const res = await api.get('/cms/blog-posts/', { params });
  return Array.isArray(res) ? res : res.results || [];
};

export const getBlog = async (id) => {
  return await api.get(`/cms/blog-posts/${id}/`);
};

export const createBlog = async (data) => {
  return await api.post('/cms/blog-posts/', data);
};

export const updateBlog = async (id, data) => {
  return await api.patch(`/cms/blog-posts/${id}/`, data);
};

export const deleteBlog = async (id) => {
  return await api.delete(`/cms/blog-posts/${id}/`);
};

// Blog Categories
export const getBlogCategories = async (params = {}) => {
  const res = await api.get('/cms/blog-categories/', { params });
  return Array.isArray(res) ? res : res.results || [];
};
export const getBlogCategory = async (id) => {
  return await api.get(`/cms/blog-categories/${id}/`);
};
export const createBlogCategory = async (data) => {
  return await api.post('/cms/blog-categories/', data);
};
export const updateBlogCategory = async (id, data) => {
  return await api.patch(`/cms/blog-categories/${id}/`, data);
};
export const deleteBlogCategory = async (id) => {
  return await api.delete(`/cms/blog-categories/${id}/`);
};

// Authors
export const getAuthors = async (params = {}) => {
  const res = await api.get('/cms/authors/', { params });
  return Array.isArray(res) ? res : res.results || [];
};
export const getAuthor = async (id) => {
  return await api.get(`/cms/authors/${id}/`);
};
export const createAuthor = async (data) => {
  return await api.post('/cms/authors/', data);
};
export const updateAuthor = async (id, data) => {
  return await api.patch(`/cms/authors/${id}/`, data);
};
export const deleteAuthor = async (id) => {
  return await api.delete(`/cms/authors/${id}/`);
};

// FAQs
export const getFaqs = async (params = {}) => {
  const res = await api.get('/cms/faqs/', { params });
  return Array.isArray(res) ? res : res.results || [];
};

export const getFaq = async (id) => {
  return await api.get(`/cms/faqs/${id}/`);
};

export const createFaq = async (data) => {
  return await api.post('/cms/faqs/', data);
};

export const updateFaq = async (id, data) => {
  return await api.patch(`/cms/faqs/${id}/`, data);
};

export const deleteFaq = async (id) => {
  return await api.delete(`/cms/faqs/${id}/`);
};
