import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { customerUpdatePassword } = useAuth();
  const { success } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await customerUpdatePassword(password);
      success('Password updated successfully! Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
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
            className="text-2xl font-semibold text-center mb-2"
            style={{ fontFamily: 'Cinzel, serif', color: '#171717' }}
          >
            Set New Password
          </h1>
          <p
            className="text-xs text-center text-muted mb-8"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Choose a strong password with at least 6 characters.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: 'rgba(23,23,23,0.2)',
                  color: '#171717',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  backgroundColor: '#FAFAF8',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-opacity disabled:opacity-70"
              style={{ backgroundColor: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating Password…
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

