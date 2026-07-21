/**
 * Service layer for admin dashboard.
 * Now acts as an aggregator exporting domain-specific services.
 */
import { catalogService } from './catalog.service';
import { customerService } from './customer.service';
import { orderService } from './order.service';
import { otherService } from './other.service';

/* ═══════ Dashboard ═══════ */
export const getDashboardStats = otherService.getDashboardStats;
export const getRecentActivity = otherService.getRecentActivity;

/* ═══════ Products ═══════ */
export const getProducts = catalogService.getProducts;
export const getProduct = catalogService.getProduct;
export const createProduct = catalogService.createProduct;
export const updateProduct = catalogService.updateProduct;
export const deleteProduct = catalogService.deleteProduct;
export const duplicateProduct = catalogService.duplicateProduct;

/* ═══════ Categories ═══════ */
export const getCategories = catalogService.getCategories;
export const createCategory = catalogService.createCategory;
export const updateCategory = catalogService.updateCategory;
export const deleteCategory = catalogService.deleteCategory;

export const getBrands = catalogService.getBrands;
export const getBrand = catalogService.getBrand;
export const createBrand = catalogService.createBrand;
export const updateBrand = catalogService.updateBrand;
export const deleteBrand = catalogService.deleteBrand;

export const getBadges = catalogService.getBadges;
export const getBadge = catalogService.getBadge;
export const createBadge = catalogService.createBadge;
export const updateBadge = catalogService.updateBadge;
export const deleteBadge = catalogService.deleteBadge;

/* ═══════ Orders ═══════ */
export const getOrders = orderService.getOrders;
export const getOrder = orderService.getOrder;
export const updateOrderStatus = orderService.updateOrderStatus;
export const deleteOrder = orderService.deleteOrder;

/* ═══════ Customers ═══════ */
export const getCustomers = customerService.getCustomers;
export const getCustomer = customerService.getCustomer;
export const deleteCustomer = customerService.deleteCustomer;

/* ═══════ Messages ═══════ */
export const getMessages = otherService.getMessages;
export const clearMessages = otherService.clearMessages;
export const markAsRead = otherService.markAsRead;
export const replyToMessage = otherService.replyToMessage;

/* ═══════ Notifications ═══════ */
export const getNotifications = otherService.getNotifications;
export const markAllNotificationsRead = otherService.markAllNotificationsRead;

/* ═══════ Content ═══════ */
export const getBlogs = otherService.getBlogs;
export const createBlog = otherService.createBlog;
export const updateBlog = otherService.updateBlog;
export const deleteBlog = otherService.deleteBlog;

export const getFaqs = otherService.getFaqs;
export const createFaq = otherService.createFaq;
export const updateFaq = otherService.updateFaq;
export const deleteFaq = otherService.deleteFaq;

/* ═══════ Stores ═══════ */
export const getStores = otherService.getStores;
export const createStore = otherService.createStore;
export const updateStore = otherService.updateStore;
export const deleteStore = otherService.deleteStore;

/* ═══════ Surveys ═══════ */
export const getSurveys = otherService.getSurveys;
export const getSurveyAnalytics = otherService.getSurveyAnalytics;

/* ═══════ Analytics ═══════ */
export const getAnalyticsData = otherService.getAnalyticsData;

/* ═══════ Settings ═══════ */
export const getSettings = otherService.getSettings;
export const updateSettings = otherService.updateSettings;
export const getSystemConfig = otherService.getSystemConfig;
export const updateSystemConfig = otherService.updateSystemConfig;
