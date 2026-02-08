'use client';

import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { useState, useEffect, useCallback } from 'react';
import { MohnMenuBusiness } from '@/lib/types';

// Competitor prices for comparison (retail .com/yr)
const COMPETITOR_PRICES = [
  { name: 'GoDaddy', price: '$22.99', savings: '$8.00' },
  { name: 'Namecheap', price: '$15.98', savings: '$0.99' },
  { name: 'Squarespace', price: '$20.00', savings: '$5.01' },
  { name: 'Hostinger', price: '$15.99', savings: '$1.00' },
];
const OUR_PRICE = '$14.99';

interface DomainResult {
  domain: string;
  available: boolean;
  price: number;
  totalPrice: number;
  markup: number;
  currency: string;
  period: number;
}

interface DomainPurchaseState {
  step: 'search' | 'contact' | 'payment' | 'purchasing' | 'success' | 'error';
  selectedDomain: DomainResult | null;
  contact: {
    nameFirst: string;
    nameLast: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    organization: string;
  };
  error: string;
  orderId: number | null;
}

export default function DomainManager({ business }: { business: MohnMenuBusiness }) {
  const { user } = useAuth();

  // Domain acquisition mode: 'purchase' or 'connect'
  const [mode, setMode] = useState<'purchase' | 'connect'>('purchase');

  // Connect existing domain state
  const [existingDomainInput, setExistingDomainInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<Array<{ type: string; name: string; value: string; note: string }>>([]);
  const [verifying, setVerifying] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [purchaseState, setPurchaseState] = useState<DomainPurchaseState>({
    step: 'search',
    selectedDomain: null,
    contact: {
      nameFirst: '',
      nameLast: '',
      email: user?.email || '',
      phone: business?.businessPhone || business?.ownerPhone || '',
      address1: business?.address || '',
      address2: '',
      city: business?.city || '',
      state: business?.state || '',
      postalCode: business?.zipCode || '',
      country: 'US',
      organization: business?.name || '',
    },
    error: '',
    orderId: null,
  });

  // Current domain info
  const existingDomain = business?.website?.customDomain;
  const domainPurchased = business?.website?.domainPurchased;
  const domainStatus = business?.website?.domainStatus;
  const dnsConfigured = business?.website?.dnsConfigured;

  // Populate contact from business data
  useEffect(() => {
    if (business) {
      setPurchaseState(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          email: user?.email || prev.contact.email,
          phone: business.businessPhone || business.ownerPhone || prev.contact.phone,
          organization: business.name || prev.contact.organization,
          address1: business.address || prev.contact.address1,
          city: business.city || prev.contact.city,
          state: business.state || prev.contact.state,
          postalCode: business.zipCode || prev.contact.postalCode,
        }
      }));
    }
  }, [business, user]);

  // ── Search Domains ─────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const isDomainName = searchQuery.includes('.');

      if (isDomainName) {
        const res = await fetch(`/api/domains/search?domain=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (res.ok) {
          setSearchResults(data.results || [data.primary || data]);
        } else {
          setSearchError(data.error || 'Search failed');
        }
      } else {
        const res = await fetch(`/api/domains/search?keyword=${encodeURIComponent(searchQuery)}&limit=12`);
        const data = await res.json();

        if (res.ok) {
          setSearchResults(data.suggestions || []);
        } else {
          setSearchError(data.error || 'Search failed');
        }
      }
    } catch (err) {
      setSearchError('Network error — please try again');
      console.error(err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // ── Select Domain ──────────────────────────────────────────

  const selectDomain = (domain: DomainResult) => {
    if (!domain.available) return;
    setPurchaseState(prev => ({
      ...prev,
      step: 'contact',
      selectedDomain: domain,
      error: '',
    }));
  };

  // ── Purchase Domain ────────────────────────────────────────

  const handlePurchase = async () => {
    if (!purchaseState.selectedDomain || !business || !user) return;

    setPurchaseState(prev => ({ ...prev, step: 'purchasing', error: '' }));

    try {
      // Step 1: Create Stripe PaymentIntent
      const paymentRes = await authFetch('/api/domains/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: purchaseState.selectedDomain.domain }),
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error || 'Payment setup failed');

      // Step 2: Purchase domain
      const purchaseRes = await authFetch('/api/domains/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: purchaseState.selectedDomain.domain,
          businessSlug: business.slug,
          years: 1,
          stripePaymentIntentId: paymentData.paymentIntentId,
          contact: {
            nameFirst: purchaseState.contact.nameFirst,
            nameLast: purchaseState.contact.nameLast,
            email: purchaseState.contact.email,
            phone: purchaseState.contact.phone,
            addressMailing: {
              address1: purchaseState.contact.address1,
              address2: purchaseState.contact.address2 || undefined,
              city: purchaseState.contact.city,
              state: purchaseState.contact.state,
              postalCode: purchaseState.contact.postalCode,
              country: purchaseState.contact.country,
            },
            organization: purchaseState.contact.organization || undefined,
          },
        }),
      });

      const purchaseData = await purchaseRes.json();

      if (!purchaseRes.ok) throw new Error(purchaseData.error || 'Purchase failed');

      setPurchaseState(prev => ({
        ...prev,
        step: 'success',
        orderId: purchaseData.orderId,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      setPurchaseState(prev => ({
        ...prev,
        step: 'error',
        error: msg,
      }));
    }
  };

  // ── Connect Existing Domain ────────────────────────────────

  const handleConnectExisting = async (skipVerification = false) => {
    if (!existingDomainInput.trim() || !business || !user) return;

    setConnecting(true);
    setConnectError('');

    try {
      const res = await authFetch('/api/domains/connect-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: existingDomainInput,
          businessSlug: business.slug,
          skipVerification,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConnectSuccess(true);
        setDnsRecords(data.dnsRecords || []);

        if (data.verified) {
          // DNS is verified, domain is active
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        // DNS not verified yet or error
        setConnectError(data.message || data.error || 'Failed to connect domain');
        setDnsRecords(data.dnsRecords || []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect domain';
      setConnectError(msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleVerifyDNS = async () => {
    setVerifying(true);
    setConnectError('');

    try {
      const res = await authFetch('/api/domains/connect-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: existingDomainInput,
          businessSlug: business.slug,
          skipVerification: false,
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setConnectSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setConnectError(data.message || 'DNS not configured correctly yet. Please wait 5-10 minutes and try again.');
      }
    } catch {
      setConnectError('DNS verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // ── Retry DNS ──────────────────────────────────────────────

  const [retryingDns, setRetryingDns] = useState(false);

  const retryDnsConfig = async () => {
    if (!existingDomain || !business || !user) return;
    setRetryingDns(true);

    try {
      const res = await authFetch('/api/domains/configure-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: existingDomain,
          businessSlug: business.slug,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('DNS configured successfully! It may take up to 48 hours to fully propagate.');
        window.location.reload();
      } else {
        alert(data.error || 'DNS configuration failed');
      }
    } catch {
      alert('Failed to configure DNS');
    } finally {
      setRetryingDns(false);
    }
  };

  // ── Disconnect Domain ──────────────────────────────────────

  const handleDisconnect = async () => {
    if (!existingDomain || !business || !user) return;
    if (!confirm(`Are you sure you want to disconnect ${existingDomain}? Your site will revert to mohnmenu.com/${business.slug}.`)) return;

    try {
      const res = await authFetch(
        `/api/domains/connect-existing?domain=${encodeURIComponent(existingDomain)}&businessSlug=${encodeURIComponent(business.slug)}`,
        { method: 'DELETE' },
      );

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Domain disconnected successfully.');
        window.location.reload();
      } else {
        alert(data.error || 'Failed to disconnect domain');
      }
    } catch {
      alert('Failed to disconnect domain');
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (!business) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No business selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          🌐 Custom Domain
        </h2>
        <p className="text-gray-500 mt-1">
          Get a custom domain for your business website
        </p>
      </div>

      {/* ── Existing Domain Status ──────────────────────────── */}
      {existingDomain && (domainPurchased || domainStatus === 'active') && (
        <div className={`mb-8 rounded-xl border-2 p-6 ${
          domainStatus === 'active' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {domainStatus === 'active' ? '✅' : '⏳'}
                {existingDomain}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {domainStatus === 'active'
                  ? 'Your custom domain is active and pointing to your website'
                  : 'DNS configuration is pending — your domain will be active once DNS propagates'}
              </p>
            </div>

            <div className="flex gap-2">
              {domainStatus === 'active' && (
                <a
                  href={`https://${existingDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-blue-700"
                >
                  Visit ↗
                </a>
              )}
              {!dnsConfigured && (
                <button
                  onClick={retryDnsConfig}
                  disabled={retryingDns}
                  className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-yellow-600 disabled:opacity-50"
                >
                  {retryingDns ? '⏳ Configuring...' : '⚙️ Retry DNS'}
                </button>
              )}
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Domain Details */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Status</p>
              <p className={`font-bold text-sm ${domainStatus === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                {domainStatus === 'active' ? 'Active' : 'Pending DNS'}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">DNS</p>
              <p className={`font-bold text-sm ${dnsConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                {dnsConfigured ? 'Configured' : 'Pending'}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Auto-Renew</p>
              <p className="font-bold text-sm text-green-600">{domainPurchased ? 'Enabled' : 'N/A'}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Source</p>
              <p className="font-bold text-sm text-gray-700">{domainPurchased ? 'MohnMenu' : 'External'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Domain Setup Flow ───────────────────────────────── */}
      {!existingDomain || (!domainPurchased && domainStatus !== 'active') ? (
        <>
          {/* Mode Selection (Purchase vs Connect Existing) */}
          {purchaseState.step === 'search' && !connectSuccess && (
            <div className="mb-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How do you want to add a domain?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('purchase')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    mode === 'purchase'
                      ? 'border-blue-600 bg-blue-50 shadow'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                      mode === 'purchase' ? 'bg-blue-600 text-white' : 'border-2 border-gray-300'
                    }`}>
                      {mode === 'purchase' && '✓'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">🛒 Purchase New Domain</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Buy a domain through MohnMenu for {OUR_PRICE}/year
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>✅ Auto-configured DNS & SSL</li>
                        <li>✅ Free WHOIS privacy</li>
                        <li>✅ Instant setup (no technical knowledge)</li>
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('connect')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    mode === 'connect'
                      ? 'border-blue-600 bg-blue-50 shadow'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                      mode === 'connect' ? 'bg-blue-600 text-white' : 'border-2 border-gray-300'
                    }`}>
                      {mode === 'connect' && '✓'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">🔗 Connect Existing Domain</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Already own a domain? Point it to MohnMenu
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>✅ Keep your existing domain</li>
                        <li>✅ Free to connect</li>
                        <li>✅ Update DNS at your registrar</li>
                      </ul>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Connect Existing Domain Flow ──────────────── */}
          {mode === 'connect' && purchaseState.step === 'search' && !connectSuccess && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connect Your Existing Domain</h3>
              <p className="text-gray-600 mb-6">
                Enter the domain you already own, and we&apos;ll give you DNS instructions to point it to MohnMenu.
              </p>

              {/* Domain input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Domain</label>
                <input
                  type="text"
                  value={existingDomainInput}
                  onChange={(e) => setExistingDomainInput(e.target.value)}
                  placeholder="yourbusiness.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Enter without http:// or www.</p>
              </div>

              {connectError && !dnsRecords.length && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {connectError}
                </div>
              )}

              {dnsRecords.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3">📋 DNS Setup Instructions</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and update these DNS records:
                  </p>
                  <div className="space-y-3">
                    {dnsRecords.map((record, i) => (
                      <div key={i} className="bg-white p-3 rounded border border-blue-100">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <p className="font-mono font-bold">{record.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <p className="font-mono font-bold">{record.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Value:</span>
                            <p className="font-mono font-bold">{record.value}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{record.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-800">
                      ⏱️ <strong>DNS propagation</strong> can take 5-10 minutes (usually) up to 48 hours (rarely).
                      After updating DNS, click &quot;Verify DNS&quot; below to activate your domain.
                    </p>
                  </div>
                </div>
              )}

              {connectError && dnsRecords.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  ⚠️ {connectError}
                </div>
              )}

              <div className="flex gap-3">
                {!dnsRecords.length ? (
                  <button
                    onClick={() => handleConnectExisting(false)}
                    disabled={connecting || !existingDomainInput.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connecting ? '⏳ Checking DNS...' : '➡️ Get DNS Instructions'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleVerifyDNS}
                      disabled={verifying}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      {verifying ? '⏳ Verifying...' : '✅ Verify DNS & Activate'}
                    </button>
                    <button
                      onClick={() => handleConnectExisting(true)}
                      disabled={connecting}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Skip Verification
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('purchase')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Switch to domain purchase
                </button>
              </div>
            </div>
          )}

          {/* Success State for Connect */}
          {connectSuccess && mode === 'connect' && (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Domain Connected!</h3>
              <p className="text-gray-600 mb-4">
                <strong>{existingDomainInput}</strong> is now connected to your MohnMenu website.
              </p>
              <p className="text-sm text-gray-500">
                Reloading to update your dashboard...
              </p>
            </div>
          )}

          {/* Purchase Flow link (when in purchase mode) */}
          {mode === 'purchase' && purchaseState.step === 'search' && !connectSuccess && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('connect')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Already own a domain? Connect it instead →
              </button>
            </div>
          )}

          {/* Step indicator */}
          {mode === 'purchase' && <div className="mb-6 flex items-center gap-2 text-sm">
            {['Search', 'Contact Info', 'Purchase'].map((label, i) => {
              const stepMap = ['search', 'contact', 'payment'];
              const currentIdx = stepMap.indexOf(purchaseState.step);
              const isCompleted = i < currentIdx;
              const isCurrent = stepMap[i] === purchaseState.step;

              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted ? 'bg-green-100 text-green-700' :
                    isCurrent ? 'bg-blue-600 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : <span>{i + 1}</span>}
                    {label}
                  </div>
                </div>
              );
            })}
          </div>}

          {/* ── Step 1: Search ─────────────────────────────── */}
          {mode === 'purchase' && purchaseState.step === 'search' && (
            <div>
              {/* Info banner */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">ℹ️</span>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Why get a custom domain?</p>
                    <p className="text-blue-700 text-xs mt-1">
                      A custom domain like <strong>yourbusiness.com</strong> makes your business look professional,
                      improves SEO, and builds brand trust. Customers will visit your own domain instead of
                      mohnmenu.com/{business.slug}.
                    </p>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                        🏷️ {OUR_PRICE}/yr — includes free WHOIS privacy & SSL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for a domain... (e.g., mybusiness.com or mybusiness)"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searching ? '⏳' : '🔍'}
                  Search
                </button>
              </div>

              {/* Error */}
              {searchError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {searchError}
                </div>
              )}

              {/* Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.domain}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        result.available
                          ? 'border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                      onClick={() => selectDomain(result)}
                    >
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-red-400">❌</span>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{result.domain}</p>
                          <p className="text-xs text-gray-500">
                            {result.available ? 'Available' : 'Taken'}
                            {result.period > 0 && ` · ${result.period} year${result.period > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>

                      {result.available && (
                        <div className="text-right">
                          <p className="font-black text-gray-900">{OUR_PRICE}<span className="text-xs text-gray-500">/yr</span></p>
                          <p className="text-xs text-green-600 font-medium">
                            Save $8 vs GoDaddy
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Searching indicator */}
              {searching && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Searching available domains...</p>
                </div>
              )}

              {/* Price comparison */}
              {searchResults.length > 0 && !searching && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Why MohnMenu domains?</p>
                  <div className="flex items-center gap-6 flex-wrap text-xs text-gray-500">
                    {COMPETITOR_PRICES.map(c => (
                      <div key={c.name} className="flex items-center gap-1.5">
                        <span className="text-gray-400 line-through">{c.price}</span>
                        <span className="text-gray-300">{c.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 font-bold text-green-600">
                      ✓ {OUR_PRICE} MohnMenu
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Includes free WHOIS privacy, SSL, auto DNS setup & website hosting</p>
                </div>
              )}

              {/* Suggested TLDs */}
              {!searching && searchResults.length === 0 && !searchQuery && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-500 mb-3">POPULAR EXTENSIONS</h3>
                  <div className="flex flex-wrap gap-2">
                    {['.com', '.net', '.org', '.io', '.co', '.shop', '.store', '.menu', '.food', '.restaurant'].map(tld => (
                      <button
                        key={tld}
                        onClick={() => {
                          const base = business?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mybusiness';
                          setSearchQuery(`${base}${tld}`);
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        {tld}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Contact Info ──────────────────────── */}
          {mode === 'purchase' && purchaseState.step === 'contact' && purchaseState.selectedDomain && (
            <div>
              {/* Selected domain summary */}
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-green-500">⭐</span>
                  <div>
                    <p className="font-bold text-gray-900">{purchaseState.selectedDomain.domain}</p>
                    <p className="text-xs text-gray-500">Selected domain</p>
                  </div>
                </div>
                <p className="font-black text-lg">{OUR_PRICE}<span className="text-xs text-gray-500">/yr</span></p>
              </div>

              {/* Contact form */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Registrant Contact Information</h3>
                <p className="text-sm text-gray-500 mb-6">Required by ICANN for domain registration. This information is kept private with free WHOIS privacy.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.nameFirst}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, nameFirst: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.nameLast}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, nameLast: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Email *</label>
                    <input
                      type="email"
                      value={purchaseState.contact.email}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={purchaseState.contact.phone}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))}
                      placeholder="+1.5555555555"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Organization</label>
                    <input
                      type="text"
                      value={purchaseState.contact.organization}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, organization: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.address1}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address1: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={purchaseState.contact.address2}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address2: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">City *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.city}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, city: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">State *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.state}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, state: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.postalCode}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, postalCode: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Country *</label>
                    <select
                      value={purchaseState.contact.country}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, country: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="MX">Mexico</option>
                      <option value="CN">China</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setPurchaseState(prev => ({ ...prev, step: 'search' }))}
                    className="px-4 py-2 text-gray-500 hover:text-gray-900 font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      const c = purchaseState.contact;
                      if (!c.nameFirst || !c.nameLast || !c.email || !c.phone || !c.address1 || !c.city || !c.state || !c.postalCode) {
                        alert('Please fill in all required fields (marked with *)');
                        return;
                      }
                      setPurchaseState(prev => ({ ...prev, step: 'payment' }));
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment/Confirmation ─────────────── */}
          {mode === 'purchase' && purchaseState.step === 'payment' && purchaseState.selectedDomain && (
            <div>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💳 Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{purchaseState.selectedDomain.domain}</p>
                      <p className="text-xs text-gray-500">1 year registration + WHOIS privacy + SSL + DNS setup</p>
                    </div>
                    <p className="font-medium text-gray-600">{OUR_PRICE}</p>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <p className="font-black text-lg text-gray-900">Total</p>
                    <p className="font-black text-lg text-gray-900">{OUR_PRICE}<span className="text-xs font-normal text-gray-500">/yr</span></p>
                  </div>
                </div>

                {/* Competitor comparison */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-green-700 mb-1.5">You&apos;re saving money</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {COMPETITOR_PRICES.map(c => (
                      <div key={c.name} className="flex justify-between text-gray-500">
                        <span>{c.name}: <span className="line-through">{c.price}</span></span>
                        <span className="text-green-600 font-medium">Save {c.savings}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold text-gray-500 mb-2">INCLUDES:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">✅ Domain registration (1 yr)</div>
                    <div className="flex items-center gap-1.5">✅ Auto DNS configuration</div>
                    <div className="flex items-center gap-1.5">✅ SSL certificate (free)</div>
                    <div className="flex items-center gap-1.5">✅ Custom domain routing</div>
                    <div className="flex items-center gap-1.5">✅ WHOIS privacy</div>
                    <div className="flex items-center gap-1.5">✅ Auto-renewal</div>
                  </div>
                </div>

                {/* Registrant summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold text-gray-500 mb-2">REGISTRANT</p>
                  <p className="text-sm text-gray-700">
                    {purchaseState.contact.nameFirst} {purchaseState.contact.nameLast}
                    {purchaseState.contact.organization && ` · ${purchaseState.contact.organization}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {purchaseState.contact.address1}, {purchaseState.contact.city}, {purchaseState.contact.state} {purchaseState.contact.postalCode}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setPurchaseState(prev => ({ ...prev, step: 'contact' }))}
                    className="px-4 py-2 text-gray-500 hover:text-gray-900 font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2"
                  >
                    💳 Purchase {purchaseState.selectedDomain.domain}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Purchasing ───────────────────────────────── */}
          {mode === 'purchase' && purchaseState.step === 'purchasing' && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Purchasing Your Domain...</h3>
              <p className="text-gray-500 text-sm">
                Registering {purchaseState.selectedDomain?.domain} and configuring DNS.
                This may take a few moments.
              </p>
            </div>
          )}

          {/* ── Success ──────────────────────────────────── */}
          {mode === 'purchase' && purchaseState.step === 'success' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Domain Purchased!</h3>
              <p className="text-gray-500 mb-6">
                <strong>{purchaseState.selectedDomain?.domain}</strong> is now yours.
                DNS changes may take up to 48 hours to propagate worldwide.
              </p>
              <div className="inline-block bg-gray-100 rounded-lg p-4 text-left text-sm text-gray-600">
                <p className="font-bold text-gray-900 mb-2">What happens next:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>DNS records are being configured automatically</li>
                  <li>SSL certificate will be provisioned (usually within minutes)</li>
                  <li>Your website will be accessible at {purchaseState.selectedDomain?.domain}</li>
                  <li>Visitors to your custom domain will see your MohnMenu website</li>
                </ol>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  View Domain Status
                </button>
              </div>
            </div>
          )}

          {/* ── Error ────────────────────────────────────── */}
          {mode === 'purchase' && purchaseState.step === 'error' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Failed</h3>
              <p className="text-red-600 mb-6">{purchaseState.error}</p>
              <button
                onClick={() => setPurchaseState(prev => ({ ...prev, step: 'payment', error: '' }))}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
