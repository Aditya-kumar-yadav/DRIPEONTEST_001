import React, { useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import ZipPreloader from './components/ZipPreloader';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';
import Preloader from './components/Preloader';
import ChatWidget from './components/ChatWidget';
import FlyToCartAnimation from './components/FlyToCartAnimation';
import ConfettiAnimation from './components/ConfettiAnimation';

// Customer Pages (Lazy Loaded for Performance)
const Home = lazy(() => import('./pages/Home'));
const FootwearLanding = lazy(() => import('./pages/FootwearLanding'));
const ClothingLanding = lazy(() => import('./pages/ClothingLanding'));
const CapsLanding = lazy(() => import('./pages/CapsLanding'));
const Ornaments = lazy(() => import('./pages/Ornaments'));
const EarPiercing = lazy(() => import('./pages/EarPiercing'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Policies = lazy(() => import('./pages/Policies'));
const Login = lazy(() => import('./pages/Login'));
const SignUpPage = lazy(() => import('./pages/SignUp'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Cart = lazy(() => import('./pages/Cart'));
const FAQ = lazy(() => import('./pages/FAQ'));
const OptimizedProductGrid = lazy(() => import('./components/OptimizedProductGrid'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import CustomerRouteGuard from './components/CustomerRouteGuard';
import { useApp } from './AppContext';

// Helper component to auto-scroll to ceiling on route changes
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [pathname, search]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Customer routes */}
        <Route path="/preview-architecture" element={<Suspense fallback={<div>Loading...</div>}><OptimizedProductGrid /></Suspense>} />
        <Route path="/" element={<Home />} />
        <Route path="/footwear" element={<FootwearLanding />} />
        <Route path="/clothing" element={<ClothingLanding />} />
        <Route path="/caps" element={<CapsLanding />} />
        <Route path="/ornaments" element={<Ornaments />} />
        <Route path="/ear-piercing" element={<EarPiercing />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route
          path="/checkout"
          element={
            <CustomerRouteGuard>
              <Checkout />
            </CustomerRouteGuard>
          }
        />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route
          path="/account"
          element={
            <CustomerRouteGuard>
              <Account />
            </CustomerRouteGuard>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <CustomerRouteGuard>
              <OrderTracking />
            </CustomerRouteGuard>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Policy pages routing to unified policy suite */}
        <Route path="/shipping-policy" element={<Policies />} />
        <Route path="/return-policy" element={<Policies />} />
        <Route path="/privacy-policy" element={<Policies />} />
        <Route path="/terms-and-conditions" element={<Policies />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Administrative console route gateways */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          }
        />

        {/* Fallback routing */}
        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) return;

      const originalText = selection.toString();
      // Don't append if it's a very short copy (like a single word/code)
      if (originalText.length < 15) return;

      const currentUrl = window.location.href;
      const attribution = `\n\nShop this at DRIPEON: ${currentUrl}`;
      const clipboardText = originalText + attribution;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', clipboardText);
        e.preventDefault();
      }
    };
    
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  const appContent = (
    <BrowserRouter>
      <ScrollToTop />

      {/* First visit portal curtain */}
      <Preloader />

      {/* Standard toast container logs alerts */}
      <ToastContainer />

      {/* Luxury Chatbot Personal Concierge */}
      <ChatWidget />

      <div className="flex flex-col min-h-screen bg-white text-gray-900">

        {/* Header navigation bar */}
        <Navbar />

        {/* Cart side-drawer panel */}
        <CartDrawer />


        {/* Floating Add to Cart flight particles effect */}
        <FlyToCartAnimation />

        {/* Global coupon validated celebration effects */}
        <ConfettiAnimation />

        {/* Core layout routes viewport */}
        <main className="flex-grow flex flex-col">
          <Suspense fallback={
            <div className="flex-grow flex flex-col items-center justify-center bg-white min-h-[60vh]">
              <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-red-600 animate-spin"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium mt-4">Loading Experience...</p>
            </div>
          }>
            <AnimatedRoutes />
          </Suspense>
        </main>

        {/* Ground footer controls */}
        <Footer />

      </div>
    </BrowserRouter>
  );

  return (
    <AppProvider>
      <ZipPreloader />
      {appContent}
    </AppProvider>
  );
}
