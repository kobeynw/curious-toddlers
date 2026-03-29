import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-sand-surface border-t border-sand-border">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-muted">
        <p>&copy; 2026 Curious Toddlers</p>
        <nav className="flex gap-4">
          <Link to="/about" className="hover:text-terra transition-colors">About</Link>
          <Link to="/activities" className="hover:text-terra transition-colors">Activities</Link>
          <Link to="/learn" className="hover:text-terra transition-colors">Learn</Link>
        </nav>
      </div>
    </footer>
  );
}
