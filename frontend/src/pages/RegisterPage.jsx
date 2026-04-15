import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function validateForm({ name, email, password, confirmPassword }) {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length > 255) return 'Name must be 255 characters or fewer';
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Invalid email format';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user?.isVerified) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validateForm({ name, email, password, confirmPassword });
    if (validationError) return setError(validationError);

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-sand-surface rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-ink mb-6">Create an Account</h1>

        {error && (
          <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-sand-border rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-terra text-sand py-2 rounded-md font-medium hover:bg-terra-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-ink-muted mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-terra hover:text-terra-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
