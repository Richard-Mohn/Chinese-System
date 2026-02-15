'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FaCheckCircle, FaFilter, FaReply, FaStar } from 'react-icons/fa';

type ResponseVisibility = 'internal' | 'public';
type FollowUpStatus = 'open' | 'resolved';

const REVIEW_FLAG_OPTIONS = [
  { key: 'food_quality', label: 'Food Quality' },
  { key: 'late_delivery', label: 'Late Delivery' },
  { key: 'wrong_order', label: 'Wrong Order' },
  { key: 'driver_behavior', label: 'Driver Behavior' },
  { key: 'refund_requested', label: 'Refund Requested' },
  { key: 'vip_followup', label: 'VIP Follow-up' },
] as const;

interface CustomerFeedback {
  restaurantRating?: number;
  restaurantReview?: string;
  driverRating?: number;
  driverReview?: string;
  overallRating?: number;
  overallReview?: string;
  updatedAt?: string;
  ownerResponse?: string;
  ownerRespondedAt?: string;
  ownerResponderUid?: string;
  ownerResponseVisibility?: ResponseVisibility;
  reviewFlags?: string[];
  followUpStatus?: FollowUpStatus;
}

interface ReviewOrder {
  id: string;
  status: string;
  customerName: string;
  createdAt?: string;
  customerReviewSubmittedAt?: string;
  customerFeedback?: CustomerFeedback;
  assignedDriverId?: string;
  driverId?: string;
}

function toStars(value?: number) {
  const n = Number(value) || 0;
  return n > 0 ? `${n.toFixed(1)} ★` : '—';
}

export default function OwnerReviewsPage() {
  const { currentBusiness, user } = useAuth();

  const [orders, setOrders] = useState<ReviewOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');

  const [ownerResponse, setOwnerResponse] = useState('');
  const [responseVisibility, setResponseVisibility] = useState<ResponseVisibility>('internal');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('open');
  const [reviewFlags, setReviewFlags] = useState<string[]>([]);

  const [queueFilter, setQueueFilter] = useState<'all' | 'needs_response' | 'flagged' | 'low_rated' | 'public_response'>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentBusiness) return;

    const q = query(
      collection(db, 'businesses', currentBusiness.businessId, 'orders'),
      orderBy('updatedAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: ReviewOrder[] = [];
      snap.forEach((d) => {
        const data = d.data() as Record<string, any>;
        const feedback = data.customerFeedback as CustomerFeedback | undefined;
        if (!feedback && !data.customerReviewSubmittedAt) return;

        rows.push({
          id: d.id,
          status: data.status || 'pending',
          customerName: data.customerName || 'Customer',
          createdAt: data.createdAt,
          customerReviewSubmittedAt: data.customerReviewSubmittedAt,
          customerFeedback: feedback,
          assignedDriverId: data.assignedDriverId,
          driverId: data.driverId,
        });
      });

      setOrders(rows);
      setLoading(false);

      if (!selectedId && rows[0]) {
        setSelectedId(rows[0].id);
      }
    });

    return () => unsub();
  }, [currentBusiness, selectedId]);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) || null, [orders, selectedId]);
  const hasDriverReview = !!(selected?.assignedDriverId || selected?.driverId);

  useEffect(() => {
    const feedback = selected?.customerFeedback;
    setOwnerResponse(feedback?.ownerResponse || '');
    setResponseVisibility((feedback?.ownerResponseVisibility as ResponseVisibility) || 'internal');
    setFollowUpStatus((feedback?.followUpStatus as FollowUpStatus) || 'open');
    setReviewFlags(Array.isArray(feedback?.reviewFlags) ? feedback!.reviewFlags! : []);
    setSaveMessage(null);
  }, [selectedId, selected?.customerFeedback]);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const fb = item.customerFeedback || {};
      const hasResponse = !!fb.ownerResponse?.trim();
      const hasFlags = Array.isArray(fb.reviewFlags) && fb.reviewFlags.length > 0;
      const lowRated = Number(fb.overallRating || 0) > 0 && Number(fb.overallRating || 0) <= 2;
      const isPublicResponse = hasResponse && fb.ownerResponseVisibility === 'public';

      if (queueFilter === 'needs_response' && hasResponse) return false;
      if (queueFilter === 'flagged' && !hasFlags) return false;
      if (queueFilter === 'low_rated' && !lowRated) return false;
      if (queueFilter === 'public_response' && !isPublicResponse) return false;

      if (flagFilter !== 'all' && !(fb.reviewFlags || []).includes(flagFilter)) return false;

      return true;
    });
  }, [orders, queueFilter, flagFilter]);

  const summary = useMemo(() => {
    if (orders.length === 0) {
      return { count: 0, avgRestaurant: 0, avgOverall: 0, responded: 0 };
    }

    let restaurantSum = 0;
    let overallSum = 0;
    let restaurantCount = 0;
    let overallCount = 0;
    let responded = 0;

    for (const item of orders) {
      const fb = item.customerFeedback;
      const rr = Number(fb?.restaurantRating || 0);
      const or = Number(fb?.overallRating || 0);
      if (rr > 0) {
        restaurantSum += rr;
        restaurantCount += 1;
      }
      if (or > 0) {
        overallSum += or;
        overallCount += 1;
      }
      if (fb?.ownerResponse?.trim()) responded += 1;
    }

    return {
      count: orders.length,
      avgRestaurant: restaurantCount > 0 ? restaurantSum / restaurantCount : 0,
      avgOverall: overallCount > 0 ? overallSum / overallCount : 0,
      responded,
    };
  }, [orders]);

  const toggleFlag = (flag: string) => {
    setReviewFlags((prev) => (prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]));
  };

  const handleSaveResponse = async () => {
    if (!currentBusiness || !selected || !user) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const now = new Date().toISOString();
      const feedback: CustomerFeedback = {
        ...(selected.customerFeedback || {}),
        ownerResponse: ownerResponse.trim(),
        ownerRespondedAt: ownerResponse.trim() ? now : undefined,
        ownerResponderUid: ownerResponse.trim() ? user.uid : undefined,
        ownerResponseVisibility: responseVisibility,
        followUpStatus,
        reviewFlags,
      };

      await updateDoc(doc(db, 'businesses', currentBusiness.businessId, 'orders', selected.id), {
        customerFeedback: feedback,
        updatedAt: now,
      });

      setSaveMessage('Response and tags saved.');
    } catch {
      setSaveMessage('Failed to save response. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentBusiness) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">Customer Reviews</h1>
          <p className="text-zinc-400 font-medium mt-1">Read feedback, tag issues, and control public response visibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Reviews</p>
          <p className="text-2xl font-black text-black mt-1">{summary.count}</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Restaurant Avg</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{summary.avgRestaurant > 0 ? summary.avgRestaurant.toFixed(1) : '—'}</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Overall Avg</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.avgOverall > 0 ? summary.avgOverall.toFixed(1) : '—'}</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Responded</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{summary.responded}</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-zinc-400" />
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Queue Filters</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            title="Queue filter"
            value={queueFilter}
            onChange={(e) => setQueueFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="needs_response">Needs Response</option>
            <option value="flagged">Flagged Reviews</option>
            <option value="low_rated">Low Rated (≤ 2)</option>
            <option value="public_response">Public Responses</option>
          </select>

          <select
            title="Flag filter"
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
          >
            <option value="all">All Flags</option>
            {REVIEW_FLAG_OPTIONS.map((flag) => (
              <option key={flag.key} value={flag.key}>{flag.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-zinc-100 rounded-3xl p-5">
          <h2 className="text-lg font-black text-black mb-4">Review Queue</h2>
          {loading ? (
            <p className="text-sm text-zinc-400 font-bold">Loading reviews...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-sm text-zinc-400 font-bold">No reviews match these filters.</p>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {filteredOrders.map((item) => {
                const fb = item.customerFeedback || {};
                const selectedRow = selectedId === item.id;
                const hasOwnerResponse = !!fb.ownerResponse?.trim();
                const hasFlags = Array.isArray(fb.reviewFlags) && fb.reviewFlags.length > 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedRow ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-black text-sm">{item.customerName}</p>
                      {hasOwnerResponse ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Responded</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Needs Response</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Order #{item.id.slice(-8).toUpperCase()} · {item.status}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] font-bold text-zinc-500">
                      <span>Restaurant: {toStars(fb.restaurantRating)}</span>
                      <span>Overall: {toStars(fb.overallRating)}</span>
                    </div>
                    {hasFlags && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {fb.reviewFlags!.slice(0, 3).map((flag) => (
                          <span key={flag} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-red-50 text-red-600">
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-5">
          {!selected ? (
            <div className="h-full min-h-95 flex items-center justify-center text-center text-zinc-400 text-sm font-bold">
              Select a review to read and respond.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-black">{selected.customerName}</h2>
                <p className="text-sm text-zinc-500">Order #{selected.id.slice(-8).toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-200 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Restaurant Rating</p>
                  <p className="text-lg font-black text-amber-500 inline-flex items-center gap-2"><FaStar /> {toStars(selected.customerFeedback?.restaurantRating)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Overall Rating</p>
                  <p className="text-lg font-black text-emerald-600 inline-flex items-center gap-2"><FaStar /> {toStars(selected.customerFeedback?.overallRating)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Restaurant Feedback</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selected.customerFeedback?.restaurantReview || 'No written restaurant feedback.'}</p>
              </div>

              {hasDriverReview && (
                <>
                  <div className="rounded-2xl border border-zinc-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Driver Rating</p>
                    <p className="text-sm font-black text-indigo-600">{toStars(selected.customerFeedback?.driverRating)}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Driver Feedback</p>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selected.customerFeedback?.driverReview || 'No written driver feedback.'}</p>
                  </div>
                </>
              )}

              <div className="rounded-2xl border border-zinc-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Overall Notes</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selected.customerFeedback?.overallReview || 'No additional notes.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="response-visibility" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                    Response Visibility
                  </label>
                  <select
                    id="response-visibility"
                    value={responseVisibility}
                    onChange={(e) => setResponseVisibility(e.target.value as ResponseVisibility)}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
                  >
                    <option value="internal">Internal Only</option>
                    <option value="public">Public to Customer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="followup-status" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                    Follow-up Status
                  </label>
                  <select
                    id="followup-status"
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                    className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Review Flags</p>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_FLAG_OPTIONS.map((flag) => {
                    const active = reviewFlags.includes(flag.key);
                    return (
                      <button
                        key={flag.key}
                        type="button"
                        onClick={() => toggleFlag(flag.key)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${active ? 'bg-red-600 text-white border-red-600' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
                      >
                        {flag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="owner-response" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Owner Response
                </label>
                <textarea
                  id="owner-response"
                  className="w-full min-h-28 rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                  placeholder="Write your response. If visibility is set to Public, customer sees this on their tracking page."
                  value={ownerResponse}
                  onChange={(e) => setOwnerResponse(e.target.value)}
                  maxLength={800}
                />
                {saveMessage && (
                  <p className={`mt-2 text-sm font-bold ${saveMessage.toLowerCase().includes('saved') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveResponse}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-black hover:bg-zinc-800 disabled:opacity-50"
                >
                  {saving ? <FaCheckCircle /> : <FaReply />} {saving ? 'Saving...' : 'Save Workflow'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
