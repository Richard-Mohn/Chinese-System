'use client';

import { useAuth } from '@/context/AuthContext';
import GatedPage from '@/components/GatedPage';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaUserPlus,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaTrash,
  FaEdit,
  FaSave,
} from 'react-icons/fa';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  yearsExp: number;
  customerFavorite: boolean;
  onDuty: boolean;
  uid?: string;
}

const ROLE_OPTIONS = [
  'bartender',
  'server',
  'host',
  'manager',
  'cook',
  'dj / karaoke host',
  'bouncer',
  'barback',
];

const ROLE_COLORS: Record<string, string> = {
  bartender: 'bg-purple-100 text-purple-700 border-purple-200',
  server: 'bg-blue-100 text-blue-700 border-blue-200',
  host: 'bg-pink-100 text-pink-700 border-pink-200',
  manager: 'bg-amber-100 text-amber-700 border-amber-200',
  cook: 'bg-orange-100 text-orange-700 border-orange-200',
  'dj / karaoke host': 'bg-violet-100 text-violet-700 border-violet-200',
  bouncer: 'bg-zinc-200 text-zinc-700 border-zinc-300',
  barback: 'bg-teal-100 text-teal-700 border-teal-200',
};

const EMPTY_FORM = {
  name: '',
  role: 'bartender',
  specialty: '',
  bio: '',
  yearsExp: 0,
  customerFavorite: false,
  onDuty: true,
};

export default function OwnerStaffPageGated() {
  return (
    <GatedPage feature="staff">
      <OwnerStaffPage />
    </GatedPage>
  );
}

function OwnerStaffPage() {
  const { currentBusiness } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Real-time listener
  useEffect(() => {
    if (!currentBusiness) return;

    const ref = collection(db, 'businesses', currentBusiness.businessId, 'staffOnDuty');
    const unsub = onSnapshot(ref, snap => {
      const data: StaffMember[] = [];
      snap.forEach(d => {
        const s = d.data();
        data.push({
          id: d.id,
          name: s.name || '',
          role: s.role || '',
          specialty: s.specialty || '',
          bio: s.bio || '',
          yearsExp: s.yearsExp || 0,
          customerFavorite: s.customerFavorite || false,
          onDuty: s.onDuty ?? true,
          uid: s.uid || '',
        });
      });
      setStaff(data);
      setLoading(false);
    });

    return () => unsub();
  }, [currentBusiness]);

  const toggleDuty = useCallback(
    async (member: StaffMember) => {
      if (!currentBusiness) return;
      const ref = doc(db, 'businesses', currentBusiness.businessId, 'staffOnDuty', member.id);
      await updateDoc(ref, { onDuty: !member.onDuty, updatedAt: new Date().toISOString() });
    },
    [currentBusiness]
  );

  const toggleFavorite = useCallback(
    async (member: StaffMember) => {
      if (!currentBusiness) return;
      const ref = doc(db, 'businesses', currentBusiness.businessId, 'staffOnDuty', member.id);
      await updateDoc(ref, { customerFavorite: !member.customerFavorite });
    },
    [currentBusiness]
  );

  const deleteMember = useCallback(
    async (id: string) => {
      if (!currentBusiness) return;
      if (!confirm('Remove this staff member?')) return;
      await deleteDoc(doc(db, 'businesses', currentBusiness.businessId, 'staffOnDuty', id));
    },
    [currentBusiness]
  );

  const startEdit = (member: StaffMember) => {
    setEditing(member.id);
    setForm({
      name: member.name,
      role: member.role,
      specialty: member.specialty,
      bio: member.bio,
      yearsExp: member.yearsExp,
      customerFavorite: member.customerFavorite,
      onDuty: member.onDuty,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!currentBusiness || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const ref = doc(db, 'businesses', currentBusiness.businessId, 'staffOnDuty', editing);
        await updateDoc(ref, {
          ...form,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'businesses', currentBusiness.businessId, 'staffOnDuty'), {
          ...form,
          updatedAt: new Date().toISOString(),
        });
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Save staff error:', err);
    } finally {
      setSaving(false);
    }
  };

  const onDutyCount = staff.filter(s => s.onDuty).length;

  if (!currentBusiness) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Staff</h1>
          <p className="text-zinc-400 font-medium mt-1">
            {onDutyCount} on duty · {staff.length} total members
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors"
        >
          <FaUserPlus /> Add Staff
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-3xl font-black text-black">{staff.length}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Total Staff</div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-3xl font-black text-green-600">{onDutyCount}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">On Duty</div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-3xl font-black text-zinc-400">{staff.length - onDutyCount}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Off Duty</div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="text-3xl font-black text-amber-500">{staff.filter(s => s.customerFavorite).length}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Fan Favorites</div>
        </div>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400 font-bold text-sm">Loading staff...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-zinc-600 font-bold">No staff members yet</p>
          <p className="text-zinc-400 text-sm mt-1">Add your team to show &ldquo;Who&apos;s Working Tonight&rdquo; on your storefront.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map(member => (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                member.onDuty ? 'border-green-200 shadow-sm' : 'border-zinc-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                      member.onDuty
                        ? 'bg-gradient-to-br from-purple-500 to-violet-500 text-white'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black">{member.name}</span>
                      {member.customerFavorite && (
                        <FaStar className="text-amber-500 text-xs" title="Customer Favorite" />
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border mt-0.5 ${
                        ROLE_COLORS[member.role] || 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* On/Off Duty Toggle */}
                <button
                  onClick={() => toggleDuty(member)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    member.onDuty
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                  title={member.onDuty ? 'Click to set off duty' : 'Click to set on duty'}
                >
                  {member.onDuty ? (
                    <>
                      <FaToggleOn className="text-sm" /> On Duty
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="text-sm" /> Off Duty
                    </>
                  )}
                </button>
              </div>

              {/* Details */}
              {member.specialty && (
                <p className="text-sm text-zinc-600 mb-1">
                  <span className="font-bold text-zinc-500">Specialty:</span> {member.specialty}
                </p>
              )}
              {member.bio && (
                <p className="text-sm text-zinc-400 mb-2 line-clamp-2">{member.bio}</p>
              )}
              {member.yearsExp > 0 && (
                <p className="text-xs text-zinc-400">{member.yearsExp} years experience</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
                <button
                  onClick={() => toggleFavorite(member)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    member.customerFavorite
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  <FaStar className="text-[10px]" />
                  {member.customerFavorite ? 'Favorited' : 'Set Favorite'}
                </button>
                <button
                  onClick={() => startEdit(member)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 text-zinc-500 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors"
                >
                  <FaEdit className="text-[10px]" /> Edit
                </button>
                <button
                  onClick={() => deleteMember(member.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors ml-auto"
                >
                  <FaTrash className="text-[10px]" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              title="Close"
              className="absolute top-4 right-4 w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>

            <h2 className="text-xl font-black text-black mb-6">
              {editing ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Mike Reeves"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Role
                </label>
                <select
                  title="Staff role"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Craft Cocktails & Whiskey Flights"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows={3}
                  placeholder="Short bio shown to customers..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.yearsExp}
                    title="Years of experience"
                    onChange={e => setForm({ ...form, yearsExp: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.customerFavorite}
                      onChange={e => setForm({ ...form, customerFavorite: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-bold text-zinc-600">⭐ Customer Favorite</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={form.onDuty}
                      onChange={e => setForm({ ...form, onDuty: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-zinc-600">🟢 On Duty Now</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <FaSave /> {saving ? 'Saving...' : editing ? 'Update' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
