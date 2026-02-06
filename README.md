# MohnMenu - Commission-Free Local Business Ordering Platform

**MohnMenu** is a modern, open-source ordering platform that empowers local restaurants, convenience stores, and small businesses to accept orders directly — keeping 100% of their revenue. No commissions. No middlemen.

## 🎯 Key Features

- **Zero Commission Model** - Keep 100% of every order
- **Multi-Payment Support** - Cards, Crypto (BTC, ETH, LTC, DOGE), Cash
- **Live Chef Cam** - HD kitchen streaming builds customer trust
- **GPS Fleet Tracking** - Sub-second delivery tracking with real-time updates
- **Multi-Tenant Architecture** - Single codebase serves unlimited businesses
- **Custom Domains** - Each business gets their own branded storefront
- **Order with Google** - Appear in Google Search and Maps
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Fraud Protection** - Built-in chargeback coverage
- **AI Analytics** - Smart insights into your business

## 📁 Monorepo Structure

```
/
├── restaurant-app/           # Next.js 16 web application
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── context/             # React context (Auth, Cart)
│   ├── lib/                 # Utilities & Firebase config
│   ├── public/              # Static assets
│   ├── functions/           # Firebase Cloud Functions
│   ├── dataconnect/         # Firebase Data Connect configs
│   └── package.json         # App dependencies
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│
├── docs/                    # Documentation
├── .gitignore              # Git exclusion rules
├── README.md               # This file
└── package.json            # Monorepo root config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (free tier works)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mohnmenu.git
cd mohnmenu

# Install dependencies
cd restaurant-app
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Install Firebase globally (optional, for CLI commands)
npm install -g firebase-tools

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Project Structure

### `restaurant-app/`

The main Next.js application containing:

- **`app/`** - Page routes and layouts
  - `/` - Marketing homepage
  - `/register` - Business registration
  - `/login` - Authentication
  - `/owner/` - Business owner dashboard
  - `/driver/` - Driver dashboard
  - `/customer/` - Customer dashboard
  - `/[businessSlug]/` - Dynamic tenant storefronts

- **`components/`** - Reusable React components
  - `Header.tsx` - Navigation header
  - `RealTimeMap.tsx` - Live delivery map
  - `ChefCameraStream.tsx` - Chef Cam streaming
  - `DriverApp.tsx` - Driver interface

- **`context/`** - React Context management
  - `AuthContext.tsx` - Multi-tenant authentication
  - `CartContext.tsx` - Shopping cart state

- **`lib/`** - Utilities and configurations
  - `firebase.ts` - Firebase SDK setup
  - `types.ts` - TypeScript type definitions
  - `realTimeTracking.ts` - GPS tracking service
  - `stripe/` - Stripe payment integration

- **`functions/`** - Firebase Cloud Functions
  - Stripe webhook handlers
  - Payment processing
  - Order notifications

## 🔑 Key Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion animations
- **Backend**: Firebase (Auth, Firestore, Realtime DB, Functions)
- **Payments**: Stripe, NOWPayments (crypto)
- **Maps**: Mapbox GL for live tracking
- **Video**: HLS.js for Chef Cam streaming
- **3D**: Three.js with React Three Fiber

## 📦 Environment Variables

Create a `.env.local` file in the `restaurant-app/` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Maps & Geo
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...

# Feature Flags
NEXT_PUBLIC_OWNER_SECRET_CODE=demo123

# NOWPayments (Crypto)
NOWPAYMENTS_API_KEY=your_api_key
```

## 🔐 Authentication

MohnMenu uses Firebase Authentication with a multi-tenant system:

- **Business Owners** - Create and manage their storefront
- **Drivers** - Accept and complete deliveries
- **Customers** - Browse menus and place orders
- **Admins** - Platform-wide management

Each user role has a dedicated dashboard with role-specific features.

## 🎬 Chef Cam (Live Kitchen Streaming)

The Chef Cam feature allows restaurants to stream their kitchen preparation live to customers:

```typescript
// Enable in owner dashboard
// Components:
// - ChefCameraStream.tsx - HLS stream viewer
// - Kitchen display system integration
// - Auto-trigger on order placement
// - Increases retention by 40%+
```

## 🚗 GPS Fleet Tracking

Real-time delivery tracking with sub-second GPS updates:

```typescript
// Features:
// - Firebase Realtime Database for ultra-low latency
// - Mapbox live map visualization
// - Automated driver routing
// - Customer tracking links
// - ETA calculations
```

## 📊 Data Architecture

### Multi-Tenant Setup

Each business operates in complete isolation:

```typescript
// Firestore structure
/businesses/{businessId}
  ├── /settings
  ├── /menu/{menuItemId}
  ├── /orders/{orderId}
  ├── /drivers/{driverId}
  └── /website (SEO data)

// Realtime Database
/tracking/{businessId}/{driverId}/location
```

### Security Rules

- Field-level access control via custom auth claims
- Business owners can only access their data
- Drivers can only see assigned orders
- Customers can only view their orders

## 🧪 Testing

```bash
cd restaurant-app

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🚀 Deployment

### Firebase App Hosting + GitHub Integration

MohnMenu uses **Firebase App Hosting** with automatic GitHub integration. No manual deployment commands needed!

**How it works:**
1. Push code to `main` branch on GitHub
2. GitHub Actions runs tests and builds the app
3. Firebase App Hosting automatically detects the changes
4. Auto-rollout creates a new deployment
5. Your app is live instantly

**Your Deployment URLs:**
- **Backend API**: `ordersystem--chinese-system.us-east4.hosted.app`
- **Custom Domain**: `mohnmenu.com`
- **Project ID**: `chinese-system`

### GitHub Actions Workflow

CI/CD pipeline in `.github/workflows/build.yml`:

1. **Build** - Installs dependencies, runs type-check
2. **Test** - Verifies TypeScript compilation
3. **Auto-Deploy** - Firebase App Hosting detects changes and deploys

**What you DON'T need to do:**
- ❌ Run `firebase deploy` manually
- ❌ Upload files to Firebase Hosting
- ❌ Manage deployment tokens in CI/CD

Just push to GitHub and Firebase handles the rest! ✅

Deployment status: ✅ **[AUTO FROM GITHUB]**

## 📖 Documentation

- [Architecture Guide](./restaurant-app/MULTI_TENANT_AUTH.md)
- [Setup Instructions](./restaurant-app/SETUP_GUIDE.md)
- [Deployment Checklist](./restaurant-app/DEPLOYMENT_CHECKLIST.md)
- [Real-Time Tracking](./restaurant-app/REALTIME_TRACKING_GUIDE.md)
- [API Reference](./docs/API.md) (Coming soon)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Create a Pull Request
6. Wait for review and merge

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

- **Email**: hello@mohnmenu.com
- **Phone**: (804) 605-1461
- **Issues**: [GitHub Issues](https://github.com/yourusername/mohnmenu/issues)

## 🎯 Roadmap

### Phase 1 ✅
- Landing pages
- Marketing content
- Pricing structure

### Phase 2 ✅
- Multi-tenant architecture
- Authentication system
- Role-based dashboards

### Phase 3 🚀 (Current)
- Chef Cam implementation
- GPS fleet tracking
- Order management

### Phase 4 ⏳
- Loyalty programs
- Advanced analytics
- White-label solutions

## 👥 Team

Built with ❤️ by Richard & the MohnMenu team

---

**Made with ❤️ for local businesses.**
