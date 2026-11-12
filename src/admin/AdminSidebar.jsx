import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, CreditCard, Users, 
  Settings, ExternalLink, LogOut, X, Sparkles, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/dbBridge';

export const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { adminLogout, adminUser } = useAuth();
  const navigate = useNavigate();
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const fetchPendingPayments = async () => {
    try {
      const payments = await db.getPayments();
      const pending = payments.filter((p) => p.payment_status === 'Pending Verification');
      setPendingPaymentsCount(pending.length);
    } catch (e) {}
  };

  useEffect(() => {
    fetchPendingPayments();

    const unsubscribe = db.subscribe('payments', () => {
      fetchPendingPayments();
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products Catalog', path: '/admin/products', icon: Package },
    { label: 'Orders Management', path: '/admin/orders', icon: ShoppingCart },
    { 
      label: 'UPI Verification', 
      path: '/admin/payments', 
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null 
    },
    { label: 'Customer Directory', path: '/admin/customers', icon: Users },
    { label: 'Custom Requests', path: '/admin/custom-requests', icon: MessageSquare },
    { label: 'Store & UPI Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-charcoal text-white flex flex-col justify-between border-r border-charcoal-700 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Close */}
        <div>
          <div className="p-6 border-b border-charcoal-700 flex items-center justify-between">
            <Link to="/admin/dashboard" className="space-y-0.5">
              <span className="font-serif text-xl font-extrabold tracking-wider text-white block">
                ATELIER ADMIN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent block">
                Store Operations Portal
              </span>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-charcoal-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-accent text-charcoal font-extrabold shadow-sm'
                        : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: User profile, View Store, Logout */}
        <div className="p-4 border-t border-charcoal-700 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-300 hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-accent" />
              <span>Customer Storefront</span>
            </span>
          </Link>

          <div className="p-3 bg-charcoal-800 rounded-xl flex items-center justify-between">
            <div className="truncate pr-2">
              <span className="text-xs font-bold text-white block truncate">
                {adminUser?.email || 'Admin'}
              </span>
              <span className="text-[10px] text-accent uppercase font-bold tracking-wider">
                {adminUser?.role || 'Administrator'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-charcoal-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

