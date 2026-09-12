import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import StripeCardForm from '../components/StripeCardForm';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const hasRealStripe = Boolean(STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.startsWith('your_'));
const stripePromise = hasRealStripe ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export default function Checkout() {
  const { items, total, refreshCart } = useCart();
  const navigate = useNavigate();

  const [line1, setLine1] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, newTotal }
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const finalTotal = appliedCoupon ? appliedCoupon.newTotal : total;

  // Dummy gateway fields
  const [card, setCard] = useState({ cardNumber: '', name: '', expiry: '', cvv: '' });

  // Stripe fields
  const [clientSecret, setClientSecret] = useState(null);
  const [creatingIntent, setCreatingIntent] = useState(false);

  useEffect(() => {
    if (hasRealStripe && finalTotal > 0) {
      setCreatingIntent(true);
      api.post('/payments/create-intent', { amount: finalTotal })
        .then(res => setClientSecret(res.data.clientSecret))
        .catch(err => setError(err.response?.data?.message || 'Could not initialize Stripe'))
        .finally(() => setCreatingIntent(false));
    }
  }, [finalTotal]);

  function updateCard(field, value) {
    setCard(prev => ({ ...prev, [field]: value }));
  }

  function validateAddress() {
    if (!line1.trim()) { setError('Please enter a shipping address line.'); return false; }
    return true;
  }

  async function applyCoupon(e) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponInput.trim(), subtotal: total });
      setAppliedCoupon(res.data);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  async function finalizeOrder(paymentPayload) {
    try {
      const res = await api.post('/orders/create', {
        address: { line1 },
        couponCode: appliedCoupon?.code || null,
        ...paymentPayload
      });
      await refreshCart();
      navigate(`/order-success/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try a different card.');
      setPlacing(false);
    }
  }

  async function handleDummySubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateAddress()) return;
    setPlacing(true);
    await finalizeOrder({ paymentMethod: 'dummy-card', card });
  }

  async function handleStripeSuccess(paymentIntentId) {
    setError('');
    await finalizeOrder({ paymentMethod: 'stripe', paymentIntentId });
  }

  if (items.length === 0) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-muted">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid md:grid-cols-2 gap-8 md:gap-10">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-xl mb-4">Shipping address</h2>
          <input
            className="input"
            placeholder="Street address, apartment, etc."
            value={line1}
            onChange={e => setLine1(e.target.value)}
          />
        </div>

        <div>
          <h2 className="font-display text-xl mb-4">Payment</h2>

          {hasRealStripe ? (
            <>
              <p className="text-xs text-muted mb-4">Secure payment powered by Stripe (test mode).</p>
              {creatingIntent && <p className="text-sm text-muted">Preparing payment form…</p>}
              {clientSecret && stripePromise && (
                <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCardForm
                    clientSecret={clientSecret}
                    submitting={placing}
                    setSubmitting={(v) => { if (v && !validateAddress()) return; setPlacing(v); }}
                    onSuccess={handleStripeSuccess}
                    onError={(msg) => setError(msg)}
                  />
                </Elements>
              )}
            </>
          ) : (
            <form onSubmit={handleDummySubmit} className="space-y-3">
              <p className="text-xs text-muted mb-1">
                This is a simulated payment gateway — no real charge happens. Use any 16-digit number.
                A number ending in <code>0000</code> simulates a declined card.
              </p>
              <input
                className="input"
                placeholder="Card number (16 digits)"
                maxLength={19}
                value={card.cardNumber}
                onChange={e => updateCard('cardNumber', e.target.value)}
              />
              <input
                className="input"
                placeholder="Name on card"
                value={card.name}
                onChange={e => updateCard('name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="MM/YY" value={card.expiry} onChange={e => updateCard('expiry', e.target.value)} />
                <input className="input" placeholder="CVV" value={card.cvv} onChange={e => updateCard('cvv', e.target.value)} />
              </div>
              <button type="submit" disabled={placing} className="btn-primary w-full">
                {placing ? 'Processing payment…' : `Pay Rs. ${finalTotal.toFixed(2)} & place order`}
              </button>
            </form>
          )}

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
      </div>

      <div className="card p-5 sm:p-6 h-fit">
        <h2 className="font-display text-xl mb-4">Order summary</h2>
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>{item.name} × {item.qty}</span>
              <span>Rs. {(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="border-t border-line pt-4 mb-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-forest-light rounded px-3 py-2">
              <span className="text-sm text-forest-dark font-medium">
                {appliedCoupon.code} applied — -Rs. {appliedCoupon.discount.toFixed(2)}
              </span>
              <button onClick={removeCoupon} className="text-xs text-forest-dark underline">Remove</button>
            </div>
          ) : (
            <form onSubmit={applyCoupon} className="flex gap-2">
              <input
                className="input"
                placeholder="Coupon code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
              />
              <button type="submit" disabled={applyingCoupon} className="btn-secondary text-sm whitespace-nowrap">
                {applyingCoupon ? 'Checking…' : 'Apply'}
              </button>
            </form>
          )}
          {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
          {!appliedCoupon && (
            <p className="text-xs text-muted mt-2">Try WELCOME10, SAVE20, or FLAT15</p>
          )}
        </div>

        <div className="space-y-1">
          {appliedCoupon && (
            <>
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-forest">
                <span>Discount</span>
                <span>-Rs. {appliedCoupon.discount.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-display text-lg pt-2">
            <span>Total</span>
            <span>Rs. {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
