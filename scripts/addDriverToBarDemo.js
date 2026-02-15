/**
 * Add driver James to The Copper Tap business drivers subcollection
 * Run with: node scripts/addDriverToBarDemo.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Init Firebase Admin
const serviceAccount = require(path.resolve(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chinese-system-default-rtdb.firebaseio.com',
  });
}

const db = admin.firestore();

const BUSINESS_ID = 'demo-the-copper-tap';
const DRIVER_UID = 'FUCJrEKF24Wnx2NbttujmEXGOLr1'; // From seedBarDemo output
const DRIVER_EMAIL = 'driver@coppertap.demo';

async function addDriver() {
  console.log('🚗 Adding James Kowalski to The Copper Tap drivers...\n');

  const now = new Date().toISOString();
  const driverId = 'driver-james-kowalski';

  const driverData = {
    driverId: driverId,
    userId: DRIVER_UID,
    businessId: BUSINESS_ID,
    name: 'James Kowalski',
    email: DRIVER_EMAIL,
    phone: '(804) 555-3456',
    driverType: 'inhouse',
    status: 'offline',
    rating: 5.0,
    totalDeliveries: 12,
    totalEarnings: 185.50,
    acceptanceRate: 100,
    cancellationRate: 0,
    backgroundCheckStatus: 'approved',
    licenseVerified: true,
    insuranceVerified: true,
    activeLocationIds: [BUSINESS_ID],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.doc(`businesses/${BUSINESS_ID}/drivers/${driverId}`).set(driverData);
    console.log('✅ Driver James Kowalski added to The Copper Tap!');
    console.log(`   ID: ${driverId}`);
    console.log(`   UserID: ${DRIVER_UID}`);
    console.log(`   Email: ${DRIVER_EMAIL}`);
    console.log(`   Background Check: Approved ✓`);
    console.log(`   License: Verified ✓`);
    console.log('\n✨ Owner can now see James in the driver dashboard at /owner/drivers');
  } catch (error) {
    console.error('❌ Error adding driver:', error);
  }

  process.exit(0);
}

addDriver();
