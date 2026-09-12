import { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Branded to match Meridian's forest/gold theme + Inter body font, and
// split into separate fields (a more "real checkout" look/feel than the
// single combined CardElement box).
const elementStyle = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1C1B19',
      fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.02em',
      '::placeholder': { color: '#9B968A' }
    },
    invalid: { color: '#dc2626', iconColor: '#dc2626' }
  }
};

function FieldWrap({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-muted mb-1 block">{label}</span>
      <div className="border border-line rounded px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-forest/30 focus-within:border-forest transition">
        {children}
      </div>
    </label>
  );
}

// Renders inside a Stripe <Elements> wrapper (see Checkout.jsx). Confirms
// the given PaymentIntent client secret using the card details entered here.
export default function StripeCardForm({ clientSecret, onSuccess, onError, submitting, setSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [cardError, setCardError] = useState('');

  async function handleConfirm() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: { name: cardholderName || undefined }
      }
    });

    if (error) {
      setCardError(error.message);
      onError(error.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setCardError(`Payment status: ${paymentIntent.status}`);
      onError(`Payment status: ${paymentIntent.status}`);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs text-muted mb-1 block">Cardholder name</span>
        <input
          className="input"
          placeholder="Name on card"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
        />
      </label>

      <FieldWrap label="Card number">
        <CardNumberElement options={elementStyle} />
      </FieldWrap>

      <div className="grid grid-cols-2 gap-3">
        <FieldWrap label="Expiry">
          <CardExpiryElement options={elementStyle} />
        </FieldWrap>
        <FieldWrap label="CVC">
          <CardCvcElement options={elementStyle} />
        </FieldWrap>
      </div>

      {cardError && <p className="text-sm text-red-600">{cardError}</p>}

      <button type="button" onClick={handleConfirm} disabled={!stripe || submitting} className="btn-primary w-full mt-2">
        {submitting ? 'Processing payment…' : 'Pay & place order'}
      </button>

      <p className="text-xs text-muted flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Secured by Stripe · Test card: 4242 4242 4242 4242, any future expiry, any CVC
      </p>
    </div>
  );
}
