import Link from 'next/link';
import { FaArrowRight, FaBriefcase, FaGamepad } from 'react-icons/fa';
import { ECOSYSTEM_ROLES } from '@/lib/careers/roles';

const CATEGORY_LABELS = {
  hospitality: 'Hospitality',
  delivery: 'Delivery',
  church: 'Church & Community',
  operations: 'Operations',
} as const;

export default function ApplyHubPage() {
  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-700">
            Mohn Ecosystem Applications
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-6">
            Apply for Roles<span className="text-emerald-600">.</span>
          </h1>
          <p className="text-xl text-zinc-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Browse all open role paths across restaurants, delivery, church operations, and platform staffing. Every role page explains expectations, earnings, and growth opportunities.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest">
            <FaGamepad /> Includes offerwall + future in-game ecosystem opportunities
          </div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_ROLES.map(role => (
            <div key={role.slug} className="bg-white rounded-3xl border border-zinc-200 p-6 hover:shadow-xl hover:border-emerald-200 transition-all">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-3">
                <FaBriefcase className="text-[9px]" />
                {CATEGORY_LABELS[role.category]}
              </div>
              <h2 className="text-xl font-black text-zinc-900 mb-2">{role.title}</h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">{role.summary}</p>
              <Link
                href={`/apply/${role.slug}`}
                className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm hover:text-emerald-600"
              >
                View Role Details <FaArrowRight className="text-[11px]" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
