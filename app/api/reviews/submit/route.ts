import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

type ReviewPayload = {
  orderId?: string;
  businessId?: string;
  restaurantRating?: number;
  restaurantReview?: string;
  driverRating?: number;
  driverReview?: string;
  overallRating?: number;
  overallReview?: string;
};

function normalizeRating(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function applyRatingUpdate(currentAvg: number, currentCount: number, nextRating: number, previousRating: number | null) {
  if (currentCount <= 0) {
    return { avg: nextRating, count: 1 };
  }

  if (previousRating == null) {
    const nextCount = currentCount + 1;
    const nextAvg = ((currentAvg * currentCount) + nextRating) / nextCount;
    return { avg: nextAvg, count: nextCount };
  }

  const nextAvg = ((currentAvg * currentCount) - previousRating + nextRating) / currentCount;
  return { avg: nextAvg, count: currentCount };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReviewPayload;
    const orderId = (body.orderId || '').trim();
    const businessId = (body.businessId || '').trim();

    if (!orderId || !businessId) {
      return NextResponse.json({ error: 'Missing orderId or businessId.' }, { status: 400 });
    }

    const restaurantRating = normalizeRating(body.restaurantRating);
    const overallRating = normalizeRating(body.overallRating);
    const driverRating = body.driverRating == null ? null : normalizeRating(body.driverRating);

    if (!restaurantRating || !overallRating) {
      return NextResponse.json({ error: 'Restaurant and overall rating are required (1-5).' }, { status: 400 });
    }

    if (body.driverRating != null && !driverRating) {
      return NextResponse.json({ error: 'Driver rating must be between 1 and 5.' }, { status: 400 });
    }

    const restaurantReview = normalizeText(body.restaurantReview, 600);
    const driverReview = normalizeText(body.driverReview, 600);
    const overallReview = normalizeText(body.overallReview, 600);
    const now = new Date().toISOString();

    const trackingRef = adminDb.collection('trackingLinks').doc(orderId);
    const businessRef = adminDb.collection('businesses').doc(businessId);
    const orderRef = businessRef.collection('orders').doc(orderId);
    const customerReviewRef = orderRef.collection('reviews').doc('customer');

    await adminDb.runTransaction(async (tx) => {
      const [trackingSnap, orderSnap, existingReviewSnap, businessSnap] = await Promise.all([
        tx.get(trackingRef),
        tx.get(orderRef),
        tx.get(customerReviewRef),
        tx.get(businessRef),
      ]);

      if (!trackingSnap.exists) {
        throw new Error('Tracking link not found for this order.');
      }

      const trackingData = trackingSnap.data() || {};
      if (trackingData.businessId !== businessId) {
        throw new Error('Business mismatch for review submission.');
      }

      if (!orderSnap.exists) {
        throw new Error('Order not found.');
      }

      const order = orderSnap.data() || {};
      const existingFeedback = (order.customerFeedback || {}) as Record<string, any>;
      const orderStatus = String(order.status || '').toLowerCase();
      if (orderStatus !== 'delivered') {
        throw new Error('Reviews can only be submitted after delivery is completed.');
      }

      const previousReview = (existingReviewSnap.exists ? existingReviewSnap.data() : {}) as Record<string, any>;
      const previousRestaurantRating = Number.isFinite(Number(previousReview.restaurantRating))
        ? Number(previousReview.restaurantRating)
        : null;
      const previousDriverRating = Number.isFinite(Number(previousReview.driverRating))
        ? Number(previousReview.driverRating)
        : null;

      tx.set(customerReviewRef, {
        orderId,
        businessId,
        target: 'customer_delivery_review',
        restaurantRating,
        restaurantReview,
        driverRating,
        driverReview,
        overallRating,
        overallReview,
        updatedAt: now,
        ...(existingReviewSnap.exists ? {} : { createdAt: now }),
      }, { merge: true });

      tx.set(orderRef, {
        customerRating: overallRating,
        customerReview: overallReview || restaurantReview || '',
        customerReviewSubmittedAt: now,
        customerFeedback: {
          ownerResponse: existingFeedback.ownerResponse || '',
          ownerRespondedAt: existingFeedback.ownerRespondedAt || null,
          ownerResponderUid: existingFeedback.ownerResponderUid || null,
          ownerResponseVisibility: existingFeedback.ownerResponseVisibility || 'internal',
          reviewFlags: Array.isArray(existingFeedback.reviewFlags) ? existingFeedback.reviewFlags : [],
          followUpStatus: existingFeedback.followUpStatus || 'open',
          restaurantRating,
          restaurantReview,
          driverRating,
          driverReview,
          overallRating,
          overallReview,
          updatedAt: now,
        },
        updatedAt: now,
      }, { merge: true });

      if (businessSnap.exists) {
        const businessData = businessSnap.data() || {};
        const currentAvg = Number.isFinite(Number(businessData.averageRating)) ? Number(businessData.averageRating) : 0;
        const currentCount = Number.isFinite(Number(businessData.reviewCount)) ? Number(businessData.reviewCount) : 0;
        const next = applyRatingUpdate(currentAvg, currentCount, restaurantRating, previousRestaurantRating);

        tx.set(businessRef, {
          averageRating: Number(next.avg.toFixed(2)),
          reviewCount: next.count,
          updatedAt: now,
        }, { merge: true });
      }

      const assignedDriverId = String(order.assignedDriverId || order.driverId || '');
      const assignedDriverType = String(order.assignedDriverType || 'inhouse');

      if (assignedDriverId && driverRating) {
        const driverRef = assignedDriverType === 'courier'
          ? adminDb.collection('couriers').doc(assignedDriverId)
          : adminDb.collection('businesses').doc(businessId).collection('drivers').doc(assignedDriverId);

        const driverSnap = await tx.get(driverRef);
        if (driverSnap.exists) {
          const driverData = driverSnap.data() || {};
          const currentDriverAvg = Number.isFinite(Number(driverData.rating)) ? Number(driverData.rating) : 0;
          const currentDriverCount = Number.isFinite(Number(driverData.reviewCount))
            ? Number(driverData.reviewCount)
            : Number.isFinite(Number(driverData.driverReviewCount))
              ? Number(driverData.driverReviewCount)
              : 0;

          const nextDriver = applyRatingUpdate(currentDriverAvg, currentDriverCount, driverRating, previousDriverRating);

          tx.set(driverRef, {
            rating: Number(nextDriver.avg.toFixed(2)),
            reviewCount: nextDriver.count,
            driverReviewCount: nextDriver.count,
            updatedAt: now,
          }, { merge: true });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to submit review.' },
      { status: 400 },
    );
  }
}
