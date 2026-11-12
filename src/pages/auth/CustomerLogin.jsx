import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerLogin } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerLogin(email, password);
      success('Welcome back!');
      const from = location.state?.from?.pathname || '/account';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: '#F5F1E8' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span
              className="text-2xl tracking-[0.3em] uppercase"
              style={{ fontFamily: 'Cinzel, serif', color: '#171717' }}
            >
              Atelier &amp; Co.
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 px-8 py-10">
          <h1
            className="text-2xl font-semibold text-center mb-8"
            style={{ fontFamily: 'Cinzel, serif', color: '#171717' }}
          >
            Welcome Back
          </h1>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(23,23,23,0.2)',
                  color: '#171717',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  backgroundColor: '#FAFAF8',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(23,23,23,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(23,23,23,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(23,23,23,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: 'rgba(23,23,23,0.2)',
                    color: '#171717',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    backgroundColor: '#FAFAF8',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(23,23,23,0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(23,23,23,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(23,23,23,0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-black/40 hover:text-black/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs hover:underline transition-all"
                style={{ color: '#C99738', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-opacity disabled:opacity-70"
              style={{ backgroundColor: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ color: '#C99738' }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
