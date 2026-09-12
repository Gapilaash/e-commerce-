const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true }
  },
  { _id: false }
);

const trackingStageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    completed: { type: Boolean, default: false },
    current: { type: Boolean, default: false }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: [orderItemSchema],
    address: {
      line1: { type: String, required: true }
    },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['dummy-card', 'stripe'], required: true },
    paymentStatus: { type: String, enum: ['success', 'failed'], default: 'success' },
    status: { type: String, default: 'processing' },
    tracking: [trackingStageSchema],
    returnStatus: { type: String, enum: [null, 'requested', 'approved', 'rejected'], default: null },
    returnReason: { type: String, default: null }
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);
