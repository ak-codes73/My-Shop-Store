import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { adminLogin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      await adminLogin(email, password);
      success('Logged in successfully as Administrator.');
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col justify-between p-4 sm:p-8">
      {/* Top back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-lift space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-charcoal text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-7 h-7 text-accent" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted block">
            Authorized Personnel Only
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal">
            Admin Management Login
          </h1>
          <p className="text-xs text-muted">
            Access store catalog, manual UPI verifications, orders, and system settings. Only accounts registered in the admin database are authorized.
          </p>
        </div>

        {loginError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl pl-10 pr-4 py-3 outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl pl-10 pr-4 py-3 outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-wider hover:bg-black transition-all shadow-md group disabled:bg-cream-300 disabled:text-muted"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-charcoal-400">
        &copy; {new Date().getFullYear()} ATELIER & CO. Secure Operations Architecture.
      </div>
    </div>
  );
};
