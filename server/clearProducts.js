// Deletes ALL products from the database. Does NOT touch orders, cart,
// wishlist, reviews, or coupons — only the `products` collection.
//
// WARNING: If any existing Orders/Cart/Wishlist entries reference these
// product ids, those references will become dangling ("Product not found")
// after this runs. Fine for test/sample data, riskier with real orders.
//
// HOW TO USE:
// Run from inside the /server folder:  node clearProducts.js

require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

async function clearProducts() {
  await connectDB();

  const { deletedCount } = await Product.deleteMany({});
  console.log(`Deleted ${deletedCount} product(s). The products collection is now empty.`);
  console.log('You can now run `node addProduct.js` to add your own products.');

  process.exit(0);
}

clearProducts().catch(err => {
  console.error('Failed to clear products:', err.message);
  process.exit(1);
});
