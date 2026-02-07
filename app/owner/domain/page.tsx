'use client';

import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { useState, useEffect, useCallback } from 'react';
import { FaGlobe, FaSearch, FaCheck, FaTimes, FaSpinner, FaCreditCard, FaCog, FaExternalLinkAlt, FaInfoCircle, FaStar, FaTag } from 'react-icons/fa';

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

export default function OwnerDomainPage() {
  const { user, currentBusiness } = useAuth();

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
      phone: currentBusiness?.businessPhone || '',
      address1: currentBusiness?.address || '',
      address2: '',
      city: currentBusiness?.city || '',
      state: currentBusiness?.state || '',
      postalCode: currentBusiness?.zipCode || '',
      country: 'US',
      organization: currentBusiness?.name || '',
    },
    error: '',
    orderId: null,
  });

  // Current domain info
  const existingDomain = currentBusiness?.website?.customDomain;
  const domainPurchased = currentBusiness?.website?.domainPurchased;
  const domainStatus = currentBusiness?.website?.domainStatus;
  const dnsConfigured = currentBusiness?.website?.dnsConfigured;

  // Populate contact from business data
  useEffect(() => {
    if (currentBusiness) {
      setPurchaseState(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          email: user?.email || prev.contact.email,
          phone: currentBusiness.businessPhone || prev.contact.phone,
          address1: currentBusiness.address || prev.contact.address1,
          city: currentBusiness.city || prev.contact.city,
          state: currentBusiness.state || prev.contact.state,
          postalCode: currentBusiness.zipCode || prev.contact.postalCode,
          organization: currentBusiness.name || prev.contact.organization,
        }
      }));
    }
  }, [currentBusiness, user]);

  // ── Search Domains ─────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // Check if it looks like a full domain name
      const isDomainName = searchQuery.includes('.');

      if (isDomainName) {
        // Single domain check
        const res = await fetch(`/api/domains/search?domain=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (res.ok) {
          setSearchResults([data]);

          // Also get suggestions
          const keyword = searchQuery.split('.')[0];
          const suggestRes = await fetch(`/api/domains/search?keyword=${encodeURIComponent(keyword)}&limit=8`);
          const suggestData = await suggestRes.json();
          if (suggestRes.ok && suggestData.suggestions) {
            setSearchResults(prev => {
              const existing = prev.map(d => d.domain);
              const newOnes = suggestData.suggestions.filter(
                (s: DomainResult) => !existing.includes(s.domain)
              );
              return [...prev, ...newOnes];
            });
          }
        } else {
          setSearchError(data.error || 'Search failed');
        }
      } else {
        // Keyword search — get suggestions
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
    if (!purchaseState.selectedDomain || !currentBusiness || !user) return;

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
          businessSlug: currentBusiness.slug,
          years: 1,
          uid: user.uid,
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

  // ── Retry DNS ──────────────────────────────────────────────

  const [retryingDns, setRetryingDns] = useState(false);

  const retryDnsConfig = async () => {
    if (!existingDomain || !currentBusiness || !user) return;
    setRetryingDns(true);

    try {
      const res = await authFetch('/api/domains/configure-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: existingDomain,
          businessSlug: currentBusiness.slug,
          uid: user.uid,
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

  // ── Render ─────────────────────────────────────────────────

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (!currentBusiness) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p>No business selected</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-black flex items-center gap-3">
          <FaGlobe className="text-orange-500" />
          Custom Domain
        </h1>
        <p className="text-zinc-500 mt-1">
          Get a custom domain for your business website
        </p>
      </div>

      {/* ── Existing Domain Status ──────────────────────────── */}
      {existingDomain && domainPurchased && (
        <div className={`mb-8 rounded-xl border-2 p-6 ${
          domainStatus === 'active' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                {domainStatus === 'active' ? (
                  <FaCheck className="text-emerald-500" />
                ) : (
                  <FaSpinner className="text-amber-500 animate-spin" />
                )}
                {existingDomain}
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
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
                  className="px-3 py-1.5 bg-black text-white rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-zinc-800"
                >
                  Visit <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
              {!dnsConfigured && (
                <button
                  onClick={retryDnsConfig}
                  disabled={retryingDns}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-amber-600 disabled:opacity-50"
                >
                  {retryingDns ? (
                    <><FaSpinner className="animate-spin" /> Configuring...</>
                  ) : (
                    <><FaCog /> Retry DNS</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Domain Details */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-zinc-500">Status</p>
              <p className={`font-bold text-sm ${domainStatus === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {domainStatus === 'active' ? 'Active' : 'Pending DNS'}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-zinc-500">DNS</p>
              <p className={`font-bold text-sm ${dnsConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                {dnsConfigured ? 'Configured' : 'Pending'}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-zinc-500">Auto-Renew</p>
              <p className="font-bold text-sm text-emerald-600">Enabled</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-zinc-500">Registrar</p>
              <p className="font-bold text-sm text-zinc-700">MohnMenu</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Purchase Flow ───────────────────────────────────── */}
      {!domainPurchased && (
        <>
          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            {['Search', 'Contact Info', 'Purchase'].map((label, i) => {
              const stepMap = ['search', 'contact', 'payment'];
              const currentIdx = stepMap.indexOf(purchaseState.step);
              const isCompleted = i < currentIdx;
              const isCurrent = stepMap[i] === purchaseState.step;

              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className={`w-8 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-zinc-200'}`} />}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted ? 'bg-emerald-100 text-emerald-700' :
                    isCurrent ? 'bg-black text-white' :
                    'bg-zinc-100 text-zinc-400'
                  }`}>
                    {isCompleted ? <FaCheck className="text-[10px]" /> : <span>{i + 1}</span>}
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Search ─────────────────────────────── */}
          {purchaseState.step === 'search' && (
            <div>
              {/* Info banner */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Why get a custom domain?</p>
                    <p className="text-blue-700 text-xs mt-1">
                      A custom domain like <strong>yourbusiness.com</strong> makes your business look professional,
                      improves SEO, and builds brand trust. Your customers will visit your own domain instead of
                      mohnmenu.com/your-slug.
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                        <FaTag className="text-[9px]" /> {OUR_PRICE}/yr — includes free WHOIS privacy & SSL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for a domain... (e.g., mybusiness.com or mybusiness)"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-zinc-200 rounded-xl text-black font-medium focus:border-black focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
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
                          ? 'border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                          : 'border-zinc-100 bg-zinc-50 opacity-60'
                      }`}
                      onClick={() => selectDomain(result)}
                    >
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <FaCheck className="text-emerald-500" />
                        ) : (
                          <FaTimes className="text-red-400" />
                        )}
                        <div>
                          <p className="font-bold text-black">{result.domain}</p>
                          <p className="text-xs text-zinc-500">
                            {result.available ? 'Available' : 'Taken'}
                            {result.period > 0 && ` · ${result.period} year${result.period > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>

                      {result.available && (
                        <div className="text-right">
                          <p className="font-black text-black">{OUR_PRICE}<span className="text-xs text-zinc-500">/yr</span></p>
                          <p className="text-xs text-emerald-600 font-medium">
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
                  <FaSpinner className="animate-spin text-2xl text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">Searching available domains...</p>
                </div>
              )}

              {/* Empty state */}
              {!searching && searchResults.length === 0 && searchQuery && !searchError && (
                <div className="text-center py-12">
                  <FaGlobe className="text-4xl text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">Search for a domain to get started</p>
                </div>
              )}

              {/* Price comparison — shown after results */}
              {searchResults.length > 0 && !searching && (
                <div className="mt-6 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Why MohnMenu domains?</p>
                  <div className="flex items-center gap-6 flex-wrap text-xs text-zinc-500">
                    {COMPETITOR_PRICES.map(c => (
                      <div key={c.name} className="flex items-center gap-1.5">
                        <span className="text-zinc-400 line-through">{c.price}</span>
                        <span className="text-zinc-300">{c.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <FaCheck className="text-[10px]" />
                      <span>{OUR_PRICE} MohnMenu</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5">Includes free WHOIS privacy, SSL, auto DNS setup & website hosting</p>
                </div>
              )}

              {/* Suggested TLDs */}
              {!searching && searchResults.length === 0 && !searchQuery && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-zinc-500 mb-3">POPULAR EXTENSIONS</h3>
                  <div className="flex flex-wrap gap-2">
                    {['.com', '.net', '.org', '.io', '.food', '.restaurant', '.shop', '.store', '.menu', '.cafe'].map(tld => (
                      <button
                        key={tld}
                        onClick={() => {
                          const base = currentBusiness?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mybusiness';
                          setSearchQuery(`${base}${tld}`);
                        }}
                        className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-200"
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
          {purchaseState.step === 'contact' && purchaseState.selectedDomain && (
            <div>
              {/* Selected domain summary */}
              <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaStar className="text-emerald-500" />
                  <div>
                    <p className="font-bold text-black">{purchaseState.selectedDomain.domain}</p>
                    <p className="text-xs text-zinc-500">Selected domain</p>
                  </div>
                </div>
                <p className="font-black text-lg">{OUR_PRICE}<span className="text-xs text-zinc-500">/yr</span></p>
              </div>

              {/* Contact form */}
              <div className="bg-white border-2 border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-black mb-4">Registrant Contact Information</h3>
                <p className="text-sm text-zinc-500 mb-6">Required by ICANN for domain registration. This information can be kept private.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.nameFirst}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, nameFirst: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.nameLast}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, nameLast: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Email *</label>
                    <input
                      type="email"
                      value={purchaseState.contact.email}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={purchaseState.contact.phone}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))}
                      placeholder="+1.5555555555"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Organization</label>
                    <input
                      type="text"
                      value={purchaseState.contact.organization}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, organization: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.address1}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address1: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={purchaseState.contact.address2}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, address2: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">City *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.city}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, city: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">State *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.state}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, state: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      value={purchaseState.contact.postalCode}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, postalCode: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">Country *</label>
                    <select
                      value={purchaseState.contact.country}
                      onChange={(e) => setPurchaseState(prev => ({
                        ...prev,
                        contact: { ...prev.contact, country: e.target.value },
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-black focus:border-black focus:outline-none"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="CN">China</option>
                      <option value="IN">India</option>
                      <option value="BR">Brazil</option>
                      <option value="MX">Mexico</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setPurchaseState(prev => ({ ...prev, step: 'search' }))}
                    className="px-4 py-2 text-zinc-500 hover:text-black font-medium"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => {
                      // Validate required fields
                      const c = purchaseState.contact;
                      if (!c.nameFirst || !c.nameLast || !c.email || !c.phone || !c.address1 || !c.city || !c.state || !c.postalCode) {
                        alert('Please fill in all required fields (marked with *)');
                        return;
                      }
                      setPurchaseState(prev => ({ ...prev, step: 'payment' }));
                    }}
                    className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-zinc-800"
                  >
                    Continue to Payment &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Payment/Confirmation ─────────────── */}
          {purchaseState.step === 'payment' && purchaseState.selectedDomain && (
            <div>
              <div className="bg-white border-2 border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-orange-500" />
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                    <div>
                      <p className="font-bold text-black">{purchaseState.selectedDomain.domain}</p>
                      <p className="text-xs text-zinc-500">1 year registration + WHOIS privacy + SSL + DNS setup</p>
                    </div>
                    <p className="font-medium text-zinc-600">{OUR_PRICE}</p>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <p className="font-black text-lg text-black">Total</p>
                    <p className="font-black text-lg text-black">{OUR_PRICE}<span className="text-xs font-normal text-zinc-500">/yr</span></p>
                  </div>
                </div>

                {/* Subtle competitor comparison */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4">
                  <p className="text-xs font-bold text-emerald-700 mb-1.5">You&apos;re saving money</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {COMPETITOR_PRICES.map(c => (
                      <div key={c.name} className="flex justify-between text-zinc-500">
                        <span>{c.name}: <span className="line-through">{c.price}</span></span>
                        <span className="text-emerald-600 font-medium">Save {c.savings}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-zinc-50 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold text-zinc-500 mb-2">INCLUDES:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> Domain registration (1 yr)</div>
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> Auto DNS configuration</div>
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> SSL certificate (free)</div>
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> Custom domain routing</div>
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> WHOIS privacy</div>
                    <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> Auto-renewal</div>
                  </div>
                </div>

                {/* Registrant summary */}
                <div className="bg-zinc-50 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold text-zinc-500 mb-2">REGISTRANT</p>
                  <p className="text-sm text-zinc-700">
                    {purchaseState.contact.nameFirst} {purchaseState.contact.nameLast}
                    {purchaseState.contact.organization && ` · ${purchaseState.contact.organization}`}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {purchaseState.contact.address1}, {purchaseState.contact.city}, {purchaseState.contact.state} {purchaseState.contact.postalCode}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setPurchaseState(prev => ({ ...prev, step: 'contact' }))}
                    className="px-4 py-2 text-zinc-500 hover:text-black font-medium"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <FaCreditCard />
                    Purchase {purchaseState.selectedDomain.domain}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Purchasing ───────────────────────────────── */}
          {purchaseState.step === 'purchasing' && (
            <div className="text-center py-16">
              <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">Purchasing Your Domain...</h3>
              <p className="text-zinc-500 text-sm">
                Registering {purchaseState.selectedDomain?.domain} and configuring DNS.
                This may take a few moments.
              </p>
            </div>
          )}

          {/* ── Success ──────────────────────────────────── */}
          {purchaseState.step === 'success' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-3xl text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2">Domain Purchased!</h3>
              <p className="text-zinc-500 mb-6">
                <strong>{purchaseState.selectedDomain?.domain}</strong> is now yours.
                DNS changes may take up to 48 hours to propagate worldwide.
              </p>
              <div className="inline-block bg-zinc-100 rounded-lg p-4 text-left text-sm text-zinc-600">
                <p className="font-bold text-black mb-2">What happens next:</p>
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
                  className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-zinc-800"
                >
                  View Domain Status
                </button>
              </div>
            </div>
          )}

          {/* ── Error ────────────────────────────────────── */}
          {purchaseState.step === 'error' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Purchase Failed</h3>
              <p className="text-red-600 mb-6">{purchaseState.error}</p>
              <button
                onClick={() => setPurchaseState(prev => ({ ...prev, step: 'payment', error: '' }))}
                className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-zinc-800"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Already has domain but not purchased through us ─── */}
      {existingDomain && !domainPurchased && (
        <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-zinc-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-zinc-700 text-sm">External Domain Detected</p>
              <p className="text-zinc-500 text-xs mt-1">
                Your business has <strong>{existingDomain}</strong> configured as a custom domain
                (not purchased through MohnMenu). If you&apos;d like to purchase a new domain
                through our platform with automatic setup, use the search above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
