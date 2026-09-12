import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { user } = useAuth();
  const { items } = useWishlist();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-muted mb-4">Sign in to view your wishlist.</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="font-display text-3xl mb-8">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted mb-6">Nothing here yet — tap the heart on any product to save it.</p>
          <Link to="/products" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
