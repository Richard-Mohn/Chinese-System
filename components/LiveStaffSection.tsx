'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  bio?: string;
  yearsExp?: number;
  customerFavorite?: boolean;
  onDuty: boolean;
}

interface LiveStaffSectionProps {
  businessId: string;
  primaryColor?: string;
  orderPath: string;
  /** Compact mode for embedding in order page sidebar */
  compact?: boolean;
  /** Called when customer clicks "Send Order" on a staff member */
  onSelectStaff?: (staff: StaffMember) => void;
  /** The currently selected staff ID (for highlighting) */
  selectedStaffId?: string;
}

export default function LiveStaffSection({
  businessId,
  primaryColor = '#7C3AED',
  orderPath,
  compact = false,
  onSelectStaff,
  selectedStaffId,
}: LiveStaffSectionProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener — updates whenever owner toggles on/off duty
  useEffect(() => {
    const ref = collection(db, 'businesses', businessId, 'staffOnDuty');
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
        });
      });
      setStaff(data);
      setLoading(false);
    });

    return () => unsub();
  }, [businessId]);

  const onDutyStaff = staff.filter(s => s.onDuty);
  const offDutyStaff = staff.filter(s => !s.onDuty);

  if (loading) {
    return (
      <div className={compact ? 'py-6' : 'py-24 px-4'}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-sm font-medium">Loading staff...</span>
        </div>
      </div>
    );
  }

  if (staff.length === 0) return null;

  /* ─── Compact mode (for order page sidebar) ─── */
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
            Staff On Duty
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-600">{onDutyStaff.length} online</span>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {onDutyStaff.map(member => (
            <motion.button
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelectStaff?.(member)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                selectedStaffId === member.id
                  ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-400'
                  : 'border-zinc-100 bg-white hover:border-zinc-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 relative"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
              >
                {member.name.charAt(0)}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-black truncate">{member.name}</span>
                  {member.customerFavorite && <span className="text-amber-500 text-xs">⭐</span>}
                </div>
                <span className="text-xs text-zinc-400 capitalize">{member.role}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wide text-purple-600">
                {selectedStaffId === member.id ? '✓ Selected' : 'Select'}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

        {onDutyStaff.length === 0 && (
          <div className="text-center py-4 bg-zinc-50 rounded-xl">
            <p className="text-sm text-zinc-400">No staff currently on duty</p>
          </div>
        )}

        {/* "Anyone available" option */}
        {onDutyStaff.length > 0 && (
          <button
            onClick={() => onSelectStaff?.({ id: '', name: '', role: '', onDuty: true })}
            className={`w-full text-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              selectedStaffId === '' || !selectedStaffId
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
            }`}
          >
            Anyone Available
          </button>
        )}
      </div>
    );
  }

  /* ─── Full section mode (for tenant storefront) ─── */
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
            Your Crew Tonight
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black mb-4">
            Who&apos;s Working
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            See who&apos;s behind the bar and on the floor tonight. Send your order to your favorite — they&apos;ll have it ready when you arrive.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-green-600">
              {onDutyStaff.length} staff online now
            </span>
          </div>
        </div>

        {/* On Duty staff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {onDutyStaff.map(member => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="group bg-white p-8 rounded-3xl border border-zinc-200 hover:border-black transition-all duration-300 text-center relative"
              >
                {/* Online indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Online</span>
                </div>

                {member.customerFavorite && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                    ⭐ Fan Favorite
                  </span>
                )}

                <div
                  className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl font-black text-white shadow-xl relative"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
                >
                  {member.name.charAt(0)}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white" />
                </div>

                <h3 className="text-lg font-black text-black mb-1">{member.name}</h3>
                <p className="text-sm font-bold capitalize mb-3" style={{ color: primaryColor }}>{member.role}</p>

                {member.specialty && (
                  <p className="text-zinc-500 text-xs bg-zinc-50 px-3 py-1.5 rounded-full inline-block mb-3">
                    🎯 {member.specialty}
                  </p>
                )}
                {member.bio && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{member.bio}</p>
                )}
                {member.yearsExp && member.yearsExp > 0 && (
                  <p className="text-[10px] text-zinc-400 font-bold mt-3 uppercase tracking-wider">
                    {member.yearsExp} years experience
                  </p>
                )}

                {onSelectStaff ? (
                  <button
                    onClick={() => onSelectStaff(member)}
                    className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      selectedStaffId === member.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-zinc-100 text-black group-hover:bg-black group-hover:text-white'
                    }`}
                  >
                    {selectedStaffId === member.id
                      ? `✓ Sending to ${member.name.split(' ')[0]}`
                      : `Send Order to ${member.name.split(' ')[0]} →`
                    }
                  </button>
                ) : (
                  <Link
                    href={orderPath}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-black rounded-full text-xs font-bold group-hover:bg-black group-hover:text-white transition-all"
                  >
                    Send Order to {member.name.split(' ')[0]} →
                  </Link>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Off-duty staff (dimmed) */}
        {offDutyStaff.length > 0 && onDutyStaff.length > 0 && (
          <div className="mt-8">
            <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Off Duty
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {offDutyStaff.map(member => (
                <div
                  key={member.id}
                  className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-center opacity-50"
                >
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-zinc-500">{member.name}</p>
                  <p className="text-[10px] text-zinc-400 capitalize">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — nobody on duty */}
        {onDutyStaff.length === 0 && (
          <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-100">
            <div className="text-5xl mb-4">🌙</div>
            <h3 className="text-xl font-bold text-zinc-600 mb-2">No Staff On Duty</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Check back later — our team will be online soon!
            </p>
            <Link
              href={orderPath}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors"
            >
              Order Anyway →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
