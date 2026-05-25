import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function VerifyEmailPage() {
  const { user, loading, logout, setVerified } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (!token) return;

    api('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setStatus('success');
        setVerified();
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message);
      });
  }, [token, setVerified]);

  async function handleResend() {
    setResendStatus('');
    setError('');
    try {
      const data = await api('/api/auth/resend-verification', { method: 'POST' });
      setResendStatus(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return null;

  // If not logged in and no token, redirect to login
  if (!user && !token) return <Navigate to="/login" replace />;

  // If user is verified, redirect them away
  if (user?.isVerified) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12">
        <div className="bg-sand-surface rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-ink mb-4">Email Verified</h1>
          <p className="text-ink-muted mb-6">Your email is successfully verified.</p>
          <Link
            to="/"
            className="inline-block bg-terra text-sand px-6 py-2 rounded-md font-medium hover:bg-terra-hover transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Token verification mode
  if (token) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12">
        <div className="bg-sand-surface rounded-lg shadow p-6 text-center">
          {status === 'verifying' && (
            <>
              <h1 className="text-2xl font-bold text-ink mb-4">Verifying Email</h1>
              <p className="text-ink-muted">Please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-ink mb-4">Email Verified!</h1>
              <p className="text-ink-muted mb-6">Your email has been successfully verified.</p>
              <Link
                to="/"
                className="inline-block bg-terra text-sand px-6 py-2 rounded-md font-medium hover:bg-terra-hover transition-colors"
              >
                Continue to App
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-ink mb-4">Verification Failed</h1>
              <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
                {error}
              </div>
              <p className="text-ink-muted mb-4">
                The link may have expired or already been used.
              </p>
              {user && (
                <button
                  onClick={handleResend}
                  className="text-terra hover:text-terra-hover font-medium"
                >
                  Resend verification email
                </button>
              )}
              {!user && (
                <Link to="/login" className="text-terra hover:text-terra-hover font-medium">
                  Log in to resend
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // "Check your email" screen (no token)
  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-sand-surface rounded-lg shadow p-6 text-center">
        <h1 className="text-2xl font-bold text-ink mb-4">Check Your Email</h1>
        <p className="text-ink-muted mb-2">
          We sent a verification link to:
        </p>
        {user && (
          <p className="text-ink font-medium mb-6">{user.email}</p>
        )}
        <p className="text-ink-muted text-sm mb-6">
          Click the link in the email to verify your account. The link expires in 24 hours.
        </p>

        {error && (
          <div className="bg-terra-light text-terra-dark text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}

        {resendStatus && (
          <div className="bg-green-50 text-green-700 text-sm rounded p-3 mb-4">
            {resendStatus}
          </div>
        )}

        <button
          onClick={handleResend}
          className="text-terra hover:text-terra-hover font-medium text-sm"
        >
          Resend verification email
        </button>

        <div className="mt-6 pt-4 border-t border-sand-border">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-ink-muted hover:text-terra transition-colors text-sm"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
