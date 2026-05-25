import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from '../../src/components/AdminRoute';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../src/context/AuthContext';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>admin-content</div>
            </AdminRoute>
          }
        />
        <Route path="/login" element={<div>login-page</div>} />
        <Route path="/verify-email" element={<div>verify-page</div>} />
        <Route path="/" element={<div>home-page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminRoute', () => {
  it('renders nothing while loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderAt('/admin');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to /login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderAt('/admin');
    expect(screen.getByText('login-page')).toBeInTheDocument();
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('redirects to /verify-email when user is not verified', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: false, role: 'admin' },
      loading: false,
    });

    renderAt('/admin');
    expect(screen.getByText('verify-page')).toBeInTheDocument();
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('redirects to / when user role is not admin', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: true, role: 'user' },
      loading: false,
    });

    renderAt('/admin');
    expect(screen.getByText('home-page')).toBeInTheDocument();
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('renders children when user is a verified admin', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: true, role: 'admin' },
      loading: false,
    });

    renderAt('/admin');
    expect(screen.getByText('admin-content')).toBeInTheDocument();
  });
});
