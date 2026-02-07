'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BusinessWebsite } from '@/lib/types';
import { SERVICE_INFO } from '@/lib/types';
import {
  CUISINE_TYPES,
  STORE_CATEGORIES,
  US_STATES_WITH_CITIES,
  US_STATE_LIST,
  getStateName,
  generateSeoKeywords,
} from '@/lib/seo-data';
import CityTypeahead from './CityTypeahead';

/**
 * WebsiteBuilder — 8-step wizard that generates an SEO-optimized website
 * for a restaurant, store, bakery, food truck, etc.
 *
 * Steps:
 * 1. Cuisine / Business Type — what kind of food or store?
 * 2. Store Categories — (if convenience/grocery) what do you sell?
 * 3. Services — delivery, takeout, dine-in, catering, etc.
 * 4. Service Areas — states → cities (all 50 states, real cities)
 * 5. Menu Highlights — signature dishes, best sellers
 * 6. Content — hero, about, mission, contact, hours
 * 7. Custom Domain — domain + DNS instructions
 * 8. Review & Publish — preview pages + auto-generate keywords + publish
 *
 * After publishing, shows a management dashboard.
 */

const ALL_SERVICES = Object.entries(SERVICE_INFO).map(([key, info]) => ({
  key,
  label: info.label,
  description: info.description,
}));

const TOTAL_STEPS = 8;
const STEP_LABELS = [
  'Cuisine Type',
  'Store Categories',
  'Services',
  'Service Areas',
  'Menu Highlights',
  'Content',
  'Custom Domain',
  'Review & Publish',
];

interface WebsiteBuilderProps {
  businessId: string;
  businessSlug: string;
  businessName: string;
  currentWebsite?: BusinessWebsite;
  businessState: string;
  businessCity: string;
  businessType?: string; // 'restaurant' | 'convenience_store' | etc.
}

export default function WebsiteBuilder({
  businessId,
  businessSlug,
  businessName,
  currentWebsite,
  businessState,
  businessCity,
  businessType,
}: WebsiteBuilderProps) {
  const { MohnMenuUser } = useAuth();

  // ── State ─────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Step 1: Cuisine type
  const [cuisineType, setCuisineType] = useState(currentWebsite?.cuisineType || '');
  const [cuisineSearch, setCuisineSearch] = useState('');

  // Step 2: Store categories (for convenience stores / grocery)
  const [storeCategories, setStoreCategories] = useState<string[]>(
    currentWebsite?.storeCategories || []
  );

  // Step 3: Services
  const [selectedServices, setSelectedServices] = useState<string[]>(
    currentWebsite?.selectedServices || []
  );

  // Step 4: Service areas
  const [selectedStates, setSelectedStates] = useState<string[]>(
    currentWebsite?.selectedStates || [businessState]
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    currentWebsite?.selectedCities || [businessCity]
  );
  const [customCity, setCustomCity] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  // Step 5: Menu highlights & specialties
  const [menuHighlights, setMenuHighlights] = useState<string[]>(
    currentWebsite?.menuHighlights || []
  );
  const [specialties, setSpecialties] = useState<string[]>(
    currentWebsite?.specialties || []
  );
  const [newHighlight, setNewHighlight] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Step 6: Content
  const [content, setContent] = useState({
    tagline: currentWebsite?.content?.tagline || '',
    heroTitle: currentWebsite?.content?.heroTitle || businessName,
    heroSubtitle: currentWebsite?.content?.heroSubtitle || '',
    aboutTitle: currentWebsite?.content?.aboutTitle || `About ${businessName}`,
    aboutContent: currentWebsite?.content?.aboutContent || '',
    aboutMission: currentWebsite?.content?.aboutMission || '',
    aboutValues: currentWebsite?.content?.aboutValues || '',
    contactTitle: currentWebsite?.content?.contactTitle || `Contact ${businessName}`,
    contactContent: currentWebsite?.content?.contactContent || '',
    businessHours: currentWebsite?.content?.businessHours || '',
  });
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<string, string>>(
    currentWebsite?.content?.serviceDescriptions || {}
  );

  // Step 7: Custom domain
  const [customDomain, setCustomDomain] = useState(currentWebsite?.customDomain || '');
  const [customDomainEnabled, setCustomDomainEnabled] = useState(
    currentWebsite?.customDomainEnabled || false
  );

  // Step 8: SEO
  const [seo, setSeo] = useState({
    metaTitle: currentWebsite?.seo?.metaTitle || `${businessName} | Order Online`,
    metaDescription: currentWebsite?.seo?.metaDescription || '',
    keywords: currentWebsite?.seo?.keywords?.join(', ') || '',
  });

  // ── Dashboard vs Wizard ───────────────────────────────────
  const isSetupComplete = currentWebsite?.setupComplete === true;
  const [showWizard, setShowWizard] = useState(!isSetupComplete);

  // ── Determine if store-type business (show Step 2) ────────
  const isStoreType = businessType === 'convenience_store' || businessType === 'farm_csa' ||
    cuisineType === '' && storeCategories.length > 0;

  // ── Which step to skip? If not a store, skip step 2 ───────
  const activeSteps = useMemo(() => {
    const steps = [1, 2, 3, 4, 5, 6, 7, 8];
    // Non-store businesses can skip step 2 (store categories)
    // But we still show it — they can just skip past it
    return steps;
  }, []);

  const currentStepIndex = activeSteps.indexOf(step);
  const isLastStep = step === TOTAL_STEPS;

  // ── Filtered cuisine types ────────────────────────────────
  const filteredCuisines = useMemo(() => {
    if (!cuisineSearch.trim()) return CUISINE_TYPES;
    const s = cuisineSearch.toLowerCase();
    return CUISINE_TYPES.filter(
      c => c.label.toLowerCase().includes(s) || c.keywords.some(k => k.includes(s))
    );
  }, [cuisineSearch]);

  // ── Filtered states ───────────────────────────────────────
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return US_STATE_LIST;
    const s = stateSearch.toLowerCase();
    return US_STATE_LIST.filter(
      st => st.toLowerCase().includes(s) || getStateName(st).toLowerCase().includes(s)
    );
  }, [stateSearch]);

  // ── When state is deselected, remove cities that the user likely added for that state ──
  // (We keep all cities since we can't track which state each came from)

  // ── Auto-generate SEO keywords on step 8 entry ────────────
  useEffect(() => {
    if (step === 8 && !seo.keywords) {
      const autoKeywords = generateSeoKeywords(
        businessName,
        businessCity,
        businessState,
        cuisineType,
        selectedServices,
        storeCategories.length > 0 ? storeCategories : undefined,
      );
      setSeo(prev => ({
        ...prev,
        keywords: autoKeywords.slice(0, 30).join(', '),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Auto-generate meta description ────────────────────────
  useEffect(() => {
    if (step === 8 && !seo.metaDescription) {
      const cuisine = CUISINE_TYPES.find(c => c.key === cuisineType);
      const cuisineLabel = cuisine ? cuisine.label : 'fresh';
      setSeo(prev => ({
        ...prev,
        metaDescription: `Order ${cuisineLabel} food online from ${businessName} in ${businessCity}, ${businessState}. Delivery, takeout, and more. No app needed, no hidden fees. Browse our full menu and order in seconds.`,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────
  const toggleService = (key: string) => {
    setSelectedServices(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      setSelectedStates(prev => prev.filter(s => s !== state));
    } else {
      setSelectedStates(prev => [...prev, state]);
    }
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const addCustomCity = () => {
    const trimmed = customCity.trim();
    if (trimmed && !selectedCities.includes(trimmed)) {
      setSelectedCities(prev => [...prev, trimmed]);
      setCustomCity('');
    }
  };

  const addHighlight = () => {
    const trimmed = newHighlight.trim();
    if (trimmed && !menuHighlights.includes(trimmed)) {
      setMenuHighlights(prev => [...prev, trimmed]);
      setNewHighlight('');
    }
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties(prev => [...prev, trimmed]);
      setNewSpecialty('');
    }
  };

  const toggleStoreCategory = (key: string) => {
    setStoreCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const handlePublish = async () => {
    if (!MohnMenuUser) return;
    setSaving(true);
    setMessage('');

    try {
      const websiteData: BusinessWebsite = {
        enabled: true,
        setupComplete: true,
        customDomain: customDomain || undefined,
        customDomainEnabled,
        selectedServices,
        selectedStates,
        selectedCities,
        cuisineType: cuisineType || undefined,
        foodCategories: [],
        storeCategories: storeCategories.length > 0 ? storeCategories : undefined,
        menuHighlights: menuHighlights.length > 0 ? menuHighlights : undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        content: {
          ...content,
          serviceDescriptions,
        },
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          keywords: seo.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
        },
      };

      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        website: websiteData,
        updatedAt: new Date().toISOString(),
      });

      setMessage('Website published successfully! Your SEO pages are now live.');
      setShowWizard(false);
    } catch (err) {
      setMessage(
        `Error: ${err instanceof Error ? err.message : 'Failed to publish'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const totalPages =
    1 + // homepage
    selectedServices.length + // service pages
    selectedCities.length + // location pages
    2; // about + contact

  // ─── Management Dashboard (post-publish) ──────────────────
  if (isSetupComplete && !showWizard) {
    const cuisine = CUISINE_TYPES.find(c => c.key === cuisineType);

    return (
      <div className="space-y-8">
        {/* Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <p className="font-bold text-emerald-800">Website is Live</p>
              <p className="text-emerald-600 text-sm">
                {cuisine ? `${cuisine.emoji} ${cuisine.label} ` : ''}
                SEO website with {totalPages} pages is published and indexable.
              </p>
            </div>
          </div>
          <a
            href={`/${businessSlug}`}
            target="_blank"
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            View Site →
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { val: cuisine?.emoji || '🍽️', label: cuisine?.label || 'General' },
            { val: String(selectedServices.length), label: 'Services' },
            { val: String(selectedCities.length), label: 'Cities' },
            { val: String(totalPages), label: 'SEO Pages' },
            { val: customDomainEnabled ? '✓' : '—', label: 'Custom Domain' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 text-center">
              <p className="text-2xl font-black text-black">{stat.val}</p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Cuisine Type', desc: cuisine?.label || 'Not set' },
            { step: 3, title: 'Services', desc: `${selectedServices.length} active` },
            { step: 4, title: 'Service Areas', desc: `${selectedCities.length} cities` },
            { step: 5, title: 'Menu Highlights', desc: `${menuHighlights.length} items` },
            { step: 6, title: 'Content', desc: 'Hero, about, contact' },
            { step: 7, title: 'Custom Domain', desc: customDomain || 'Not set' },
            { step: 8, title: 'SEO Settings', desc: 'Meta tags & keywords' },
          ].map(card => (
            <button
              key={card.step}
              onClick={() => {
                setStep(card.step);
                setShowWizard(true);
              }}
              className="text-left p-5 bg-white rounded-2xl border border-zinc-100 hover:border-black transition-all group"
            >
              <h3 className="font-bold text-black group-hover:text-indigo-600 transition-colors text-sm">
                {card.title}
              </h3>
              <p className="text-zinc-400 text-xs mt-1">{card.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setStep(1);
            setShowWizard(true);
          }}
          className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
        >
          Run Full Wizard Again
        </button>
      </div>
    );
  }

  // ─── Wizard Render ────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center gap-1.5">
        {activeSteps.map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              s <= step ? 'bg-black' : 'bg-zinc-200'
            }`}
            aria-label={`Go to step ${s}`}
          />
        ))}
      </div>
      <p className="text-sm text-zinc-400 font-bold">
        Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
      </p>

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

      {/* ═══════════════════════════════════════════════════════
          STEP 1: CUISINE / BUSINESS TYPE
          ═══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-black mb-2">What Type of Food Do You Serve?</h2>
          <p className="text-zinc-500 mb-6">
            This determines the keywords, descriptions, and SEO content generated for every page.
          </p>

          {/* Search */}
          <input
            type="text"
            value={cuisineSearch}
            onChange={e => setCuisineSearch(e.target.value)}
            placeholder="Search cuisines..."
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black mb-6"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredCuisines.map(c => (
              <button
                key={c.key}
                onClick={() => setCuisineType(c.key)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  cuisineType === c.key
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                }`}
              >
                <span className="text-2xl block mb-1">{c.emoji}</span>
                <h3 className="font-bold text-sm">{c.label}</h3>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    cuisineType === c.key ? 'text-zinc-300' : 'text-zinc-400'
                  }`}
                >
                  {c.description.slice(0, 70)}...
                </p>
              </button>
            ))}
          </div>

          {cuisineType && (
            <div className="mt-6 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
              <p className="text-sm text-zinc-600">
                <span className="font-black">Selected:</span>{' '}
                {CUISINE_TYPES.find(c => c.key === cuisineType)?.emoji}{' '}
                {CUISINE_TYPES.find(c => c.key === cuisineType)?.label}
                {' — '}
                <span className="text-zinc-400">
                  {CUISINE_TYPES.find(c => c.key === cuisineType)?.keywords.slice(0, 5).join(', ')}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 2: STORE CATEGORIES
          ═══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Store Item Categories</h2>
          <p className="text-zinc-500 mb-6">
            If you&apos;re a convenience store, grocery, or general store — select what you carry.
            Restaurants can skip this step.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {STORE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => toggleStoreCategory(cat.key)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  storeCategories.includes(cat.key)
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                }`}
              >
                <span className="text-2xl block mb-1">{cat.emoji}</span>
                <h3 className="font-bold text-sm">{cat.label}</h3>
              </button>
            ))}
          </div>

          {storeCategories.length > 0 && (
            <p className="text-sm text-zinc-400 mt-4 font-bold">
              {storeCategories.length} categor{storeCategories.length !== 1 ? 'ies' : 'y'} selected
            </p>
          )}

          <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              💡 Don&apos;t sell store items? No problem — just hit <strong>Next</strong> to skip this step.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 3: SERVICES
          ═══════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Select Your Services</h2>
          <p className="text-zinc-500 mb-6">
            Each selected service generates a dedicated, keyword-rich SEO page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SERVICES.map(service => (
              <button
                key={service.key}
                onClick={() => toggleService(service.key)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedServices.includes(service.key)
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <h3 className="font-bold text-sm mb-1">{service.label}</h3>
                <p
                  className={`text-xs leading-relaxed ${
                    selectedServices.includes(service.key)
                      ? 'text-zinc-300'
                      : 'text-zinc-400'
                  }`}
                >
                  {service.description.slice(0, 80)}...
                </p>
              </button>
            ))}
          </div>

          <p className="text-sm text-zinc-400 mt-4 font-bold">
            {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected →{' '}
            {selectedServices.length} SEO page{selectedServices.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 4: SERVICE AREAS (States → Cities)
          ═══════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Select Service Areas</h2>
          <p className="text-zinc-500 mb-6">
            Each city you select generates a geo-targeted SEO landing page.
            Select states first, then search for cities within them.
          </p>

          {/* State Search */}
          <input
            type="text"
            value={stateSearch}
            onChange={e => setStateSearch(e.target.value)}
            placeholder="Search states..."
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black mb-4"
          />

          {/* State Grid */}
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              States ({selectedStates.length} selected)
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredStates.map(st => (
                <button
                  key={st}
                  onClick={() => toggleState(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedStates.includes(st)
                      ? 'bg-black text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {st} — {getStateName(st)}
                </button>
              ))}
            </div>
          </div>

          {/* City typeahead */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Cities
            </h3>
            <CityTypeahead
              selectedStates={selectedStates}
              selectedCities={selectedCities}
              onCitiesChange={setSelectedCities}
              getStateName={getStateName}
            />
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-sm text-zinc-600 font-bold">
              📍 {selectedCities.length} cities selected → {selectedCities.length} SEO landing pages
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Every city includes cities, towns, villages, and hamlets from our 135,000+ US places database.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 5: MENU HIGHLIGHTS & SPECIALTIES
          ═══════════════════════════════════════════════════════ */}
      {step === 5 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Menu Highlights & Specialties</h2>
          <p className="text-zinc-500 mb-6">
            Add your best-selling dishes and what makes your food unique. These appear on your homepage
            and get woven into every SEO page.
          </p>

          {/* Signature Dishes */}
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              🌟 Signature Dishes / Best Sellers
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              e.g., &ldquo;General Tso&apos;s Chicken&rdquo;, &ldquo;BBQ Brisket Platter&rdquo;, &ldquo;Chicken Parm Sub&rdquo;
            </p>

            {menuHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {menuHighlights.map(item => (
                  <button
                    key={item}
                    onClick={() => setMenuHighlights(prev => prev.filter(h => h !== item))}
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    {item} <span>×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHighlight()}
                placeholder="Add a dish or item..."
                className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={addHighlight}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              ✨ What Makes You Special?
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              e.g., &ldquo;Family recipes since 1985&rdquo;, &ldquo;Smoked in-house daily&rdquo;, &ldquo;All halal meats&rdquo;
            </p>

            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {specialties.map(item => (
                  <button
                    key={item}
                    onClick={() => setSpecialties(prev => prev.filter(s => s !== item))}
                    className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    {item} <span>×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={e => setNewSpecialty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSpecialty()}
                placeholder="What makes you unique..."
                className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                onClick={addSpecialty}
                className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {menuHighlights.length === 0 && specialties.length === 0 && (
            <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <p className="text-sm text-amber-700 font-medium">
                💡 Adding at least 3-5 signature dishes dramatically improves SEO ranking for your pages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 6: CONTENT
          ═══════════════════════════════════════════════════════ */}
      {step === 6 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Website Content</h2>
          <p className="text-zinc-500 mb-6">
            Customize your homepage, about page, and contact page. Leave blank to use smart defaults.
          </p>

          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Homepage Hero</h3>
              <input
                type="text"
                value={content.tagline}
                onChange={e => setContent(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Tagline — e.g., Authentic Chinese Cuisine Since 1998"
              />
              <input
                type="text"
                value={content.heroTitle}
                onChange={e => setContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={businessName}
              />
              <textarea
                value={content.heroSubtitle}
                onChange={e => setContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                placeholder="Short description under your business name"
              />
            </div>

            {/* About Section */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">About Page</h3>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={e => setContent(prev => ({ ...prev, aboutTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={`About ${businessName}`}
              />
              <textarea
                value={content.aboutContent}
                onChange={e => setContent(prev => ({ ...prev, aboutContent: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-28 resize-none"
                placeholder="Tell your story..."
              />
              <textarea
                value={content.aboutMission}
                onChange={e => setContent(prev => ({ ...prev, aboutMission: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                placeholder="Our mission is..."
              />
              <textarea
                value={content.aboutValues}
                onChange={e => setContent(prev => ({ ...prev, aboutValues: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                placeholder="What we believe in..."
              />
            </div>

            {/* Contact Section */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Contact Page</h3>
              <input
                type="text"
                value={content.contactTitle}
                onChange={e => setContent(prev => ({ ...prev, contactTitle: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={`Contact ${businessName}`}
              />
              <textarea
                value={content.contactContent}
                onChange={e => setContent(prev => ({ ...prev, contactContent: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                placeholder="How to reach us..."
              />
              <textarea
                value={content.businessHours}
                onChange={e => setContent(prev => ({ ...prev, businessHours: e.target.value }))}
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-28 resize-none"
                placeholder={"Mon-Fri: 11am - 10pm\nSat-Sun: 10am - 11pm"}
              />
            </div>

            {/* Per-Service Descriptions */}
            {selectedServices.length > 0 && (
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Service Page Descriptions (optional override)
                </h3>
                <p className="text-xs text-zinc-400">
                  Leave blank to auto-generate rich content based on your cuisine type and location.
                </p>
                {selectedServices.map(serviceKey => {
                  const info = SERVICE_INFO[serviceKey];
                  if (!info) return null;
                  return (
                    <div key={serviceKey}>
                      <label className="block text-xs font-bold text-zinc-500 mb-1">
                        {info.label}
                      </label>
                      <textarea
                        value={serviceDescriptions[serviceKey] || ''}
                        onChange={e =>
                          setServiceDescriptions(prev => ({
                            ...prev,
                            [serviceKey]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
                        placeholder={`Leave blank for auto-generated ${info.label.toLowerCase()} content`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 7: CUSTOM DOMAIN
          ═══════════════════════════════════════════════════════ */}
      {step === 7 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Custom Domain</h2>
          <p className="text-zinc-500 mb-6">
            Connect your own domain to your MohnMenu website. This is optional — your site also lives at
            mohnmenu.com/{businessSlug}.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={e =>
                  setCustomDomain(
                    e.target.value
                      .toLowerCase()
                      .replace(/^https?:\/\//, '')
                      .replace(/\/+$/, '')
                  )
                }
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="yourbusiness.com"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customDomainEnabled}
                onChange={e => setCustomDomainEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300"
              />
              <span className="font-bold text-black">Enable custom domain routing</span>
            </label>

            {customDomain && (
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <h3 className="font-bold mb-4">DNS Configuration</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Add the following DNS record to your domain registrar:
                </p>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 font-mono text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Type:</span>
                    <span className="font-bold">CNAME</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Name:</span>
                    <span className="font-bold">
                      {customDomain.startsWith('www.') ? 'www' : '@'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Value:</span>
                    <span className="font-bold text-indigo-600">
                      your-app-hosting-url.hosted.app
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-4">
                  DNS changes can take up to 48 hours to propagate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STEP 8: REVIEW & PUBLISH
          ═══════════════════════════════════════════════════════ */}
      {step === 8 && (
        <div>
          <h2 className="text-2xl font-black mb-2">Review & Publish</h2>
          <p className="text-zinc-500 mb-6">
            Preview everything. SEO keywords are auto-generated. Hit Publish to go live.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-50 rounded-xl p-4 text-center border border-zinc-100">
              <p className="text-2xl font-black">{selectedServices.length}</p>
              <p className="text-xs text-zinc-400 font-bold">Services</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center border border-zinc-100">
              <p className="text-2xl font-black">{selectedCities.length}</p>
              <p className="text-xs text-zinc-400 font-bold">Cities</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center border border-zinc-100">
              <p className="text-2xl font-black">{totalPages}</p>
              <p className="text-xs text-zinc-400 font-bold">Total Pages</p>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="mb-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              SEO Settings (auto-generated, editable)
            </h3>
            <input
              type="text"
              value={seo.metaTitle}
              onChange={e => setSeo(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Meta Title"
            />
            <textarea
              value={seo.metaDescription}
              onChange={e =>
                setSeo(prev => ({ ...prev, metaDescription: e.target.value }))
              }
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"
              placeholder="Meta Description"
            />
            <textarea
              value={seo.keywords}
              onChange={e => setSeo(prev => ({ ...prev, keywords: e.target.value }))}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black h-24 resize-none"
              placeholder="Keywords (auto-generated)"
            />
            <p className="text-xs text-zinc-400">
              {seo.keywords.split(',').filter(k => k.trim()).length} keywords generated
            </p>
          </div>

          {/* Page Preview List */}
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8">
            <h3 className="font-bold mb-4 text-sm">
              Pages to be created ({totalPages} total)
            </h3>

            <div className="space-y-1.5 text-sm max-h-80 overflow-y-auto">
              {/* Static pages */}
              {[
                { label: 'Homepage', path: `/${businessSlug}` },
                { label: 'Menu', path: `/${businessSlug}/menu` },
                { label: 'About', path: `/${businessSlug}/about` },
                { label: 'Contact', path: `/${businessSlug}/contact` },
              ].map(pg => (
                <div
                  key={pg.path}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg"
                >
                  <span className="w-2 h-2 bg-black rounded-full shrink-0" />
                  <span className="font-bold truncate">{pg.label}</span>
                  <span className="text-zinc-400 ml-auto text-xs truncate">
                    {pg.path}
                  </span>
                </div>
              ))}

              {/* Service pages */}
              {selectedServices.map(s => {
                const info = SERVICE_INFO[s];
                return (
                  <div
                    key={s}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0" />
                    <span className="font-bold truncate">{info?.label || s}</span>
                    <span className="text-zinc-400 ml-auto text-xs truncate">
                      /{businessSlug}/services/{s}
                    </span>
                  </div>
                );
              })}

              {/* City pages */}
              {selectedCities.slice(0, 50).map(city => {
                const state = selectedStates[0] || businessState;
                const slug = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
                return (
                  <div
                    key={city}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg"
                  >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                    <span className="font-bold truncate">
                      {city}, {state}
                    </span>
                    <span className="text-zinc-400 ml-auto text-xs truncate">
                      /{businessSlug}/{slug}
                    </span>
                  </div>
                );
              })}
              {selectedCities.length > 50 && (
                <p className="text-xs text-zinc-400 p-2">
                  ...and {selectedCities.length - 50} more city pages
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="w-full py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {saving
              ? 'Publishing...'
              : `🚀 Publish Website (${totalPages} pages)`}
          </button>
        </div>
      )}

      {/* ─── Navigation ──────────────────────────────────────── */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => {
            if (step === 1 && isSetupComplete) {
              setShowWizard(false);
            } else {
              setStep(Math.max(1, step - 1));
            }
          }}
          className="px-8 py-3 bg-zinc-100 rounded-full font-bold text-zinc-600 hover:bg-zinc-200 transition-colors"
        >
          {step === 1 && isSetupComplete ? 'Back to Dashboard' : 'Previous'}
        </button>

        {!isLastStep && (
          <button
            onClick={() => setStep(Math.min(TOTAL_STEPS, step + 1))}
            className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-zinc-800 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
