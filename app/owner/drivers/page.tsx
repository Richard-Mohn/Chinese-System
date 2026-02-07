'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { authFetch } from '@/lib/authFetch';
import type { MohnMenuDriver } from '@/lib/types';

const EMPTY_DRIVER: Partial<MohnMenuDriver> = {
  name: '',
  phone: '',
  email: '',
  driverType: 'inhouse',
  status: 'offline',
  rating: 5,
  totalDeliveries: 0,
  acceptanceRate: 100,
  cancellationRate: 0,
  backgroundCheckStatus: 'pending',
  licenseVerified: false,
  insuranceVerified: false,
  activeLocationIds: [],
};

export default function OwnerDriversPage() {
  const { currentBusiness } = useAuth();
  const [drivers, setDrivers] = useState<MohnMenuDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<MohnMenuDriver>>(EMPTY_DRIVER);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const businessId = currentBusiness?.businessId;

  // ── Fetch drivers ──────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'businesses', businessId, 'drivers'));
        const list = snap.docs.map(d => ({ driverId: d.id, ...d.data() } as MohnMenuDriver));
        setDrivers(list.sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [businessId]);

  // ── Helpers ────────────────────────────────────────
  const filtered = drivers.filter(d =>
    [d.name, d.email, d.phone].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const openNew = () => {
    setForm({ ...EMPTY_DRIVER });
    setSelectedId(null);
    setEditing(true);
  };

  const openEdit = (d: MohnMenuDriver) => {
    setForm({ ...d });
    setSelectedId(d.driverId);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!businessId || !form.name || !form.email) return;
    setSaving(true);
    try {
      const id = selectedId || crypto.randomUUID();
      const driverRef = doc(db, 'businesses', businessId, 'drivers', id);
      const now = new Date().toISOString();
      if (selectedId) {
        await updateDoc(driverRef, { ...form, updatedAt: now });
      } else {
        await setDoc(driverRef, {
          ...form,
          driverId: id,
          businessId,
          userId: '',
          createdAt: now,
          updatedAt: now,
        });
      }
      // refresh
      const snap = await getDocs(collection(db, 'businesses', businessId, 'drivers'));
      setDrivers(snap.docs.map(d => ({ driverId: d.id, ...d.data() } as MohnMenuDriver)));
      setEditing(false);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!businessId) return;
    if (!confirm('Remove this driver?')) return;
    await deleteDoc(doc(db, 'businesses', businessId, 'drivers', driverId));
    setDrivers(prev => prev.filter(d => d.driverId !== driverId));
    if (selectedId === driverId) setEditing(false);
  };

  const handleStripeOnboard = async (driver: MohnMenuDriver) => {
    if (!businessId) return;
    try {
      const res = await authFetch('/api/stripe/connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'driver',
          driverId: driver.driverId,
          businessId,
          email: driver.email,
          name: driver.name,
        }),
      });
      const data = await res.json();
      if (data.accountId) {
        // Save the Stripe account ID to the driver record
        await updateDoc(doc(db, 'businesses', businessId, 'drivers', driver.driverId), {
          stripeAccountId: data.accountId,
        });
        setDrivers(prev =>
          prev.map(d =>
            d.driverId === driver.driverId
              ? { ...d, stripeAccountId: data.accountId } as MohnMenuDriver
              : d
          ),
        );
      }
      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, '_blank');
      }
    } catch {
      alert('Failed to start Stripe onboarding for driver');
    }
  };

  if (!currentBusiness) return null;

  const statusColor: Record<string, string> = {
    available: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-zinc-300',
    'on-delivery': 'bg-indigo-500',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Drivers</h1>
          <p className="text-zinc-400 font-medium mt-1">
            Manage your delivery fleet.
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          + Add Driver
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 font-bold text-sm">Loading drivers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <p className="text-5xl mb-4">🚗</p>
          <p className="font-black text-black text-lg mb-1">No drivers yet</p>
          <p className="text-zinc-400 text-sm mb-6">
            Add your first delivery driver to start fulfilling orders.
          </p>
          <button
            onClick={openNew}
            className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            + Add Your First Driver
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(driver => (
            <div
              key={driver.driverId}
              className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4 hover:border-zinc-200 transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-lg shrink-0">
                {driver.name?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-black truncate">{driver.name}</p>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor[driver.status] || 'bg-zinc-300'}`}
                    title={driver.status}
                  />
                  <span className="text-[10px] uppercase font-black text-zinc-400">
                    {driver.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {driver.email}
                  {driver.phone ? ` · ${driver.phone}` : ''}
                </p>
                <div className="flex gap-3 mt-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  <span>⭐ {driver.rating?.toFixed(1)}</span>
                  <span>{driver.totalDeliveries} deliveries</span>
                  <span className="capitalize">{driver.driverType}</span>
                  <span
                    className={
                      driver.backgroundCheckStatus === 'approved'
                        ? 'text-emerald-600'
                        : driver.backgroundCheckStatus === 'rejected'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }
                  >
                    BG Check: {driver.backgroundCheckStatus}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {!driver.stripeAccountId ? (
                  <button
                    onClick={() => handleStripeOnboard(driver)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    💳 Setup Pay
                  </button>
                ) : (
                  <span className="text-emerald-500 text-[10px] font-black uppercase self-center">💳 ✓</span>
                )}
                <button
                  onClick={() => openEdit(driver)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(driver.driverId)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit / Add Drawer ──────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setEditing(false)}>
          <div
            className="bg-white w-full max-w-md h-full overflow-y-auto p-6 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-black">
                {selectedId ? 'Edit Driver' : 'Add Driver'}
              </h2>
              <button
                onClick={() => setEditing(false)}
                className="text-zinc-400 hover:text-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="driver-name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Full Name *
              </label>
              <input
                id="driver-name"
                type="text"
                value={form.name || ''}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="driver-email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Email *
              </label>
              <input
                id="driver-email"
                type="email"
                value={form.email || ''}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="driver-phone" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Phone
              </label>
              <input
                id="driver-phone"
                type="tel"
                value={form.phone || ''}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Driver Type */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Driver Type
              </label>
              <select
                title="Driver type"
                value={form.driverType || 'inhouse'}
                onChange={e => setForm(p => ({ ...p, driverType: e.target.value as 'inhouse' | 'marketplace' }))}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="inhouse">In-House</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Status
              </label>
              <select
                title="Driver status"
                value={form.status || 'offline'}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as MohnMenuDriver['status'] }))}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="offline">Offline</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="on-delivery">On Delivery</option>
              </select>
            </div>

            {/* Background Check */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                Background Check
              </label>
              <select
                title="Background check status"
                value={form.backgroundCheckStatus || 'pending'}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    backgroundCheckStatus: e.target.value as 'pending' | 'approved' | 'rejected',
                  }))
                }
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Verification toggles */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.licenseVerified || false}
                  onChange={e => setForm(p => ({ ...p, licenseVerified: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-bold text-black">License Verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.insuranceVerified || false}
                  onChange={e => setForm(p => ({ ...p, insuranceVerified: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-bold text-black">Insurance Verified</span>
              </label>
            </div>

            {/* Vehicle */}
            <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Vehicle (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Make"
                  value={form.vehicle?.make || ''}
                  onChange={e =>
                    setForm(p => ({ ...p, vehicle: { ...p.vehicle!, make: e.target.value } }))
                  }
                  className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={form.vehicle?.model || ''}
                  onChange={e =>
                    setForm(p => ({ ...p, vehicle: { ...p.vehicle!, model: e.target.value } }))
                  }
                  className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={form.vehicle?.licensePlate || ''}
                  onChange={e =>
                    setForm(p => ({ ...p, vehicle: { ...p.vehicle!, licensePlate: e.target.value } }))
                  }
                  className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={form.vehicle?.color || ''}
                  onChange={e =>
                    setForm(p => ({ ...p, vehicle: { ...p.vehicle!, color: e.target.value } }))
                  }
                  className="border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.email}
              className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {saving ? 'Saving...' : selectedId ? 'Update Driver' : 'Add Driver'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
