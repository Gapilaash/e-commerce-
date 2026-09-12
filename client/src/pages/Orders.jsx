import { useEffect, useState } from 'react';
import api from '../services/api';
import TrackingTimeline from '../components/TrackingTimeline';
import { downloadInvoice } from '../utils/invoice';

const RETURN_WINDOW_DAYS = 7;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnFormFor, setReturnFormFor] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get('/orders').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const intervalId = setInterval(load, 15000); // reflect simulated shipping progress live
    return () => clearInterval(intervalId);
  }, []);

  function canReturn(order) {
    if (order.paymentStatus !== 'success' || order.returnStatus) return false;
    const daysSince = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= RETURN_WINDOW_DAYS;
  }

  async function submitReturn(orderId) {
    if (!reason.trim()) { setError('Please describe the reason for your return.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/orders/${orderId}/return`, { reason });
      setReturnFormFor(null);
      setReason('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit return request');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-10 text-muted">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="font-display text-3xl mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'success' ? 'bg-forest-light text-forest-dark' : 'bg-red-950 text-red-400'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {order.tracking && !order.returnStatus && (
                <TrackingTimeline tracking={order.tracking} />
              )}

              {order.items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm py-0.5">
                  <span>{item.name} × {item.qty}</span>
                  <span>Rs. {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-line mt-3 pt-3 space-y-1">
                {order.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-muted">
                      <span>Subtotal</span>
                      <span>Rs. {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-forest">
                      <span>Discount ({order.couponCode})</span>
                      <span>-Rs. {order.discountAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>Rs. {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {order.returnStatus && (
                <p className="text-xs text-forest mt-3">Return {order.returnStatus} for this order.</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {order.paymentStatus === 'success' && (
                  <button onClick={() => downloadInvoice(order)} className="text-sm text-forest underline flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v13m0 0l-4-4m4 4l4-4M4 21h16" />
                    </svg>
                    Download invoice
                  </button>
                )}

                {canReturn(order) && returnFormFor !== order.id && (
                  <button
                    onClick={() => { setReturnFormFor(order.id); setReason(''); setError(''); }}
                    className="text-sm text-forest underline"
                  >
                    Request a return
                  </button>
                )}
              </div>

              {canReturn(order) && returnFormFor === order.id && (
                <div className="space-y-2 mt-3">
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Why are you returning this order?"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => submitReturn(order.id)} disabled={submitting} className="btn-primary py-1.5 px-3 text-sm">
                      {submitting ? 'Submitting…' : 'Submit return request'}
                    </button>
                    <button onClick={() => { setReturnFormFor(null); setError(''); }} className="btn-secondary py-1.5 px-3 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
