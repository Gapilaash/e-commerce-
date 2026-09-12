import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { items, total, refreshCart, updateQty, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) refreshCart();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted mb-4">Sign in to view your cart.</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl mb-3">Your cart is empty</h1>
        <p className="text-muted mb-6">Add something you like — it'll show up here.</p>
        <Link to="/products" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">Your cart</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.productId} className="card p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
            <ProductImage src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shrink-0" />
            <div className="flex-1 min-w-[140px]">
              <p className="font-medium text-sm sm:text-base">{item.name}</p>
              <p className="text-sm text-muted">Rs. {item.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2 order-3 sm:order-none">
              <button
                className="btn-secondary w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => item.qty > 1 ? updateQty(item.productId, item.qty - 1) : removeFromCart(item.productId)}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.qty}
                onChange={e => updateQty(item.productId, Math.max(1, Number(e.target.value)))}
                className="input w-14 text-center"
              />
              <button
                className="btn-secondary w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => updateQty(item.productId, Math.min(item.stock, item.qty + 1))}
              >
                +
              </button>
            </div>

            <p className="w-16 sm:w-20 text-right font-medium text-sm sm:text-base order-2 sm:order-none">Rs. {(item.price * item.qty).toFixed(2)}</p>

            <button onClick={() => removeFromCart(item.productId)} className="text-sm text-red-600 hover:underline order-4 sm:order-none">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-line pt-6">
        <span className="font-display text-xl sm:text-2xl">Total: Rs. {total.toFixed(2)}</span>
        <button onClick={() => navigate('/checkout')} className="btn-primary">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
