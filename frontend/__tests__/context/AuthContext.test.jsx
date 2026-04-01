import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Mock the api module
vi.mock('../../src/utils/api', () => ({
  default: vi.fn(),
}));

import api from '../../src/utils/api';

function TestConsumer() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) return <div>loading</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'none'}</div>
      <button onClick={() => login('a@b.com', 'Pass1234')}>login</button>
      <button onClick={() => register('Test', 'a@b.com', 'Pass1234')}>register</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AuthContext', () => {
  it('shows loading then resolves user from /me on mount', async () => {
    api.mockResolvedValueOnce({ user: { id: 1, name: 'Alice', email: 'a@b.com' } });

    renderWithProvider();

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    });
  });

  it('sets user to null when /me fails', async () => {
    api.mockRejectedValueOnce(new Error('Not authenticated'));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
  });

  it('login sets user on success', async () => {
    api.mockRejectedValueOnce(new Error('Not authenticated')); // /me on mount

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    api.mockResolvedValueOnce({ user: { id: 2, name: 'Bob', email: 'b@c.com' } });

    await act(async () => {
      await userEvent.click(screen.getByText('login'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Bob');
    expect(api).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
  });

  it('register sets user on success', async () => {
    api.mockRejectedValueOnce(new Error('Not authenticated')); // /me

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    api.mockResolvedValueOnce({ user: { id: 3, name: 'Test', email: 'a@b.com' } });

    await act(async () => {
      await userEvent.click(screen.getByText('register'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test');
    expect(api).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' }));
  });

  it('logout clears user', async () => {
    api.mockResolvedValueOnce({ user: { id: 1, name: 'Alice', email: 'a@b.com' } }); // /me

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    });

    api.mockResolvedValueOnce({}); // logout response

    await act(async () => {
      await userEvent.click(screen.getByText('logout'));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(api).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});
