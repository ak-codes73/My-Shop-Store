import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Storefront Components
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';

// Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Payment } from './pages/Payment';
import { OrderSuccess } from './pages/OrderSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { CustomPosterRequest } from './pages/CustomPosterRequest';
import { Wishlist } from './pages/Wishlist';
import { Policies } from './pages/Policies';
import { NotFound } from './pages/NotFound';
import { MyAccount } from './pages/MyAccount';
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerSignUp } from './pages/auth/CustomerSignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Admin Components & Pages
import { AdminGuard } from './admin/AdminGuard';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminProductForm } from './admin/AdminProductForm';
import { AdminOrders } from './admin/AdminOrders';
import { AdminPayments } from './admin/AdminPayments';
import { AdminCustomers } from './admin/AdminCustomers';
import { AdminCustomRequests } from './admin/AdminCustomRequests';
import { AdminSettings } from './admin/AdminSettings';

// Customer Layout wrapper with Announcement, Navbar, Cart Drawer, and Footer
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <StoreSettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <Routes>
                  {/* Public Customer Storefront Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/:orderId" element={<Payment />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/custom-order" element={<CustomPosterRequest />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/account" element={<MyAccount />} />
                    <Route path="/login" element={<CustomerLogin />} />
                    <Route path="/signup" element={<CustomerSignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* Admin Authentication */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminGuard>
                        <AdminLayout />
                      </AdminGuard>
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/edit/:id" element={<AdminProductForm />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="custom-requests" element={<AdminCustomRequests />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
                </Routes>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </StoreSettingsProvider>
  );
}

export default App;

