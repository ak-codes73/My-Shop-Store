import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPassword = () => {
  const { customerForgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await customerForgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to send reset email. Please try again.');
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
            Reset Password
          </h1>
          <p
            className="text-xs text-center text-muted mb-8"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Enter your email address and we will send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 text-left">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Check your inbox</p>
                  <p className="text-xs leading-relaxed text-emerald-700">
                    If an account exists for <span className="font-semibold">{email}</span>, you will receive an email with instructions to reset your password.
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal hover:underline"
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-opacity disabled:opacity-70"
                style={{ backgroundColor: '#171717', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending link…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-charcoal transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

