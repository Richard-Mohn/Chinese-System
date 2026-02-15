'use client';

import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { useState, useMemo } from 'react';
import { INTEGRATION_REGISTRY, type IntegrationCategory, type Integration } from '@/lib/integrations/registry';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlug, FaCheck, FaClock, FaLock, FaStar, FaPrint, FaCashRegister,
  FaChartLine, FaTruck, FaEnvelope, FaBoxes, FaCreditCard, FaCalculator
} from 'react-icons/fa';
import Link from 'next/link';

export default function OwnerIntegrationsPageGated() {
  return (
    <GatedPage feature="integrations">
      <OwnerIntegrationsPage />
    </GatedPage>
  );
}

const CATEGORY_INFO: Record<IntegrationCategory, { label: string; icon: typeof FaPlug; color: string; description: string }> = {
  pos: { label: 'Point of Sale', icon: FaCashRegister, color: 'blue', description: 'Sync with your POS system' },
  printer: { label: 'Printers', icon: FaPrint, color: 'purple', description: 'Receipt & label printers' },
  accounting: { label: 'Accounting', icon: FaCalculator, color: 'green', description: 'QuickBooks, Xero & more' },
  payment: { label: 'Payments', icon: FaCreditCard, color: 'emerald', description: 'Payment processors' },
  delivery: { label: 'Delivery', icon: FaTruck, color: 'orange', description: 'Third-party logistics' },
  marketing: { label: 'Marketing', icon: FaEnvelope, color: 'pink', description: 'Email & SMS automation' },
  inventory: { label: 'Inventory', icon: FaBoxes, color: 'amber', description: 'Stock management' },
  analytics: { label: 'Analytics', icon: FaChartLine, color: 'indigo', description: 'Business intelligence' },
};

function OwnerIntegrationsPage() {
  const { currentBusiness } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredIntegrations = useMemo(() => {
    let results = INTEGRATION_REGISTRY;
    
    if (selectedCategory !== 'all') {
      results = results.filter(i => i.category === selectedCategory);
    }
    
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter(i => 
        i.name.toLowerCase().includes(lower) ||
        i.description.toLowerCase().includes(lower) ||
        i.features.some(f => f.toLowerCase().includes(lower))
      );
    }
    
    return results;
  }, [selectedCategory, search]);

  // Tier check
  const currentTier = currentBusiness?.tier || 'starter';
  const hasGrowth = currentTier === 'growth' || currentTier === 'professional';
  const hasPro = currentTier === 'professional';

  const activeCount = INTEGRATION_REGISTRY.filter(i => i.status === 'active').length;
  const availableCount = INTEGRATION_REGISTRY.filter(i => i.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-black">Integrations Hub</h1>
        <p className="text-zinc-400 font-medium mt-1">
          Connect MohnMenu with your favorite business tools. {activeCount} active, {availableCount} available, {INTEGRATION_REGISTRY.length - activeCount - availableCount} coming soon.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search integrations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All ({INTEGRATION_REGISTRY.length})
            </button>
            {(Object.keys(CATEGORY_INFO) as IntegrationCategory[]).map(cat => {
              const count = INTEGRATION_REGISTRY.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {CATEGORY_INFO[cat].label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Integration Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${search}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredIntegrations.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-zinc-100 p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-zinc-400 font-bold">No integrations match your search</p>
            </div>
          ) : (
            filteredIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                hasGrowth={hasGrowth}
                hasPro={hasPro}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-black mb-2">Need a custom integration?</h3>
        <p className="text-indigo-100 text-sm font-medium mb-4">
          We can build custom integrations for enterprise clients. Contact our solutions team to discuss your needs.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
        >
          Contact Sales
        </Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Integration Card Component
// ══════════════════════════════════════════════════════════════

function IntegrationCard({ 
  integration, 
  hasGrowth, 
  hasPro 
}: { 
  integration: Integration; 
  hasGrowth: boolean; 
  hasPro: boolean;
}) {
  const categoryInfo = CATEGORY_INFO[integration.category];
  const Icon = categoryInfo.icon;
  
  const isLocked = 
    (integration.requiresTier === 'growth' && !hasGrowth) ||
    (integration.requiresTier === 'professional' && !hasPro);

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    available: 'bg-blue-100 text-blue-700 border-blue-200',
    coming_soon: 'bg-amber-100 text-amber-700 border-amber-200',
    beta: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const statusLabels = {
    active: 'Active',
    available: 'Available',
    coming_soon: 'Coming Soon',
    beta: 'Beta',
  };

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
      isLocked ? 'border-zinc-200 opacity-60' : 'border-zinc-100 hover:border-black'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-br p-4 flex items-center justify-between from-${categoryInfo.color}-500 to-${categoryInfo.color}-600`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Icon className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm">{integration.name}</h3>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
              {categoryInfo.label}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${statusColors[integration.status]}`}>
          {statusLabels[integration.status]}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-600 font-medium leading-relaxed">
          {integration.description}
        </p>

        {/* Features */}
        <div className="space-y-1">
          {integration.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-zinc-600 font-medium">{feature}</span>
            </div>
          ))}
          {integration.features.length > 3 && (
            <p className="text-[10px] text-zinc-400 font-bold">
              + {integration.features.length - 3} more features
            </p>
          )}
        </div>

        {/* Pricing */}
        {integration.pricingModel && (
          <div className="bg-zinc-50 rounded-lg px-3 py-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-0.5">
              Pricing
            </p>
            <p className="text-xs text-zinc-700 font-bold">{integration.pricingModel}</p>
          </div>
        )}

        {/* Tier Lock */}
        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <FaLock className="text-amber-600 text-xs" />
            <p className="text-xs text-amber-700 font-bold">
              Requires {integration.requiresTier === 'growth' ? 'Growth' : 'Professional'} tier
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {integration.status === 'active' && (
            <button className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
              <FaCheck /> Connected
            </button>
          )}
          
          {integration.status === 'available' && !isLocked && (
            <button className="flex-1 bg-black text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
              <FaPlug /> Connect
            </button>
          )}
          
          {integration.status === 'coming_soon' && (
            <button 
              disabled 
              className="flex-1 bg-zinc-100 text-zinc-400 px-4 py-2 rounded-xl text-xs font-black cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaClock /> Coming Soon
            </button>
          )}
          
          {integration.status === 'beta' && !isLocked && (
            <button className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
              <FaStar /> Join Beta
            </button>
          )}

          {integration.docsUrl && (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border-2 border-zinc-200 rounded-xl text-xs font-black text-zinc-600 hover:border-black hover:text-black transition-colors"
            >
              Docs
            </a>
          )}
        </div>

        {/* Setup Complexity */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Setup Complexity
          </span>
          <div className="flex gap-1">
            {['easy', 'medium', 'advanced'].map((level, idx) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  (integration.setupComplexity === 'easy' && idx === 0) ||
                  (integration.setupComplexity === 'medium' && idx <= 1) ||
                  (integration.setupComplexity === 'advanced' && idx <= 2)
                    ? 'bg-zinc-800'
                    : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
