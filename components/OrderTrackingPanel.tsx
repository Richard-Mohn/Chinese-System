'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  type DriverLocation,
  subscribeToCourierLocation,
  subscribeToDriverLocation,
  calculateETA,
} from '@/lib/realTimeTracking';
import { FaCheckCircle, FaClock, FaMapMarkerAlt, FaMotorcycle, FaStore } from 'react-icons/fa';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'driver_en_route_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled' | string;

interface TrackedOrder {
  status?: OrderStatus;
  customerName?: string;
  deliveryAddress?: string;
  assignedDriverId?: string;
  assignedDriverType?: 'courier' | 'inhouse' | string;
  driverId?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryLocation?: { lat?: number; lng?: number };
  updatedAt?: string;
  customerFeedback?: {
    restaurantRating?: number;
    restaurantReview?: string;
    driverRating?: number;
    driverReview?: string;
    overallRating?: number;
    overallReview?: string;
    ownerResponse?: string;
    ownerResponseVisibility?: 'internal' | 'public';
    reviewFlags?: string[];
    followUpStatus?: 'open' | 'resolved';
    updatedAt?: string;
  };
  deliveryWorkflow?: {
    phase?: 'en_route_pickup' | 'out_for_delivery' | 'delivered' | string;
    acceptedAt?: string;
    pickedUpAt?: string;
  };
  customerReviewSubmittedAt?: string;
  createdAt?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  items?: { name?: string; quantity?: number; price?: number }[];
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  tip?: number;
  total?: number;
  pricing?: {
    subtotal?: number;
    tax?: number;
    deliveryFee?: number;
    tip?: number;
    total?: number;
  };
  deliveryVerification?: {
    pickupCode?: string | null;
    dropoffCode?: string | null;
    pickupVerifiedAt?: string | null;
    dropoffVerifiedAt?: string | null;
  };
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'driver_en_route_pickup', label: 'Driver Heading to Pickup' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTrackingPanel({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [driverRealtimeStatus, setDriverRealtimeStatus] = useState<string>('idle');
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [restaurantReview, setRestaurantReview] = useState('');
  const [driverReview, setDriverReview] = useState('');
  const [overallReview, setOverallReview] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewSaved, setReviewSaved] = useState(false);

  const driverUnsubRef = useRef<(() => void) | null>(null);
  const driverKeyRef = useRef<string>('');

  useEffect(() => {
    if (!orderId) return;

    let orderUnsub: (() => void) | null = null;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const trackingRef = doc(db, 'trackingLinks', orderId);
        const trackingSnap = await getDoc(trackingRef);

        if (!trackingSnap.exists()) {
          setError('Tracking link not found for this order.');
          setLoading(false);
          return;
        }

        const trackingData = trackingSnap.data() as { businessId?: string };
        const bizId = trackingData.businessId;
        if (!bizId) {
          setError('Tracking is missing business info.');
          setLoading(false);
          return;
        }

        setBusinessId(bizId);

        const bizSnap = await getDoc(doc(db, 'businesses', bizId));
        if (bizSnap.exists()) {
          setBusinessName((bizSnap.data() as { name?: string }).name || 'Business');
        }

        const orderRef = doc(db, 'businesses', bizId, 'orders', orderId);
        orderUnsub = onSnapshot(orderRef, (snap) => {
          if (!snap.exists()) {
            setError('Order not found.');
            setLoading(false);
            return;
          }

          const data = snap.data() as TrackedOrder;
          setOrder(data);
          setLoading(false);

          const driverId = data.assignedDriverId;
          const driverType = data.assignedDriverType || 'inhouse';
          const key = `${driverType}:${driverId || ''}:${bizId}`;

          if (!driverId) {
            if (driverUnsubRef.current) {
              driverUnsubRef.current();
              driverUnsubRef.current = null;
            }
            driverKeyRef.current = '';
            setDriverLocation(null);
            setDriverRealtimeStatus('idle');
            return;
          }

          if (driverKeyRef.current === key) {
            return;
          }

          if (driverUnsubRef.current) {
            driverUnsubRef.current();
            driverUnsubRef.current = null;
          }

          if (driverType === 'courier') {
            driverUnsubRef.current = subscribeToCourierLocation(driverId, setDriverLocation, setDriverRealtimeStatus);
          } else {
            driverUnsubRef.current = subscribeToDriverLocation(bizId, driverId, setDriverLocation, setDriverRealtimeStatus);
          }

          driverKeyRef.current = key;
        });
      } catch {
        setError('Unable to load tracking right now.');
        setLoading(false);
      }
    };

    run();

    return () => {
      if (orderUnsub) orderUnsub();
      if (driverUnsubRef.current) driverUnsubRef.current();
    };
  }, [orderId]);

  const destination = useMemo(() => {
    if (!order) return null;
    const lat = order.deliveryLat ?? order.deliveryLocation?.lat;
    const lng = order.deliveryLng ?? order.deliveryLocation?.lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
    return null;
  }, [order]);

  const etaMinutes = useMemo(() => {
    if (!driverLocation) return null;
    if (!destination) return order?.status === 'out_for_delivery' ? 10 : null;

    const speedMph = driverLocation.speed ? Math.max(driverLocation.speed * 2.237, 5) : 20;
    return calculateETA(driverLocation.lat, driverLocation.lng, destination.lat, destination.lng, speedMph);
  }, [driverLocation, destination, order?.status]);

  const mapEmbedUrl = useMemo(() => {
    if (!driverLocation) return '';
    const delta = 0.01;
    const minLng = driverLocation.lng - delta;
    const minLat = driverLocation.lat - delta;
    const maxLng = driverLocation.lng + delta;
    const maxLat = driverLocation.lat + delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${driverLocation.lat}%2C${driverLocation.lng}`;
  }, [driverLocation]);

  const currentStepIndex = useMemo(() => {
    const status = order?.status || 'pending';
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    if (idx >= 0) return idx;
    if (status === 'pending') return 0;
    return 1;
  }, [order?.status]);

  const pickedUpAt = order?.deliveryWorkflow?.pickedUpAt;
  const pickupCode = String(order?.deliveryVerification?.pickupCode || '').trim();
  const dropoffCode = String(order?.deliveryVerification?.dropoffCode || '').trim();
  const pickupVerifiedAt = String(order?.deliveryVerification?.pickupVerifiedAt || '').trim();
  const dropoffVerifiedAt = String(order?.deliveryVerification?.dropoffVerifiedAt || '').trim();

  const subtotal = Number(order?.pricing?.subtotal ?? order?.subtotal ?? 0);
  const tax = Number(order?.pricing?.tax ?? order?.tax ?? 0);
  const deliveryFee = Number(order?.pricing?.deliveryFee ?? order?.deliveryFee ?? 0);
  const tip = Number(order?.pricing?.tip ?? order?.tip ?? 0);
  const total = Number(order?.pricing?.total ?? order?.total ?? subtotal + tax + deliveryFee + tip);

  const hasDriverAssigned = !!(order?.assignedDriverId || order?.driverId);
  const publicOwnerResponse =
    order?.customerFeedback?.ownerResponseVisibility === 'public'
      ? (order?.customerFeedback?.ownerResponse || '').trim()
      : '';

  useEffect(() => {
    const feedback = order?.customerFeedback;
    if (!feedback) return;

    setRestaurantRating(Number(feedback.restaurantRating) || 0);
    setDriverRating(Number(feedback.driverRating) || 0);
    setOverallRating(Number(feedback.overallRating) || 0);
    setRestaurantReview(feedback.restaurantReview || '');
    setDriverReview(feedback.driverReview || '');
    setOverallReview(feedback.overallReview || '');
    setReviewSaved(!!order?.customerReviewSubmittedAt);
  }, [order?.customerFeedback, order?.customerReviewSubmittedAt]);

  const submitReview = async () => {
    if (!businessId || !order) return;
    if (restaurantRating < 1 || overallRating < 1) {
      setReviewMessage('Please set restaurant and overall ratings before submitting.');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage(null);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          businessId,
          restaurantRating,
          restaurantReview,
          driverRating: hasDriverAssigned ? driverRating || null : null,
          driverReview: hasDriverAssigned ? driverReview : '',
          overallRating,
          overallReview,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save review.');
      }

      const updatedAt = new Date().toISOString();
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customerReviewSubmittedAt: updatedAt,
          customerFeedback: {
            ownerResponse: prev.customerFeedback?.ownerResponse || '',
            ownerRespondedAt: (prev.customerFeedback as any)?.ownerRespondedAt || null,
            ownerResponderUid: (prev.customerFeedback as any)?.ownerResponderUid || null,
            ownerResponseVisibility: prev.customerFeedback?.ownerResponseVisibility || 'internal',
            reviewFlags: prev.customerFeedback?.reviewFlags || [],
            followUpStatus: prev.customerFeedback?.followUpStatus || 'open',
            restaurantRating,
            restaurantReview,
            driverRating: hasDriverAssigned ? driverRating : 0,
            driverReview,
            overallRating,
            overallReview,
            updatedAt,
          },
        };
      });

      setReviewSaved(true);
      setReviewMessage('Thank you — your review is saved. You can update it any time from this link.');
    } catch (err: any) {
      setReviewMessage(err?.message || 'Unable to save review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const StarInput = ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string;
    value: number;
    onChange: (next: number) => void;
    required?: boolean;
  }) => (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
        {label} {required ? '(required)' : '(optional)'}
      </p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            title={`${label}: ${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${star <= value ? 'text-amber-500' : 'text-zinc-200 hover:text-zinc-400'}`}
          >
            ★
          </button>
        ))}
        <span className="text-xs text-zinc-500 font-bold">{value > 0 ? `${value}/5` : 'Not rated'}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-bold">Loading your delivery tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <p className="text-xl font-black text-black mb-2">Tracking Unavailable</p>
          <p className="text-zinc-500">{error || 'Order tracking is not available for this order.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-12 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white border border-zinc-100 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivery Tracking</p>
          <h1 className="text-3xl font-black tracking-tight text-black mt-1">Order #{orderId.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-zinc-500 mt-1">{businessName || 'Business'} • {order.customerName || 'Customer'}</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Status</p>
          <div className="space-y-3">
            {STATUS_STEPS.map((step, index) => {
              const completed = index <= currentStepIndex;
              const active = index === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-300'}`}>
                    {completed ? <FaCheckCircle className="text-[11px]" /> : <span className="text-[11px] font-bold">{index + 1}</span>}
                  </div>
                  <p className={`text-sm font-bold ${active ? 'text-black' : 'text-zinc-500'}`}>{step.label}</p>
                </div>
              );
            })}

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${pickedUpAt ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-300'}`}>
                {pickedUpAt ? <FaCheckCircle className="text-[11px]" /> : <span className="text-[11px] font-bold">•</span>}
              </div>
              <p className={`text-sm font-bold ${pickedUpAt ? 'text-black' : 'text-zinc-500'}`}>
                Picked Up{pickedUpAt ? ` • ${new Date(pickedUpAt).toLocaleTimeString()}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaMotorcycle className="text-emerald-600" />
              <p className="font-black text-black">Driver Location</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ETA</p>
              <p className="text-lg font-black text-emerald-600">{etaMinutes ? `${etaMinutes} min` : '--'}</p>
            </div>
          </div>

          {driverLocation ? (
            <>
              <div className="rounded-2xl overflow-hidden border border-zinc-200">
                <iframe
                  title="Driver live map"
                  src={mapEmbedUrl}
                  className="w-full h-64"
                  loading="lazy"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div className="bg-zinc-50 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Driver Status</p>
                  <p className="font-bold text-black capitalize">{driverRealtimeStatus.replace('_', ' ')}</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Last GPS</p>
                  <p className="font-bold text-black">{new Date(driverLocation.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-50 rounded-2xl p-5 text-center">
              <FaClock className="mx-auto text-zinc-300 text-xl mb-2" />
              <p className="font-bold text-zinc-600">Driver location will appear once assigned and active.</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-zinc-100 rounded-3xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Delivery Address</p>
          <p className="text-sm font-bold text-black flex items-start gap-2">
            <FaMapMarkerAlt className="text-zinc-300 mt-0.5" />
            <span>{order.deliveryAddress || 'Address not provided'}</span>
          </p>
          {driverLocation && (
            <a
              href={`https://www.google.com/maps?q=${driverLocation.lat},${driverLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-all"
            >
              <FaStore /> Open Live Map
            </a>
          )}
        </div>

        {(pickupCode || dropoffCode) && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verification Codes</p>

            {pickupCode && (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-xs font-black text-black mb-1">Pickup Code</p>
                <p className="text-2xl font-black tracking-[0.3em] text-black">{pickupCode}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {pickupVerifiedAt ? `Verified at ${new Date(pickupVerifiedAt).toLocaleTimeString()}` : 'Share this with your driver at pickup handoff.'}
                </p>
              </div>
            )}

            {dropoffCode && (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-xs font-black text-black mb-1">Drop-off Code</p>
                <p className="text-2xl font-black tracking-[0.3em] text-black">{dropoffCode}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {dropoffVerifiedAt ? `Verified at ${new Date(dropoffVerifiedAt).toLocaleTimeString()}` : 'Share this with your driver to complete delivery.'}
                </p>
              </div>
            )}
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Receipt</p>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest"
              >
                Print
              </button>
            </div>

            {!!order.items?.length && (
              <div className="space-y-1 text-sm">
                {order.items.map((item, index) => (
                  <div key={`${item.name || 'item'}-${index}`} className="flex justify-between text-zinc-600">
                    <span>{Number(item.quantity || 0)}× {item.name || 'Item'}</span>
                    <span>${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-zinc-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-600"><span>Tip</span><span>${tip.toFixed(2)}</span></div>
              <div className="flex justify-between text-black font-black text-base pt-1"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <p className="text-xs text-zinc-500">
              Paid via {order.paymentMethod || 'card'} • {order.paymentStatus || 'paid'}
              {order.createdAt ? ` • ${new Date(order.createdAt).toLocaleString()}` : ''}
            </p>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer Review</p>
                <p className="text-sm font-bold text-black">Rate your restaurant and delivery experience</p>
              </div>
              {reviewSaved && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Saved</span>}
            </div>

              {publicOwnerResponse && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Business Response</p>
                  <p className="text-sm text-emerald-900 whitespace-pre-wrap">{publicOwnerResponse}</p>
                </div>
              )}

            <StarInput label="Restaurant" value={restaurantRating} onChange={setRestaurantRating} required />

            <textarea
              title="Restaurant review"
              className="w-full min-h-24 rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
              placeholder="How was the food and restaurant experience?"
              value={restaurantReview}
              onChange={(e) => setRestaurantReview(e.target.value)}
              maxLength={600}
            />

            {hasDriverAssigned && (
              <>
                <StarInput label="Delivery Driver" value={driverRating} onChange={setDriverRating} />
                <textarea
                  title="Driver review"
                  className="w-full min-h-24 rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                  placeholder="How was your delivery driver?"
                  value={driverReview}
                  onChange={(e) => setDriverReview(e.target.value)}
                  maxLength={600}
                />
              </>
            )}

            <StarInput label="Overall Experience" value={overallRating} onChange={setOverallRating} required />

            <textarea
              title="Overall review"
              className="w-full min-h-24 rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
              placeholder="Anything else you want us to improve?"
              value={overallReview}
              onChange={(e) => setOverallReview(e.target.value)}
              maxLength={600}
            />

            {reviewMessage && (
              <p className={`text-sm font-bold ${reviewMessage.toLowerCase().includes('thank') ? 'text-emerald-600' : 'text-red-600'}`}>
                {reviewMessage}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-black hover:bg-zinc-800 disabled:opacity-50"
              >
                {reviewSubmitting ? 'Saving...' : reviewSaved ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-zinc-400">
          Updates stream live from the courier app every 1-2 seconds.
        </div>
      </div>
    </div>
  );
}
