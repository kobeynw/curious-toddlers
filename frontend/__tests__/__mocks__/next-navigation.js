import { vi } from 'vitest';

export const mockRouter = { push: vi.fn(), replace: vi.fn(), back: vi.fn() };
export const mockPathname = vi.fn(() => '/');
export const mockSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams(),
}));
