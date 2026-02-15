'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';
import { FEATURE_REGISTRY, tierMeetsRequirement } from '@/lib/tier-features';
import Link from 'next/link';

/** Reusable iOS-style toggle switch */
function Toggle({ checked, onChange, color = 'bg-emerald-500' }: { checked: boolean; onChange: () => void; color?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle setting"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black ${
        checked ? color : 'bg-zinc-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function OwnerSettingsPage() {
  const { currentBusiness } = useAuth();
  const managedSupportEntitled = tierMeetsRequirement(
    currentBusiness?.tier,
    FEATURE_REGISTRY['managed-support'].minTier,
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable settings state
  const [settings, setSettings] = useState({
    orderingEnabled: currentBusiness?.settings?.orderingEnabled ?? true,
    deliveryFee: currentBusiness?.settings?.pricing?.deliveryFee ?? 3.99,
    minimumOrder: currentBusiness?.settings?.pricing?.minimumOrder ?? 15,
    taxRate: currentBusiness?.settings?.pricing?.taxRate ?? 0.07,
    primaryColor: currentBusiness?.settings?.primaryColor || '#000000',
    logoUrl: currentBusiness?.settings?.logoUrl || '',
    cashPaymentsEnabled: currentBusiness?.settings?.cashPaymentsEnabled ?? true,
    useMarketplaceDrivers: currentBusiness?.settings?.useMarketplaceDrivers ?? false,
    showMenuStats: currentBusiness?.settings?.showMenuStats ?? false,
    inventoryEnabled: currentBusiness?.settings?.inventoryEnabled ?? false,
    flashSalesEnabled: currentBusiness?.settings?.flashSalesEnabled ?? false,
  });

  const [courierDelivery, setCourierDelivery] = useState({
    enabled: currentBusiness?.settings?.courierDelivery?.enabled ?? false,
    radiusMiles: currentBusiness?.settings?.courierDelivery?.radiusMiles ?? 2,
    maxRadiusMiles: currentBusiness?.settings?.courierDelivery?.maxRadiusMiles ?? 3,
  });

  const [marketplaceListings, setMarketplaceListings] = useState({
    uberEatsUrl: currentBusiness?.settings?.thirdPartyDelivery?.uberEatsUrl || '',
    doordashUrl: currentBusiness?.settings?.thirdPartyDelivery?.doordashUrl || '',
    grubhubUrl: currentBusiness?.settings?.thirdPartyDelivery?.grubhubUrl || '',
  });

  const [businessInfo, setBusinessInfo] = useState({
    name: currentBusiness?.name || '',
    description: currentBusiness?.description || '',
    address: currentBusiness?.address || '',
    city: currentBusiness?.city || '',
    state: currentBusiness?.state || '',
    zipCode: currentBusiness?.zipCode || '',
    businessPhone: currentBusiness?.businessPhone || '',
    ownerEmail: currentBusiness?.ownerEmail || '',
    ownerPhone: currentBusiness?.ownerPhone || '',
  });

  const [brandColors, setBrandColors] = useState({
    primary: currentBusiness?.brandColors?.primary || '#4F46E5',
    secondary: currentBusiness?.brandColors?.secondary || '#9333EA',
    accent: currentBusiness?.brandColors?.accent || '#10B981',
  });

  const handleSave = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    setMessage('');

    try {
      const businessRef = doc(db, 'businesses', currentBusiness.businessId);
      await updateDoc(businessRef, {
        name: businessInfo.name,
        description: businessInfo.description,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        businessPhone: businessInfo.businessPhone,
        ownerEmail: businessInfo.ownerEmail,
        ownerPhone: businessInfo.ownerPhone,
        brandColors,
        settings: {
          orderingEnabled: settings.orderingEnabled,
          primaryColor: settings.primaryColor,
          logoUrl: settings.logoUrl || null,
          pricing: {
            deliveryFee: parseFloat(settings.deliveryFee as unknown as string) || 0,
            minimumOrder: parseFloat(settings.minimumOrder as unknown as string) || 0,
            taxRate: parseFloat(settings.taxRate as unknown as string) || 0,
          },
          cashPaymentsEnabled: settings.cashPaymentsEnabled,
          useMarketplaceDrivers: settings.useMarketplaceDrivers,
          showMenuStats: settings.showMenuStats,
          inventoryEnabled: settings.inventoryEnabled,
          flashSalesEnabled: settings.flashSalesEnabled,
          courierDelivery: {
            enabled: courierDelivery.enabled,
            radiusMiles: courierDelivery.radiusMiles,
            maxRadiusMiles: courierDelivery.maxRadiusMiles,
          },
          thirdPartyDelivery: {
            enabled: false,
            uberEatsUrl: marketplaceListings.uberEatsUrl || null,
            doordashUrl: marketplaceListings.doordashUrl || null,
            grubhubUrl: marketplaceListings.grubhubUrl || null,
          },
        },
        updatedAt: new Date().toISOString(),
      });

      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!currentBusiness) return null;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-black">Settings</h1>
        <p className="text-zinc-400 font-medium mt-1">
          Configure your business profile, pricing, and branding.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold ${
            message.startsWith('Error')
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {message}
        </div>
      )}

      {/* ── Business Info ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Business Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-name" className="block text-xs font-bold text-zinc-500 mb-1">Business Name</label>
            <input
              id="settings-name"
              type="text"
              value={businessInfo.name}
              onChange={e => setBusinessInfo(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Phone</label>
            <input
              type="text"
              value={businessInfo.businessPhone}
              onChange={e => setBusinessInfo(p => ({ ...p, businessPhone: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="(804) 555-1234"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-1">Description</label>
          <textarea
            value={businessInfo.description}
            onChange={e => setBusinessInfo(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
            placeholder="A short description of your business..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-address" className="block text-xs font-bold text-zinc-500 mb-1">Address</label>
            <input
              id="settings-address"
              type="text"
              value={businessInfo.address}
              onChange={e => setBusinessInfo(p => ({ ...p, address: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="settings-city" className="block text-xs font-bold text-zinc-500 mb-1">City</label>
              <input
                id="settings-city"
                type="text"
                value={businessInfo.city}
                onChange={e => setBusinessInfo(p => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="settings-state" className="block text-xs font-bold text-zinc-500 mb-1">State</label>
              <input
                id="settings-state"
                type="text"
                value={businessInfo.state}
                onChange={e => setBusinessInfo(p => ({ ...p, state: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label htmlFor="settings-zip" className="block text-xs font-bold text-zinc-500 mb-1">ZIP</label>
              <input
                id="settings-zip"
                type="text"
                value={businessInfo.zipCode}
                onChange={e => setBusinessInfo(p => ({ ...p, zipCode: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-email" className="block text-xs font-bold text-zinc-500 mb-1">Owner Email</label>
            <input
              id="settings-email"
              type="email"
              value={businessInfo.ownerEmail}
              onChange={e => setBusinessInfo(p => ({ ...p, ownerEmail: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="settings-ownerphone" className="block text-xs font-bold text-zinc-500 mb-1">Owner Phone</label>
            <input
              id="settings-ownerphone"
              type="text"
              value={businessInfo.ownerPhone}
              onChange={e => setBusinessInfo(p => ({ ...p, ownerPhone: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </section>

      {/* ── Ordering & Pricing ──────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Ordering & Pricing
        </h2>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Online Ordering</span>
            <p className="text-xs text-zinc-400">Allow customers to place orders on your website</p>
          </div>
          <Toggle checked={settings.orderingEnabled} onChange={() => setSettings(p => ({ ...p, orderingEnabled: !p.orderingEnabled }))} />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Accept Cash Payments</span>
            <p className="text-xs text-zinc-400">When off, customers must pay by card before you start cooking</p>
          </div>
          <Toggle checked={settings.cashPaymentsEnabled} onChange={() => setSettings(p => ({ ...p, cashPaymentsEnabled: !p.cashPaymentsEnabled }))} />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Show Order Stats on Menu</span>
            <p className="text-xs text-zinc-400">Display order counts and ratings on your public menu page</p>
          </div>
          <Toggle checked={settings.showMenuStats} onChange={() => setSettings(p => ({ ...p, showMenuStats: !p.showMenuStats }))} />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Enable Inventory Tracking</span>
            <p className="text-xs text-zinc-400">Track stock for items like baked goods, daily specials, etc.</p>
          </div>
          <Toggle checked={settings.inventoryEnabled} onChange={() => setSettings(p => ({ ...p, inventoryEnabled: !p.inventoryEnabled }))} />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="settings-deliveryfee" className="block text-xs font-bold text-zinc-500 mb-1">Delivery Fee ($)</label>
            <input
              id="settings-deliveryfee"
              type="number"
              step="0.01"
              min="0"
              value={settings.deliveryFee}
              onChange={e => setSettings(p => ({ ...p, deliveryFee: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="settings-minorder" className="block text-xs font-bold text-zinc-500 mb-1">Minimum Order ($)</label>
            <input
              id="settings-minorder"
              type="number"
              step="0.01"
              min="0"
              value={settings.minimumOrder}
              onChange={e => setSettings(p => ({ ...p, minimumOrder: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={settings.taxRate}
              onChange={e => setSettings(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="0.07 = 7%"
            />
          </div>
        </div>
      </section>

      {/* ── Branding ────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Branding
        </h2>

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-1">Logo URL</label>
          <input
            type="text"
            value={settings.logoUrl}
            onChange={e => setSettings(p => ({ ...p, logoUrl: e.target.value }))}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="https://your-logo-url.com/logo.png"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'accent', label: 'Accent' },
          ].map(color => (
            <div key={color.key}>
              <label className="block text-xs font-bold text-zinc-500 mb-1">{color.label}</label>
              <div className="flex items-center gap-2">
                <input
                  title={color.label + ' color'}
                  type="color"
                  value={brandColors[color.key as keyof typeof brandColors]}
                  onChange={e =>
                    setBrandColors(p => ({ ...p, [color.key]: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer"
                />
                <input
                  title={color.label + ' hex value'}
                  type="text"
                  value={brandColors[color.key as keyof typeof brandColors]}
                  onChange={e =>
                    setBrandColors(p => ({ ...p, [color.key]: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── External Marketplace Listings ───────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          External Marketplace Listings
        </h2>
        <p className="text-xs text-zinc-400">
          Keep your existing marketplace storefront links on file. MohnMenu does not connect to or modify Uber Eats, DoorDash, or Grubhub APIs.
        </p>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">🟢 Uber Eats Store URL</label>
            <input
              type="url"
              value={marketplaceListings.uberEatsUrl}
              onChange={e => setMarketplaceListings(p => ({ ...p, uberEatsUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://www.ubereats.com/store/your-restaurant/..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">🔴 DoorDash Store URL</label>
            <input
              type="url"
              value={marketplaceListings.doordashUrl}
              onChange={e => setMarketplaceListings(p => ({ ...p, doordashUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://www.doordash.com/store/your-restaurant/..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">🟠 Grubhub Store URL</label>
            <input
              type="url"
              value={marketplaceListings.grubhubUrl}
              onChange={e => setMarketplaceListings(p => ({ ...p, grubhubUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://www.grubhub.com/restaurant/your-restaurant/..."
            />
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Customers can still use those marketplace apps directly. Starting a MohnMenu trial does not change your existing listings.
          </p>
        </div>
      </section>

      {/* ── Community Courier Delivery ──────────────────────── */}
      <section className="bg-white rounded-2xl border border-emerald-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600">
          🚴 Community Courier Delivery
        </h2>
        <p className="text-xs text-zinc-400">
          Enable community couriers — independent walkers, bikers, and scooter riders — to deliver your orders within a short radius. MohnMenu takes just $0.25 per order. No contracts, no minimum volume.
        </p>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Enable Community Couriers</span>
            <p className="text-xs text-zinc-400">Allow nearby couriers to pick up and deliver your orders</p>
          </div>
          <Toggle checked={courierDelivery.enabled} onChange={() => setCourierDelivery(p => ({ ...p, enabled: !p.enabled }))} />
        </label>

        {courierDelivery.enabled && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2">Delivery Radius: {courierDelivery.radiusMiles} miles</label>
              <input
                title="Delivery radius in miles"
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={courierDelivery.radiusMiles}
                onChange={e => setCourierDelivery(p => ({ ...p, radiusMiles: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>0.5 mi</span>
                <span>2 mi (recommended)</span>
                <span>5 mi</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-700 font-medium">
                🚴 Couriers within {courierDelivery.radiusMiles} miles of your business will see your delivery orders. The platform fee is just <strong>$0.25 per delivery</strong> — far less than DoorDash or Uber Eats. Couriers sign up at <strong>/signup/courier</strong>.
              </p>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-black text-sm">Enable Flash Sales</span>
                <p className="text-xs text-zinc-400">Allow time-limited sale prices on menu items</p>
              </div>
              <Toggle checked={settings.flashSalesEnabled} onChange={() => setSettings(p => ({ ...p, flashSalesEnabled: !p.flashSalesEnabled }))} color="bg-orange-500" />
            </label>
          </div>
        )}
      </section>

      {/* ── Driver Marketplace ──────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          MohnMenu Driver Marketplace
        </h2>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Use Marketplace Drivers</span>
            <p className="text-xs text-zinc-400">
              Don&apos;t have your own drivers? Turn this on to request deliveries from MohnMenu&apos;s shared driver pool. 
              Other restaurants on the platform share their drivers when available.
            </p>
          </div>
          <Toggle checked={settings.useMarketplaceDrivers} onChange={() => setSettings(p => ({ ...p, useMarketplaceDrivers: !p.useMarketplaceDrivers }))} />
        </label>

        {settings.useMarketplaceDrivers && (
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-700 font-medium">
              🚗 When a delivery order comes in and you don&apos;t have an available in-house driver, 
              MohnMenu will broadcast the delivery to marketplace drivers in your area. 
              Standard marketplace delivery fee applies.
            </p>
          </div>
        )}
      </section>

      {/* ── Stripe Connect (Payments) ───────────────────────── */}
      <StripeConnectSection
        businessId={currentBusiness.businessId}
        businessName={currentBusiness.name}
        ownerEmail={currentBusiness.ownerEmail || businessInfo.ownerEmail}
        stripeAccountId={currentBusiness.stripeAccountId}
      />

      {/* ── Crypto Payments ────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Crypto Payments
        </h2>
        <p className="text-xs text-zinc-400">
          Accept BTC, ETH, USDC, SOL and 100+ cryptocurrencies with 0% processing fees.
          Payments are collected in your custody account and credited automatically.
          Withdraw anytime to your own wallet (1% or $2 min withdrawal fee).
        </p>

        {/* Crypto balance */}
        <div className="bg-linear-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Crypto Balance</p>
              <p className="text-2xl font-black text-black mt-1">
                ${(currentBusiness.cryptoBalance || 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-orange-600 mt-0.5">Available for withdrawal</p>
            </div>
            <div className="text-3xl">₿</div>
          </div>
        </div>

        {/* Custody account status */}
        {currentBusiness.nowPaymentsCustomerId ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
            <span className="text-emerald-600 text-lg">✓</span>
            <div>
              <p className="font-bold text-emerald-800 text-sm">Custody Account Active</p>
              <p className="text-[10px] text-emerald-600">
                Account ID: {currentBusiness.nowPaymentsCustomerId} · Inline crypto checkout enabled
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
            <span className="text-amber-600 text-lg">⏳</span>
            <div>
            aria-checked={checked}
              <p className="text-[10px] text-amber-600">
                Custody account will be created automatically on first crypto order.
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-zinc-400 bg-zinc-50 rounded-xl p-3">
          <p className="font-bold text-zinc-500 mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Customer selects their coin &amp; sees deposit address inline</li>
            <li>They send crypto directly — no redirects, fully white-label</li>
            <li>Payment is confirmed automatically via webhook</li>
            <li>Your crypto balance is credited in real-time</li>
            <li>Withdraw to your own wallet anytime</li>
          </ol>
        </div>
      </section>

      {/* ── Subscription Info ───────────────────────────────── */}
      <section id="subscription" className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Subscription
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Plan', value: currentBusiness.tier?.toUpperCase() || 'FREE' },
            { label: 'Status', value: currentBusiness.subscriptionStatus || '—' },
            { label: 'Max Drivers', value: String(currentBusiness.maxInhouseDrivers || 0) },
            { label: 'Business ID', value: currentBusiness.businessId?.slice(0, 8) || '—' },
          ].map(item => (
            <div key={item.label} className="bg-zinc-50 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</p>
              <p className="font-bold text-black text-sm mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-xl border p-3 ${managedSupportEntitled ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-50 border-zinc-100'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Managed Support</p>
          <p className={`font-bold text-sm mt-1 ${managedSupportEntitled ? 'text-emerald-700' : 'text-zinc-600'}`}>
            {managedSupportEntitled ? 'Included with your current tier' : 'Upgrade to Growth or Professional to enable'}
          </p>
        </div>

        {/* Subscription Actions */}
        <div className="border-t border-zinc-100 pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-black text-sm">Change Plan</p>
              <p className="text-xs text-zinc-400">
                Upgrade or downgrade your subscription tier.
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
            >
              View Plans
            </Link>
          </div>

          {currentBusiness.tier && currentBusiness.tier !== 'free' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
              <div>
                <p className="font-bold text-red-800 text-sm">Cancel Subscription</p>
                <p className="text-xs text-red-500">
                  You&apos;ll keep access until the end of your billing period. After that, your account will revert to Free.
                </p>
              </div>
              <SubscriptionBillingActions businessId={currentBusiness.businessId} />
            </div>
          )}
        </div>
      </section>

      {/* ── Danger Zone ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-red-400">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-black text-sm">Deactivate Business</p>
            <p className="text-xs text-zinc-400">
              Temporarily hide your website and stop accepting orders.
            </p>
          </div>
          <button className="px-6 py-2.5 border-2 border-red-200 text-red-600 rounded-full text-sm font-bold hover:bg-red-50 transition-colors">
            Deactivate
          </button>
        </div>
      </section>

      {/* ── Save Button ─────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

// ── Stripe Connect Section ────────────────────────────────────

function StripeConnectSection({
  businessId,
  businessName,
  ownerEmail,
  stripeAccountId,
}: {
  businessId: string;
  businessName: string;
  ownerEmail: string;
  stripeAccountId?: string;
}) {
  const [accountId, setAccountId] = useState(stripeAccountId || '');
  const [status, setStatus] = useState<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [balance, setBalance] = useState<{ availableCents: number; pendingCents: number } | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showTab, setShowTab] = useState<'overview' | 'payments' | 'payouts'>('overview');

  // Check status + balance on mount if we have an account
  useEffect(() => {
    if (!accountId) return;
    setChecking(true);
    Promise.all([
      authFetch(`/api/stripe/connect-account?accountId=${accountId}`).then(r => r.json()),
      authFetch(`/api/stripe/connect-account?accountId=${accountId}&action=balance`).then(r => r.json()),
      authFetch(`/api/stripe/connect-account?accountId=${accountId}&action=payments`).then(r => r.json()),
      authFetch(`/api/stripe/connect-account?accountId=${accountId}&action=payouts`).then(r => r.json()),
    ])
      .then(([statusData, balanceData, paymentsData, payoutsData]) => {
        if (statusData.chargesEnabled !== undefined) setStatus(statusData);
        if (balanceData.availableCents !== undefined) setBalance(balanceData);
        if (paymentsData.payments) setPayments(paymentsData.payments);
        if (payoutsData.payouts) setPayouts(payoutsData.payouts);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [accountId]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/stripe/connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'owner',
          businessId,
          businessName,
          email: ownerEmail,
        }),
      });
      const data = await res.json();
      if (data.accountId) {
        await updateDoc(doc(db, 'businesses', businessId), {
          stripeAccountId: data.accountId,
        });
        setAccountId(data.accountId);
      }
      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
      }
    } catch {
      alert('Failed to start Stripe onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = async () => {
    if (!accountId) return;
    try {
      const res = await authFetch(`/api/stripe/connect-account?accountId=${accountId}&action=dashboard`);
      const data = await res.json();
      if (data.dashboardUrl) window.open(data.dashboardUrl, '_blank');
    } catch {
      alert('Failed to open Stripe dashboard');
    }
  };

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isConnected = status?.chargesEnabled && status?.payoutsEnabled;

  return (
    <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
      <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
        Payments — Stripe Connect
      </h2>

      {checking ? (
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
          Loading payment data...
        </div>
      ) : isConnected ? (
        <div className="space-y-5">
          {/* Status + Dashboard link */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-bold text-emerald-700 text-sm">Stripe Connected</span>
              <span className="text-[10px] text-zinc-400 ml-1">{accountId.slice(0, 12)}...</span>
            </div>
            <button
              onClick={handleDashboard}
              className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              Open Stripe Dashboard
            </button>
          </div>

          {/* Balance cards */}
          {balance && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Available</p>
                <p className="text-2xl font-black text-emerald-900">{fmt(balance.availableCents)}</p>
                <p className="text-[10px] text-emerald-600 mt-1">Ready to pay out</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Pending</p>
                <p className="text-2xl font-black text-amber-900">{fmt(balance.pendingCents)}</p>
                <p className="text-[10px] text-amber-600 mt-1">Processing (1-2 days)</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
            {(['overview', 'payments', 'payouts'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setShowTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                  showTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'payments' ? `Payments (${payments.length})` : `Payouts (${payouts.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {showTab === 'overview' && (
            <div className="space-y-3">
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-zinc-600">Payment Flow</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="px-2 py-0.5 bg-white border rounded-lg">Customer pays</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-white border rounded-lg">Stripe processes</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-700 font-bold">You receive 99%</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2">
                  MohnMenu keeps a 1% platform fee. Stripe charges ~2.9% + $0.30 processing fee. Payouts are daily.
                </p>
              </div>
              {payments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-zinc-500 mb-2">Latest Payment</p>
                  <div className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black text-sm">{fmt(payments[0].amount)}</p>
                      <p className="text-[10px] text-zinc-400">{fmtDate(payments[0].created)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      payments[0].status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {payments[0].status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {showTab === 'payments' && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {payments.length === 0 ? (
                <p className="text-center text-sm text-zinc-400 py-8">No payments yet</p>
              ) : payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-bold text-black text-sm">{fmt(p.amount)}</p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {p.description || p.receiptEmail || p.id.slice(0, 20)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      p.status === 'succeeded' ? 'bg-emerald-100 text-emerald-700'
                      : p.status === 'pending' ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1">{fmtDate(p.created)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showTab === 'payouts' && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {payouts.length === 0 ? (
                <p className="text-center text-sm text-zinc-400 py-8">No payouts yet — payments arrive daily</p>
              ) : payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-bold text-black text-sm">{fmt(p.amount)}</p>
                    <p className="text-[10px] text-zinc-400">
                      Arrives {fmtDate(p.arrivalDate)} · {p.method}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-700'
                      : p.status === 'in_transit' ? 'bg-blue-100 text-blue-700'
                      : p.status === 'pending' ? 'bg-amber-100 text-amber-700'
                      : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {p.status === 'in_transit' ? 'In Transit' : p.status}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1">{fmtDate(p.created)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : accountId ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-700 text-sm">Onboarding Incomplete</span>
          </div>
          <p className="text-xs text-zinc-400">
            Your Stripe account setup isn&apos;t finished. Complete onboarding to accept payments.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Loading...' : 'Complete Stripe Onboarding'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">
            Connect your Stripe account to accept online payments. MohnMenu charges a 1% platform fee per order.
            The rest goes directly to your account.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Setting Up...' : 'Connect with Stripe'}
          </button>
        </div>
      )}
    </section>
  );
}

// ── Subscription Billing Actions ──────────────────────────────

function SubscriptionBillingActions({ businessId }: { businessId: string }) {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [subscriptionState, setSubscriptionState] = useState<{
    hasSubscription: boolean;
    subscriptionStatus: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    cancelAt: string | null;
  }>({
    hasSubscription: false,
    subscriptionStatus: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    cancelAt: null,
  });

  const loadStatus = async () => {
    setLoadingStatus(true);
    setStatusError('');
    try {
      const res = await authFetch(`/api/billing/subscription-status?businessId=${businessId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load billing status');
      }

      setSubscriptionState({
        hasSubscription: data.hasSubscription === true,
        subscriptionStatus: typeof data.subscriptionStatus === 'string' ? data.subscriptionStatus : null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
        currentPeriodEnd: typeof data.currentPeriodEnd === 'string' ? data.currentPeriodEnd : null,
        cancelAt: typeof data.cancelAt === 'string' ? data.cancelAt : null,
      });
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to load billing status');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [businessId]);

  const handleOpenPortal = async () => {
    setOpeningPortal(true);
    setStatusError('');
    try {
      const res = await authFetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to open billing portal');
      }

      window.open(data.url, '_blank');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setStatusError('');
    try {
      const res = await authFetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to cancel subscription');
      }

      setSubscriptionState(prev => ({
        ...prev,
        hasSubscription: true,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
        currentPeriodEnd: typeof data.currentPeriodEnd === 'string' ? data.currentPeriodEnd : prev.currentPeriodEnd,
        cancelAt: typeof data.cancelAt === 'string' ? data.cancelAt : prev.cancelAt,
        subscriptionStatus: 'cancelling',
      }));
      setConfirmingCancel(false);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formattedCancelDate = subscriptionState.cancelAt
    ? new Date(subscriptionState.cancelAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full sm:w-auto space-y-2">
      {loadingStatus ? (
        <p className="text-xs text-zinc-500">Loading billing status…</p>
      ) : (
        <>
          {subscriptionState.hasSubscription ? (
            <p className="text-[11px] text-zinc-600">
              Stripe status: <span className="font-bold uppercase">{subscriptionState.subscriptionStatus || 'unknown'}</span>
              {subscriptionState.cancelAtPeriodEnd && formattedCancelDate
                ? ` · Cancels on ${formattedCancelDate}`
                : ''}
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">No active Stripe subscription is linked yet.</p>
          )}

          {statusError && (
            <p className="text-[11px] font-bold text-red-600">{statusError}</p>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenPortal}
              disabled={openingPortal}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {openingPortal ? 'Opening…' : 'Manage Billing'}
            </button>

            {subscriptionState.hasSubscription && !subscriptionState.cancelAtPeriodEnd && !confirmingCancel && (
              <button
                onClick={() => setConfirmingCancel(true)}
                className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
              >
                Cancel Plan
              </button>
            )}

            {subscriptionState.cancelAtPeriodEnd && (
              <div className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold">
                Cancellation Scheduled
              </div>
            )}
          </div>

          {confirmingCancel && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
              <button
                onClick={() => setConfirmingCancel(false)}
                className="px-4 py-2 bg-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-300 transition-colors"
              >
                Keep Plan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
