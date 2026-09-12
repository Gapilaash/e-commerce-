// Manually add one or more products WITHOUT touching existing data.
// (Unlike seed.js, this does NOT delete anything first.)
//
// HOW TO USE:
// 1. Edit the `newProducts` array below with your product details.
// 2. Run:  node addProduct.js   (from inside the /server folder)
// 3. Check the console output — it prints the id of every product created.

require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const newProducts = [
  {
    name: 'Example Product Name',
    description: 'A short description of the product.',
    price: 29.99,
    category: 'Electronics', // must match an existing category to show up in filters, or a new one is fine too
    image: 'https://loremflickr.com/400/400/gadget', // any image URL, or a path like /images/products/your-file.svg
    stock: 50
    // rating and numReviews default to 0 — they fill in automatically once reviews come in
  }

  // Add more products here, comma-separated:
  // {
  //   name: 'Another Product',
  //   description: '...',
  //   price: 19.99,
  //   category: 'Home',
  //   image: 'https://loremflickr.com/400/400/lamp',
  //   stock: 30
  // }
];

async function addProducts() {
  await connectDB();

  const created = await Product.insertMany(newProducts);
  console.log(`Added ${created.length} product(s):`);
  created.forEach(p => console.log(`  - ${p.name}  (id: ${p._id})`));

  process.exit(0);
}

addProducts().catch(err => {
  console.error('Failed to add products:', err.message);
  process.exit(1);
});
