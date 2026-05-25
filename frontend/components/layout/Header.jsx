'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/learn', label: 'Learn' },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

function navLinkClass(active) {
  return active
    ? 'text-terra font-medium'
    : 'text-ink-muted hover:text-terra transition-colors';
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-sand border-b border-sand-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo doesn't benefit from next/image optimization */}
          <img src="/curious-toddlers-logo.svg" alt="Curious Toddlers logo" width={50} />
          <Link href="/" className="text-2xl font-bold text-ink hover:text-terra transition-colors">
            Curious Toddlers
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <Link key={to} href={to} className={navLinkClass(isActive(pathname, to))}>
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link href="/admin" className={navLinkClass(isActive(pathname, '/admin'))}>
              Admin
            </Link>
          )}
          <span className="w-px h-5 bg-sand-border" />
          {!loading && (
            user ? (
              <>
                <span className="text-sm text-ink-muted">Hi, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-ink-muted hover:text-terra transition-colors text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={navLinkClass(isActive(pathname, '/login'))}>
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-terra text-sand px-3 py-1 rounded-md hover:bg-terra-hover transition-colors text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1 p-1"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-ink" />
          <span className="block w-6 h-0.5 bg-ink" />
          <span className="block w-6 h-0.5 bg-ink" />
        </button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-4 py-4 border-t border-sand-border bg-sand">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={navLinkClass(isActive(pathname, to))}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={navLinkClass(isActive(pathname, '/admin'))}
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          )}
          {!loading && (
            user ? (
              <>
                <span className="text-sm text-ink-muted">Hi, {user.name}</span>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="text-ink-muted hover:text-terra transition-colors text-sm text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={navLinkClass(isActive(pathname, '/login'))}
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-terra text-sand px-3 py-1 rounded-md hover:bg-terra-hover transition-colors text-sm font-medium w-fit"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )
          )}
        </nav>
      )}
    </header>
  );
}
