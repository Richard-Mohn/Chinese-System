'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CityResult {
  n: string;
  lat: number;
  lng: number;
  t: string; // city | town | village | hamlet
}

interface CityTypeaheadProps {
  /** Currently selected state(s) to search within */
  selectedStates: string[];
  /** Already-selected cities (displayed as pills) */
  selectedCities: string[];
  /** Callback when cities change */
  onCitiesChange: (cities: string[]) => void;
  /** State name lookup */
  getStateName: (code: string) => string;
}

const TYPE_LABELS: Record<string, string> = {
  city: 'City',
  town: 'Town',
  village: 'Village',
  hamlet: 'Hamlet',
};

const TYPE_COLORS: Record<string, string> = {
  city: 'bg-indigo-100 text-indigo-700',
  town: 'bg-emerald-100 text-emerald-700',
  village: 'bg-amber-100 text-amber-700',
  hamlet: 'bg-zinc-100 text-zinc-500',
};

export default function CityTypeahead({
  selectedStates,
  selectedCities,
  onCitiesChange,
  getStateName,
}: CityTypeaheadProps) {
  const [activeState, setActiveState] = useState(selectedStates[0] || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [totalForState, setTotalForState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update active state when selectedStates changes
  useEffect(() => {
    if (selectedStates.length > 0 && !selectedStates.includes(activeState)) {
      setActiveState(selectedStates[0]);
    }
  }, [selectedStates, activeState]);

  // Fetch total count when active state changes
  useEffect(() => {
    if (!activeState) return;
    fetch(`/api/cities?state=${activeState}`)
      .then(r => r.json())
      .then(data => setTotalForState(data.total || 0))
      .catch(() => {});
  }, [activeState]);

  // Search cities with debounce
  const searchCities = useCallback(async (searchQuery: string, state: string) => {
    if (!state || searchQuery.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cities?state=${state}&q=${encodeURIComponent(searchQuery)}&limit=15`);
      const data = await res.json();
      setResults(data.cities || []);
      setTotalForState(data.total || 0);
      setShowDropdown(true);
      setHighlightIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input handler
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchCities(value, activeState);
    }, 250);
  };

  // Add a city
  const addCity = (cityName: string) => {
    if (!selectedCities.includes(cityName)) {
      onCitiesChange([...selectedCities, cityName]);
    }
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Remove a city
  const removeCity = (cityName: string) => {
    onCitiesChange(selectedCities.filter(c => c !== cityName));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && results[highlightIndex]) {
      e.preventDefault();
      addCity(results[highlightIndex].n);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cities for the active state
  const citiesInActiveState = selectedCities.filter(() => true); // All for now — grouped display below

  if (selectedStates.length === 0) {
    return (
      <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
        <p className="text-zinc-400 font-bold text-sm">Select at least one state above to add cities</p>
      </div>
    );
  }

  return (
    <div>
      {/* State tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedStates.map(st => (
          <button
            key={st}
            onClick={() => { setActiveState(st); setQuery(''); setResults([]); setShowDropdown(false); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeState === st
                ? 'bg-black text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {getStateName(st)} ({st})
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            onKeyDown={handleKeyDown}
            placeholder={`Search cities in ${getStateName(activeState)}... (type 3+ characters)`}
            className="w-full px-4 py-3 pl-10 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <div className="absolute right-3 top-3.5">
              <div className="animate-spin h-4 w-4 border-2 border-zinc-300 border-t-black rounded-full" />
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="text-xs text-zinc-400 mt-1.5 ml-1 font-medium">
          {query.length > 0 && query.length < 3
            ? `Type ${3 - query.length} more character${3 - query.length > 1 ? 's' : ''} to search`
            : `${totalForState.toLocaleString()} places available in ${getStateName(activeState)}`
          }
        </p>

        {/* Dropdown results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {results.map((city, i) => {
              const isSelected = selectedCities.includes(city.n);
              return (
                <button
                  key={`${city.n}-${city.lat}`}
                  onClick={() => addCity(city.n)}
                  className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-colors ${
                    i === highlightIndex ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                  } ${isSelected ? 'opacity-50' : ''} ${i === 0 ? 'rounded-t-xl' : ''} ${i === results.length - 1 ? 'rounded-b-xl' : ''}`}
                  disabled={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800">{city.n}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[city.t] || TYPE_COLORS.hamlet}`}>
                      {TYPE_LABELS[city.t] || city.t}
                    </span>
                  </span>
                  {isSelected ? (
                    <span className="text-xs text-zinc-400 font-bold">Added ✓</span>
                  ) : (
                    <span className="text-xs text-zinc-400">+ Add</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* No results */}
        {showDropdown && query.length >= 3 && results.length === 0 && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl p-4">
            <p className="text-sm text-zinc-400 text-center font-medium">
              No places found for &ldquo;{query}&rdquo; in {getStateName(activeState)}
            </p>
          </div>
        )}
      </div>

      {/* Selected cities grouped by state */}
      {selectedCities.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Selected Cities ({selectedCities.length})
          </h4>
          
          {selectedStates.map(st => {
            // We just show all cities — user tracks which state they belong to
            // In future, could store city+state pairs. For now, show all.
            return null; // Handled below as flat list
          })}

          <div className="flex flex-wrap gap-2">
            {selectedCities.map(city => (
              <span
                key={city}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold"
              >
                {city}
                <button
                  onClick={() => removeCity(city)}
                  className="ml-0.5 text-indigo-200 hover:text-white transition-colors"
                  aria-label={`Remove ${city}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
