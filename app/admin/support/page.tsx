'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { FaLifeRing, FaPlus, FaTools } from 'react-icons/fa';

type Ticket = {
  id: string;
  title: string;
  businessSlug?: string;
  businessId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_user' | 'resolved';
  contactName?: string;
  contactEmail?: string;
  createdAt?: string;
  provider?: 'circle_assist' | 'manual';
};

export default function AdminSupportPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    businessSlug: '',
    businessId: '',
    priority: 'normal' as Ticket['priority'],
    contactName: '',
    contactEmail: '',
    provider: 'manual' as Ticket['provider'],
  });

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
        const snap = await getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(120)));
        setTickets(
          snap.docs.map(doc => {
            const data = doc.data() as Record<string, any>;
            return {
              id: doc.id,
              title: data.title || 'Untitled issue',
              businessSlug: data.businessSlug,
              businessId: data.businessId,
              priority: data.priority || 'normal',
              status: data.status || 'new',
              contactName: data.contactName,
              contactEmail: data.contactEmail,
              createdAt: data.createdAt,
              provider: data.provider || 'manual',
            };
          })
        );
      } finally {
        setLoadingTickets(false);
      }
    };
    load();
  }, [user, MohnMenuUser]);

  const grouped = useMemo(() => {
    return {
      new: tickets.filter(item => item.status === 'new'),
      inProgress: tickets.filter(item => item.status === 'in_progress'),
      waiting: tickets.filter(item => item.status === 'waiting_user'),
      resolved: tickets.filter(item => item.status === 'resolved'),
    };
  }, [tickets]);

  const submitTicket = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        title: form.title.trim(),
        businessSlug: form.businessSlug || null,
        businessId: form.businessId || null,
        priority: form.priority,
        status: 'new',
        contactName: form.contactName || null,
        contactEmail: form.contactEmail || null,
        provider: form.provider,
        source: 'admin-support-console',
        createdBy: user?.uid || null,
        createdAt: serverTimestamp(),
      });

      setForm({ title: '', businessSlug: '', businessId: '', priority: 'normal', contactName: '', contactEmail: '', provider: 'manual' });

      const snap = await getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(120)));
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, any>) })) as Ticket[]);
    } finally {
      setSaving(false);
    }
  };

  if (loading || MohnMenuUser?.role !== 'admin') {
    return <div className="min-h-screen grid place-items-center text-zinc-500 font-bold">Loading support console...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-black text-orange-600">Support Operations</div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Support Queue</h1>
            <p className="text-sm text-zinc-500 mt-1">Track tenant issues and support sessions from one panel.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/super" className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-zinc-800">Tenant Console</Link>
            <Link href="/admin" className="px-4 py-2 rounded-full border border-zinc-200 text-sm font-bold text-zinc-700 hover:border-zinc-400">Back to Admin</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-5">
            <div className="font-black text-zinc-900 mb-3 flex items-center gap-2"><FaPlus /> New Ticket</div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Issue title" className="w-full h-11 px-3 rounded-xl border border-zinc-200" />
              <input value={form.businessSlug} onChange={e => setForm(prev => ({ ...prev, businessSlug: e.target.value }))} placeholder="Business slug (optional)" className="w-full h-11 px-3 rounded-xl border border-zinc-200" />
              <input value={form.businessId} onChange={e => setForm(prev => ({ ...prev, businessId: e.target.value }))} placeholder="Business ID (optional)" className="w-full h-11 px-3 rounded-xl border border-zinc-200" />
              <input value={form.contactName} onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))} placeholder="Contact name (optional)" className="w-full h-11 px-3 rounded-xl border border-zinc-200" />
              <input value={form.contactEmail} onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))} placeholder="Contact email (optional)" className="w-full h-11 px-3 rounded-xl border border-zinc-200" />
              <select title="Ticket priority" value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))} className="w-full h-11 px-3 rounded-xl border border-zinc-200">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select title="Support provider" value={form.provider} onChange={e => setForm(prev => ({ ...prev, provider: e.target.value as Ticket['provider'] }))} className="w-full h-11 px-3 rounded-xl border border-zinc-200">
                <option value="manual">Manual support</option>
                <option value="circle_assist">Circle Assist</option>
              </select>
              <button onClick={submitTicket} disabled={saving} className="w-full h-11 rounded-xl bg-black text-white font-bold hover:bg-zinc-800 disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="font-black text-zinc-900 flex items-center gap-2"><FaLifeRing /> Active Ticket Feed</div>
              <div className="text-xs text-zinc-500">New: {grouped.new.length} • In Progress: {grouped.inProgress.length}</div>
            </div>

            {loadingTickets ? (
              <div className="p-8 text-center text-zinc-500 font-bold">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-bold">No support tickets yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {tickets.map(item => (
                  <div key={item.id} className="px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="font-bold text-zinc-900">{item.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {item.businessSlug || item.businessId || 'General'} • {item.contactEmail || 'No contact email'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 uppercase">{item.status.replace('_', ' ')}</span>
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 uppercase">{item.priority}</span>
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 uppercase inline-flex items-center gap-1"><FaTools className="text-[10px]" /> {item.provider || 'manual'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
