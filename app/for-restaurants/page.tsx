'use client';

import Image from "next/image";
import Link from "next/link";
import Footer from '@/components/Footer';
import { FloatingItems, GradientText } from '@/components/AnimatedElements';

export default function ForRestaurants() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <FloatingItems />
      
      {/* HERO SECTION */}
      <section className="relative flex-1 flex items-center min-h-screen overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=2000"
            alt="Restaurant kitchen"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/50 to-white dark:via-zinc-950/50 dark:to-zinc-950" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <span className="inline-block bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full mb-6 border border-red-200 dark:border-red-800">
              <span className="text-sm font-black text-red-900 dark:text-red-300 uppercase tracking-wide">For Restaurants</span>
            </span>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.95] tracking-tighter mb-8">
              Margins Matter.
              <br />
              <GradientText>DoorDash Eats Yours.</GradientText>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-700 dark:text-zinc-300 font-semibold mb-12 max-w-3xl leading-relaxed">
              The average restaurant pays DoorDash $598/month for 400 orders. OrderFlow? Just $47. Take back control of your delivery platform.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-16">
              <Link 
                href="#demo"
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl shadow-red-500/30 active:scale-95 text-lg"
              >
                Schedule Demo
              </Link>
              <a 
                href="#details"
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border-2 border-zinc-200 dark:border-zinc-800 text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-white mb-4">
              The <GradientText>DoorDash Problem</GradientText>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              You're not alone. Here's what restaurant owners tell us every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">Commission Costs</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                30% commission means you need to raise menu prices or lose money on every order.
              </p>
              <div className="text-sm font-bold text-red-600">Example: $100 order = $30 to DoorDash</div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">😤</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">Lost Customers</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                DoorDash owns your customer relationship. You can't build loyalty or repeat business.
              </p>
              <div className="text-sm font-bold text-red-600">No direct email, phone, or repeat orders</div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">No Control</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                You can't control pricing, promotions, or how your restaurant appears to customers.
              </p>
              <div className="text-sm font-bold text-red-600">They set the rules. You follow.</div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">Order Delays</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Orders come through with delays. Drivers get lost. Customers blame you.
              </p>
              <div className="text-sm font-bold text-red-600">You can't control driver quality</div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">Poor Support</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                When something goes wrong, you're low priority. Response times are days, not hours.
              </p>
              <div className="text-sm font-bold text-red-600">Dedicated account reps only for big chains</div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">Hidden Fees</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                It's never just 30%. Add payment processing, platform fees, and delivery fees.
              </p>
              <div className="text-sm font-bold text-red-600">Often 35-40% total cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-white mb-4">
              The <GradientText>OrderFlow Solution</GradientText>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Built by restaurant operators who understand your business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-8">Your Own Platform</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <div className="font-black text-zinc-900 dark:text-white">White-Label Your Brand</div>
                    <p className="text-zinc-600 dark:text-zinc-400">Customers order directly from YOUR site, not through a third party.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <div className="font-black text-zinc-900 dark:text-white">Own Your Customer Data</div>
                    <p className="text-zinc-600 dark:text-zinc-400">Email lists, phone numbers, order history - it's all yours to use.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <div className="font-black text-zinc-900 dark:text-white">Control Pricing & Promos</div>
                    <p className="text-zinc-600 dark:text-zinc-400">Run your own loyalty program, discounts, and specials.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <div className="font-black text-zinc-900 dark:text-white">Real-Time Delivery Tracking</div>
                    <p className="text-zinc-600 dark:text-zinc-400">Live GPS tracking. Your drivers. Your control. No more surprises.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="font-black text-zinc-900 dark:text-white text-lg">Your Custom App</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Fully branded, fully yours</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-12 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 mb-16">
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-8 text-center">Restaurant Math: $5K/Month in Sales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-black text-red-600 mb-2">$1,500</div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-4">DoorDash Cost</p>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <div>30% commission</div>
                  <div>+ payment fees</div>
                  <div>+ delivery premium</div>
                  <div>= ~30% of sales</div>
                </div>
              </div>

              <div className="text-center border-l border-r border-zinc-300 dark:border-zinc-600 px-8">
                <div className="text-5xl font-black text-emerald-600 mb-2">$150</div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-4">OrderFlow Cost</p>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <div>$0 per order</div>
                  <div>+ payment fees</div>
                  <div>(2.9% + $0.30)</div>
                  <div>= ~3% of sales</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-black text-green-600 mb-2">$1,350</div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-4">Your Savings</p>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <div>✓ 90% per-order savings</div>
                  <div>✓ Month 2 and beyond</div>
                  <div>✓ Keep growing your margin</div>
                  <div>= 27% more profit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES FOR RESTAURANTS */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl sm:text-6xl font-black text-zinc-900 dark:text-white mb-16 text-center">
            Restaurant-Specific Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Kitchen Display System</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Orders print automatically or appear on kitchen screens. No more phone call miscommunications.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Real-time order notifications</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Bump bar for complex orders</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Ready time tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Analytics Dashboard</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">See exactly what's selling, when peak hours are, and where to optimize.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Best-selling items</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Peak order times</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Revenue by hour/day/week</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Direct Marketing</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Email your customers directly with specials, new items, and promotions.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Email campaigns built-in</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>SMS reminders & coupons</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Loyalty rewards program</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Delivery Management</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Use your own drivers, contractors, or a mix. You stay in control.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Driver assignment & routing</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Real-time GPS tracking</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Customer notifications</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Payment Processing</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Accept all payment methods. Money goes straight to your account.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Credit/debit cards</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Apple Pay & Google Pay</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Daily deposits</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Staff Management</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Manage who can access the system, view sales, and run reports.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Role-based access</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Multi-location support</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Audit logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-8">
            Ready to Stop Losing Money?
          </h2>
          <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto">
            The average restaurant using OrderFlow saves $7,200/year. What could you do with that extra profit?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#demo" 
              className="bg-white text-red-600 px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-100 transition-all text-lg"
            >
              Schedule Demo
            </Link>
            <a 
              href="/pricing" 
              className="bg-red-700 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-800 transition-all border-2 border-white text-lg"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
