require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const defaultProducts = [
  // Tartlets
  {
    name: 'Wild Berry Vanilla Tartlet',
    category: 'tartlet',
    price: 6.75,
    description: 'Madagascar vanilla bean diplomat cream topped with fresh blackberries, raspberries, and wild blueberries on a crisp French butter crust.',
    ingredients: ['Madagascar Vanilla Bean', 'French Butter Crust', 'Fresh Blackberries', 'Wild Blueberries', 'Raspberries', 'Diplomat Cream'],
    image: '/images/products/tartlet-berry.png',
    badge: 'Fresh Harvest',
    isAvailable: true,
    displayOnHome: true,
    order: 1,
  },
  {
    name: 'Lemon Meringue Tartlet',
    category: 'tartlet',
    price: 6.50,
    description: 'Crisp buttery pâte sablée filled with zesty Meyer lemon curd and crowned with a torched Swiss meringue swirl.',
    ingredients: ['Meyer Lemon Curd', 'Swiss Meringue', 'French Sablée Pastry', 'AOP Butter', 'Organic Eggs', 'Cane Sugar'],
    image: '/images/products/tartlet-lemon-meringue.png',
    badge: "Chef's Signature",
    isAvailable: true,
    displayOnHome: true,
    order: 2,
  },
  {
    name: 'Strawberry Pistachio Mousse Tart',
    category: 'tartlet',
    price: 7.25,
    description: 'Hand-sliced ripe strawberries enveloped around whipped pistachio ganache with roasted crushed nuts.',
    ingredients: ['Fresh Strawberries', 'Bronte Pistachio Paste', 'White Chocolate Ganache', 'Almond Tart Shell'],
    image: '/images/products/tartlet-strawberry-pistachio.png',
    badge: 'Limited Batch',
    isAvailable: true,
    displayOnHome: true,
    order: 3,
  },
  {
    name: 'Pistachio Praline Tartlet',
    category: 'tartlet',
    price: 7.00,
    description: 'Velvety Sicilian pistachio cream, roasted crushed pistachios, and salted honey caramel glaze.',
    ingredients: ['Sicilian Pistachio Cream', 'Crushed Roasted Pistachios', 'Honey Caramel Glaze', 'Shortbread Crust'],
    image: '/images/products/tartlet-pistachio.png',
    badge: 'Popular',
    isAvailable: true,
    displayOnHome: true,
    order: 4,
  },
  {
    name: 'Hazelnut Praliné Chantilly Tart',
    category: 'tartlet',
    price: 7.00,
    description: 'Gianduja chocolate mousse layered with roasted Piedmont hazelnuts and rich hazelnut piped chantilly.',
    ingredients: ['Gianduja Mousse', 'Piedmont Hazelnuts', 'Hazelnut Chantilly', 'Cocoa Tart Shell'],
    image: '/images/products/tartlet-hazelnut.png',
    isAvailable: true,
    displayOnHome: true,
    order: 5,
  },

  // Cookies
  {
    name: 'Matcha White Chocolate Cookie',
    category: 'cookies',
    price: 4.75,
    description: 'Ceremonial grade Uji matcha infused dough studded with chunky Belgian white chocolate callets.',
    ingredients: ['Ceremonial Uji Matcha', 'Belgian White Chocolate', 'Cultured Butter', 'Brown Sugar', 'Sea Salt'],
    image: '/images/products/cookie-matcha.png',
    badge: 'Bestseller',
    isAvailable: true,
    displayOnHome: true,
    order: 6,
  },
  {
    name: 'Red Velvet Cream Cheese Cookie',
    category: 'cookies',
    price: 4.95,
    description: 'Decadent cocoa crinkle cookie stuffed with a molten center of tangy sweet cream cheese filling.',
    ingredients: ['Dutch Cocoa', 'Philadelphia Cream Cheese Core', 'Vanilla Extract', 'Crinkle Crust'],
    image: '/images/products/cookie-red-velvet.png',
    badge: 'Molten Core',
    isAvailable: true,
    displayOnHome: true,
    order: 7,
  },
  {
    name: 'Classic Sea Salt Choc Chip',
    category: 'cookies',
    price: 4.50,
    description: 'Brown butter dough aged for 36 hours, loaded with 64% Guittard dark chocolate and flaky Maldon salt.',
    ingredients: ['36h Aged Brown Butter Dough', 'Guittard 64% Dark Chocolate', 'Maldon Sea Salt Flakes'],
    image: '/images/products/cookie-classic-choc.png',
    isAvailable: true,
    displayOnHome: true,
    order: 8,
  },
  {
    name: 'Chunky Golden Chocolate Cookie',
    category: 'cookies',
    price: 4.50,
    description: 'Golden-crisp edges with a chewy soft center packed with generous semisweet chocolate droplets.',
    ingredients: ['Semisweet Chocolate Chips', 'Golden Molasses Sugar', 'Creamery Butter', 'Organic Flour'],
    image: '/images/products/cookie-chunky-choc.png',
    isAvailable: true,
    displayOnHome: true,
    order: 9,
  },
  {
    name: 'Double Fudge Crumbl Cookie',
    category: 'cookies',
    price: 5.25,
    description: 'Dark Dutch cocoa dough loaded with Hershey milk chocolate morsels and melted fudge pools.',
    ingredients: ['Extra Dark Dutch Cocoa', 'Milk Chocolate Morsels', 'Dark Fudge Swirl', 'Pure Butter'],
    image: '/images/products/cookie-double-choc.png',
    badge: 'Chocoholic',
    isAvailable: true,
    displayOnHome: true,
    order: 10,
  },

  // Pies & Pastries
  {
    name: 'Wild Blueberry Lattice Pie',
    category: 'beignet',
    price: 8.50,
    description: 'Hand-woven lattice crust brimming with sweet-tart mountain blueberries and fresh lemon zest.',
    ingredients: ['Wild Mountain Blueberries', 'Hand-woven Butter Lattice', 'Lemon Zest', 'Raw Demerara Sugar'],
    image: '/images/products/pie-blueberry.png',
    badge: 'Artisanal Crust',
    isAvailable: true,
    displayOnHome: true,
    order: 11,
  },
  {
    name: 'Golden Apple Cinnamon Lattice Pie',
    category: 'beignet',
    price: 8.25,
    description: 'Caramelized Honeycrisp apples infused with Saigon cinnamon and Bourbon vanilla in a golden flaky lattice.',
    ingredients: ['Honeycrisp Apples', 'Saigon Cinnamon', 'Bourbon Vanilla Bean', 'Flaky All-Butter Pastry'],
    image: '/images/products/pie-apple-lattice.png',
    isAvailable: true,
    displayOnHome: true,
    order: 12,
  },
  {
    name: 'Glazed Sour Cherry Pie',
    category: 'beignet',
    price: 8.50,
    description: 'Whole tart cherries glazed in reduced natural nectar with crimped butter pastry edge.',
    ingredients: ['Tart Montmorency Cherries', 'Kirsch Nectar Reduction', 'Crimped Fluted Butter Crust'],
    image: '/images/products/tartlet-cherry.png',
    isAvailable: true,
    displayOnHome: true,
    order: 13,
  },
  {
    name: 'Heritage Blackberry Lattice Tart',
    category: 'beignet',
    price: 8.00,
    description: 'Traditional lattice pastry filled with reduced wild blackberries and hint of star anise.',
    ingredients: ['Wild Harvest Blackberries', 'Star Anise Infusion', 'Traditional Lattice Weave'],
    image: '/images/products/pie-dark-lattice.png',
    isAvailable: true,
    displayOnHome: true,
    order: 14,
  },
];

const seedAdminAndProducts = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@samy.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const name = process.env.ADMIN_NAME || 'SAMY Executive Admin';

  console.log('\n--- [SEED SCRIPT] Starting Admin & Products Setup ---');

  // 1. Check & Create Admin User
  let admin = await User.findOne({ email: email.toLowerCase() });
  if (admin) {
    console.log(`[SEED] Admin account already exists: ${admin.email}`);
    // Update password if needed
    admin.password = password;
    admin.role = 'admin';
    admin.name = name;
    await admin.save();
    console.log(`[SEED] Admin credentials verified & updated.`);
  } else {
    admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
    });
    console.log(`[SEED] Created new Admin user successfully:`);
    console.log(`       Email:    ${admin.email}`);
    console.log(`       Password: ${password}`);
    console.log(`       Role:     ${admin.role}`);
  }

  // 2. Check & Seed Products
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('[SEED] Products collection is empty. Seeding initial artisanal confections...');
    await Product.insertMany(defaultProducts);
    console.log(`[SEED] Seeded ${defaultProducts.length} initial products successfully!`);
  } else {
    console.log(`[SEED] Products already exist in database (${count} products). Skipping product overwrite.`);
  }

  console.log('--- [SEED SCRIPT] Completed Successfully ---\n');
};

// Allow direct CLI execution
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedAdminAndProducts();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[SEED] Error running seed script:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedAdminAndProducts };
