'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';

/** Reusable iOS-style toggle switch */
function Toggle({ checked, onChange, color = 'bg-emerald-500' }: { checked: boolean; onChange: () => void; color?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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

  const [thirdPartyDelivery, setThirdPartyDelivery] = useState({
    enabled: currentBusiness?.settings?.thirdPartyDelivery?.enabled ?? false,
    uberEatsUrl: currentBusiness?.settings?.thirdPartyDelivery?.uberEatsUrl || '',
    doordashUrl: currentBusiness?.settings?.thirdPartyDelivery?.doordashUrl || '',
    grubhubUrl: currentBusiness?.settings?.thirdPartyDelivery?.grubhubUrl || '',
    whiteLabel: currentBusiness?.settings?.thirdPartyDelivery?.whiteLabel ?? false,
    providers: currentBusiness?.settings?.thirdPartyDelivery?.providers || ['doordash', 'uber'],
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
            enabled: thirdPartyDelivery.enabled,
            whiteLabel: thirdPartyDelivery.whiteLabel,
            providers: thirdPartyDelivery.providers,
            uberEatsUrl: thirdPartyDelivery.uberEatsUrl || null,
            doordashUrl: thirdPartyDelivery.doordashUrl || null,
            grubhubUrl: thirdPartyDelivery.grubhubUrl || null,
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

      {/* ── Third-Party Delivery ────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Third-Party Delivery Partners
        </h2>
        <p className="text-xs text-zinc-400">
          Use DoorDash and Uber drivers for delivery — white-labeled under your brand. Customers see delivery options at checkout without being redirected. You can also add store links as a fallback.
        </p>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="font-bold text-black text-sm">Enable Third-Party Delivery</span>
            <p className="text-xs text-zinc-400">Offer DoorDash / Uber delivery alongside your own drivers</p>
          </div>
          <Toggle checked={thirdPartyDelivery.enabled} onChange={() => setThirdPartyDelivery(p => ({ ...p, enabled: !p.enabled }))} />
        </label>

        {thirdPartyDelivery.enabled && (
          <div className="space-y-5 pt-2">
            {/* White-label toggle */}
            <label className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
              <div>
                <span className="font-bold text-black text-sm">⚡ White-Label Delivery API</span>
                <p className="text-xs text-zinc-500">Use DoorDash Drive & Uber Direct APIs — customers see delivery options at checkout, no redirects. Powered by third-party drivers under your brand.</p>
              </div>
              <div className="shrink-0 ml-4">
                <Toggle checked={thirdPartyDelivery.whiteLabel} onChange={() => setThirdPartyDelivery(p => ({ ...p, whiteLabel: !p.whiteLabel }))} color="bg-orange-500" />
              </div>
            </label>

            {thirdPartyDelivery.whiteLabel && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-zinc-600">Delivery Providers</p>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Coming Soon</span>
                </div>
                <div className="flex gap-3">
                  {(['doordash', 'uber'] as const).map((p) => (
                    <div
                      key={p}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-60"
                    >
                      {p === 'doordash' ? '🔴 DoorDash' : '⬛ Uber'}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-amber-600 font-medium">
                  ⏳ DoorDash Drive & Uber Direct APIs are awaiting approval. Once approved, professional drivers will be available at checkout. Community Couriers are fully operational now!
                </p>
              </div>
            )}

            {/* Fallback store links */}
            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <p className="text-xs font-bold text-zinc-500">📎 Fallback Store Links (optional)</p>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">🟢 Uber Eats Store URL</label>
                <input
                  type="url"
                  value={thirdPartyDelivery.uberEatsUrl}
                  onChange={e => setThirdPartyDelivery(p => ({ ...p, uberEatsUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://www.ubereats.com/store/your-restaurant/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">🔴 DoorDash Store URL</label>
                <input
                  type="url"
                  value={thirdPartyDelivery.doordashUrl}
                  onChange={e => setThirdPartyDelivery(p => ({ ...p, doordashUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://www.doordash.com/store/your-restaurant/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">🟠 Grubhub Store URL</label>
                <input
                  type="url"
                  value={thirdPartyDelivery.grubhubUrl}
                  onChange={e => setThirdPartyDelivery(p => ({ ...p, grubhubUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://www.grubhub.com/restaurant/your-restaurant/..."
                />
              </div>
            </div>
          </div>
        )}
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
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
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
              <p className="font-bold text-amber-800 text-sm">Crypto Payments Active</p>
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

      {/* ── Subscription Info (read-only) ───────────────────── */}
      <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
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

  // Check status on mount if we have an account
  useEffect(() => {
    if (!accountId) return;
    setChecking(true);
    authFetch(`/api/stripe/connect-account?accountId=${accountId}`)
      .then(r => r.json())
      .then(data => {
        if (data.chargesEnabled !== undefined) setStatus(data);
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
        // Save to Firestore
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

  const isConnected = status?.chargesEnabled && status?.payoutsEnabled;

  return (
    <section className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
      <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
        Payments — Stripe Connect
      </h2>

      {checking ? (
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
          Checking payment status...
        </div>
      ) : isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">Stripe Connected</span>
          </div>
          <p className="text-xs text-zinc-400">
            Account: {accountId.slice(0, 12)}... · Payments and payouts enabled.
          </p>
          <button
            onClick={handleDashboard}
            className="bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            Open Stripe Dashboard
          </button>
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
