/**
 * Cloud Functions for MohnMenu Platform
 *
 * IMPORTANT: Orders live at businesses/{businessId}/orders/{orderId}
 * The old top-level "orders" collection is NOT used.
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

// Restrict CORS to our domains
const allowedOrigins = [
  "https://mohnmenu.com",
  "https://www.mohnmenu.com",
  /\.mohnmenu\.com$/,
];
if (process.env.FUNCTIONS_EMULATOR) {
  allowedOrigins.push("http://localhost:3000" as any);
}
const corsHandler = cors({ origin: allowedOrigins });

// Fail fast if Stripe keys are missing
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("CRITICAL: STRIPE_SECRET_KEY is not set. Payment functions will fail.");
}
const stripe = new Stripe(stripeSecretKey || "missing", {
  apiVersion: "2026-01-28.clover",
});

/**
 * Creates a Stripe Payment Intent for an order.
 * NOTE: The Next.js API route (/api/stripe/create-payment-intent) is preferred.
 * This Cloud Function exists as a fallback.
 */
export const createPaymentIntent = onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    if (!stripeSecretKey) {
      res.status(500).send({ error: "Stripe is not configured" });
      return;
    }

    try {
      const { amount, customerEmail, orderId, businessId } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        receipt_email: customerEmail,
        metadata: {
          mohn_order_id: orderId,
          mohn_business_id: businessId || "",
        },
      });

      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: unknown) {
      console.error("Error creating payment intent:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
      res.status(500).send({ error: errorMessage });
    }
  });
});

/**
 * Handles Stripe Webhook events to confirm payment and update order status.
 * Orders are stored at: businesses/{businessId}/orders/{orderId}
 */
export const stripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set — rejecting webhook");
    res.status(500).send("Webhook secret not configured");
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook Error: ${message}`);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const orderId = paymentIntent.metadata.mohn_order_id || paymentIntent.metadata.orderId;
    const businessId = paymentIntent.metadata.mohn_business_id;
    const receiptUrl = paymentIntent.receipt_url;

    if (orderId && businessId) {
      // Correct path: businesses/{businessId}/orders/{orderId}
      await db.collection("businesses").doc(businessId).collection("orders").doc(orderId).update({
        paymentStatus: "succeeded",
        currentStatus: "Received",
        paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        receiptUrl: receiptUrl || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Order ${orderId} (business ${businessId}) marked as paid.`);
    } else if (orderId) {
      // Fallback: search for the order across all businesses
      const querySnap = await db.collectionGroup("orders")
        .where("__name__", "==", orderId)
        .limit(1)
        .get();
      if (!querySnap.empty) {
        await querySnap.docs[0].ref.update({
          paymentStatus: "succeeded",
          currentStatus: "Received",
          paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),
          receiptUrl: receiptUrl || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Order ${orderId} found via collectionGroup and marked as paid.`);
      } else {
        console.error(`Order ${orderId} not found in any business subcollection.`);
      }
    }
  }

  res.json({ received: true });
});

/**
 * Cloud Function to handle order status changes and calculate driver payouts.
 * Triggers on: businesses/{businessId}/orders/{orderId}
 */
export const onOrderStatusUpdate = onDocumentUpdated(
  "businesses/{businessId}/orders/{orderId}",
  async (event) => {
    const orderAfter = event.data?.after.data();
    const orderBefore = event.data?.before.data();

    if (!orderAfter || !orderBefore) {
      console.log("No data for order update.");
      return null;
    }

    const { businessId, orderId } = event.params;

    // Check if status changed to 'Delivered' and a driverId is present
    if (
      orderAfter.currentStatus === "Delivered" &&
      orderBefore.currentStatus !== "Delivered" &&
      orderAfter.driverId
    ) {
      // Calculate payout: use business-configured amount, default $5.00
      const payoutAmount = orderAfter.driverPayoutOverride || 5.0;

      if (!orderAfter.driverPayoutAmount) {
        await db
          .collection("businesses")
          .doc(businessId)
          .collection("orders")
          .doc(orderId)
          .update({
            driverPayoutAmount: payoutAmount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        console.log(
          `Driver ${orderAfter.driverId} earned $${payoutAmount} for order ${orderId} (business ${businessId}).`
        );
      }
    }

    // ── Award Loyalty Points + $MOHN Tokens ─────────────
    // Loyalty: 1 point per $1 spent
    // $MOHN: 5 tokens per completed order (unified ecosystem reward)
    const isCompleted =
      (orderAfter.currentStatus === "Delivered" || orderAfter.currentStatus === "Completed") &&
      orderBefore.currentStatus !== "Delivered" &&
      orderBefore.currentStatus !== "Completed";

    if (isCompleted && orderAfter.customerId && !orderAfter.loyaltyPointsAwarded) {
      const orderTotal = orderAfter.total || orderAfter.subtotal || 0;
      const pointsEarned = Math.floor(orderTotal); // 1 point per $1
      const mohnEarned = 5; // 5 $MOHN per completed order

      if (pointsEarned > 0) {
        const customerRef = db.collection("users").doc(orderAfter.customerId);
        await customerRef.update({
          loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned),
          loyaltyPointsLifetime: admin.firestore.FieldValue.increment(pointsEarned),
          mohnBalance: admin.firestore.FieldValue.increment(mohnEarned),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ── Update customer profile stats for social features ──
        const profileRef = db.collection("customerProfiles").doc(orderAfter.customerId);
        const profileSnap = await profileRef.get();

        if (!profileSnap.exists) {
          // Initialize profile on first order
          const userSnap = await customerRef.get();
          const userData = userSnap.data();
          await profileRef.set({
            displayName: userData?.displayName || orderAfter.customerName || "Anonymous",
            email: userData?.email || orderAfter.customerEmail || "",
            photoURL: userData?.photoURL || null,
            stats: {
              totalOrders: 1,
              totalSpent: orderTotal,
              badges: ["first_order"],
              friendsOrderedFor: 0,
            },
            privacy: {
              showLeaderboard: true,
              disableSocialPosts: false,
              socialPostPrivacy: "public",
              acceptFriendOrders: true,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          // Update existing profile
          const profileData = profileSnap.data();
          const currentSpent = profileData?.stats?.totalSpent || 0;
          const currentOrders = profileData?.stats?.totalOrders || 0;
          const newSpent = currentSpent + orderTotal;
          const newOrders = currentOrders + 1;

          // Badge assignment logic
          const badges = new Set(profileData?.stats?.badges || []);
          if (newOrders === 1) badges.add("first_order");
          if (newSpent >= 100) badges.add("big_spender");
          if (newSpent >= 500) badges.add("foodie");
          if (newSpent >= 1000) badges.add("vip");
          if (newSpent >= 5000) badges.add("legend");
          if (newOrders >= 50) badges.add("champion");

          await profileRef.update({
            "stats.totalOrders": admin.firestore.FieldValue.increment(1),
            "stats.totalSpent": admin.firestore.FieldValue.increment(orderTotal),
            "stats.badges": Array.from(badges),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Log $MOHN reward event for audit trail
        await db.collection("mohn_rewards").add({
          action: "food_order",
          points: mohnEarned,
          userId: orderAfter.customerId,
          description: "Completed a food order",
          platform: "mohnmenu",
          metadata: { orderId, businessId, orderTotal },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark order so we don't double-award
        await db
          .collection("businesses")
          .doc(businessId)
          .collection("orders")
          .doc(orderId)
          .update({
            loyaltyPointsAwarded: pointsEarned,
            mohnAwarded: mohnEarned,
          });

        console.log(
          `Awarded ${pointsEarned} loyalty points + ${mohnEarned} $MOHN to customer ${orderAfter.customerId} for order ${orderId}.`
        );
      }
    }

    // ── Award $MOHN to Driver ──────────────────────────────
    // Drivers earn 5 $MOHN per delivery completed
    if (isCompleted && orderAfter.driverId && !orderAfter.driverMohnAwarded) {
      const driverMohn = 5;
      const driverRef = db.collection("users").doc(orderAfter.driverId);
      await driverRef.update({
        mohnBalance: admin.firestore.FieldValue.increment(driverMohn),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("mohn_rewards").add({
        action: "driver_delivery",
        points: driverMohn,
        userId: orderAfter.driverId,
        description: "Completed a delivery as driver",
        platform: "mohnmenu",
        metadata: { orderId, businessId },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db
        .collection("businesses")
        .doc(businessId)
        .collection("orders")
        .doc(orderId)
        .update({ driverMohnAwarded: driverMohn });

      console.log(
        `Awarded ${driverMohn} $MOHN to driver ${orderAfter.driverId} for delivery of order ${orderId}.`
      );
    }

    return null;
  }
);

// ════════════════════════════════════════════════════════════
// $MOHN REWARDS — Wallet Transfer Trigger
// Awards $MOHN for P2P transfers & pay-for-friend actions
// ════════════════════════════════════════════════════════════
export const awardMohnOnWalletTransfer = functions.firestore
  .document("wallet_transfers/{transferId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot) => {
    const transfer = snap.data();
    if (!transfer || transfer.mohnAwarded) return null;

    const senderId = transfer.senderId;
    if (!senderId) return null;

    let mohnAmount = 0;
    let action = "";

    if (transfer.type === "p2p_transfer") {
      mohnAmount = 2; // 2 $MOHN per P2P transfer
      action = "p2p_transfer";
    } else if (transfer.type === "pay_for_friend") {
      mohnAmount = 5; // 5 $MOHN for paying a friend's order
      action = "pay_for_friend";
    }

    if (mohnAmount > 0) {
      const senderRef = db.collection("users").doc(senderId);
      await senderRef.update({
        mohnBalance: admin.firestore.FieldValue.increment(mohnAmount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("mohn_rewards").add({
        action,
        points: mohnAmount,
        userId: senderId,
        description:
          action === "p2p_transfer"
            ? "Sent a P2P transfer"
            : "Paid for a friend's order",
        platform: "mohnmenu",
        metadata: { transferId: snap.id },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await snap.ref.update({ mohnAwarded: mohnAmount });

      console.log(
        `Awarded ${mohnAmount} $MOHN to ${senderId} for ${action} (transfer ${snap.id}).`
      );
    }

    return null;
  });

// ════════════════════════════════════════════════════════════
// $MOHN REWARDS — Wallet Top-Up Trigger  
// Awards 3 $MOHN per wallet top-up (triggered by Stripe webhook)
// ════════════════════════════════════════════════════════════
export const awardMohnOnWalletTopup = functions.firestore
  .document("wallet_topups/{topupId}")
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot) => {
    const topup = snap.data();
    if (!topup || topup.mohnAwarded) return null;

    const userId = topup.userId || topup.firebaseUid;
    if (!userId) return null;

    const mohnAmount = 3; // 3 $MOHN per top-up

    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      mohnBalance: admin.firestore.FieldValue.increment(mohnAmount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("mohn_rewards").add({
      action: "wallet_topup",
      points: mohnAmount,
      userId,
      description: "Topped up wallet balance",
      platform: "mohnmenu",
      metadata: { topupId: snap.id, amount: topup.amount },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await snap.ref.update({ mohnAwarded: mohnAmount });

    console.log(
      `Awarded ${mohnAmount} $MOHN to ${userId} for wallet top-up (${snap.id}).`
    );

    return null;
  });