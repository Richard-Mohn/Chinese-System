import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';
import { adminDb } from '@/lib/firebaseAdmin';

type DispatchAction = 'accept' | 'pickup' | 'complete';
type DispatchSource = 'restaurant' | 'quick';

type ActionBody = {
  action?: DispatchAction;
  source?: DispatchSource;
  businessId?: string;
  orderId?: string;
  verificationCode?: string;
};

function isDriverRole(role?: string) {
  return role === 'driver' || role === 'driver_inhouse' || role === 'driver_marketplace' || role === 'manager' || role === 'admin' || role === 'staff';
}

async function staffCanDispatchRestaurantDeliveries(params: { uid: string; businessId: string }) {
  const businessId = String(params.businessId || '').trim();
  if (!businessId) return false;

  const snap = await adminDb
    .collection('businesses')
    .doc(businessId)
    .collection('drivers')
    .where('userId', '==', params.uid)
    .limit(1)
    .get();

  if (snap.empty) return false;
  const row = snap.docs[0].data() || {};
  return String(row.backgroundCheckStatus || 'pending') === 'approved' && Boolean(row.licenseVerified) === true;
}

function toIsoNow() {
  return new Date().toISOString();
}

function randomCode(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function normalizeCode(value?: string) {
  return String(value || '').replace(/\D/g, '').trim();
}

export async function POST(request: NextRequest) {
  const auth = await verifyApiAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const body = (await request.json()) as ActionBody;
    const action = body.action;
    const source = body.source || 'restaurant';
    const businessId = (body.businessId || '').trim();
    const orderId = (body.orderId || '').trim();
    const verificationCode = normalizeCode(body.verificationCode);

    if (!action || !orderId) {
      return NextResponse.json({ error: 'Missing action or orderId.' }, { status: 400 });
    }

    const userSnap = await adminDb.collection('users').doc(auth.uid).get();
    const userData = userSnap.exists ? userSnap.data() || {} : {};
    const role = String(userData.role || '');

    if (!isDriverRole(role)) {
      return NextResponse.json({ error: 'You are not authorized for dispatch actions.' }, { status: 403 });
    }

    // Staff can only dispatch restaurant deliveries when they have an approved driver record.
    if (role === 'staff') {
      if (source !== 'restaurant') {
        return NextResponse.json({ error: 'Staff are not authorized for courier dispatch actions.' }, { status: 403 });
      }
      if (!businessId || businessId === '__quickDelivery') {
        return NextResponse.json({ error: 'businessId is required.' }, { status: 400 });
      }
      const staffRole = String((userData as any).staffRole || '').toLowerCase();
      if (!['server', 'both'].includes(staffRole)) {
        return NextResponse.json({ error: 'Only servers can dispatch deliveries.' }, { status: 403 });
      }
      const ok = await staffCanDispatchRestaurantDeliveries({ uid: auth.uid, businessId });
      if (!ok) {
        return NextResponse.json({ error: 'Driver verification required (background + license).' }, { status: 403 });
      }
    }

    // Quick deliveries (courier)
    if (source === 'quick' || businessId === '__quickDelivery') {
      const quickRef = adminDb.collection('quickDeliveries').doc(orderId);

      await adminDb.runTransaction(async (tx) => {
        const snap = await tx.get(quickRef);
        if (!snap.exists) throw new Error('Quick delivery not found.');

        const row = snap.data() || {};
        const assignedCourierId = String(row.assignedCourierId || '');
        const status = String(row.status || 'pending').toLowerCase();

        if (action === 'accept') {
          if (assignedCourierId && assignedCourierId !== auth.uid) throw new Error('Delivery already claimed by another courier.');
          if (!['pending', 'ready'].includes(status)) throw new Error('Delivery is not claimable in its current status.');

          const pickupCode = normalizeCode(row.deliveryVerification?.pickupCode) || randomCode();
          const dropoffCode = normalizeCode(row.deliveryVerification?.dropoffCode) || randomCode();

          tx.update(quickRef, {
            assignedCourierId: auth.uid,
            status: 'in_transit',
            deliveryVerification: {
              pickupCode,
              dropoffCode,
              pickupVerifiedAt: row.deliveryVerification?.pickupVerifiedAt || null,
              dropoffVerifiedAt: row.deliveryVerification?.dropoffVerifiedAt || null,
            },
            deliveryWorkflow: {
              phase: 'out_for_delivery',
              acceptedAt: toIsoNow(),
              pickedUpAt: toIsoNow(),
            },
            updatedAt: toIsoNow(),
          });
          return;
        }

        if (assignedCourierId !== auth.uid && role !== 'admin') {
          throw new Error('Only the assigned courier can update this delivery.');
        }

        if (action === 'pickup') {
          const pickupCode = normalizeCode(row.deliveryVerification?.pickupCode);
          const isAdminOverride = role === 'admin';
          if (pickupCode && !isAdminOverride && verificationCode !== pickupCode) {
            throw new Error('Invalid pickup verification code.');
          }

          tx.update(quickRef, {
            status: 'in_transit',
            deliveryVerification: {
              pickupCode: pickupCode || null,
              dropoffCode: normalizeCode(row.deliveryVerification?.dropoffCode) || null,
              pickupVerifiedAt: pickupCode ? toIsoNow() : row.deliveryVerification?.pickupVerifiedAt || null,
              dropoffVerifiedAt: row.deliveryVerification?.dropoffVerifiedAt || null,
            },
            deliveryWorkflow: {
              phase: 'out_for_delivery',
              acceptedAt: row.deliveryWorkflow?.acceptedAt || toIsoNow(),
              pickedUpAt: toIsoNow(),
            },
            updatedAt: toIsoNow(),
          });
          return;
        }

        if (action === 'complete') {
          const dropoffCode = normalizeCode(row.deliveryVerification?.dropoffCode);
          const isAdminOverride = role === 'admin';
          if (dropoffCode && !isAdminOverride && verificationCode !== dropoffCode) {
            throw new Error('Invalid drop-off verification code.');
          }

          tx.update(quickRef, {
            status: 'delivered',
            deliveryVerification: {
              pickupCode: normalizeCode(row.deliveryVerification?.pickupCode) || null,
              dropoffCode: dropoffCode || null,
              pickupVerifiedAt: row.deliveryVerification?.pickupVerifiedAt || null,
              dropoffVerifiedAt: dropoffCode ? toIsoNow() : row.deliveryVerification?.dropoffVerifiedAt || null,
            },
            deliveryWorkflow: {
              phase: 'delivered',
              acceptedAt: row.deliveryWorkflow?.acceptedAt || toIsoNow(),
              pickedUpAt: row.deliveryWorkflow?.pickedUpAt || toIsoNow(),
              deliveredAt: toIsoNow(),
            },
            updatedAt: toIsoNow(),
          });
          return;
        }
      });

      return NextResponse.json({ ok: true });
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId for restaurant order dispatch action.' }, { status: 400 });
    }

    const orderRef = adminDb.collection('businesses').doc(businessId).collection('orders').doc(orderId);
    const businessRef = adminDb.collection('businesses').doc(businessId);

    await adminDb.runTransaction(async (tx) => {
      const [orderSnap, businessSnap] = await Promise.all([tx.get(orderRef), tx.get(businessRef)]);
      if (!orderSnap.exists) throw new Error('Order not found.');

      const order = orderSnap.data() || {};
      const status = String(order.status || 'pending').toLowerCase();
      const assignedDriverId = String(order.assignedDriverId || '');

      const canOverride = role === 'admin' || role === 'manager';

      if (action === 'accept') {
        if (assignedDriverId && assignedDriverId !== auth.uid && !canOverride) {
          throw new Error('Order already claimed by another driver.');
        }
        if (!['ready', 'driver_en_route_pickup', 'confirmed', 'preparing'].includes(status)) {
          throw new Error('Order cannot be accepted in its current state.');
        }

        const businessData = businessSnap.exists ? businessSnap.data() || {} : {};
        const pickupAddress = [businessData.address, businessData.city, businessData.state, businessData.zipCode]
          .filter(Boolean)
          .join(', ');

        const pickupLat = Number.isFinite(Number(businessData.latitude ?? businessData.lat))
          ? Number(businessData.latitude ?? businessData.lat)
          : null;
        const pickupLng = Number.isFinite(Number(businessData.longitude ?? businessData.lng))
          ? Number(businessData.longitude ?? businessData.lng)
          : null;

        const pickupCode = normalizeCode(order.deliveryVerification?.pickupCode) || randomCode();
        const dropoffCode = normalizeCode(order.deliveryVerification?.dropoffCode) || randomCode();

        tx.update(orderRef, {
          assignedDriverId: auth.uid,
          assignedDriverType: role === 'driver_inhouse' ? 'inhouse' : 'courier',
          status: 'driver_en_route_pickup',
          businessAddress: pickupAddress || businessData.name || 'Business',
          pickupAddress: pickupAddress || businessData.name || 'Business',
          pickupLat,
          pickupLng,
          deliveryVerification: {
            pickupCode,
            dropoffCode,
            pickupVerifiedAt: order.deliveryVerification?.pickupVerifiedAt || null,
            dropoffVerifiedAt: order.deliveryVerification?.dropoffVerifiedAt || null,
          },
          deliveryWorkflow: {
            phase: 'en_route_pickup',
            acceptedAt: toIsoNow(),
          },
          updatedAt: toIsoNow(),
        });
        return;
      }

      if (assignedDriverId !== auth.uid && !canOverride) {
        throw new Error('Only the assigned driver can update this order.');
      }

      if (action === 'pickup') {
        const pickupCode = normalizeCode(order.deliveryVerification?.pickupCode);
        if (pickupCode && !canOverride && verificationCode !== pickupCode) {
          throw new Error('Invalid pickup verification code.');
        }

        tx.update(orderRef, {
          status: 'out_for_delivery',
          deliveryVerification: {
            pickupCode: pickupCode || null,
            dropoffCode: normalizeCode(order.deliveryVerification?.dropoffCode) || null,
            pickupVerifiedAt: pickupCode ? toIsoNow() : order.deliveryVerification?.pickupVerifiedAt || null,
            dropoffVerifiedAt: order.deliveryVerification?.dropoffVerifiedAt || null,
          },
          deliveryWorkflow: {
            phase: 'out_for_delivery',
            acceptedAt: order.deliveryWorkflow?.acceptedAt || toIsoNow(),
            pickedUpAt: toIsoNow(),
          },
          updatedAt: toIsoNow(),
        });
        return;
      }

      if (action === 'complete') {
        const dropoffCode = normalizeCode(order.deliveryVerification?.dropoffCode);
        if (dropoffCode && !canOverride && verificationCode !== dropoffCode) {
          throw new Error('Invalid drop-off verification code.');
        }

        tx.update(orderRef, {
          status: 'delivered',
          deliveryVerification: {
            pickupCode: normalizeCode(order.deliveryVerification?.pickupCode) || null,
            dropoffCode: dropoffCode || null,
            pickupVerifiedAt: order.deliveryVerification?.pickupVerifiedAt || null,
            dropoffVerifiedAt: dropoffCode ? toIsoNow() : order.deliveryVerification?.dropoffVerifiedAt || null,
          },
          deliveryWorkflow: {
            phase: 'delivered',
            acceptedAt: order.deliveryWorkflow?.acceptedAt || toIsoNow(),
            pickedUpAt: order.deliveryWorkflow?.pickedUpAt || toIsoNow(),
            deliveredAt: toIsoNow(),
          },
          updatedAt: toIsoNow(),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dispatch action failed.' },
      { status: 400 },
    );
  }
}
