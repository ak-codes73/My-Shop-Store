import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CustomerSignUp = () => {
  const navigate = useNavigate();
  const { customerSignUp } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await customerSignUp(email, password, {
        name: name.trim(),
        phone: phone.trim()
      });
      success('Account created successfully! Welcome to Atelier & Co.');
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
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
            Create Account
          </h1>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aryan Kedar"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(23,23,23,0.2)',
                  color: '#171717',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  backgroundColor: '#FAFAF8',
                }}
              />
            </div>

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
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Phone Number <span className="text-xs text-muted font-normal">(Optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(23,23,23,0.2)',
                  color: '#171717',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  backgroundColor: '#FAFAF8',
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
                Password <span className="text-xs text-muted font-normal">(Min 6 characters)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-black/40 hover:text-black/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-opacity disabled:opacity-70"
              style={{ backgroundColor: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: '#C99738' }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

