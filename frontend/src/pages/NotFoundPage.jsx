import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
          <SearchX className="w-12 h-12 text-primary-400" />
        </div>
        <div>
          <h1 className="text-6xl font-bold font-display text-surface-900">404</h1>
          <p className="text-lg text-surface-500 mt-2">Page not found</p>
          <p className="text-sm text-surface-400 mt-1">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
