import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/curious-toddlers-logo.svg';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/learn', label: 'Learn' },
];

function navLinkClass({ isActive }) {
  return isActive
    ? 'text-terra font-medium'
    : 'text-ink-muted hover:text-terra transition-colors';
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="bg-sand border-b border-sand-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} width={50}/>
          <Link to="/" className="text-2xl font-bold text-ink hover:text-terra transition-colors">
            Curious Toddlers
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass} end={to === '/'}>
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
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
                <NavLink to="/login" className={navLinkClass}>
                  Log in
                </NavLink>
                <Link
                  to="/register"
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
            <NavLink
              key={to}
              to={to}
              className={navLinkClass}
              end={to === '/'}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass} onClick={() => setIsOpen(false)}>
              Admin
            </NavLink>
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
                <NavLink to="/login" className={navLinkClass} onClick={() => setIsOpen(false)}>
                  Log in
                </NavLink>
                <Link
                  to="/register"
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
