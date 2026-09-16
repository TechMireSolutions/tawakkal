import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import NotificationToast from "./components/NotificationToast";

// Critical Eager Routes
import Home from "./pages/Home";

// Lazy Loaded Storefront Routes
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const BrandDetail = lazy(() => import("./pages/BrandDetail"));
const BadgeDetail = lazy(() => import("./pages/BadgeDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Shipping = lazy(() => import("./pages/Shipping"));
const StoreLocator = lazy(() => import("./pages/StoreLocator"));
const Blogs = lazy(() => import("./pages/Blogs"));
const FabricGlossary = lazy(() => import("./pages/FabricGlossary"));
const FeedbackSurvey = lazy(() => import("./pages/FeedbackSurvey"));
const FAQs = lazy(() => import("./pages/FAQs"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));

// Lazy Loaded Admin Routes
const AdminRoutes = lazy(() => import("./admin/routes/AdminRoutes"));
const AdminLogin = lazy(() => import("./admin/features/auth/AdminLogin"));
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { SystemConfigProvider, useSystemConfig } from "./context/SystemConfigContext";

function App() {
  return (
    <SiteSettingsProvider>
      <SystemConfigProvider>
        <AppContent />
      </SystemConfigProvider>
    </SiteSettingsProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminLegacyPath = location.pathname.startsWith("/admin-panel");
  const isNewAdminPath = location.pathname.startsWith("/admin");
  const isLoginPage = location.pathname === "/admin-login";
  const systemConfig = useSystemConfig();

  useEffect(() => {
    if (systemConfig) {
      const lang = systemConfig.default_language || 'en';
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [systemConfig]);

  if (systemConfig?.maintenance_mode && !isAdminLegacyPath && !isNewAdminPath && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory text-charcoal flex-col gap-4 text-center p-4">
        <h1 className="text-4xl font-serif">Maintenance Mode</h1>
        <p className="text-lg max-w-md">Our website is currently undergoing scheduled maintenance. Please check back later.</p>
      </div>
    );
  }

  return (
    <>
      {isAdminLegacyPath || isNewAdminPath || isLoginPage ? (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-charcoal"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin-panel"
              element={<Navigate to="/admin" replace />}
            />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </Suspense>
      ) : (
        <SmoothScroll>
          <div className="bg-ivory min-h-screen text-charcoal">
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ivory"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/brand/:slug" element={<BrandDetail />} />
                <Route path="/badge/:slug" element={<BadgeDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/store-locator" element={<StoreLocator />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/fabric-glossary" element={<FabricGlossary />} />
                <Route path="/feedback-survey" element={<FeedbackSurvey />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/page/:slug" element={<DynamicPage />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="*" element={<DynamicPage />} />
              </Routes>
            </Suspense>
            <Footer />
            <WhatsAppButton />
            <NotificationToast />
          </div>
        </SmoothScroll>
      )}
    </>
  );
}

export default App;
