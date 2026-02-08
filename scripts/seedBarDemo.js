/**
 * Seed Bar Demo — run with: node scripts/seedBarDemo.js
 *
 * Creates a fully-configured demo bar in Firestore with:
 *  - Business document (website, settings, brand, entertainment, reservations)
 *  - 60+ menu items (cocktails, draft beer, wine, whiskey, shots, bar food)
 *  - Demo jukebox queue
 *  - Demo bookings / reservations
 *  - Demo user accounts (owner, staff, driver)
 *
 *  Ready to test at:
 *    https://mohnmenu.com/the-copper-tap         (tenant website)
 *    https://mohnmenu.com/order/the-copper-tap    (order page)
 *    https://mohnmenu.com/the-copper-tap/jukebox  (jukebox)
 *    https://mohnmenu.com/the-copper-tap/reserve  (reservations)
 *    https://mohnmenu.com/the-copper-tap/kiosk    (kiosk mode)
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

const BUSINESS_ID = 'demo-the-copper-tap';
const BUSINESS_SLUG = 'the-copper-tap';

// ═══════════════════════════════════════════
// ── BAR MENU DATA ─────────────────────────
// ═══════════════════════════════════════════

const MENU_ITEMS = [
  // ── Signature Cocktails ──
  { id: 'copper-old-fashioned', category: 'Signature Cocktails', name: 'Copper Old Fashioned', description: 'Bulleit bourbon, demerara, Angostura, orange peel, luxardo cherry. Our #1 seller.', price: 14, image_url: '', popular: true },
  { id: 'spicy-margarita', category: 'Signature Cocktails', name: 'Spicy Margarita', description: 'Casamigos blanco, fresh lime, agave, jalapeño slices, Tajín rim.', price: 13, image_url: '', popular: true, isSpicy: true },
  { id: 'espresso-martini', category: 'Signature Cocktails', name: 'Espresso Martini', description: 'Grey Goose, Kahlúa, fresh espresso, vanilla syrup. Shaken cold.', price: 15, image_url: '', popular: true },
  { id: 'moscow-mule', category: 'Signature Cocktails', name: 'Moscow Mule', description: 'Tito\'s vodka, fresh lime, Fever-Tree ginger beer, copper mug.', price: 12, image_url: '' },
  { id: 'whiskey-sour', category: 'Signature Cocktails', name: 'Whiskey Sour', description: 'Buffalo Trace, fresh lemon, simple syrup, egg white foam, Angostura.', price: 13, image_url: '' },
  { id: 'aperol-spritz', category: 'Signature Cocktails', name: 'Aperol Spritz', description: 'Aperol, prosecco, soda, orange slice. Light and refreshing.', price: 12, image_url: '' },
  { id: 'dark-stormy', category: 'Signature Cocktails', name: 'Dark & Stormy', description: 'Goslings Black Seal rum, ginger beer, lime, bitters.', price: 12, image_url: '' },
  { id: 'manhattan', category: 'Signature Cocktails', name: 'Manhattan', description: 'Woodford Reserve, sweet vermouth, Angostura, brandied cherry.', price: 14, image_url: '' },
  { id: 'paloma', category: 'Signature Cocktails', name: 'Paloma', description: 'Espolòn tequila, fresh grapefruit, lime, soda, salt rim.', price: 12, image_url: '' },
  { id: 'negroni', category: 'Signature Cocktails', name: 'Negroni', description: 'Tanqueray gin, Campari, sweet vermouth, orange twist.', price: 13, image_url: '' },

  // ── Draft Beer ──
  { id: 'bud-light-draft', category: 'Draft Beer', name: 'Bud Light', description: '16oz pint. Smooth, easy-drinking American lager.', price: 5, image_url: '' },
  { id: 'miller-lite-draft', category: 'Draft Beer', name: 'Miller Lite', description: '16oz pint. Light pilsner with a clean finish.', price: 5, image_url: '' },
  { id: 'blue-moon', category: 'Draft Beer', name: 'Blue Moon', description: '16oz pint. Belgian-style wheat ale with orange.', price: 7, image_url: '', popular: true },
  { id: 'guinness-draft', category: 'Draft Beer', name: 'Guinness Draught', description: '20oz imperial pint. Rich, creamy Irish stout.', price: 8, image_url: '', popular: true },
  { id: 'ipa-of-month', category: 'Draft Beer', name: 'IPA of the Month', description: '16oz pint. Rotating craft IPA — ask your bartender!', price: 8, image_url: '' },
  { id: 'local-lager', category: 'Draft Beer', name: 'Local Craft Lager', description: '16oz pint. Rotating local brewery selection.', price: 7, image_url: '' },
  { id: 'cider-draft', category: 'Draft Beer', name: 'Angry Orchard', description: '16oz pint. Crisp apple hard cider.', price: 7, image_url: '' },
  { id: 'stella-draft', category: 'Draft Beer', name: 'Stella Artois', description: '11.2oz chalice pour. Belgian pilsner.', price: 7, image_url: '' },

  // ── Bottled & Canned Beer ──
  { id: 'corona-extra', category: 'Bottled & Canned', name: 'Corona Extra', description: '12oz bottle. Mexican lager, served with lime.', price: 5, image_url: '' },
  { id: 'modelo-especial', category: 'Bottled & Canned', name: 'Modelo Especial', description: '12oz bottle. Rich, full-flavored pilsner-style lager.', price: 5, image_url: '' },
  { id: 'white-claw', category: 'Bottled & Canned', name: 'White Claw Variety', description: '12oz can. Choose: Mango, Black Cherry, Lime, or Watermelon.', price: 6, image_url: '' },
  { id: 'heineken', category: 'Bottled & Canned', name: 'Heineken', description: '12oz bottle. Classic Dutch pale lager.', price: 6, image_url: '' },
  { id: 'michelob-ultra', category: 'Bottled & Canned', name: 'Michelob Ultra', description: '12oz bottle. Light lager, only 95 calories.', price: 5, image_url: '' },
  { id: 'yuengling', category: 'Bottled & Canned', name: 'Yuengling Lager', description: '12oz bottle. America\'s oldest brewery. Amber lager.', price: 5, image_url: '' },

  // ── Wine ──
  { id: 'house-cab', category: 'Wine', name: 'Cabernet Sauvignon', description: 'House pour — rich, full-bodied red. California.', price: 9, image_url: '', prices: { glass: 9, bottle: 32 } },
  { id: 'house-pinot-noir', category: 'Wine', name: 'Pinot Noir', description: 'House pour — light, smooth red. Oregon.', price: 10, image_url: '', prices: { glass: 10, bottle: 36 } },
  { id: 'house-chardonnay', category: 'Wine', name: 'Chardonnay', description: 'House pour — buttery, oaked white. Sonoma.', price: 9, image_url: '', prices: { glass: 9, bottle: 32 } },
  { id: 'house-sauv-blanc', category: 'Wine', name: 'Sauvignon Blanc', description: 'House pour — crisp, citrusy white. New Zealand.', price: 9, image_url: '', prices: { glass: 9, bottle: 32 } },
  { id: 'prosecco', category: 'Wine', name: 'Prosecco', description: 'Italian sparkling. Light, bubbly, perfect for celebrations.', price: 10, image_url: '', prices: { glass: 10, bottle: 38 } },
  { id: 'rose-wine', category: 'Wine', name: 'Rosé', description: 'Dry Provence rosé. Strawberry, melon, subtle florals.', price: 10, image_url: '', prices: { glass: 10, bottle: 36 } },

  // ── Whiskey & Bourbon ──
  { id: 'jack-daniels', category: 'Whiskey & Bourbon', name: 'Jack Daniel\'s', description: 'Tennessee whiskey. Smooth, classic.', price: 8, image_url: '', prices: { single: 8, double: 14 } },
  { id: 'makers-mark', category: 'Whiskey & Bourbon', name: 'Maker\'s Mark', description: 'Kentucky straight bourbon. Soft, sweet.', price: 9, image_url: '', prices: { single: 9, double: 16 } },
  { id: 'buffalo-trace', category: 'Whiskey & Bourbon', name: 'Buffalo Trace', description: 'Kentucky straight bourbon. Caramel, vanilla, spice.', price: 9, image_url: '', prices: { single: 9, double: 16 } },
  { id: 'woodford-reserve', category: 'Whiskey & Bourbon', name: 'Woodford Reserve', description: 'Premium Kentucky bourbon. Rich, balanced.', price: 12, image_url: '', prices: { single: 12, double: 20 }, popular: true },
  { id: 'jameson', category: 'Whiskey & Bourbon', name: 'Jameson Irish Whiskey', description: 'Triple-distilled Irish whiskey. Smooth, approachable.', price: 8, image_url: '', prices: { single: 8, double: 14 } },
  { id: 'crown-royal', category: 'Whiskey & Bourbon', name: 'Crown Royal', description: 'Canadian whisky. Smooth, creamy, delicate.', price: 9, image_url: '', prices: { single: 9, double: 16 } },
  { id: 'fireball', category: 'Whiskey & Bourbon', name: 'Fireball', description: 'Cinnamon whisky. Sweet heat.', price: 6, image_url: '', isSpicy: true },

  // ── Shots ──
  { id: 'patron-shot', category: 'Shots', name: 'Patrón Silver', description: 'Premium tequila. Smooth, citrus finish.', price: 10, image_url: '' },
  { id: 'rumple-minze', category: 'Shots', name: 'Rumple Minze', description: '100 proof peppermint schnapps. Ice cold.', price: 8, image_url: '' },
  { id: 'jager-shot', category: 'Shots', name: 'Jägermeister', description: 'German herbal liqueur. Served ice cold.', price: 7, image_url: '' },
  { id: 'washington-apple', category: 'Shots', name: 'Washington Apple', description: 'Crown Royal, sour apple pucker, cranberry.', price: 8, image_url: '', popular: true },
  { id: 'lemon-drop-shot', category: 'Shots', name: 'Lemon Drop', description: 'Citrus vodka, fresh lemon, sugar rim.', price: 8, image_url: '' },
  { id: 'b52-shot', category: 'Shots', name: 'B-52', description: 'Kahlúa, Baileys, Grand Marnier. Layered.', price: 9, image_url: '' },

  // ── Bar Bites ──
  { id: 'loaded-nachos', category: 'Bar Bites', name: 'Loaded Nachos', description: 'Tortilla chips, queso, ground beef, jalapeños, pico, sour cream, guac.', price: 14, image_url: '', popular: true, isSpicy: true },
  { id: 'wings-basket', category: 'Bar Bites', name: 'Wings (12ct)', description: 'Choose: Buffalo, BBQ, Garlic Parm, Lemon Pepper, or Mango Habanero. Celery + ranch.', price: 16, image_url: '', popular: true },
  { id: 'pretzel-bites', category: 'Bar Bites', name: 'Pretzel Bites & Beer Cheese', description: 'Warm soft pretzel bites, house beer cheese, honey mustard.', price: 11, image_url: '' },
  { id: 'fried-pickles', category: 'Bar Bites', name: 'Fried Pickles', description: 'Beer-battered dill chips, chipotle ranch dip.', price: 10, image_url: '' },
  { id: 'mozzarella-sticks', category: 'Bar Bites', name: 'Mozzarella Sticks', description: '6 golden-fried mozzarella sticks, marinara sauce.', price: 10, image_url: '' },
  { id: 'quesadilla', category: 'Bar Bites', name: 'Chicken Quesadilla', description: 'Grilled chicken, pepper jack, peppers, onions. Sour cream, pico.', price: 13, image_url: '' },
  { id: 'sliders-trio', category: 'Bar Bites', name: 'Sliders Trio', description: 'Three smash burger sliders, American cheese, pickles, special sauce.', price: 13, image_url: '' },

  // ── Burgers & Sandwiches ──
  { id: 'copper-tap-burger', category: 'Burgers & Sandwiches', name: 'The Copper Tap Burger', description: 'Double smash patty, cheddar, bacon, caramelized onions, house sauce, brioche bun. Served with fries.', price: 16, image_url: '', popular: true },
  { id: 'bbq-bacon-burger', category: 'Burgers & Sandwiches', name: 'BBQ Bacon Burger', description: 'Angus patty, pepper jack, thick bacon, onion rings, smoky BBQ. Fries included.', price: 17, image_url: '' },
  { id: 'chicken-sandwich', category: 'Burgers & Sandwiches', name: 'Crispy Chicken Sandwich', description: 'Buttermilk fried chicken, pickles, spicy mayo, brioche. Fries included.', price: 15, image_url: '' },
  { id: 'philly-cheese', category: 'Burgers & Sandwiches', name: 'Philly Cheesesteak', description: 'Shaved ribeye, provolone, peppers, onions, hoagie roll. Fries included.', price: 16, image_url: '' },
  { id: 'veggie-burger', category: 'Burgers & Sandwiches', name: 'Veggie Burger', description: 'Impossible patty, avocado, lettuce, tomato, vegan aioli. Fries included.', price: 15, image_url: '' },

  // ── Sides ──
  { id: 'fries', category: 'Sides', name: 'French Fries', description: 'Crispy seasoned fries with ketchup.', price: 5, image_url: '' },
  { id: 'loaded-fries', category: 'Sides', name: 'Loaded Fries', description: 'Fries topped with bacon, cheddar, sour cream, chives.', price: 9, image_url: '' },
  { id: 'onion-rings', category: 'Sides', name: 'Onion Rings', description: 'Beer-battered thick-cut onion rings, ranch.', price: 8, image_url: '' },
  { id: 'side-salad', category: 'Sides', name: 'House Salad', description: 'Mixed greens, tomato, cucumber, croutons, choice of dressing.', price: 7, image_url: '' },
  { id: 'mac-cheese', category: 'Sides', name: 'Mac & Cheese', description: 'Creamy three-cheese mac. Add bacon +$2.', price: 8, image_url: '' },

  // ── Non-Alcoholic ──
  { id: 'soft-drinks', category: 'Non-Alcoholic', name: 'Fountain Drinks', description: 'Coke, Diet Coke, Sprite, Dr Pepper, Lemonade. Free refills.', price: 3, image_url: '' },
  { id: 'red-bull', category: 'Non-Alcoholic', name: 'Red Bull', description: '8.4oz can. Regular or sugar-free.', price: 5, image_url: '' },
  { id: 'coffee', category: 'Non-Alcoholic', name: 'Coffee', description: 'Fresh brewed. Regular or decaf. Free refills.', price: 3, image_url: '' },
  { id: 'virgin-marg', category: 'Non-Alcoholic', name: 'Virgin Margarita', description: 'Fresh lime, agave, soda. All the flavor, no alcohol.', price: 7, image_url: '' },
  { id: 'water', category: 'Non-Alcoholic', name: 'Bottled Water', description: 'Dasani 16oz.', price: 2, image_url: '' },
];

// ═══════════════════════════════════════════
// ── DEMO ACCOUNTS ─────────────────────────
// ═══════════════════════════════════════════

const DEMO_ACCOUNTS = [
  {
    email: 'owner@coppertap.demo',
    password: 'DemoPass123!',
    displayName: 'Jake Cooper (Owner)',
    role: 'owner',
  },
  {
    email: 'bartender@coppertap.demo',
    password: 'DemoPass123!',
    displayName: 'Mike Reeves (Bartender)',
    role: 'staff',
  },
  {
    email: 'server@coppertap.demo',
    password: 'DemoPass123!',
    displayName: 'Sarah Lin (Server)',
    role: 'staff',
  },
  {
    email: 'driver@coppertap.demo',
    password: 'DemoPass123!',
    displayName: 'James Kowalski (Driver)',
    role: 'driver',
  },
  {
    email: 'customer@coppertap.demo',
    password: 'DemoPass123!',
    displayName: 'Demo Customer',
    role: 'customer',
  },
];

// ═══════════════════════════════════════════
// ── SEED FUNCTION ─────────────────────────
// ═══════════════════════════════════════════

async function seed() {
  console.log('🍺 Seeding The Copper Tap bar demo...\n');

  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  // ── 1. Create demo user accounts ──
  console.log('👤 Creating demo accounts...');
  const accountMap = {};

  for (const acct of DEMO_ACCOUNTS) {
    try {
      // Check if user exists
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

      // Set user doc in Firestore
      await db.doc(`users/${user.uid}`).set({
        email: acct.email,
        displayName: acct.displayName,
        role: acct.role,
        businessId: BUSINESS_ID,
        createdAt: now,
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
    name: 'The Copper Tap',
    slug: BUSINESS_SLUG,
    ownerId: accountMap.owner || 'demo-bar-owner-uid',
    type: 'bar_grill',
    description: 'Richmond\'s premier craft cocktail bar & grill. Live music, karaoke nights, and the best Old Fashioned in town. Full kitchen open late.',
    logo: '',

    tier: 'pro',
    subscriptionStatus: 'active',
    subscriptionStartDate: now,

    brandColors: {
      primary: '#7C3AED',
      secondary: '#581C87',
      accent: '#F59E0B',
    },

    ownerEmail: 'owner@coppertap.demo',
    ownerPhone: '(804) 555-2277',
    businessPhone: '(804) 555-TAPS',

    address: '2801 W Cary Street',
    city: 'Richmond',
    state: 'VA',
    zipCode: '23221',
    latitude: 37.5518,
    longitude: -77.4781,
    timezone: 'America/New_York',
    location: { lat: 37.5518, lng: -77.4781 },

    // ── Website config ──
    website: {
      enabled: true,
      setupComplete: true,
      customDomainEnabled: false,
      selectedServices: ['online-ordering', 'dine-in', 'takeout', 'events', 'reservations'],
      selectedStates: ['VA'],
      selectedCities: ['Richmond', 'Carytown', 'The Fan', 'Short Pump', 'Scott\'s Addition'],
      cuisineType: 'bar_grill',
      foodCategories: ['cocktails', 'beer', 'wine', 'whiskey', 'bar-bites', 'burgers'],
      menuHighlights: ['Copper Old Fashioned', 'Spicy Margarita', 'The Copper Tap Burger', 'Loaded Nachos'],
      specialties: ['Craft Cocktails', 'Live Music & Karaoke', '20 Beers on Tap', 'Late Night Kitchen'],
      content: {
        tagline: 'Richmond\'s Premier Craft Cocktail Bar & Grill',
        heroTitle: 'The Copper Tap',
        heroSubtitle: 'Craft cocktails, 20 beers on tap, full kitchen open late. Live music every weekend, karaoke Thursdays. Order from your phone — skip the bar line.',
        aboutTitle: 'About The Copper Tap',
        aboutContent: 'The Copper Tap opened in 2019 in the heart of Carytown with one mission: build the neighborhood bar that everyone deserves. Great drinks at fair prices, food that\'s actually good, and a vibe where everyone feels welcome — whether you\'re catching the game, singing karaoke, or just having a quiet bourbon after work.',
        aboutMission: 'Be the neighborhood bar where regulars become family, the drinks are always strong, and no one leaves hungry.',
        aboutValues: 'Strong pours, honest prices, real food, good music, zero pretension.',
        contactTitle: 'Visit The Copper Tap',
        contactContent: 'Walk-ins welcome. Reservations recommended for groups of 6+. Private event space available.',
        businessHours: 'Mon-Thu: 4pm-12am | Fri: 4pm-2am | Sat: 12pm-2am | Sun: 12pm-10pm',
        serviceDescriptions: {
          'online-ordering': 'Order food and drinks from your phone at the bar, patio, or from home. No waiting, no flagging down the bartender.',
          'dine-in': 'Full bar and dining room seating. Indoor, patio, and bar seating available.',
          'takeout': 'Call ahead or order online. Your food will be ready when you arrive.',
          'events': 'Private events, corporate happy hours, birthday parties. Custom drink menus available.',
          'reservations': 'Reserve a table, booth, or our private VIP room. Perfect for groups.',
        },
      },
      seo: {
        metaTitle: 'The Copper Tap - Craft Cocktail Bar & Grill in Richmond VA',
        metaDescription: 'Richmond\'s best craft cocktails, 20 beers on tap, and a full kitchen open late. Live music weekends, karaoke Thursdays. Order from your phone — no commission fees.',
        keywords: ['bar richmond va', 'craft cocktails richmond', 'bars carytown', 'karaoke richmond', 'live music richmond va', 'best bar near me'],
      },
    },

    // ── Settings ──
    settings: {
      orderingEnabled: true,
      primaryColor: '#7C3AED',
      logoUrl: '',
      pricing: {
        deliveryFee: 4.99,
        minimumOrder: 20,
        taxRate: 0.06,
      },
      cashPaymentsEnabled: true,
      thirdPartyDelivery: {
        enabled: false,
        uberEatsUrl: '',
        doordashUrl: '',
        grubhubUrl: '',
      },
      useMarketplaceDrivers: false,
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
      reservations: true,
      entertainment: true,
      staffMarketplace: true,
    },

    // ── Entertainment config ──
    entertainment: {
      jukeboxEnabled: true,
      karaokeEnabled: true,
      creditPrice: 0.50,
      creditsPerSong: 1,
      maxQueueSize: 25,
      kioskEnabled: true,
      tvDisplayEnabled: true,
      syncDelayMs: 0,
    },

    // ── Reservation config ──
    reservationSettings: {
      enabled: true,
      maxPartySize: 20,
      defaultDuration: 120,
      seatingOptions: ['Indoor', 'Patio', 'Bar', 'VIP Room'],
      requireDeposit: false,
      autoConfirm: true,
    },

    serviceAreas: ['Richmond', 'Carytown', 'The Fan', 'Museum District', 'Short Pump'],
    services: ['dine-in', 'takeout', 'events', 'reservations'],

    isActive: true,
    isLocked: false,
    isDemo: true,

    maxInhouseDrivers: 2,
    inHouseDriverIds: accountMap.driver ? [accountMap.driver] : [],
    staffIds: [accountMap.staff, accountMap.owner].filter(Boolean),
    staffCount: 12,

    monthlyRevenue: 48500,
    totalOrders: 1247,
    customerCount: 632,

    createdAt: now,
    updatedAt: now,
  };

  await db.doc(`businesses/${BUSINESS_ID}`).set(business);
  console.log('✅ Business document created');

  // ── 3. Menu items ──
  console.log(`\n📋 Seeding ${MENU_ITEMS.length} menu items...`);

  const menuRef = db.collection(`businesses/${BUSINESS_ID}/menuItems`);

  // Clear existing
  const existing = await menuRef.get();
  if (existing.docs.length > 0) {
    const delBatch = db.batch();
    existing.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
    console.log(`   🗑️  Cleared ${existing.docs.length} existing items`);
  }

  // Write in batches
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

  // Clear existing
  const existStaff = await staffRef.get();
  if (existStaff.docs.length > 0) {
    const sBatch = db.batch();
    existStaff.docs.forEach(d => sBatch.delete(d.ref));
    await sBatch.commit();
  }

  const staffProfiles = [
    {
      name: 'Mike Reeves',
      role: 'bartender',
      specialty: 'Craft Cocktails & Whiskey Flights',
      bio: 'Award-winning mixologist. If you can dream it, Mike can pour it. Try his Copper Old Fashioned.',
      yearsExp: 8,
      customerFavorite: true,
      uid: accountMap.staff || '',
    },
    {
      name: 'Sarah Lin',
      role: 'server',
      specialty: 'Wine Pairings & VIP Service',
      bio: 'Sarah knows every item on the menu by heart. Ask her for dinner recs — she never misses.',
      yearsExp: 5,
      customerFavorite: true,
      uid: accountMap.staff2 || '',
    },
    {
      name: 'DJ Ty',
      role: 'dj / karaoke host',
      specialty: 'Karaoke Nights & Music Curation',
      bio: 'Thursday through Saturday, DJ Ty keeps the energy right. Request songs through the jukebox or talk to him directly.',
      yearsExp: 3,
      customerFavorite: false,
    },
    {
      name: 'Amanda Cruz',
      role: 'bartender',
      specialty: 'Tequila & Mezcal Cocktails',
      bio: 'If you like spicy margaritas, Amanda makes the best in Richmond. Period.',
      yearsExp: 6,
      customerFavorite: false,
    },
  ];

  for (const sp of staffProfiles) {
    await staffRef.add({ ...sp, onDuty: true, updatedAt: now });
  }
  console.log(`✅ ${staffProfiles.length} staff profiles seeded`);

  // ── 4. Demo jukebox queue ──
  console.log('\n🎵 Seeding jukebox queue...');
  const jukeboxRef = db.collection(`businesses/${BUSINESS_ID}/jukeboxQueue`);

  // Clear existing
  const existQ = await jukeboxRef.get();
  if (existQ.docs.length > 0) {
    const delBatch = db.batch();
    existQ.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
  }

  const demoQueue = [
    { songTitle: 'Sweet Caroline', artist: 'Neil Diamond', requestedBy: 'Jake', isKaraoke: false, status: 'playing', credits: 1, createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 180000)) },
    { songTitle: 'Mr. Brightside', artist: 'The Killers', requestedBy: 'Sarah', isKaraoke: false, status: 'queued', credits: 1, createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 120000)) },
    { songTitle: 'Bohemian Rhapsody', artist: 'Queen', requestedBy: 'Mike', isKaraoke: true, status: 'queued', credits: 1, createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60000)) },
    { songTitle: 'Piano Man', artist: 'Billy Joel', requestedBy: 'Alex', isKaraoke: true, status: 'queued', credits: 1, createdAt: admin.firestore.Timestamp.fromDate(new Date()) },
  ];

  for (const song of demoQueue) {
    await jukeboxRef.add(song);
  }
  console.log('✅ 4 songs in jukebox queue');

  // ── 5. Demo reservations ──
  console.log('\n📅 Seeding demo reservations...');
  const bookRef = db.collection(`businesses/${BUSINESS_ID}/bookings`);

  // Clear existing
  const existB = await bookRef.get();
  if (existB.docs.length > 0) {
    const delBatch = db.batch();
    existB.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
  }

  const demoBookings = [
    { name: 'Jennifer Martinez', phone: '(804) 555-1111', email: 'jenn@email.com', date: tomorrow, time: '7:00 PM', partySize: 4, seatingPreference: 'Patio', status: 'confirmed', occasion: 'Birthday', isVIP: false, createdAt: now },
    { name: 'The Richardson Group', phone: '(804) 555-2222', email: 'rich@corp.com', date: tomorrow, time: '8:00 PM', partySize: 12, seatingPreference: 'VIP Room', status: 'confirmed', occasion: 'Corporate', isVIP: true, createdAt: now },
    { name: 'Tom & Lisa', phone: '(804) 555-3333', email: 'tom@email.com', date: dayAfter, time: '6:30 PM', partySize: 2, seatingPreference: 'Bar', status: 'pending', occasion: 'Date Night', isVIP: false, createdAt: now },
    { name: 'Karaoke Night Crew', phone: '(804) 555-4444', email: 'crew@email.com', date: dayAfter, time: '9:00 PM', partySize: 8, seatingPreference: 'Indoor', status: 'pending', occasion: 'Fun', isVIP: false, createdAt: now },
  ];

  for (const booking of demoBookings) {
    await bookRef.add(booking);
  }
  console.log('✅ 4 demo reservations created');

  // ── 6. Demo orders (recent activity) ──
  console.log('\n🛒 Seeding demo orders...');
  const ordersRef = db.collection(`businesses/${BUSINESS_ID}/orders`);

  // Clear existing
  const existO = await ordersRef.get();
  if (existO.docs.length > 0) {
    const delBatch = db.batch();
    existO.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
  }

  const demoOrders = [
    {
      customerName: 'Marcus Johnson',
      customerEmail: 'marcus@email.com',
      customerPhone: '(804) 555-5555',
      items: [
        { name: 'Copper Old Fashioned', quantity: 2, price: 14 },
        { name: 'Loaded Nachos', quantity: 1, price: 14 },
        { name: 'Wings (12ct)', quantity: 1, price: 16 },
      ],
      subtotal: 58,
      tax: 3.48,
      total: 61.48,
      type: 'dine-in',
      status: 'completed',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      customerName: 'Emily Chen',
      customerEmail: 'emily@email.com',
      customerPhone: '(804) 555-6666',
      items: [
        { name: 'The Copper Tap Burger', quantity: 1, price: 16 },
        { name: 'Blue Moon', quantity: 2, price: 7 },
        { name: 'Loaded Fries', quantity: 1, price: 9 },
      ],
      subtotal: 39,
      tax: 2.34,
      total: 41.34,
      type: 'takeout',
      status: 'preparing',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      customerName: 'Demo Customer',
      customerEmail: 'customer@coppertap.demo',
      customerPhone: '(804) 555-7777',
      items: [
        { name: 'Espresso Martini', quantity: 2, price: 15 },
        { name: 'Pretzel Bites & Beer Cheese', quantity: 1, price: 11 },
      ],
      subtotal: 41,
      tax: 2.46,
      total: 43.46,
      type: 'dine-in',
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
  console.log('  🍺  THE COPPER TAP — DEMO BAR READY!');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  📍 URLs (live on mohnmenu.com after deploy):');
  console.log('');
  console.log('  🏠 Tenant Website:      /the-copper-tap');
  console.log('  📋 Menu Page:            /the-copper-tap/menu');
  console.log('  🛒 Order Page:           /order/the-copper-tap');
  console.log('  📅 Reservations:         /the-copper-tap/reserve');
  console.log('  🎵 Jukebox:              /the-copper-tap/jukebox');
  console.log('  🖥️  TV Display:           /the-copper-tap/now-playing');
  console.log('  📱 Kiosk Mode:           /the-copper-tap/kiosk');
  console.log('');
  console.log('  👤 Demo Login Accounts (all password: DemoPass123!)');
  console.log('');
  console.log('  Owner:      owner@coppertap.demo');
  console.log('  Bartender:  bartender@coppertap.demo');
  console.log('  Server:     server@coppertap.demo');
  console.log('  Driver:     driver@coppertap.demo');
  console.log('  Customer:   customer@coppertap.demo');
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
