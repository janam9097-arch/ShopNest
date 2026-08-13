import { Heart } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

const WishlistPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-surface-900 mb-6">My Wishlist</h1>
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save items you love for later."
        action={() => window.location.href = '/products'}
        actionLabel="Browse Products"
      />
    </div>
  );
};

export default WishlistPage;
