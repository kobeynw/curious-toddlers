import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-ink mb-4">404</h1>
      <p className="text-lg text-ink-muted mb-8">Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/" className="text-terra hover:text-terra-hover font-medium transition-colors">
        Go back home
      </Link>
    </div>
  );
}
