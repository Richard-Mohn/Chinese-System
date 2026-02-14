import Link from 'next/link';
import {
  FaArrowRight,
  FaChurch,
  FaCoins,
  FaDownload,
  FaGamepad,
  FaGift,
  FaPlayCircle,
  FaStore,
  FaTruck,
  FaUserShield,
  FaWallet,
} from 'react-icons/fa';
import {
  DEFAULT_OFFERWALL_CONFIG,
  computeUserPayoutUsd,
  computeUserSharePct,
} from '@/lib/offerwall/offerwall-engine';

const sampleOffers = [
  { id: 'game-level-30', name: 'Reach Level 30', payoutUsd: 4.5 },
  { id: 'game-level-100', name: 'Reach Level 100', payoutUsd: 12 },
  { id: 'app-install-premium', name: 'Install & Activate App', payoutUsd: 2.75 },
  { id: 'video-reward-roll', name: 'Watch Reward Video Series', payoutUsd: 1.2 },
];

const roleTrackingRows = [
  { role: 'Customer', key: 'customer', reason: 'Earn credits to buy food, drinks, and products.' },
  { role: 'Driver', key: 'driver', reason: 'Earn between delivery jobs and roadside requests.' },
  { role: 'Staff', key: 'staff', reason: 'Optional side earnings during off-peak windows.' },
  { role: 'Church Member', key: 'church-member', reason: 'Fundraising participation tied to church campaigns.' },
  { role: 'Church Admin', key: 'church-admin', reason: 'Track campaign performance and donation conversion.' },
];

const flow = [
  {
    icon: FaGift,
    title: 'Customer opens Earn page',
    detail: 'Every business gets an Offerwall Earnings tab on their branded site.',
  },
  {
    icon: FaDownload,
    title: 'User completes offers',
    detail: 'Install apps, reach game levels, and complete reward-video actions.',
  },
  {
    icon: FaWallet,
    title: 'Wallet credits instantly',
    detail: 'Credits post to rewards wallet and can be applied at checkout.',
  },
  {
    icon: FaStore,
    title: 'Business converts credits to sales',
    detail: 'Users redeem earned balances for orders, increasing repeat purchases.',
  },
];

export default function OfferwallRewardsFeaturePage() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-violet-50 border border-violet-100 text-xs font-black uppercase tracking-widest text-violet-600">
            New Revenue Layer
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance">
            Offerwall Earnings<span className="text-violet-500">.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10">
            Let customers, drivers, and church communities earn credits from offers, app installs, game goals, and reward videos — then spend those credits on your platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="group px-10 py-5 bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-violet-500/20 transition-all">
              Activate Offerwall <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/for-churches" className="px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all">
              For Churches
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-zinc-50/70">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-violet-600 mb-2"><FaCoins /></div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-black">Offer Types</p>
            <p className="text-2xl font-black text-zinc-900">Apps + Games + Video</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-violet-600 mb-2"><FaWallet /></div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-black">Wallet Use</p>
            <p className="text-2xl font-black text-zinc-900">Food + Drinks + Retail</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-violet-600 mb-2"><FaChurch /></div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-black">Church Mode</p>
            <p className="text-2xl font-black text-zinc-900">Fundraising Campaigns</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-violet-600 mb-2"><FaTruck /></div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-black">Driver Mode</p>
            <p className="text-2xl font-black text-zinc-900">Earn Between Jobs</p>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">User Flow</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How money loops back into your business.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flow.map(step => (
              <div key={step.title} className="bg-white rounded-3xl border border-zinc-100 p-7 hover:border-violet-200 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                  <step.icon className="text-violet-600" />
                </div>
                <h3 className="font-bold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-zinc-50/70">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">Role + Business Tracking</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Attribution model for every offer click.</h2>
            <p className="text-zinc-500 max-w-3xl mx-auto">
              Each event is tracked with UID, business ID, role, and device so owner revenue, driver earnings, and church fundraising can be measured separately.
            </p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-black">Role</th>
                  <th className="px-5 py-4 font-black">Tracking Key</th>
                  <th className="px-5 py-4 font-black">Business Value</th>
                </tr>
              </thead>
              <tbody>
                {roleTrackingRows.map(row => (
                  <tr key={row.key} className="border-t border-zinc-100">
                    <td className="px-5 py-4 font-bold text-zinc-900">{row.role}</td>
                    <td className="px-5 py-4 text-violet-700 font-mono">{row.key}</td>
                    <td className="px-5 py-4 text-zinc-600">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-white border border-zinc-200 text-sm text-zinc-600">
            Recommended attribution fields: <span className="font-semibold">aff_sub=uid</span>, <span className="font-semibold">aff_sub2=device</span>, <span className="font-semibold">aff_sub3=businessId</span>, <span className="font-semibold">aff_sub4=role</span>, <span className="font-semibold">aff_sub5=roleId</span>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-violet-600 font-black uppercase tracking-widest text-xs mb-3 block">Payout Preview</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Sample credit outcomes using your current engine.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sampleOffers.map(offer => {
              const sharePct = computeUserSharePct(offer.payoutUsd, 'web', offer.id, DEFAULT_OFFERWALL_CONFIG);
              const userPayout = computeUserPayoutUsd(offer.payoutUsd, 'web', offer.id, DEFAULT_OFFERWALL_CONFIG);
              const businessNet = Math.max(0, offer.payoutUsd - userPayout);

              return (
                <div key={offer.id} className="bg-white rounded-3xl border border-zinc-200 p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="font-bold text-zinc-900">{offer.name}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-violet-600">{(sharePct * 100).toFixed(1)}% user share</div>
                  </div>
                  <div className="text-sm text-zinc-600 mb-2">Network payout: <span className="font-bold text-zinc-900">${offer.payoutUsd.toFixed(2)}</span></div>
                  <div className="text-sm text-zinc-600 mb-2">User credit: <span className="font-bold text-emerald-600">${userPayout.toFixed(2)}</span></div>
                  <div className="text-sm text-zinc-600">Business-side net: <span className="font-bold text-violet-700">${businessNet.toFixed(2)}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-zinc-950 text-white rounded-[3rem] mx-4 mb-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-violet-300 mb-4 font-bold">
            <FaUserShield /> MohnMatrix-Controlled Operations
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-5">Manage all campaigns from your central console.</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Use MohnMatrix as your admin layer for provider settings, postback rules, fraud controls, role segmentation, and payout reconciliation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/owner" className="px-8 py-4 bg-violet-600 rounded-full font-bold hover:bg-violet-500 transition-colors">
              Open Owner Dashboard
            </Link>
            <Link href="/demo/driver" className="px-8 py-4 bg-zinc-800 rounded-full font-bold hover:bg-zinc-700 transition-colors inline-flex items-center gap-2">
              <FaPlayCircle /> Driver Demo
            </Link>
            <Link href="/for-churches" className="px-8 py-4 bg-zinc-800 rounded-full font-bold hover:bg-zinc-700 transition-colors inline-flex items-center gap-2">
              <FaChurch /> Church Fundraising
            </Link>
          </div>
          <p className="mt-5 text-xs text-zinc-500">Set NEXT_PUBLIC_MOHNMATRIX_BG_API_URL and your offerwall provider endpoints to connect production services.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-4">Launch your Earn page with your storefront.</h2>
          <p className="text-zinc-500 mb-8">This gives your business a second monetization loop: users earn credits, then spend inside your ecosystem.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-violet-500/20 transition-all">
            Enable Offerwall Rewards <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
