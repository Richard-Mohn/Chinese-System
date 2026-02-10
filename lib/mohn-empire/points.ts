// ============================================================================
// Mohn Empire — $MOHN Points System
// Central points management for cross-platform rewards.
// ============================================================================

import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getEmpireDb } from './firebase';
import { EMPIRE_COLLECTIONS } from './config';
import {
  type PointsTransaction,
  type PointsReason,
  type MohnEmpireUser,
  calculateTier,
  POINTS_RULES,
} from './types';

/**
 * Award points to a user. Uses a Firestore transaction to ensure consistency.
 */
export async function awardPoints(
  userId: string,
  reason: PointsReason,
  source: string,
  description?: string,
  customAmount?: number,
): Promise<PointsTransaction> {
  const db = getEmpireDb();
  const amount = customAmount ?? POINTS_RULES[reason];
  if (amount <= 0) throw new Error(`Invalid points amount for reason: ${reason}`);

  const userRef = doc(db, EMPIRE_COLLECTIONS.users, userId);
  const txnRef = collection(db, EMPIRE_COLLECTIONS.pointsTransactions);

  let transaction: PointsTransaction | null = null;

  await runTransaction(db, async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const userData = userSnap.data() as Omit<MohnEmpireUser, 'uid'>;
    const newBalance = (userData.mohnPoints ?? 0) + amount;
    const newTotalEarned = (userData.totalPointsEarned ?? 0) + amount;
    const newTier = calculateTier(newTotalEarned);

    // Update user balance + tier
    t.update(userRef, {
      mohnPoints: newBalance,
      totalPointsEarned: newTotalEarned,
      tier: newTier,
    });

    // Create transaction record
    const txnData = {
      userId,
      type: 'earn' as const,
      amount,
      balance: newBalance,
      source,
      reason,
      description: description ?? `Earned ${amount} $MOHN — ${reason.replace(/_/g, ' ')}`,
      createdAt: serverTimestamp(),
    };

    const txnDocRef = doc(txnRef);
    t.set(txnDocRef, txnData);

    transaction = { id: txnDocRef.id, ...txnData, createdAt: new Date() };
  });

  return transaction!;
}

/**
 * Spend points from a user's balance.
 */
export async function spendPoints(
  userId: string,
  amount: number,
  source: string,
  description: string,
): Promise<PointsTransaction> {
  const db = getEmpireDb();
  if (amount <= 0) throw new Error('Amount must be positive');

  const userRef = doc(db, EMPIRE_COLLECTIONS.users, userId);
  const txnRef = collection(db, EMPIRE_COLLECTIONS.pointsTransactions);

  let transaction: PointsTransaction | null = null;

  await runTransaction(db, async (t) => {
    const userSnap = await t.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const userData = userSnap.data() as Omit<MohnEmpireUser, 'uid'>;
    const currentBalance = userData.mohnPoints ?? 0;

    if (currentBalance < amount) {
      throw new Error(`Insufficient $MOHN balance. Have ${currentBalance}, need ${amount}`);
    }

    const newBalance = currentBalance - amount;
    const newTotalSpent = (userData.totalPointsSpent ?? 0) + amount;

    t.update(userRef, {
      mohnPoints: newBalance,
      totalPointsSpent: newTotalSpent,
    });

    const txnData = {
      userId,
      type: 'spend' as const,
      amount: -amount,
      balance: newBalance,
      source,
      reason: 'redemption' as const,
      description,
      createdAt: serverTimestamp(),
    };

    const txnDocRef = doc(txnRef);
    t.set(txnDocRef, txnData);

    transaction = { id: txnDocRef.id, ...txnData, createdAt: new Date() };
  });

  return transaction!;
}

/**
 * Get recent points transactions for a user.
 */
export async function getPointsHistory(
  userId: string,
  maxResults = 20,
): Promise<PointsTransaction[]> {
  const db = getEmpireDb();
  const txnRef = collection(db, EMPIRE_COLLECTIONS.pointsTransactions);
  const q = query(
    txnRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxResults),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PointsTransaction);
}

/**
 * Apply a referral bonus — award points to BOTH referrer and new user.
 */
export async function applyReferralBonus(
  referrerUserId: string,
  newUserId: string,
  source: string,
): Promise<void> {
  await Promise.all([
    awardPoints(referrerUserId, 'referral_signup', source, 'Referral bonus — new member joined'),
    awardPoints(newUserId, 'referral_use', source, 'Welcome bonus — joined via referral'),
  ]);

  // Increment referrer's referral count
  const db = getEmpireDb();
  const referrerRef = doc(db, EMPIRE_COLLECTIONS.users, referrerUserId);
  await updateDoc(referrerRef, {
    referralCount: (await import('firebase/firestore')).increment(1),
  });
}

/**
 * Check if user already earned daily login points today.
 */
export async function awardDailyLogin(userId: string, source: string): Promise<boolean> {
  const db = getEmpireDb();
  const txnRef = collection(db, EMPIRE_COLLECTIONS.pointsTransactions);

  // Check for existing daily login today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    txnRef,
    where('userId', '==', userId),
    where('reason', '==', 'daily_login'),
    where('createdAt', '>=', today),
    limit(1),
  );

  const snap = await getDocs(q);
  if (!snap.empty) return false; // Already earned today

  await awardPoints(userId, 'daily_login', source, 'Daily login reward');
  return true;
}
