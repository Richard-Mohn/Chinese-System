/**
 * Seed Coffee Shop Demo — run with: node scripts/seedCoffeeDemo.js
 *
 * Creates a fully-configured demo coffee shop in Firestore with:
 *  - Business document (website config, settings, brand, loyalty)
 *  - 50+ menu items (espresso, cold brew, tea, pastries, food)
 *  - Demo user accounts (owner, barista, server, driver, customer)
 *  - Demo orders (recent activity)
 *  - KDS stations (Espresso Bar, Food Prep, Pickup/Expo)
 *
 *  Ready to test at:
 *    https://mohnmenu.com/griffin-lounge        (tenant website)
 *    https://mohnmenu.com/order/griffin-lounge   (order page)
 *    https://mohnmenu.com/griffin-lounge/kiosk   (kiosk mode)
 */

const admin = require('firebase-admin');
const path = require('path');

// ── Init Firebase Admin ──
const serviceAccount = require(path.resolve(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chinese-system-default-rtdb.firebaseio.com',
  });
}

const db = admin.firestore();
const auth = admin.auth();

const BUSINESS_ID = 'demo-griffin-lounge';
const BUSINESS_SLUG = 'griffin-lounge';

// ═══════════════════════════════════════════
// ── COFFEE SHOP MENU DATA ─────────────────
// ═══════════════════════════════════════════

const MENU_ITEMS = [
  // ── Espresso Drinks ──
  { id: 'latte', category: 'Espresso Drinks', name: 'Caffè Latte', description: 'Double shot espresso, steamed milk, light foam. Choose your milk: whole, oat, almond, or coconut.', price: 5.50, image_url: '', popular: true },
  { id: 'cappuccino', category: 'Espresso Drinks', name: 'Cappuccino', description: 'Double shot espresso, equal parts steamed milk and thick foam. Classic Italian style.', price: 5.50, image_url: '', popular: true },
  { id: 'americano', category: 'Espresso Drinks', name: 'Americano', description: 'Double shot espresso with hot water. Bold and smooth. Iced available.', price: 4.50, image_url: '' },
  { id: 'mocha', category: 'Espresso Drinks', name: 'Caffè Mocha', description: 'Double espresso, house chocolate, steamed milk, whipped cream. Rich and indulgent.', price: 6.00, image_url: '', popular: true },
  { id: 'macchiato', category: 'Espresso Drinks', name: 'Caramel Macchiato', description: 'Vanilla syrup, steamed milk, espresso, caramel drizzle. Sweet and balanced.', price: 6.00, image_url: '' },
  { id: 'flat-white', category: 'Espresso Drinks', name: 'Flat White', description: 'Double ristretto shots, velvety steamed milk. Australian-style, smaller and stronger.', price: 5.50, image_url: '' },
  { id: 'cortado', category: 'Espresso Drinks', name: 'Cortado', description: 'Equal parts espresso and warm milk. No foam, no fuss. 4oz.', price: 4.50, image_url: '' },
  { id: 'espresso-shot', category: 'Espresso Drinks', name: 'Espresso', description: 'Single or double shot. Our house blend is a medium-dark roast from Colombia and Ethiopia.', price: 3.00, image_url: '', prices: { single: 3.00, double: 4.00 } },
  { id: 'dirty-chai', category: 'Espresso Drinks', name: 'Dirty Chai Latte', description: 'Spiced chai concentrate with a shot of espresso and steamed milk. Sweet and spicy.', price: 6.00, image_url: '' },
  { id: 'lavender-latte', category: 'Espresso Drinks', name: 'Lavender Latte', description: 'House-made lavender syrup, double espresso, oat milk. Floral and smooth.', price: 6.50, image_url: '', popular: true },

  // ── Cold Brew & Iced ──
  { id: 'cold-brew', category: 'Cold Brew & Iced', name: 'Classic Cold Brew', description: '20-hour slow-steeped cold brew. Smooth, low acidity, naturally sweet.', price: 5.00, image_url: '', popular: true },
  { id: 'nitro-cold-brew', category: 'Cold Brew & Iced', name: 'Nitro Cold Brew', description: 'Cold brew infused with nitrogen for a creamy, Guinness-like texture. No cream needed.', price: 6.00, image_url: '', popular: true },
  { id: 'vanilla-sweet-cream', category: 'Cold Brew & Iced', name: 'Vanilla Sweet Cream Cold Brew', description: 'Cold brew topped with house-made vanilla sweet cream. Smooth and indulgent.', price: 6.00, image_url: '' },
  { id: 'iced-latte', category: 'Cold Brew & Iced', name: 'Iced Latte', description: 'Double espresso over ice, your choice of milk. Simple and refreshing.', price: 5.50, image_url: '' },
  { id: 'iced-mocha', category: 'Cold Brew & Iced', name: 'Iced Mocha', description: 'Double espresso, house chocolate, milk, over ice. Whipped cream on top.', price: 6.00, image_url: '' },
  { id: 'brown-sugar-shaken', category: 'Cold Brew & Iced', name: 'Brown Sugar Oatmilk Shaken Espresso', description: 'Espresso shaken with brown sugar syrup and oat milk over ice. TikTok famous.', price: 6.50, image_url: '', popular: true },
  { id: 'affogato', category: 'Cold Brew & Iced', name: 'Affogato', description: 'Double espresso poured over a scoop of vanilla gelato. Dessert meets coffee.', price: 7.00, image_url: '' },

  // ── Drip Coffee ──
  { id: 'drip-coffee', category: 'Drip Coffee', name: 'House Drip Coffee', description: 'Fresh-brewed Colombian medium roast. Free refills all day.', price: 3.00, image_url: '' },
  { id: 'pour-over', category: 'Drip Coffee', name: 'Single-Origin Pour Over', description: 'Hand-poured Hario V60. Rotating single-origin — ask your barista for today\'s selection.', price: 5.50, image_url: '' },
  { id: 'french-press', category: 'Drip Coffee', name: 'French Press (2 cups)', description: 'Full-immersion brew. Rich and bold. Great for sharing.', price: 6.00, image_url: '' },

  // ── Tea ──
  { id: 'matcha-latte', category: 'Tea', name: 'Matcha Latte', description: 'Ceremonial-grade Japanese matcha, steamed milk of your choice. Hot or iced.', price: 6.00, image_url: '', popular: true },
  { id: 'chai-latte', category: 'Tea', name: 'Chai Latte', description: 'House-spiced chai concentrate, steamed milk. Cinnamon, cardamom, ginger, clove.', price: 5.50, image_url: '' },
  { id: 'london-fog', category: 'Tea', name: 'London Fog', description: 'Earl Grey tea, vanilla syrup, steamed milk, lavender. Warm and floral.', price: 5.50, image_url: '' },
  { id: 'hot-tea', category: 'Tea', name: 'Hot Tea', description: 'Choose: English Breakfast, Earl Grey, Green, Chamomile, Peppermint, or Jasmine.', price: 3.50, image_url: '' },
  { id: 'iced-tea', category: 'Tea', name: 'Iced Tea', description: 'Fresh-brewed black or green tea over ice. Sweetened or unsweetened.', price: 3.50, image_url: '' },

  // ── Blended & Specialty ──
  { id: 'mocha-frappe', category: 'Blended & Specialty', name: 'Mocha Frappé', description: 'Espresso, chocolate, milk, ice — blended thick. Whipped cream, chocolate drizzle.', price: 6.50, image_url: '' },
  { id: 'caramel-frappe', category: 'Blended & Specialty', name: 'Caramel Frappé', description: 'Espresso, caramel, milk, ice — blended smooth. Whipped cream, caramel drizzle.', price: 6.50, image_url: '' },
  { id: 'strawberry-smoothie', category: 'Blended & Specialty', name: 'Strawberry Banana Smoothie', description: 'Real fruit, yogurt, honey, ice. No coffee — just refreshing.', price: 6.00, image_url: '' },
  { id: 'hot-chocolate', category: 'Blended & Specialty', name: 'Hot Chocolate', description: 'House chocolate, steamed milk, whipped cream, marshmallows. Kid-approved.', price: 4.50, image_url: '' },

  // ── Pastries ──
  { id: 'croissant', category: 'Pastries', name: 'Butter Croissant', description: 'Flaky, golden, buttery. Baked fresh every morning.', price: 3.50, image_url: '', popular: true },
  { id: 'almond-croissant', category: 'Pastries', name: 'Almond Croissant', description: 'Filled with almond cream, topped with sliced almonds and powdered sugar.', price: 4.50, image_url: '' },
  { id: 'blueberry-muffin', category: 'Pastries', name: 'Blueberry Muffin', description: 'Jumbo muffin loaded with fresh blueberries. Streusel top.', price: 3.50, image_url: '' },
  { id: 'banana-bread', category: 'Pastries', name: 'Banana Bread', description: 'House-baked, moist, walnut-studded. Served warm with butter.', price: 3.50, image_url: '' },
  { id: 'scone', category: 'Pastries', name: 'Cranberry Orange Scone', description: 'Tender, flaky scone with dried cranberries and orange zest. Orange glaze.', price: 3.50, image_url: '' },
  { id: 'cinnamon-roll', category: 'Pastries', name: 'Cinnamon Roll', description: 'Giant cinnamon roll, cream cheese icing. Best seller before 10am.', price: 4.50, image_url: '', popular: true },
  { id: 'cookie', category: 'Pastries', name: 'Chocolate Chip Cookie', description: 'Thick, chewy, loaded with dark chocolate chunks. Baked in-house.', price: 3.00, image_url: '' },
  { id: 'brownie', category: 'Pastries', name: 'Fudge Brownie', description: 'Dense, fudgy, salted caramel drizzle. Pairs perfectly with a latte.', price: 4.00, image_url: '' },

  // ── Breakfast & Food ──
  { id: 'avocado-toast', category: 'Breakfast & Food', name: 'Avocado Toast', description: 'Sourdough, smashed avocado, everything seasoning, microgreens. Add egg +$2.', price: 8.00, image_url: '', popular: true },
  { id: 'breakfast-sandwich', category: 'Breakfast & Food', name: 'Breakfast Sandwich', description: 'Egg, cheddar, bacon or sausage on a brioche bun. Add avocado +$1.50.', price: 7.50, image_url: '' },
  { id: 'bagel-schmear', category: 'Breakfast & Food', name: 'Bagel & Cream Cheese', description: 'Choose: Plain, Everything, or Cinnamon Raisin. Regular or flavored cream cheese.', price: 4.50, image_url: '' },
  { id: 'overnight-oats', category: 'Breakfast & Food', name: 'Overnight Oats', description: 'Rolled oats, oat milk, chia seeds, honey, seasonal fruit. Grab and go.', price: 6.00, image_url: '' },
  { id: 'acai-bowl', category: 'Breakfast & Food', name: 'Açaí Bowl', description: 'Blended açaí, banana, granola, fresh berries, coconut flakes, honey drizzle.', price: 9.00, image_url: '' },
  { id: 'turkey-wrap', category: 'Breakfast & Food', name: 'Turkey & Avocado Wrap', description: 'Smoked turkey, avocado, spinach, tomato, herb cream cheese. Whole wheat wrap.', price: 9.50, image_url: '' },
  { id: 'grilled-cheese', category: 'Breakfast & Food', name: 'Grilled Cheese & Tomato Soup', description: 'Three-cheese grilled on sourdough with a cup of house tomato bisque.', price: 8.50, image_url: '' },

  // ── Retail & Bags ──
  { id: 'house-blend-bag', category: 'Retail Coffee', name: 'House Blend (12oz bag)', description: 'Our signature medium-dark roast. Colombia & Ethiopia. Whole bean or ground.', price: 16.00, image_url: '' },
  { id: 'single-origin-bag', category: 'Retail Coffee', name: 'Single Origin (12oz bag)', description: 'Rotating seasonal single-origin. Ask your barista for this month\'s selection.', price: 18.00, image_url: '' },
  { id: 'cold-brew-bottle', category: 'Retail Coffee', name: 'Cold Brew Bottle (32oz)', description: 'House cold brew, bottled fresh. Keep refrigerated. Good for 7 days.', price: 12.00, image_url: '' },
];

// ═══════════════════════════════════════════
// ── DEMO ACCOUNTS ─────────────────────────
// ═══════════════════════════════════════════

const DEMO_ACCOUNTS = [
  {
    email: 'owner@griffinlounge.demo',
    password: 'DemoPass123!',
    displayName: 'Alex Griffin (Owner)',
    role: 'owner',
  },
  {
    email: 'barista@griffinlounge.demo',
    password: 'DemoPass123!',
    displayName: 'Maya Torres (Barista)',
    role: 'staff',
  },
  {
    email: 'server@griffinlounge.demo',
    password: 'DemoPass123!',
    displayName: 'Jordan Kim (Server)',
    role: 'staff',
  },
  {
    email: 'driver@griffinlounge.demo',
    password: 'DemoPass123!',
    displayName: 'Chris Nguyen (Driver)',
    role: 'driver_inhouse',
  },
  {
    email: 'customer@griffinlounge.demo',
    password: 'DemoPass123!',
    displayName: 'Demo Customer',
    role: 'customer',
  },
];

// ═══════════════════════════════════════════
// ── DEFAULT KDS STATIONS ──────────────────
// ═══════════════════════════════════════════

const DEFAULT_STATIONS = [
  { name: 'Espresso Bar', color: '#92400e', categories: ['Espresso Drinks', 'Cold Brew & Iced', 'Drip Coffee', 'Tea', 'Blended & Specialty'], position: 0, isExpo: false },
  { name: 'Food Prep', color: '#ea580c', categories: ['Pastries', 'Breakfast & Food'], position: 1, isExpo: false },
  { name: 'Pickup', color: '#22c55e', categories: [], position: 2, isExpo: true },
];

// ═══════════════════════════════════════════
// ── SEED FUNCTION ─────────────────────────
// ═══════════════════════════════════════════

async function seed() {
  console.log('☕ Seeding Griffin Lounge coffee shop demo...\n');

  const now = new Date().toISOString();

  // ── 1. Create demo user accounts ──
  console.log('👤 Creating demo accounts...');
  const accountMap = {};

  for (const acct of DEMO_ACCOUNTS) {
    try {
      let user;
      try {
        user = await auth.getUserByEmail(acct.email);
        console.log(`   ⏩ ${acct.email} already exists (${user.uid})`);
      } catch {
        user = await auth.createUser({
          email: acct.email,
          password: acct.password,
          displayName: acct.displayName,
          emailVerified: true,
        });
        console.log(`   ✅ Created ${acct.email} (${user.uid})`);
      }
      accountMap[acct.role] = user.uid;

      await db.doc(`users/${user.uid}`).set({
        email: acct.email,
        displayName: acct.displayName,
        role: acct.role,
        businessIds: [BUSINESS_ID],
        activeBusinessId: BUSINESS_ID,
        createdAt: now,
        updatedAt: now,
        isDemo: true,
      }, { merge: true });

    } catch (err) {
      console.log(`   ⚠️  Could not create ${acct.email}: ${err.message}`);
    }
  }

  // ── 2. Business document ──
  console.log('\n🏢 Creating business document...');

  const business = {
    businessId: BUSINESS_ID,
    name: 'Griffin Lounge',
    slug: BUSINESS_SLUG,
    ownerId: accountMap.owner || 'demo-coffee-owner-uid',
    type: 'coffee_shop',
    description: 'A modern coffee lounge serving specialty espresso, cold brew, teas, and house-baked pastries. Order ahead, skip the line, and earn rewards with every visit.',
    logo: '',

    tier: 'professional',
    subscriptionStatus: 'active',
    subscriptionStartDate: now,

    brandColors: {
      primary: '#92400E',
      secondary: '#78350F',
      accent: '#F59E0B',
    },

    ownerEmail: 'owner@griffinlounge.demo',
    ownerPhone: '(804) 555-8822',
    businessPhone: '(804) 555-BREW',

    address: '1501 W Main Street',
    city: 'Richmond',
    state: 'VA',
    zipCode: '23220',
    latitude: 37.5446,
    longitude: -77.4485,
    timezone: 'America/New_York',
    location: { lat: 37.5446, lng: -77.4485 },

    // ── Website config ──
    website: {
      enabled: true,
      setupComplete: true,
      customDomainEnabled: false,
      selectedServices: ['online-ordering', 'dine-in', 'takeout', 'pickup'],
      selectedStates: ['VA'],
      selectedCities: ['Richmond', 'The Fan', 'VCU', 'Scott\'s Addition', 'Carytown'],
      cuisineType: 'coffee_shop',
      foodCategories: ['espresso', 'cold-brew', 'tea', 'pastries', 'breakfast', 'retail-coffee'],
      menuHighlights: ['Lavender Latte', 'Nitro Cold Brew', 'Avocado Toast', 'Cinnamon Roll'],
      specialties: ['Specialty Espresso', 'Nitro Cold Brew', 'House-Baked Pastries', 'Order Ahead'],
      content: {
        tagline: 'Specialty Coffee. Baked Fresh. Order Ahead.',
        heroTitle: 'Griffin Lounge',
        heroSubtitle: 'Specialty espresso, nitro cold brew, house-baked pastries. Order from your phone, skip the line, and earn rewards with every cup.',
        aboutTitle: 'About Griffin Lounge',
        aboutContent: 'Griffin Lounge opened in 2023 in the Fan District with a simple idea: serve exceptional coffee without the pretension. We source single-origin beans, bake everything in-house, and believe that your morning coffee shouldn\'t cost you half an hour in line. Order ahead, grab your drink, and get on with your day.',
        aboutMission: 'Make great coffee accessible — no lines, no hassle, just quality.',
        aboutValues: 'Quality beans, house-baked, real ingredients, zero waste.',
        contactTitle: 'Visit Griffin Lounge',
        contactContent: 'Walk-ins welcome. Indoor seating, patio, and plenty of power outlets for remote work.',
        businessHours: 'Mon-Fri: 6am-7pm | Sat: 7am-6pm | Sun: 8am-4pm',
        serviceDescriptions: {
          'online-ordering': 'Order your coffee and food from your phone before you arrive. It\'s ready when you walk in.',
          'dine-in': 'Cozy seating with fast WiFi, outlets at every table, and the best playlist in Richmond.',
          'takeout': 'Order ahead and grab from the pickup counter. No line, no wait.',
          'pickup': 'Curbside pickup available — text us when you arrive and we\'ll bring it out.',
        },
      },
      seo: {
        metaTitle: 'Griffin Lounge - Specialty Coffee Shop in Richmond VA',
        metaDescription: 'Richmond\'s best specialty coffee — espresso, nitro cold brew, house-baked pastries. Order ahead from your phone. No commissions, no app required.',
        keywords: ['coffee shop richmond va', 'espresso bar richmond', 'cold brew richmond', 'order ahead coffee', 'best coffee near me', 'coffee shop the fan richmond'],
      },
    },

    // ── Settings ──
    settings: {
      orderingEnabled: true,
      primaryColor: '#92400E',
      logoUrl: '',
      pricing: {
        deliveryFee: 2.99,
        minimumOrder: 10,
        taxRate: 0.06,
      },
      cashPaymentsEnabled: true,
      thirdPartyDelivery: {
        enabled: false,
        uberEatsUrl: '',
        doordashUrl: '',
        grubhubUrl: '',
      },
      useMarketplaceDrivers: true,
      peerDelivery: {
        enabled: true,
        discountAmount: 2.00,
        maxDistance: 2,
      },
    },

    // ── Features ──
    features: {
      liveOrderTracking: true,
      driverManagement: true,
      kitchenDisplaySystem: true,
      loyaltyProgram: true,
      liveStreaming: false,
      batchRouting: false,
      advancedAnalytics: true,
      apiAccess: false,
      customIntegrations: false,
      seoWebsite: true,
      reservations: false,
      entertainment: false,
      staffMarketplace: true,
      peerDelivery: true,
    },

    serviceAreas: ['Richmond', 'The Fan', 'VCU', 'Scott\'s Addition', 'Museum District'],
    services: ['dine-in', 'takeout', 'pickup', 'online-ordering'],

    isActive: true,
    isLocked: false,
    isDemo: true,

    maxInhouseDrivers: 2,
    inHouseDriverIds: accountMap.driver_inhouse ? [accountMap.driver_inhouse] : [],
    staffIds: [accountMap.staff, accountMap.owner].filter(Boolean),
    staffCount: 6,

    monthlyRevenue: 22400,
    totalOrders: 3842,
    customerCount: 1156,

    createdAt: now,
    updatedAt: now,
  };

  await db.doc(`businesses/${BUSINESS_ID}`).set(business);
  console.log('✅ Business document created');

  // ── 3. Menu items ──
  console.log(`\n📋 Seeding ${MENU_ITEMS.length} menu items...`);

  const menuRef = db.collection(`businesses/${BUSINESS_ID}/menuItems`);

  const existing = await menuRef.get();
  if (existing.docs.length > 0) {
    const delBatch = db.batch();
    existing.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
    console.log(`   🗑️  Cleared ${existing.docs.length} existing items`);
  }

  let batch = db.batch();
  let count = 0;
  for (const item of MENU_ITEMS) {
    const docRef = menuRef.doc(item.id);
    batch.set(docRef, {
      id: item.id,
      category: item.category,
      name: item.name,
      description: item.description || '',
      price: item.price,
      prices: item.prices || { order: item.price },
      image_url: item.image_url || '',
      isSpicy: item.isSpicy || false,
      popular: item.popular || false,
      available: true,
    });
    count++;
    if (count % 20 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % 20 !== 0) {
    await batch.commit();
  }
  console.log(`✅ ${count} menu items seeded`);

  // ── 3b. Staff on duty profiles ──
  console.log('\n👥 Seeding staff on duty...');
  const staffRef = db.collection(`businesses/${BUSINESS_ID}/staffOnDuty`);

  const existStaff = await staffRef.get();
  if (existStaff.docs.length > 0) {
    const sBatch = db.batch();
    existStaff.docs.forEach(d => sBatch.delete(d.ref));
    await sBatch.commit();
  }

  const staffProfiles = [
    {
      name: 'Maya Torres',
      role: 'barista',
      specialty: 'Latte Art & Pour Overs',
      bio: 'Former national latte art competitor. Her rosetta is Instagram-famous. Try the lavender latte — it\'s her creation.',
      yearsExp: 6,
      customerFavorite: true,
      uid: accountMap.staff || '',
    },
    {
      name: 'Jordan Kim',
      role: 'barista',
      specialty: 'Cold Brew & Nitro',
      bio: 'Jordan perfected our cold brew recipe over 200+ batches. He also manages our single-origin sourcing.',
      yearsExp: 4,
      customerFavorite: true,
      uid: accountMap.staff2 || '',
    },
    {
      name: 'Priya Sharma',
      role: 'baker',
      specialty: 'Pastries & Bread',
      bio: 'Everything we bake is Priya\'s recipe. The cinnamon rolls sell out by 9am — set your alarm.',
      yearsExp: 8,
      customerFavorite: false,
    },
  ];

  for (const sp of staffProfiles) {
    await staffRef.add({ ...sp, onDuty: true, updatedAt: now });
  }
  console.log(`✅ ${staffProfiles.length} staff profiles seeded`);

  // ── 4. KDS Stations ──
  console.log('\n🖥️  Seeding KDS stations...');
  const stationsRef = db.collection(`businesses/${BUSINESS_ID}/kdsStations`);

  const existStations = await stationsRef.get();
  if (existStations.docs.length > 0) {
    const sBatch = db.batch();
    existStations.docs.forEach(d => sBatch.delete(d.ref));
    await sBatch.commit();
  }

  for (const station of DEFAULT_STATIONS) {
    await stationsRef.add(station);
  }
  console.log(`✅ ${DEFAULT_STATIONS.length} KDS stations seeded`);

  // ── 5. Demo orders ──
  console.log('\n🛒 Seeding demo orders...');
  const ordersRef = db.collection(`businesses/${BUSINESS_ID}/orders`);

  const existO = await ordersRef.get();
  if (existO.docs.length > 0) {
    const delBatch = db.batch();
    existO.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
  }

  const demoOrders = [
    {
      customerName: 'Sarah Mitchell',
      customerEmail: 'sarah@email.com',
      customerPhone: '(804) 555-1001',
      items: [
        { name: 'Lavender Latte', quantity: 1, price: 6.50, category: 'Espresso Drinks' },
        { name: 'Butter Croissant', quantity: 1, price: 3.50, category: 'Pastries' },
      ],
      subtotal: 10.00,
      tax: 0.60,
      total: 10.60,
      type: 'pickup',
      status: 'completed',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      customerName: 'David Park',
      customerEmail: 'david@email.com',
      customerPhone: '(804) 555-1002',
      items: [
        { name: 'Nitro Cold Brew', quantity: 2, price: 6.00, category: 'Cold Brew & Iced' },
        { name: 'Avocado Toast', quantity: 1, price: 8.00, category: 'Breakfast & Food' },
        { name: 'Blueberry Muffin', quantity: 1, price: 3.50, category: 'Pastries' },
      ],
      subtotal: 23.50,
      tax: 1.41,
      total: 24.91,
      type: 'dine-in',
      status: 'preparing',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      customerName: 'Demo Customer',
      customerEmail: 'customer@griffinlounge.demo',
      customerPhone: '(804) 555-1003',
      items: [
        { name: 'Brown Sugar Oatmilk Shaken Espresso', quantity: 1, price: 6.50, category: 'Cold Brew & Iced' },
        { name: 'Cinnamon Roll', quantity: 1, price: 4.50, category: 'Pastries' },
      ],
      subtotal: 11.00,
      tax: 0.66,
      total: 11.66,
      type: 'pickup',
      status: 'pending',
      paymentMethod: 'crypto',
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ];

  for (const order of demoOrders) {
    await ordersRef.add(order);
  }
  console.log('✅ 3 demo orders created');

  // ── DONE ──
  console.log('\n');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  ☕  GRIFFIN LOUNGE — DEMO COFFEE SHOP READY!');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  📍 URLs (live on mohnmenu.com after deploy):');
  console.log('');
  console.log('  🏠 Tenant Website:      /griffin-lounge');
  console.log('  📋 Menu Page:            /griffin-lounge/menu');
  console.log('  🛒 Order Page:           /order/griffin-lounge');
  console.log('  📱 Kiosk Mode:           /griffin-lounge/kiosk');
  console.log('');
  console.log('  👤 Demo Login Accounts (all password: DemoPass123!)');
  console.log('');
  console.log('  Owner:      owner@griffinlounge.demo');
  console.log('  Barista:    barista@griffinlounge.demo');
  console.log('  Server:     server@griffinlounge.demo');
  console.log('  Driver:     driver@griffinlounge.demo');
  console.log('  Customer:   customer@griffinlounge.demo');
  console.log('');
  console.log('  💳 Test card: 4242 4242 4242 4242');
  console.log('     Exp: 12/28  CVC: 123  ZIP: 12345');
  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
