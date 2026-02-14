'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getCountFromServer, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { FaArrowRight, FaBuilding, FaLifeRing, FaSearch, FaStore, FaUsers } from 'react-icons/fa';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  ownerEmail: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  createdAt?: string;
};

export default function SuperAdminPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ businesses: 0, users: 0, tickets: 0 });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (MohnMenuUser?.role !== 'admin') router.push('/dashboard');
    }
  }, [loading, user, MohnMenuUser, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || MohnMenuUser?.role !== 'admin') return;
      try {
        const [bizCount, userCount, ticketCount, bizSnap] = await Promise.all([
          getCountFromServer(collection(db, 'businesses')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'support_tickets')),
          getDocs(query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(150))),
        ]);

        setStats({
          businesses: bizCount.data().count,
          users: userCount.data().count,
          tickets: ticketCount.data().count,
        });

        setTenants(
          bizSnap.docs.map(doc => {
            const data = doc.data() as Record<string, any>;
            return {
              id: doc.id,
              name: data.name || 'Unknown Business',
              slug: data.slug || '',
              type: data.type || 'other',
              ownerEmail: data.ownerEmail || '',
              city: data.city,
              state: data.state,
              isActive: data.isActive,
              createdAt: data.createdAt,
            };
          })
        );
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [user, MohnMenuUser]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tenants;
    return tenants.filter(item =>
      [item.name, item.slug, item.ownerEmail, item.city, item.state, item.type]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    );
  }, [tenants, search]);

  if (loading || MohnMenuUser?.role !== 'admin') {
    return <div className="min-h-screen grid place-items-center text-zinc-500 font-bold">Loading super admin...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-black text-orange-600">Super Management</div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Tenant Command Center</h1>
            <p className="text-sm text-zinc-500 mt-1">Cross-tenant oversight for support and operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/support" className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-zinc-800 inline-flex items-center gap-2">
              Support Queue <FaLifeRing className="text-xs" />
            </Link>
            <Link href="/admin" className="px-4 py-2 rounded-full border border-zinc-200 text-sm font-bold text-zinc-700 hover:border-zinc-400">
              Back to Admin
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="text-xs uppercase tracking-widest text-zinc-500 font-black">Businesses</div><div className="text-3xl font-black mt-1">{stats.businesses}</div></div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="text-xs uppercase tracking-widest text-zinc-500 font-black">Users</div><div className="text-3xl font-black mt-1">{stats.users}</div></div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-5"><div className="text-xs uppercase tracking-widest text-zinc-500 font-black">Support Tickets</div><div className="text-3xl font-black mt-1">{stats.tickets}</div></div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4 flex items-center gap-2">
          <FaSearch className="text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search business, slug, owner email, city, state..."
            className="w-full h-11 px-2 text-sm outline-none"
          />
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100">
            <div className="col-span-4">Business</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Owner</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {loadingData ? (
            <div className="p-8 text-center text-zinc-500 font-bold">Loading tenants...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-bold">No matching tenants found.</div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-100 items-center">
                <div className="col-span-4 min-w-0">
                  <div className="font-bold text-zinc-900 truncate">{item.name}</div>
                  <div className="text-xs text-zinc-500 truncate">/{item.slug || item.id}</div>
                </div>
                <div className="col-span-2 text-sm text-zinc-600">{item.type}</div>
                <div className="col-span-3 text-sm text-zinc-600 truncate">{item.ownerEmail || '—'}</div>
                <div className="col-span-2 text-sm text-zinc-600">{[item.city, item.state].filter(Boolean).join(', ') || '—'}</div>
                <div className="col-span-1 text-right">
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 hover:border-zinc-400 text-zinc-600" title="Tenant detail (Phase 2)">
                    <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 text-xs text-zinc-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Phase 1 is read-focused. Write actions + impersonation + remote session launcher are documented for Phase 2/3.
        </div>
      </div>
    </div>
  );
}
