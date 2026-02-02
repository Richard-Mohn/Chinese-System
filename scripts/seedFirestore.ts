import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Check if serviceAccountKey.json exists
const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    'Error: serviceAccountKey.json not found. Please follow these steps:\n' +
    '1. Go to Firebase Console -> Project settings -> Service accounts.\n' +
    '2. Click "Generate new private key" and download the JSON file.\n' +
    '3. Rename the downloaded file to "serviceAccountKey.json".\n' +
    '4. Place "serviceAccountKey.json" in the root of your "restaurant-app" directory.\n' +
    '   (i.e., C:\\Users\\richa\\projects\\chinesesite\\restaurant-app\\serviceAccountKey.json)'
  );
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Path to your menu.json file
const menuDataPath = resolve(__dirname, '../data/menu.json');

if (!fs.existsSync(menuDataPath)) {
  console.error(`Error: menu.json not found at ${menuDataPath}.`);
  process.exit(1);
}

// Read menu data
const menuItems = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));

const seedFirestore = async () => {
  console.log('Starting Firestore seeding...');
  const collectionRef = db.collection('menuItems');

  // Use a batch for efficiency if there are many items
  const batch = db.batch();
  
  for (const item of menuItems) {
    try {
      const docRef = collectionRef.doc(item.id);
      // Ensure basic structure for UI compatibility
      const itemToSave = {
        ...item,
        availability: true, // Default to true if not specified
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      batch.set(docRef, itemToSave, { merge: true });
      console.log(`Prepared: ${item.name} (ID: ${item.id})`);
    } catch (error) {
      console.error(`Failed to prepare menu item ${item.name}:`, error);
    }
  }

  try {
    await batch.commit();
    console.log('Firestore seeding complete! All items uploaded/updated.');
  } catch (error) {
    console.error('Error committing batch to Firestore:', error);
  }
  
  process.exit(0);
};

seedFirestore();
