'use client';

import { useSearchParams } from 'next/navigation';
import OrderTrackingPanel from '@/components/OrderTrackingPanel';

export default function BusinessOrderTrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  if (!orderId) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-28 px-4">
        <div className="max-w-xl mx-auto bg-white border border-zinc-100 rounded-3xl p-10 text-center">
          <p className="text-xl font-black text-black mb-2">Missing Order ID</p>
          <p className="text-zinc-500">Use a tracking link with an order ID.</p>
        </div>
      </div>
    );
  }

  return <OrderTrackingPanel orderId={orderId} />;
}
