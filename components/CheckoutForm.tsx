'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  name: string;
  email: string;
  address: string;
  orderType: 'pickup' | 'delivery';
  isExpress: boolean;
  total: number;
  subtotal: number;
  expressFee: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  name, email, address, orderType, isExpress, total, subtotal, expressFee 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Order in 'pending' status
      const orderData = {
        customerInfo: {
          uid: user?.uid || null,
          name,
          email,
          address: orderType === 'delivery' ? address : null,
        },
        items: cart,
        subtotal,
        expressFee,
        totalAmount: total,
        orderType,
        is_express: isExpress,
        currentStatus: 'Pending Payment',
        paymentStatus: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // 2. Call Cloud Function to create Payment Intent
      // Use the actual URL of your deployed Firebase Function
      const response = await fetch('https://us-central1-chinese-system.cloudfunctions.net/createPaymentIntent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customerEmail: email,
          orderId: orderRef.id,
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      // 3. Confirm Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name, email },
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          clearCart();
          router.push(`/track/${orderRef.id}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 ml-1">Card Details</label>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-xs font-bold uppercase tracking-tight text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)} Now`}
      </button>
    </form>
  );
};

export default CheckoutForm;
