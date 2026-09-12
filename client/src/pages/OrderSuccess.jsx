import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TrackingTimeline from '../components/TrackingTimeline';
import { downloadInvoice } from '../utils/invoice';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let intervalId;

    function fetchOrder() {
      api.get(`/orders/${id}`).then(res => {
        setOrder(res.data);
        // Stop polling once the simulated delivery is complete
        if (res.data.status === 'delivered' && intervalId) {
          clearInterval(intervalId);
        }
      });
    }

    fetchOrder();
    intervalId = setInterval(fetchOrder, 15000); // refresh every 15s to reflect simulated shipping progress
    return () => clearInterval(intervalId);
  }, [id]);

  if (!order) return <div className="max-w-2xl mx-auto px-6 py-16 text-muted">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-forest-light text-forest flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
      <h1 className="font-display text-3xl mb-3">Order placed</h1>
      <p className="text-muted mb-8">
        Confirmation #{order.id} · Transaction {order.transactionId}
      </p>

      {order.tracking && (
        <div className="card p-6 text-left mb-6">
          <p className="text-xs text-muted mb-1">Delivery status</p>
          <TrackingTimeline tracking={order.tracking} />
        </div>
      )}

      <div className="card p-6 text-left mb-8">
        {order.items.map(item => (
          <div key={item.productId} className="flex justify-between text-sm py-1">
            <span>{item.name} × {item.qty}</span>
            <span>Rs. {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}

        {order.discountAmount > 0 && (
          <>
            <div className="flex justify-between text-sm text-muted pt-2">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-forest">
              <span>Discount ({order.couponCode})</span>
              <span>-Rs. {order.discountAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="border-t border-line mt-3 pt-3 flex justify-between font-medium">
          <span>Total paid</span>
          <span>Rs. {order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => downloadInvoice(order)} className="btn-secondary">
          Download invoice
        </button>
        <Link to="/products" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
