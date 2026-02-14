'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-zinc-900">
            Privacy<span className="text-orange-500">.</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-12">Last Updated: February 14, 2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.02)] space-y-10 text-zinc-600 font-medium leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">01. Our Stance</h2>
              <p>
                At MohnMenu, we believe your data belongs to you. Unlike marketplace platforms that mine, resell, or weaponize your customer and transaction data, we operate on a fundamentally different model. We do not sell, rent, or share your business data, customer information, or order analytics with any third party for advertising or competing purposes — ever.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">02. Information We Collect</h2>
              <p className="mb-4">We collect information necessary to deliver our services. This includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, and business details provided during registration.</li>
                <li><strong>Business Data:</strong> Store name, address, menu items, pricing, logos, and operational settings you configure on the platform.</li>
                <li><strong>Transaction Data:</strong> Order details, payment method types, and amounts processed through our service. Card numbers and sensitive payment credentials are handled exclusively by Stripe and NOWPayments — we never store them.</li>
                <li><strong>Location Data:</strong> GPS coordinates collected from delivery drivers who opt into the live tracking feature during active deliveries only.</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, browser type, device type, and IP address for analytics and security purposes.</li>
              </ul>
              <p className="mt-4">
                <strong>Sensitive screening data:</strong> For role-based applications, we may process screening and identity-verification data where legally permitted and necessary. This may include background-check eligibility data and, when required by law or screening provider workflow, sensitive identifiers such as Social Security Number data. Sensitive identifiers are requested only in secure screening workflows and not for general marketing use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">03. How We Use Your Information</h2>
              <p className="mb-4">The information we collect is used solely to provide and improve our services:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>To process orders, payments, and delivery tracking on your behalf.</li>
                <li>To generate analytics and dashboards visible only to you (the business owner).</li>
                <li>To provide customer support and resolve disputes.</li>
                <li>To send essential service communications (order confirmations, payout notifications).</li>
                <li>To detect and prevent fraud, chargebacks, and unauthorized access.</li>
                <li>To process role applications, screening, and compliance checks where enabled.</li>
                <li>To improve platform functionality, performance, and reliability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">03A. Screening, Proof-of-Delivery &amp; Pickup Evidence</h2>
              <p className="mb-4">
                Businesses and delivery operators may use MohnMenu workflows that capture operational evidence, including proof-of-delivery photos, pickup verification events, geolocation/time metadata, and handoff confirmations.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Evidence is used for fulfillment integrity, customer protection, dispute resolution, fraud prevention, and legal compliance.</li>
                <li>Operational evidence is access-controlled and limited to authorized personnel with business need.</li>
                <li>Sensitive screening records are segregated from general customer analytics and are not sold.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">04. Third-Party Services</h2>
              <p className="mb-4">We integrate with trusted third-party services to power core platform features:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Firebase (Google Cloud):</strong> Authentication, database, and hosting infrastructure. Subject to <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google&apos;s Privacy Policy</a>.</li>
                <li><strong>Stripe:</strong> Card payment processing and business payouts via Stripe Connect. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Stripe&apos;s Privacy Policy</a>.</li>
                <li><strong>NOWPayments:</strong> Cryptocurrency payment processing (Bitcoin, Ethereum, Litecoin, Dogecoin). Subject to <a href="https://nowpayments.io/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">NOWPayments&apos; Privacy Policy</a>.</li>
                <li><strong>Mapbox:</strong> Map rendering for delivery tracking features. Subject to <a href="https://www.mapbox.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Mapbox&apos;s Privacy Policy</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">05. Cookies &amp; Tracking</h2>
              <p>
                We use essential cookies to maintain your logged-in session and remember your preferences. We use localStorage to persist your shopping cart between visits. We do not use third-party advertising cookies, retargeting pixels, or cross-site tracking technologies. Analytics data is collected in aggregate to improve the platform and is never sold or shared with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">06. Data Retention</h2>
              <p>
                Active account data is retained for the duration of your account. Order history and transaction records are retained for 7 years to comply with tax and financial reporting obligations. If you delete your account, personal identifiers are removed within 30 days while anonymized transaction records may be retained for compliance purposes.
              </p>
              <p className="mt-4">
                Screening and operational evidence records are retained according to legal requirements, dispute windows, and internal risk-control policies. Where not legally required, sensitive screening artifacts are minimized and deleted according to retention schedules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">07. Your Rights</h2>
              <p className="mb-4">Depending on your jurisdiction, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request that we correct inaccurate or incomplete data.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal data (subject to legal retention requirements).</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Opt-out:</strong> Opt out of non-essential communications at any time.</li>
              </ul>
              <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:hello@mohnmenu.com" className="text-orange-600 hover:underline">hello@mohnmenu.com</a> or call <a href="tel:8046051461" className="text-orange-600 hover:underline">(804) 605-1461</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">08. Security</h2>
              <p>
                We implement industry-standard security measures including SSL/TLS encryption for all data in transit, Firebase Security Rules for database access control, Stripe&apos;s PCI-DSS Level 1 compliant infrastructure for payment data, and role-based access controls within our multi-tenant architecture. We regularly review and update our security practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">09. Children&apos;s Privacy</h2>
              <p>
                MohnMenu is not directed to individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have inadvertently collected such information, we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last Updated&rdquo; date at the top of this page and notify active users via email if the changes are material. Your continued use of MohnMenu after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="pt-6 border-t border-zinc-100">
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">Contact Us</h2>
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>MohnMenu</strong></p>
                <p>23 Shore St., Petersburg, VA 23803</p>
                <p>Email: <a href="mailto:hello@mohnmenu.com" className="text-orange-600 hover:underline">hello@mohnmenu.com</a></p>
                <p>Phone: <a href="tel:8046051461" className="text-orange-600 hover:underline">(804) 605-1461</a></p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
