// Bulk-adds all products from bulkProductsData.json into the database.
// Does NOT delete any existing products first.
//
// HOW TO USE:
// Run from inside the /server folder:  node addBulkProducts.js
//
// NOTE ON IMAGES:
// Each product's "image" field points to a path like:
//   /images/products/TV/LG 123 cm (49 inch) ... .webp
// For these pictures to actually show up in the app, copy your image files
// (the ones currently on your Desktop under the "assest/products" folder)
// into:
//   client/public/images/products/<category-folder>/
// keeping the exact same file names, so the path above resolves correctly.
// Category folders used: TV, airpodes, camera, earphones, mobile, mouse,
// printers, processor, refrigerator, speakers, trimmers, watches.

require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');
const products = require('./bulkProductsData.json');

async function addBulkProducts() {
  await connectDB();

  const created = await Product.insertMany(products);
  console.log(`Added ${created.length} product(s).`);

  process.exit(0);
}

addBulkProducts().catch(err => {
  console.error('Failed to add products:', err.message);
  process.exit(1);
});
