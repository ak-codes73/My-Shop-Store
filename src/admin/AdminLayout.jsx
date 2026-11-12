import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, ShieldCheck, Radio, ExternalLink } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { isSupabaseConfigured } from '../services/supabase';

export const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Wrapper */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border-light px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-charcoal hover:bg-cream-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold text-sm text-charcoal hidden sm:inline">
              Operations Control Center
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Live DB Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cream-100 border border-border-light rounded-full text-[11px] font-semibold text-charcoal">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isSupabaseConfigured ? 'Supabase Realtime' : 'Local Realtime Active'}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

