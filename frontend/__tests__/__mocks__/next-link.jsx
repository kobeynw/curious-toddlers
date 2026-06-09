import { vi } from 'vitest';

// next/link reads the App Router context, which is null under jsdom. Render a plain
// anchor so components using <Link> can be tested without a router provider.
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
