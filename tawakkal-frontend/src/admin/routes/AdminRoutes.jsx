import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import { AdminProvider } from '../contexts/AdminContext';
import { ToastProvider } from '../components/ui/Toast';
import AdminLayout from '../layouts/AdminLayout';


// Features
import Dashboard from '../features/dashboard/Dashboard';
import ProductList from '../features/products/ProductList';
import CreateProduct from '../features/products/CreateProduct';
import ProductEdit from '../features/products/ProductEdit';
import OrderList from '../features/orders/OrderList';
import CustomerList from '../features/customers/CustomerList';
import CategoryList from '../features/categories/CategoryList';
import Settings from '../features/settings/Settings';
import SystemConfig from '../features/settings/SystemConfig';
import BrandList from '../features/brands/BrandList';
import BadgeList from '../features/badges/BadgeList';
import CMSDashboard from "../features/cms/CMSDashboard";
import PageList from "../features/cms/pages/PageList";
import PageForm from "../features/cms/pages/PageForm";
import BlogList from '../features/cms/blogs/BlogList';
import BlogForm from '../features/cms/blogs/BlogForm';
import BlogCategoryList from '../features/cms/blogs/BlogCategoryList';
import AuthorList from '../features/cms/blogs/AuthorList';
import FaqList from '../features/cms/faqs/FaqList';
import FaqForm from "../features/cms/faqs/FaqForm";
import Analytics from '../features/analytics/Analytics';
import ContactInquiries from '../features/inquiries/ContactInquiries';
import SurveyResponses from '../features/surveys/SurveyResponses';
import StoreLocations from '../features/stores/StoreLocations';

import Profile from '../features/profile/Profile';
import NotificationCenter from '../features/notifications/NotificationCenter';

export default function AdminRoutes() {
  return (
    <ToastProvider>
      <AdminProvider>
        <ProtectedAdminRoute>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/create" element={<CreateProduct />} />
              <Route path="products/:id/edit" element={<ProductEdit />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="brands" element={<BrandList />} />
              <Route path="badges" element={<BadgeList />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="inquiries" element={<ContactInquiries />} />
              <Route path="cms" element={<CMSDashboard />} />
              <Route path="cms/pages" element={<PageList />} />
              <Route path="cms/pages/create" element={<PageForm />} />
              <Route path="cms/pages/:id" element={<PageForm />} />
              <Route path="cms/blogs" element={<BlogList />} />
              <Route path="cms/blogs/create" element={<BlogForm />} />
              <Route path="cms/blogs/:id" element={<BlogForm />} />
              <Route path="cms/blog-categories" element={<BlogCategoryList />} />
              <Route path="cms/authors" element={<AuthorList />} />
              <Route path="cms/faqs" element={<FaqList />} />
              <Route path="cms/faqs/create" element={<FaqForm />} />
              <Route path="cms/faqs/:id" element={<FaqForm />} />
              <Route path="surveys" element={<SurveyResponses />} />
              <Route path="stores" element={<StoreLocations />} />

              <Route path="settings" element={<Settings />} />
              <Route path="system-config" element={<SystemConfig />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<NotificationCenter />} />
              
              {/* Catch all for undefined admin routes */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </ProtectedAdminRoute>
      </AdminProvider>
    </ToastProvider>
  );
}
