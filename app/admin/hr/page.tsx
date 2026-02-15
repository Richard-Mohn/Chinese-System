'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaCheck,
  FaClock,
  FaTimes,
  FaUserShield,
  FaVideo,
  FaClipboardCheck,
  FaIdCard,
} from 'react-icons/fa';
import ApplicationReviewModal from '@/components/ApplicationReviewModal';

interface CareerApplication {
  id: string;
  roleSlug: string;
  roleTitle: string;
  category: string;
  status: string;
  candidate?: {
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  legal?: {
    backgroundCheckConsent?: boolean | null;
  };
  createdAt?: any;
  hrReview?: {
    decision?: 'new' | 'under_review' | 'approved' | 'rejected' | 'waitlist';
    videoCallStatus?: 'not_scheduled' | 'scheduled' | 'completed' | 'failed';
    videoCallAt?: string | null;
    backgroundCheckStatus?: 'not_started' | 'pending' | 'clear' | 'review' | 'failed';
    backgroundProvider?: string | null;
    backgroundReference?: string | null;
    restrictedDeliveryEligible?: boolean;
    notes?: string;
    updatedAt?: any;
    updatedBy?: string;
  };
}

const DECISION_OPTIONS = ['new', 'under_review', 'approved', 'rejected', 'waitlist'] as const;
const VIDEO_OPTIONS = ['not_scheduled', 'scheduled', 'completed', 'failed'] as const;
const BACKGROUND_OPTIONS = ['not_started', 'pending', 'clear', 'review', 'failed'] as const;
type HrDecision = (typeof DECISION_OPTIONS)[number];
type HrVideoStatus = (typeof VIDEO_OPTIONS)[number];
type HrBackgroundStatus = (typeof BACKGROUND_OPTIONS)[number];

export default function AdminHRDashboardPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'under_review' | 'approved' | 'rejected' | 'all'>('new');
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [decision, setDecision] = useState<HrDecision>('under_review');
  const [videoCallStatus, setVideoCallStatus] = useState<HrVideoStatus>('not_scheduled');
  const [videoCallAt, setVideoCallAt] = useState('');
  const [backgroundStatus, setBackgroundStatus] = useState<HrBackgroundStatus>('not_started');
  const [backgroundProvider, setBackgroundProvider] = useState('');
  const [backgroundReference, setBackgroundReference] = useState('');
  const [restrictedEligible, setRestrictedEligible] = useState(false);
  const [notes, setNotes] = useState('');

  const canAccess = !!(
    MohnMenuUser?.role === 'admin' || MohnMenuUser?.role === 'manager'
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!canAccess) {
        router.push('/dashboard');
      }
    }
  }, [loading, user, canAccess, router]);

  useEffect(() => {
    if (!user || !canAccess) return;

    const q = query(collection(db, 'careerApplications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: CareerApplication[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setApplications(rows);
        setLoadingApps(false);
      },
      () => {
        setLoadingApps(false);
      },
    );

    return () => unsub();
  }, [user, canAccess]);

  useEffect(() => {
    if (!selected) return;

    const review = selected.hrReview || {};
    setDecision((review.decision || (selected.status as any) || 'under_review') as any);
    setVideoCallStatus((review.videoCallStatus || 'not_scheduled') as any);
    setVideoCallAt(review.videoCallAt || '');
    setBackgroundStatus((review.backgroundCheckStatus || 'not_started') as any);
    setBackgroundProvider(review.backgroundProvider || '');
    setBackgroundReference(review.backgroundReference || '');
    setRestrictedEligible(!!review.restrictedDeliveryEligible);
    setNotes(review.notes || '');
  }, [selected]);

  const counts = useMemo(() => {
    const out = { new: 0, under_review: 0, approved: 0, rejected: 0 };
    for (const app of applications) {
      const value = (app.hrReview?.decision || app.status || 'new') as keyof typeof out;
      if (value in out) out[value] += 1;
    }
    return out;
  }, [applications]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter((app) => (app.hrReview?.decision || app.status || 'new') === activeTab);
  }, [activeTab, applications]);

  const saveReview = async () => {
    if (!selected || !user) return;

    setSaving(true);
    try {
      const ref = doc(db, 'careerApplications', selected.id);
      await updateDoc(ref, {
        status: decision,
        hrReview: {
          decision,
          videoCallStatus,
          videoCallAt: videoCallAt || null,
          backgroundCheckStatus: backgroundStatus,
          backgroundProvider: backgroundProvider || null,
          backgroundReference: backgroundReference || null,
          restrictedDeliveryEligible: restrictedEligible,
          notes: notes || '',
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        updatedAt: serverTimestamp(),
      });
    } catch {
      alert('Failed to save review.');
    } finally {
      setSaving(false);
    }
  };

  const quickDecision = async (next: 'approved' | 'rejected') => {
    setDecision(next);
    if (!selected || !user) return;
    setSaving(true);
    try {
      const ref = doc(db, 'careerApplications', selected.id);
      await updateDoc(ref, {
        status: next,
        hrReview: {
          decision: next,
          videoCallStatus,
          videoCallAt: videoCallAt || null,
          backgroundCheckStatus: backgroundStatus,
          backgroundProvider: backgroundProvider || null,
          backgroundReference: backgroundReference || null,
          restrictedDeliveryEligible: restrictedEligible,
          notes: notes || '',
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        updatedAt: serverTimestamp(),
      });
    } catch {
      alert('Failed to update decision.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400 font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Operations Department</p>
          <h1 className="text-4xl font-black tracking-tighter text-black">Human Verification Dashboard<span className="text-emerald-600">.</span></h1>
          <p className="text-sm text-zinc-500 mt-1">Run video-call ID vetting, background checks, and approve drivers for restricted delivery eligibility.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <button onClick={() => setActiveTab('new')} className={`rounded-2xl border p-4 text-left ${activeTab === 'new' ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">New</p>
            <p className="text-2xl font-black">{counts.new}</p>
          </button>
          <button onClick={() => setActiveTab('under_review')} className={`rounded-2xl border p-4 text-left ${activeTab === 'under_review' ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Review</p>
            <p className="text-2xl font-black">{counts.under_review}</p>
          </button>
          <button onClick={() => setActiveTab('approved')} className={`rounded-2xl border p-4 text-left ${activeTab === 'approved' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Approved</p>
            <p className="text-2xl font-black">{counts.approved}</p>
          </button>
          <button onClick={() => setActiveTab('rejected')} className={`rounded-2xl border p-4 text-left ${activeTab === 'rejected' ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">Rejected</p>
            <p className="text-2xl font-black">{counts.rejected}</p>
          </button>
          <button onClick={() => setActiveTab('all')} className={`rounded-2xl border p-4 text-left ${activeTab === 'all' ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-200 bg-white'}`}>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-70">All</p>
            <p className="text-2xl font-black">{applications.length}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl border border-zinc-100 p-5">
            <h2 className="text-lg font-black text-black mb-4">Application Queue</h2>
            {loadingApps ? (
              <p className="text-sm text-zinc-400 font-bold">Loading applications...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-400 font-bold">No applications in this queue.</p>
            ) : (
              <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
                {filtered.map((app) => {
                  const isSelected = selected?.id === app.id;
                  const reviewState = app.hrReview?.decision || app.status || 'new';
                  return (
                    <button
                      key={app.id}
                      onClick={() => setSelected(app)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${isSelected ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-black text-black text-sm">{app.candidate?.fullName || 'Unnamed Candidate'}</p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{reviewState.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{app.roleTitle || app.roleSlug}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{app.candidate?.city || ''}{app.candidate?.state ? `, ${app.candidate.state}` : ''}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-zinc-100 p-5">
            {!selected ? (
              <div className="h-full min-h-95 flex items-center justify-center text-center text-zinc-400 text-sm font-bold">
                Select an application to run video + background verification.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-black">{selected.candidate?.fullName || 'Candidate'}</h2>
                    <p className="text-sm text-zinc-500">{selected.roleTitle || selected.roleSlug} · {selected.candidate?.email || 'No email'}</p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-colors"
                  >
                    <FaIdCard /> Verify Identity
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-200 p-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-2"><FaUserShield /> Decision</div>
                    <select title="HR decision" className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm" value={decision} onChange={(e) => setDecision(e.target.value as any)}>
                      {DECISION_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 p-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-2"><FaVideo /> Video Call</div>
                    <select title="Video call status" className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm" value={videoCallStatus} onChange={(e) => setVideoCallStatus(e.target.value as any)}>
                      {VIDEO_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                    </select>
                    <input
                      type="datetime-local"
                      title="Video call scheduled or completed time"
                      className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm mt-2"
                      value={videoCallAt}
                      onChange={(e) => setVideoCallAt(e.target.value)}
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 p-3 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-2"><FaClipboardCheck /> Background Check</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select title="Background status" className="h-10 rounded-xl border border-zinc-200 px-3 text-sm" value={backgroundStatus} onChange={(e) => setBackgroundStatus(e.target.value as any)}>
                        {BACKGROUND_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                      </select>
                      <input className="h-10 rounded-xl border border-zinc-200 px-3 text-sm" placeholder="Provider (e.g. Stripe Identity)" value={backgroundProvider} onChange={(e) => setBackgroundProvider(e.target.value)} />
                      <input className="h-10 rounded-xl border border-zinc-200 px-3 text-sm" placeholder="Reference ID" value={backgroundReference} onChange={(e) => setBackgroundReference(e.target.value)} />
                    </div>
                    <label className="mt-3 inline-flex items-start gap-2 text-sm text-zinc-700">
                      <input type="checkbox" checked={restrictedEligible} onChange={(e) => setRestrictedEligible(e.target.checked)} className="mt-1" />
                      Eligible for restricted-item handoff (alcohol/tobacco) after legal checks.
                    </label>
                    {selected.legal?.backgroundCheckConsent === false && (
                      <p className="text-xs text-red-600 font-bold mt-2">Background check consent is missing on this application.</p>
                    )}
                  </div>
                </div>

                <textarea
                  className="w-full min-h-28 rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                  placeholder="HR notes (ID quality, face match, references, concerns, next step)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <button
                    onClick={() => quickDecision('rejected')}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-sm font-black hover:bg-red-100 disabled:opacity-50"
                  >
                    <FaTimes /> Reject
                  </button>
                  <button
                    onClick={() => quickDecision('approved')}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-black hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={saveReview}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-black hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <FaClock /> {saving ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && selected && (
        <ApplicationReviewModal
          application={selected}
          onClose={() => setShowReviewModal(false)}
          onUpdate={() => {
            // Applications will auto-update via onSnapshot
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
}
