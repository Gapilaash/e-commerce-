import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  function loadProduct() {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
    api.get(`/products/${id}/similar`).then(res => setSimilar(res.data));
    api.get(`/reviews/${id}`).then(res => setReviews(res.data));
  }

  useEffect(() => {
    loadProduct();
    setQty(1);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (user && reviews.length) {
      const mine = reviews.find(r => r.userId === user.id);
      if (mine) setReviewForm({ rating: mine.rating, comment: mine.comment });
    }
  }, [reviews, user]);

  async function handleAdd() {
    if (!user) return navigate('/login');
    await addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleWishlist() {
    if (!user) return navigate('/login');
    await toggle(product.id);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!reviewForm.rating) return setReviewError('Please select a star rating.');
    setReviewError('');
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/${id}`)
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!product) return <div className="max-w-6xl mx-auto px-6 py-10 text-muted">Loading…</div>;

  const wishlisted = user && isWishlisted(product.id);
  const myReview = user && reviews.find(r => r.userId === user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        <div className="rounded-lg overflow-hidden border border-line aspect-square relative">
          <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#C98A2A' : 'none'} stroke="#C98A2A" strokeWidth="2">
              <path d="M12 21s-7-4.35-9.5-8.6C.6 8.7 2.3 5 6 5c2 0 3.5 1.2 4.2 2.4C10.9 6.2 12.4 5 14.4 5c3.7 0 5.4 3.7 3.5 7.4C19 16.65 12 21 12 21z" />
            </svg>
          </button>
        </div>

        <div>
          <span className="text-sm text-muted">{product.category}</span>
          <h1 className="font-display text-2xl sm:text-3xl mt-1 mb-3">{product.name}</h1>
          <p className="text-muted mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-1">
            <span className="font-display text-2xl sm:text-3xl">Rs. {product.price.toFixed(2)}</span>
            {product.numReviews > 0 ? (
              <span className="flex items-center gap-1 text-sm text-muted">
                <StarRating value={product.rating} size={14} /> {product.rating} ({product.numReviews})
              </span>
            ) : (
              <span className="text-sm text-muted">No reviews yet</span>
            )}
          </div>
          <p className={`text-sm mb-6 ${product.stock > 0 ? 'text-forest' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-muted">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max={product.stock}
                value={qty}
                onChange={e => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  if (v === '') { setQty(''); return; }
                  setQty(Math.min(product.stock, Math.max(1, v)));
                }}
                onBlur={() => { if (qty === '' || qty < 1) setQty(1); }}
                className="input w-16 text-center"
              />
              <button
                type="button"
                className="btn-secondary w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => setQty(q => Math.min(product.stock, (q || 0) + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleAdd} disabled={product.stock === 0} className="btn-primary flex-1 sm:flex-none">
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
            <button onClick={handleWishlist} className="btn-secondary flex-1 sm:flex-none">
              {wishlisted ? 'In wishlist ✓' : 'Add to wishlist'}
            </button>
          </div>

          {product.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.map(t => (
                <span key={t} className="text-xs bg-forest-light text-forest-dark px-2.5 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl mb-6">
          Reviews {product.numReviews > 0 && `(${product.numReviews})`}
        </h2>

        <div className="card p-5 mb-8">
          <h3 className="font-medium mb-3">{myReview ? 'Update your review' : 'Write a review'}</h3>
          <form onSubmit={submitReview} className="space-y-3">
            <StarRating
              value={reviewForm.rating}
              interactive
              size={22}
              onChange={(n) => setReviewForm(prev => ({ ...prev, rating: n }))}
            />
            <textarea
              className="input"
              rows={3}
              placeholder="Share your experience with this product…"
              value={reviewForm.comment}
              onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button type="submit" disabled={submittingReview} className="btn-primary">
              {submittingReview ? 'Submitting…' : myReview ? 'Update review' : 'Submit review'}
            </button>
          </form>
        </div>

        {reviews.length === 0 ? (
          <p className="text-muted text-sm">Be the first to review this product.</p>
        ) : (
          <div className="space-y-5">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-line pb-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.userName}</span>
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <StarRating value={r.rating} size={14} />
                {r.comment && <p className="text-sm text-muted mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
         }
