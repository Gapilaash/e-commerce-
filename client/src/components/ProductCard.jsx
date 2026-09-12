import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from './StarRating';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();

  async function handleAdd(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    await addToCart(product.id, 1);
  }

  async function handleWishlist(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    await toggle(product.id);
  }

  const wishlisted = user && isWishlisted(product.id);

  return (
    <Link to={`/products/${product.id}`} className="card overflow-hidden group flex flex-col relative">
      <button
        onClick={handleWishlist}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#C98A2A' : 'none'} stroke="#C98A2A" strokeWidth="2">
          <path d="M12 21s-7-4.35-9.5-8.6C.6 8.7 2.3 5 6 5c2 0 3.5 1.2 4.2 2.4C10.9 6.2 12.4 5 14.4 5c3.7 0 5.4 3.7 3.5 7.4C19 16.65 12 21 12 21z" />
        </svg>
      </button>

      <div className="aspect-[4/3] overflow-hidden bg-forest-light">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1 flex-1">
        <span className="text-xs text-muted">{product.category}</span>
        <h3 className="font-medium leading-snug text-sm sm:text-base line-clamp-2">{product.name}</h3>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating value={product.rating} size={12} />
            <span className="text-xs text-muted">({product.numReviews})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 gap-2">
          <span className="font-display text-base sm:text-lg">Rs. {product.price.toFixed(2)}</span>
          <button onClick={handleAdd} className="btn-secondary py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}
