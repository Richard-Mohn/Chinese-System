'use client';

import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-zinc-900">
            Terms<span className="text-orange-500">.</span>
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-12">Last Updated: February 14, 2026</p>
          
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.02)] space-y-10 text-zinc-600 font-medium leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">01. Acceptance of Terms</h2>
              <p>
                By accessing, registering for, or using the MohnMenu platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you are signing up on behalf of a business, you represent that you have the authority to bind that business to these Terms. If you do not agree, you may not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">02. Service Description</h2>
              <p>
                MohnMenu provides a multi-tenant commerce platform that enables local businesses (restaurants, convenience stores, and other food/retail establishments) to accept orders, process payments, manage deliveries, and operate online storefronts. The platform includes both free core features and optional premium modules available on a monthly subscription basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">03. Account Registration</h2>
              <p className="mb-4">
                To use the Service, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Maintaining the security and confidentiality of your login credentials.</li>
                <li>All activity that occurs under your account.</li>
                <li>Notifying us immediately of any unauthorized use of your account.</li>
                <li>Ensuring all business information (name, address, menu, pricing) is accurate and current.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">04. Fees &amp; Payments</h2>
              <p className="mb-4">
                MohnMenu&apos;s core ordering platform uses transparent monthly subscriptions with zero commission on orders. New paid plans include a 3-day free trial:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Starter Plan ($39.99/month):</strong> Core ordering, menu management, QR ordering, and standard payment processing.</li>
                <li><strong>Growth Plan ($79.99/month):</strong> Includes analytics, KDS, custom domain support, and managed support eligibility.</li>
                <li><strong>Professional Plan ($99.99/month):</strong> Includes dispatch, fleet tools, live streaming, advanced integrations, and priority support.</li>
              </ul>
              <p className="mt-4">
                Payment processing fees (e.g., Stripe&apos;s 2.9% + 30&cent;) are charged by the respective payment processor and are separate from MohnMenu&apos;s subscription pricing. Cryptocurrency transaction fees are determined by the blockchain network and NOWPayments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">05. Subscription &amp; Cancellation</h2>
              <p>
                Premium modules are billed on a month-to-month basis. There are no long-term contracts, no lock-in periods, and no cancellation fees. You may cancel any premium module at any time from your dashboard settings. Cancellation takes effect at the end of the current billing period, and you will retain access to premium features until that date. No refunds are provided for partial billing periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">06. User Conduct</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Use the Service for any unlawful purpose or in violation of applicable local, state, or federal regulations.</li>
                <li>Post inaccurate menu items, pricing, or misleading business information.</li>
                <li>Attempt to reverse-engineer, decompile, or access non-public areas of the platform.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Use the platform to sell prohibited items (controlled substances, stolen goods, etc.).</li>
                <li>Impersonate another person or entity, or falsely represent your affiliation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">07. Payment Processing &amp; Crypto</h2>
              <p>
                Card payments are processed through Stripe Connect. Cryptocurrency payments are processed through NOWPayments. MohnMenu is not a money transmitter and does not hold, custody, or convert funds on your behalf. Payments flow directly from customers to your connected Stripe or crypto wallet accounts, minus applicable processing fees. You acknowledge that cryptocurrency values are volatile and that MohnMenu bears no responsibility for exchange rate fluctuations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">08. Delivery &amp; Driver Operations</h2>
              <p>
                If you use MohnMenu&apos;s delivery modules, you are responsible for complying with all applicable local, state, and federal labor, transportation, licensing, and insurance laws. Marketplace drivers may be treated as independent contractors only where supported by applicable law and actual operating practices. Labels in contracts do not override legal classification standards. MohnMenu provides technology workflows, but each business remains responsible for role classification, staffing practices, and lawful operation.
              </p>
              <p className="mt-4">
                For delivery and handoff integrity, participating drivers and teams may be required to submit completion evidence such as proof-of-delivery photos, timestamped completion confirmations, and pickup verification events. Businesses using store pickup workflows are responsible for pickup release controls, order identity checks, and local compliance requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">09. Applications, Screening &amp; Background Checks</h2>
              <p>
                MohnMenu may offer role-based application workflows for drivers, hospitality staff, operations personnel, and other role categories. By submitting an application, applicants agree that MohnMenu and/or participating businesses may review the submission for hiring, contracting, eligibility, safety, fraud-prevention, and compliance purposes.
              </p>
              <p className="mt-4">
                Where permitted by law and required for role eligibility, MohnMenu or participating businesses may request identity verification details and run background checks through approved screening workflows. Sensitive identifiers, including Social Security Number data when legally required, are collected only with consent and only through approved secure workflows. Sensitive data is not sold and is processed solely for legitimate screening, compliance, and risk management purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">10. Intellectual Property</h2>
              <p>
                MohnMenu retains all rights, title, and interest in the platform, software, branding, and documentation. You retain full ownership of your business content — menus, logos, photos, and customer data — uploaded to the platform. By creating a MohnMenu storefront, you grant us a limited license to display your content for the purpose of operating the Service on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MohnMenu shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to lost profits, lost revenue, or business interruption, arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid to MohnMenu in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">12. Dispute Resolution</h2>
              <p>
                Any disputes arising from or relating to these Terms or the Service shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be settled by binding arbitration in accordance with the rules of the American Arbitration Association, conducted in Petersburg, Virginia. These Terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict-of-law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">13. Termination</h2>
              <p>
                Either party may terminate the relationship at any time. You may delete your account from your dashboard settings. We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or remain inactive for more than 12 months. Upon termination, we will provide you with a 30-day window to export your data before it is permanently deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">14. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be communicated via email to the address associated with your account at least 30 days before taking effect. Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms. If you do not agree to the updated Terms, you must discontinue use of the Service.
              </p>
            </section>

            <section className="pt-6 border-t border-zinc-100">
              <h2 className="text-2xl font-black text-black mb-4 tracking-tight uppercase italic">Contact</h2>
              <p>If you have questions about these Terms, please contact us:</p>
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
