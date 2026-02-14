'use client';

import { useMemo, useState } from 'react';
import { FaArrowRight, FaSearch, FaShieldAlt, FaTimes } from 'react-icons/fa';

interface ApplicationBackgroundCheckModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (result: {
    firstName: string;
    lastName: string;
    state: string;
    dob?: string;
    recordCount: number;
    rawResult: unknown;
  }) => void;
  defaultFullName?: string;
}

const STATES = [
  { code: 'VA', name: 'Virginia' },
  { code: 'WV', name: 'West Virginia' },
];

function splitName(fullName: string | undefined) {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

export default function ApplicationBackgroundCheckModal({
  open,
  onClose,
  onComplete,
  defaultFullName,
}: ApplicationBackgroundCheckModalProps) {
  const defaults = useMemo(() => splitName(defaultFullName), [defaultFullName]);
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [state, setState] = useState('VA');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleRunSearch = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = process.env.NEXT_PUBLIC_MOHNMATRIX_SEARCH_API_URL || 'https://mohnmatrix.com/api/search';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          state,
          dob: dob || undefined,
          purpose: 'employment_screening',
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'Background check failed.');
      }

      const records = payload.results || payload.raw || [];

      onComplete({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        state,
        dob: dob || undefined,
        recordCount: records.length,
        rawResult: payload,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to run background check right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/55" onClick={onClose} aria-label="Close modal" />

      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-emerald-500 to-green-600" />
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Application Background Check</h2>
              <p className="text-xs text-zinc-500">Required for this application workflow.</p>
            </div>
          </div>
          <button onClick={onClose} title="Close background check modal" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">First Name</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Last Name</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">State</label>
              <select
                title="Select state"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {STATES.map(option => (
                  <option key={option.code} value={option.code}>{option.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">DOB (optional)</label>
              <input
                type="text"
                title="Date of birth"
                value={dob}
                onChange={e => setDob(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleRunSearch}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold hover:brightness-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaSearch className="text-sm" />
            )}
            {loading ? 'Running Search...' : 'Run Search and Continue'}
            {!loading && <FaArrowRight className="text-xs" />}
          </button>

          <p className="text-xs text-zinc-500">
            This check is only available inside application flows and not exposed as a standalone owner action.
          </p>
        </div>
      </div>
    </div>
  );
}
