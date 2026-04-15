import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={user.isVerified ? '/' : '/verify-email'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email is required');
    if (!password) return setError('Password is required');

    setSubmitting(true);
    try {
      const data = await login(email, password);
      navigate(data?.isVerified ? '/' : '/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-sand-surface rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-ink mb-6">Log In</h1>

        {error && (
          <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-terra text-sand py-2 rounded-md font-medium hover:bg-terra-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-ink-muted mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-terra hover:text-terra-hover">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
