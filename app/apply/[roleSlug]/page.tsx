import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { ECOSYSTEM_ROLES, getRoleBySlug } from '@/lib/careers/roles';
import QuickApplyButton from '@/components/QuickApplyButton';

export function generateStaticParams() {
  return ECOSYSTEM_ROLES.map(role => ({ roleSlug: role.slug }));
}

export default async function ApplyRolePage({ params }: { params: Promise<{ roleSlug: string }> }) {
  const { roleSlug } = await params;
  const role = getRoleBySlug(roleSlug);
  if (!role) notFound();

  return (
    <div className="min-h-screen bg-white/90">
      <section className="pt-36 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-black uppercase tracking-widest text-emerald-700">
            {role.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-6">
            {role.title}
          </h1>
          <p className="text-xl text-zinc-500 leading-relaxed font-medium mb-8">{role.details}</p>

          <div className="flex flex-wrap gap-4">
            <QuickApplyButton roleSlug={role.slug} variant="primary" />
            <Link
              href={role.applyHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-200 text-zinc-700 font-bold hover:border-zinc-400"
            >
              Full Application <FaArrowRight className="text-xs" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-200 text-zinc-700 font-bold hover:border-zinc-400"
            >
              Browse All Roles
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl bg-white rounded-3xl border border-zinc-200 p-8">
          <h2 className="text-2xl font-black text-zinc-900 mb-5">Role Highlights</h2>
          <div className="space-y-3">
            {role.highlights.map(item => (
              <div key={item} className="flex items-start gap-3 text-zinc-600">
                <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
