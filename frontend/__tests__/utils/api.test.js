import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../src/utils/api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('api utility', () => {
  it('prepends VITE_API_URL and includes credentials', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 1 }),
    });

    await api('/api/health');

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/api/health'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('sets Content-Type to application/json by default', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await api('/api/test');

    const callArgs = spy.mock.calls[0][1];
    expect(callArgs.headers['Content-Type']).toBe('application/json');
  });

  it('returns parsed JSON on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1 } }),
    });

    const result = await api('/api/auth/me');
    expect(result).toEqual({ user: { id: 1 } });
  });

  it('throws error with server message on non-2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid email or password' }),
    });

    await expect(api('/api/auth/login', { method: 'POST' }))
      .rejects.toThrow('Invalid email or password');
  });

  it('throws generic error when response body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error('not json')),
    });

    await expect(api('/api/test')).rejects.toThrow('Something went wrong');
  });
});
