/**
 * Wallet & P2P Transfer API
 *
 * POST /api/stripe/wallet
 *   Actions:
 *   - action: 'topup' → Create PaymentIntent to add funds to wallet
 *     Body: { action: 'topup', amount }  (amount in cents, min $5.00)
 *   - action: 'transfer' → Transfer wallet balance to another user
 *     Body: { action: 'transfer', recipientEmail, amount, note? }
 *   - action: 'pay-for-friend' → Pay for someone else's order using your wallet
 *     Body: { action: 'pay-for-friend', orderId, businessId, amount }
 *
 * GET /api/stripe/wallet
 *   Returns wallet balance + recent transfer history.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWalletTopUp } from '@/lib/stripe/platform';
import { verifyApiAuth } from '@/lib/apiAuth';
import { standardLimiter } from '@/lib/rateLimit';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MINIMUM_TOPUP = 500; // $5.00
const MAXIMUM_TRANSFER = 50000; // $500.00

export async function POST(request: NextRequest) {
  try {
    const limited = standardLimiter(request);
    if (limited) return limited;

    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const firebaseUid = auth.uid!;
    const body = await request.json();
    const { action } = body;

    // ─── Top-Up Wallet ───────────────────────
    if (action === 'topup') {
      const { amount } = body;
      if (!amount || amount < MINIMUM_TOPUP) {
        return NextResponse.json(
          { error: `Minimum top-up is $${(MINIMUM_TOPUP / 100).toFixed(2)}` },
          { status: 400 },
        );
      }

      // Get user's Stripe Customer ID
      const userDoc = await getDoc(doc(db, 'users', firebaseUid));
      if (!userDoc.exists()) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const stripeCustomerId = userDoc.data()?.stripeCustomerId;
      if (!stripeCustomerId) {
        return NextResponse.json(
          { error: 'No Stripe Customer — place an order first to set up payment' },
          { status: 400 },
        );
      }

      const result = await createWalletTopUp({
        amountCents: amount,
        stripeCustomerId,
        firebaseUid,
      });

      return NextResponse.json(result);
    }

    // ─── P2P Transfer ────────────────────────
    if (action === 'transfer') {
      const { recipientEmail, amount, note } = body;
      if (!recipientEmail || !amount) {
        return NextResponse.json(
          { error: 'Missing recipientEmail and amount' },
          { status: 400 },
        );
      }
      if (amount < 100) {
        return NextResponse.json({ error: 'Minimum transfer is $1.00' }, { status: 400 });
      }
      if (amount > MAXIMUM_TRANSFER) {
        return NextResponse.json(
          { error: `Maximum transfer is $${(MAXIMUM_TRANSFER / 100).toFixed(2)}` },
          { status: 400 },
        );
      }

      // Find recipient by email
      const recipientQuery = query(
        collection(db, 'users'),
        where('email', '==', recipientEmail.toLowerCase().trim()),
        limit(1),
      );
      const recipientSnap = await getDocs(recipientQuery);
      if (recipientSnap.empty) {
        return NextResponse.json(
          { error: 'Recipient not found. They need a MohnMenu account.' },
          { status: 404 },
        );
      }

      const recipientDoc = recipientSnap.docs[0];
      const recipientUid = recipientDoc.id;

      if (recipientUid === firebaseUid) {
        return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });
      }

      // Atomic transfer using Firestore transaction
      const transferId = await runTransaction(db, async (txn) => {
        const senderRef = doc(db, 'users', firebaseUid);
        const recipientRef = doc(db, 'users', recipientUid);

        const senderSnap = await txn.get(senderRef);
        if (!senderSnap.exists()) throw new Error('Sender not found');

        const senderBalance = senderSnap.data()?.walletBalance || 0;
        if (senderBalance < amount) throw new Error('Insufficient wallet balance');

        // Debit sender, credit recipient
        txn.update(senderRef, {
          walletBalance: increment(-amount),
          updatedAt: new Date().toISOString(),
        });
        txn.update(recipientRef, {
          walletBalance: increment(amount),
          updatedAt: new Date().toISOString(),
        });

        // Log the transfer
        const transferRef = doc(collection(db, 'wallet_transfers'));
        txn.set(transferRef, {
          senderId: firebaseUid,
          senderEmail: senderSnap.data()?.email,
          recipientId: recipientUid,
          recipientEmail,
          amountCents: amount,
          note: note || '',
          type: 'p2p_transfer',
          createdAt: new Date().toISOString(),
        });

        return transferRef.id;
      });

      return NextResponse.json({
        success: true,
        transferId,
        message: `$${(amount / 100).toFixed(2)} sent to ${recipientEmail}`,
      });

      // $MOHN awarded via Cloud Function trigger on wallet_transfers collection
    }

    // ─── Pay for Friend's Order ──────────────
    if (action === 'pay-for-friend') {
      const { orderId, businessId, amount } = body;
      if (!orderId || !businessId || !amount) {
        return NextResponse.json(
          { error: 'Missing orderId, businessId, or amount' },
          { status: 400 },
        );
      }

      await runTransaction(db, async (txn) => {
        const senderRef = doc(db, 'users', firebaseUid);
        const senderSnap = await txn.get(senderRef);
        if (!senderSnap.exists()) throw new Error('User not found');

        const balance = senderSnap.data()?.walletBalance || 0;
        if (balance < amount) throw new Error('Insufficient wallet balance');

        // Debit wallet
        txn.update(senderRef, {
          walletBalance: increment(-amount),
          updatedAt: new Date().toISOString(),
        });

        // Mark order as paid via wallet
        const orderRef = doc(db, 'businesses', businessId, 'orders', orderId);
        txn.update(orderRef, {
          paymentStatus: 'paid',
          paymentMethod: 'wallet',
          paidByUid: firebaseUid,
          paidByEmail: senderSnap.data()?.email,
          status: 'confirmed',
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Log the transaction
        const transferRef = doc(collection(db, 'wallet_transfers'));
        txn.set(transferRef, {
          senderId: firebaseUid,
          senderEmail: senderSnap.data()?.email,
          orderId,
          businessId,
          amountCents: amount,
          type: 'pay_for_friend',
          createdAt: new Date().toISOString(),
        });
      });

      return NextResponse.json({
        success: true,
        message: `Paid $${(amount / 100).toFixed(2)} for order from your wallet`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Wallet error:', error);
    return NextResponse.json(
      { error: error.message || 'Wallet operation failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiAuth(request);
    if (auth.error) return auth.error;

    const firebaseUid = auth.uid!;

    // Get balance
    const userDoc = await getDoc(doc(db, 'users', firebaseUid));
    const walletBalance = userDoc.exists() ? userDoc.data()?.walletBalance || 0 : 0;

    // Get recent transfers (sent + received)
    const sentQuery = query(
      collection(db, 'wallet_transfers'),
      where('senderId', '==', firebaseUid),
      orderBy('createdAt', 'desc'),
      limit(20),
    );
    const receivedQuery = query(
      collection(db, 'wallet_transfers'),
      where('recipientId', '==', firebaseUid),
      orderBy('createdAt', 'desc'),
      limit(20),
    );

    const [sentSnap, receivedSnap] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const transfers = [
      ...sentSnap.docs.map(d => ({ id: d.id, direction: 'sent' as const, ...d.data() })),
      ...receivedSnap.docs.map(d => ({ id: d.id, direction: 'received' as const, ...d.data() })),
    ].sort((a, b) => (b.createdAt as string).localeCompare(a.createdAt as string));

    return NextResponse.json({
      walletBalanceCents: walletBalance,
      transfers,
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ error: 'Failed to get wallet info' }, { status: 500 });
  }
}
