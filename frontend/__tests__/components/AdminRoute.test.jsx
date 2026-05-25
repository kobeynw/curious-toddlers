import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import AdminRoute from '@/components/AdminRoute';
import { mockRouter } from '../__mocks__/next-navigation';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/context/AuthContext';

function renderRoute() {
  return render(
    <AdminRoute>
      <div>admin-content</div>
    </AdminRoute>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AdminRoute', () => {
  it('renders nothing and does not redirect while loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderRoute();
    expect(container).toBeEmptyDOMElement();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('redirects to /login when user is not authenticated', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderRoute();
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('redirects to /verify-email when user is not verified', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: false, role: 'admin' },
      loading: false,
    });

    renderRoute();
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/verify-email');
    });
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('redirects to / when user role is not admin', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: true, role: 'user' },
      loading: false,
    });

    renderRoute();
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
    expect(screen.queryByText('admin-content')).not.toBeInTheDocument();
  });

  it('renders children when user is a verified admin', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test', isVerified: true, role: 'admin' },
      loading: false,
    });

    renderRoute();
    expect(screen.getByText('admin-content')).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
