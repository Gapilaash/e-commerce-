require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

// These match the codes hinted on the Checkout page ("Try WELCOME10, SAVE20, or FLAT15")
const sampleCoupons = [
  { code: 'WELCOME10', discountPercent: 10, minSubtotal: 0, active: true },
  { code: 'SAVE20', discountPercent: 20, minSubtotal: 100, active: true },
  { code: 'FLAT15', discountPercent: 15, minSubtotal: 50, active: true }
];

const sampleProducts = [
  // Electronics
  { name: 'Wireless Headphones', description: 'Over-ear noise-cancelling headphones.', price: 79.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/headphones', stock: 50 },
  { name: 'Smart Watch', description: 'Fitness tracking smart watch.', price: 129.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/smartwatch', stock: 40 },
  { name: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker.', price: 45.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/speaker', stock: 60 },
  { name: 'Wireless Earbuds', description: 'True wireless earbuds with charging case.', price: 59.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/earbuds', stock: 75 },
  { name: 'Power Bank 20000mAh', description: 'Fast-charging portable power bank.', price: 32.5, category: 'Electronics', image: 'https://loremflickr.com/400/400/powerbank', stock: 90 },
  { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and card reader.', price: 27.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/usbhub', stock: 55 },
  { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard.', price: 69.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/keyboard', stock: 40 },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with silent clicks.', price: 24.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/computermouse', stock: 85 },
  { name: 'Webcam 1080p', description: 'Full HD webcam with autofocus.', price: 42.0, category: 'Electronics', image: 'https://loremflickr.com/400/400/webcam', stock: 50 },
  { name: 'Portable SSD 1TB', description: 'Compact external SSD with USB-C.', price: 89.99, category: 'Electronics', image: 'https://loremflickr.com/400/400/harddrive', stock: 35 },

  // Home
  { name: 'Ceramic Coffee Mug', description: 'Hand-glazed 12oz ceramic mug.', price: 14.5, category: 'Home', image: 'https://loremflickr.com/400/400/coffeemug', stock: 100 },
  { name: 'Linen Throw Pillow', description: 'Soft linen-blend throw pillow.', price: 22.0, category: 'Home', image: 'https://loremflickr.com/400/400/throwpillow', stock: 60 },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness.', price: 39.99, category: 'Home', image: 'https://loremflickr.com/400/400/desklamp', stock: 45 },
  { name: 'Scented Candle Set', description: 'Set of 3 soy wax scented candles.', price: 26.5, category: 'Home', image: 'https://loremflickr.com/400/400/candle', stock: 70 },
  { name: 'Cotton Bedsheet Set', description: '4-piece 100% cotton bedsheet set.', price: 48.0, category: 'Home', image: 'https://loremflickr.com/400/400/bedsheet', stock: 50 },
  { name: 'Non-Stick Cookware Set', description: '5-piece non-stick cookware set.', price: 89.99, category: 'Home', image: 'https://loremflickr.com/400/400/cookware', stock: 30 },
  { name: 'Glass Storage Jars', description: 'Set of 4 airtight glass jars.', price: 18.99, category: 'Home', image: 'https://loremflickr.com/400/400/masonjar', stock: 80 },
  { name: 'Wall Clock', description: 'Minimalist wooden wall clock.', price: 32.0, category: 'Home', image: 'https://loremflickr.com/400/400/wallclock', stock: 40 },
  { name: 'Bath Towel Set', description: 'Soft cotton bath towel set of 4.', price: 29.99, category: 'Home', image: 'https://loremflickr.com/400/400/towel', stock: 65 },
  { name: 'Indoor Plant Pot Set', description: 'Ceramic plant pots, set of 3.', price: 24.0, category: 'Home', image: 'https://loremflickr.com/400/400/plantpot', stock: 55 },

  // Footwear
  { name: 'Running Shoes', description: 'Lightweight breathable running shoes.', price: 64.99, category: 'Footwear', image: 'https://loremflickr.com/400/400/runningshoes', stock: 70 },
  { name: 'Canvas Sneakers', description: 'Classic low-top canvas sneakers.', price: 39.99, category: 'Footwear', image: 'https://loremflickr.com/400/400/sneakers', stock: 60 },
  { name: 'Leather Formal Shoes', description: 'Genuine leather lace-up formal shoes.', price: 74.99, category: 'Footwear', image: 'https://loremflickr.com/400/400/dressshoes', stock: 35 },
  { name: 'Flip Flops', description: 'Comfortable rubber flip flops.', price: 12.99, category: 'Footwear', image: 'https://loremflickr.com/400/400/flipflops', stock: 100 },
  { name: 'Hiking Boots', description: 'Waterproof ankle-support hiking boots.', price: 89.99, category: 'Footwear', image: 'https://loremflickr.com/400/400/hikingboots', stock: 30 },

  // Accessories
  { name: 'Leather Wallet', description: 'Slim genuine leather bifold wallet.', price: 34.0, category: 'Accessories', image: 'https://loremflickr.com/400/400/leatherwallet', stock: 80 },
  { name: 'Backpack', description: '20L water-resistant daypack.', price: 54.0, category: 'Accessories', image: 'https://loremflickr.com/400/400/backpack', stock: 65 },
  { name: 'Aviator Sunglasses', description: 'UV-protection polarized sunglasses.', price: 29.99, category: 'Accessories', image: 'https://loremflickr.com/400/400/sunglasses', stock: 75 },
  { name: 'Leather Belt', description: 'Reversible genuine leather belt.', price: 22.5, category: 'Accessories', image: 'https://loremflickr.com/400/400/leatherbelt', stock: 90 },
  { name: 'Analog Wrist Watch', description: 'Classic stainless steel wrist watch.', price: 59.99, category: 'Accessories', image: 'https://loremflickr.com/400/400/wristwatch', stock: 40 },
  { name: 'Baseball Cap', description: 'Adjustable cotton baseball cap.', price: 16.99, category: 'Accessories', image: 'https://loremflickr.com/400/400/baseballcap', stock: 100 },
  { name: 'Tote Bag', description: 'Canvas tote bag with inner pocket.', price: 19.99, category: 'Accessories', image: 'https://loremflickr.com/400/400/totebag', stock: 70 },
  { name: 'Phone Case', description: 'Shockproof clear phone case.', price: 11.99, category: 'Accessories', image: 'https://loremflickr.com/400/400/phonecase', stock: 120 },

  // Outdoor
  { name: 'Stainless Water Bottle', description: 'Insulated 750ml water bottle.', price: 19.99, category: 'Outdoor', image: 'https://loremflickr.com/400/400/waterbottle', stock: 90 },
  { name: 'Camping Tent 2-Person', description: 'Lightweight waterproof camping tent.', price: 79.99, category: 'Outdoor', image: 'https://loremflickr.com/400/400/campingtent', stock: 25 },
  { name: 'Sleeping Bag', description: 'Compact 3-season sleeping bag.', price: 49.99, category: 'Outdoor', image: 'https://loremflickr.com/400/400/sleepingbag', stock: 35 },
  { name: 'Folding Camping Chair', description: 'Portable lightweight camping chair.', price: 27.99, category: 'Outdoor', image: 'https://loremflickr.com/400/400/campingchair', stock: 45 },
  { name: 'LED Headlamp', description: 'Rechargeable LED headlamp for hiking.', price: 17.99, category: 'Outdoor', image: 'https://loremflickr.com/400/400/headlamp', stock: 60 },
  { name: 'Picnic Blanket', description: 'Waterproof foldable picnic blanket.', price: 21.5, category: 'Outdoor', image: 'https://loremflickr.com/400/400/picnicblanket', stock: 50 },

  // Fitness
  { name: 'Yoga Mat', description: 'Non-slip 6mm eco yoga mat.', price: 28.0, category: 'Fitness', image: 'https://loremflickr.com/400/400/yogamat', stock: 55 },
  { name: 'Adjustable Dumbbell Set', description: 'Pair of adjustable dumbbells 2-20kg.', price: 99.99, category: 'Fitness', image: 'https://loremflickr.com/400/400/dumbbell', stock: 20 },
  { name: 'Resistance Bands Set', description: 'Set of 5 resistance bands.', price: 15.99, category: 'Fitness', image: 'https://loremflickr.com/400/400/resistanceband', stock: 80 },
  { name: 'Foam Roller', description: 'High-density muscle foam roller.', price: 23.99, category: 'Fitness', image: 'https://loremflickr.com/400/400/foamroller', stock: 45 },
  { name: 'Jump Rope', description: 'Adjustable speed jump rope.', price: 9.99, category: 'Fitness', image: 'https://loremflickr.com/400/400/jumprope', stock: 100 },
  { name: 'Gym Gloves', description: 'Padded weightlifting gym gloves.', price: 14.5, category: 'Fitness', image: 'https://loremflickr.com/400/400/gymgloves', stock: 70 },

  // Kitchen
  { name: 'Electric Kettle', description: '1.7L stainless steel electric kettle.', price: 34.99, category: 'Kitchen', image: 'https://loremflickr.com/400/400/electrickettle', stock: 40 },
  { name: 'Blender', description: 'High-speed countertop blender.', price: 49.99, category: 'Kitchen', image: 'https://loremflickr.com/400/400/blender', stock: 30 },
  { name: 'Knife Set', description: '6-piece stainless steel knife set.', price: 44.99, category: 'Kitchen', image: 'https://loremflickr.com/400/400/kitchenknife', stock: 35 },
  { name: 'Cutting Board Set', description: 'Bamboo cutting boards, set of 3.', price: 24.99, category: 'Kitchen', image: 'https://loremflickr.com/400/400/cuttingboard', stock: 60 },
  { name: 'French Press', description: 'Glass and steel French press coffee maker.', price: 27.5, category: 'Kitchen', image: 'https://loremflickr.com/400/400/frenchpress', stock: 45 }
];

async function seed() {
  await connectDB();

  // Remove any stale/leftover indexes (e.g. an old unique "id_1" index from
  // an earlier schema version) that don't match the current Product schema.
  // Without this, insertMany() can fail midway with a duplicate-key error
  // and only the first product ends up in the collection.
  const existingIndexes = await Product.collection.indexes();
  for (const idx of existingIndexes) {
    const isDefault = idx.name === '_id_';
    const isCurrentSchemaIndex = idx.name === 'category_1'; // matches Product.js
    if (!isDefault && !isCurrentSchemaIndex) {
      console.log(`Dropping stale index: ${idx.name}`);
      await Product.collection.dropIndex(idx.name).catch(() => {});
    }
  }

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products.`);

  // Same stale-index cleanup as above, but for the coupons collection —
  // an old unique "id_1" index here causes every coupon to collide on
  // id: null and only the first one gets inserted.
  const existingCouponIndexes = await Coupon.collection.indexes();
  for (const idx of existingCouponIndexes) {
    const isDefault = idx.name === '_id_';
    const isCurrentSchemaIndex = idx.name === 'code_1'; // matches Coupon.js
    if (!isDefault && !isCurrentSchemaIndex) {
      console.log(`Dropping stale index: ${idx.name}`);
      await Coupon.collection.dropIndex(idx.name).catch(() => {});
    }
  }

  await Coupon.deleteMany({});
  await Coupon.insertMany(sampleCoupons);
  console.log(`Seeded ${sampleCoupons.length} coupons: ${sampleCoupons.map(c => c.code).join(', ')}`);

  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
