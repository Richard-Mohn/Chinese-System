/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";

import { onRequest } from "firebase-functions/v2/https";

import * as admin from "firebase-admin";

import Stripe from "stripe";

import cors from "cors";



admin.initializeApp();

const db = admin.firestore();



setGlobalOptions({ maxInstances: 10 });



const corsHandler = cors({ origin: true });



// Note: In production, use Firebase Secret Manager for the Stripe Secret Key

// firebase functions:secrets:set STRIPE_SECRET_KEY

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {

  apiVersion: "2026-01-28.clover",

});





/**

 * Creates a Stripe Payment Intent for an order.

 */

export const createPaymentIntent = onRequest(async (req, res) => {

  return corsHandler(req, res, async () => {

    if (req.method !== "POST") {

      res.status(405).send("Method Not Allowed");

      return;

    }



    try {

      const { amount, customerEmail, orderId } = req.body;



      const paymentIntent = await stripe.paymentIntents.create({

        amount: Math.round(amount * 100), // Stripe expects amounts in cents

        currency: "usd",

        receipt_email: customerEmail,

        metadata: { orderId },

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

 */

export const stripeWebhook = onRequest(async (req, res) => {

  const sig = req.headers["stripe-signature"] as string;

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";



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

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const orderId = paymentIntent.metadata.orderId;



    if (orderId) {

      await db.collection("orders").doc(orderId).update({

        paymentStatus: "succeeded",

        currentStatus: "Received",

        paymentConfirmedAt: admin.firestore.FieldValue.serverTimestamp(),

        updatedAt: admin.firestore.FieldValue.serverTimestamp(),

      });

      console.log(`Order ${orderId} marked as paid.`);

    }

  }



  res.json({ received: true });

});






