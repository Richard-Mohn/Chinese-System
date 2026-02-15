'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection, collectionGroup, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { FaLifeRing, FaPlus, FaTools, FaCheckCircle, FaTruck } from 'react-icons/fa';

type Ticket = {
  id: string;
  title: string;
  businessSlug?: string;
  businessId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_user' | 'resolved';
  contactName?: string;
  contactEmail?: string;
  details?: string;
  orderId?: string;
  createdAt?: string;
  provider?: 'circle_assist' | 'manual';
  source?: string;
  createdBy?: string;
  supportSlaAt?: string;
  supportSlaMinutes?: number;
  managedSupportEnabled?: boolean;
  managedSupportEntitled?: boolean;
  managedSupportRouted?: boolean;
  supportAgentUid?: string | null;
  supportAgentName?: string | null;
  updatedAt?: string;
};

type EscalatedOrder = {
  orderId: string;
  businessId: string;
  customerName: string;
  status: string;
  total: number;
  paymentStatus?: string;
  escalatedAt?: string;
  assignedDriverId?: string;
};

export default function AdminSupportPage() {
  const { user, MohnMenuUser, loading } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [escalatedOrders, setEscalatedOrders] = useState<EscalatedOrder[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticketUpdatingId, setTicketUpdatingId] = useState<string | null>(null);
  const [escalationUpdatingKey, setEscalationUpdatingKey] = useState<string | null>(null);
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
    if (!user || MohnMenuUser?.role !== 'admin') return;

    const ticketQuery = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(180));
    const unsubTickets = onSnapshot(ticketQuery, (snap) => {
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
            details: data.details,
            orderId: data.orderId,
            createdAt: data.createdAt,
            provider: data.provider || 'manual',
            source: data.source || 'manual',
            createdBy: data.createdBy,
            supportSlaAt: data.supportSlaAt || null,
            supportSlaMinutes: Number(data.supportSlaMinutes || 0) || undefined,
            managedSupportEnabled: !!data.managedSupportEnabled,
            managedSupportEntitled: !!data.managedSupportEntitled,
            managedSupportRouted: !!data.managedSupportRouted,
            supportAgentUid: data.supportAgentUid || null,
            supportAgentName: data.supportAgentName || null,
            updatedAt: data.updatedAt || null,
          };
        })
      );
      setLoadingTickets(false);
    });

    const escalationQuery = query(
      collectionGroup(db, 'orders'),
      where('supportEscalation.active', '==', true),
      limit(180),
    );

    const unsubEscalations = onSnapshot(escalationQuery, (snap) => {
      const rows = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        const parts = docSnap.ref.path.split('/');
        const businessId = parts.length >= 2 ? parts[1] : '';
        return {
          orderId: docSnap.id,
          businessId,
          customerName: data.customerName || 'Customer',
          status: data.status || 'pending',
          total: Number(data.total || data.pricing?.total || 0),
          paymentStatus: data.paymentStatus || 'pending',
          escalatedAt: data.supportEscalation?.escalatedAt || '',
          assignedDriverId: data.assignedDriverId || '',
        } as EscalatedOrder;
      });

      rows.sort((a, b) => new Date(b.escalatedAt || 0).getTime() - new Date(a.escalatedAt || 0).getTime());
      setEscalatedOrders(rows);
    });

    return () => {
      unsubTickets();
      unsubEscalations();
    };
  }, [user, MohnMenuUser]);

  const grouped = useMemo(() => {
    return {
      new: tickets.filter(item => item.status === 'new'),
      inProgress: tickets.filter(item => item.status === 'in_progress'),
      waiting: tickets.filter(item => item.status === 'waiting_user'),
      resolved: tickets.filter(item => item.status === 'resolved'),
    };
  }, [tickets]);

  useEffect(() => {
    if (!user || MohnMenuUser?.role !== 'admin' || tickets.length === 0) return;

    const run = async () => {
      const now = Date.now();
      for (const ticket of tickets) {
        if (!ticket.supportSlaAt) continue;
        if (ticket.status === 'resolved') continue;

        const slaAtMs = new Date(ticket.supportSlaAt).getTime();
        if (!Number.isFinite(slaAtMs)) continue;
        if (now < slaAtMs) continue;

        const ageMinutes = Math.floor((now - slaAtMs) / 60000);
        const desiredPriority: Ticket['priority'] = ageMinutes >= 30 ? 'urgent' : 'high';
        const managedSupportActive = !!ticket.managedSupportEnabled && !!ticket.managedSupportEntitled;
        const needsRoute = managedSupportActive && !ticket.managedSupportRouted;
        const needsPriorityBump = priorityRank(desiredPriority) > priorityRank(ticket.priority || 'normal');
        const needsStatus = ticket.status === 'waiting_user';

        if (!needsRoute && !needsPriorityBump && !needsStatus) continue;

        await updateDoc(doc(db, 'support_tickets', ticket.id), {
          managedSupportRouted: needsRoute ? true : (ticket.managedSupportRouted || false),
          source: needsRoute ? 'sla_auto_rollover' : ticket.source || 'manual',
          priority: needsPriorityBump ? desiredPriority : (ticket.priority || 'normal'),
          status: needsStatus ? 'in_progress' : ticket.status,
          updatedAt: new Date().toISOString(),
        });
      }
    };

    run();
  }, [tickets, user, MohnMenuUser]);

  const setTicketStatus = async (ticketId: string, nextStatus: Ticket['status']) => {
    setTicketUpdatingId(ticketId);
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setTicketUpdatingId(null);
    }
  };

  const claimTicket = async (ticket: Ticket, claim: boolean) => {
    if (!user) return;
    setTicketUpdatingId(ticket.id);
    try {
      await updateDoc(doc(db, 'support_tickets', ticket.id), {
        supportAgentUid: claim ? user.uid : null,
        supportAgentName: claim ? (MohnMenuUser?.displayName || MohnMenuUser?.email || 'Support Agent') : null,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setTicketUpdatingId(null);
    }
  };

  const resolveEscalation = async (row: EscalatedOrder) => {
    if (!row.businessId || !row.orderId) return;
    const key = `${row.businessId}:${row.orderId}`;
    setEscalationUpdatingKey(key);
    try {
      await updateDoc(doc(db, 'businesses', row.businessId, 'orders', row.orderId), {
        supportEscalation: {
          active: false,
          escalatedAt: row.escalatedAt || new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setEscalationUpdatingKey(null);
    }
  };

  const kpis = useMemo(() => {
    const now = Date.now();
    let overdue = 0;
    let mine = 0;
    for (const ticket of tickets) {
      if (ticket.supportAgentUid && user && ticket.supportAgentUid === user.uid) mine += 1;
      if (ticket.status === 'resolved') continue;
      if (!ticket.supportSlaAt) continue;
      const due = new Date(ticket.supportSlaAt).getTime();
      if (Number.isFinite(due) && due <= now) overdue += 1;
    }

    return {
      open: grouped.new.length + grouped.inProgress.length + grouped.waiting.length,
      overdue,
      mine,
    };
  }, [tickets, grouped, user]);

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
            <p className="text-sm text-zinc-500 mt-1">Track tenant issues, busy rollovers, and escalated delivery orders from one panel.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/super" className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-zinc-800">Tenant Console</Link>
            <Link href="/admin" className="px-4 py-2 rounded-full border border-zinc-200 text-sm font-bold text-zinc-700 hover:border-zinc-400">Back to Admin</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Open</p>
            <p className="text-2xl font-black text-zinc-900">{kpis.open}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Overdue SLA</p>
            <p className="text-2xl font-black text-red-600">{kpis.overdue}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">My Queue</p>
            <p className="text-2xl font-black text-emerald-600">{kpis.mine}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Escalated Orders</p>
            <p className="text-2xl font-black text-amber-600">{escalatedOrders.length}</p>
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
              <div className="text-xs text-zinc-500">New: {grouped.new.length} • In Progress: {grouped.inProgress.length} • Escalated Orders: {escalatedOrders.length}</div>
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
                        {item.orderId ? ` • Order ${item.orderId.slice(-6).toUpperCase()}` : ''}
                        {item.source ? ` • ${item.source}` : ''}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-black">
                        <span className={`px-2 py-0.5 rounded-full border ${slaBadgeClasses(item)}`}>{slaBadgeLabel(item)}</span>
                        {item.managedSupportRouted && <span className="px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">Auto Routed</span>}
                        {item.supportAgentName && <span className="px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Owner: {item.supportAgentName}</span>}
                      </div>
                      {item.details && <p className="text-xs text-zinc-500 mt-1 max-w-xl whitespace-pre-wrap">{item.details}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 uppercase">{item.status.replace('_', ' ')}</span>
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 uppercase">{item.priority}</span>
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 uppercase inline-flex items-center gap-1"><FaTools className="text-[10px]" /> {item.provider || 'manual'}</span>
                      <select
                        title="Update ticket status"
                        value={item.status}
                        onChange={(e) => setTicketStatus(item.id, e.target.value as Ticket['status'])}
                        disabled={ticketUpdatingId === item.id}
                        className="h-8 px-2 rounded-lg border border-zinc-200 text-[11px] font-bold"
                      >
                        <option value="new">new</option>
                        <option value="in_progress">in progress</option>
                        <option value="waiting_user">waiting user</option>
                        <option value="resolved">resolved</option>
                      </select>
                      {item.supportAgentUid === user?.uid ? (
                        <button
                          onClick={() => claimTicket(item, false)}
                          disabled={ticketUpdatingId === item.id}
                          className="h-8 px-2 rounded-lg border border-zinc-200 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50"
                        >
                          Unclaim
                        </button>
                      ) : (
                        <button
                          onClick={() => claimTicket(item, true)}
                          disabled={ticketUpdatingId === item.id}
                          className="h-8 px-2 rounded-lg border border-emerald-200 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="font-black text-zinc-900 flex items-center gap-2"><FaTruck /> Escalated Order Rollovers</div>
            <div className="text-xs text-zinc-500">Active escalations: {escalatedOrders.length}</div>
          </div>

          {escalatedOrders.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 font-bold">No active order escalations.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {escalatedOrders.map((row) => {
                const key = `${row.businessId}:${row.orderId}`;
                return (
                  <div key={key} className="px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="font-bold text-zinc-900">{row.customerName} • #{row.orderId.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Business {row.businessId} • {row.status} • ${row.total.toFixed(2)} • payment {row.paymentStatus || 'pending'}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Escalated: {row.escalatedAt ? new Date(row.escalatedAt).toLocaleString() : 'Unknown time'}</div>
                    </div>
                    <button
                      onClick={() => resolveEscalation(row)}
                      disabled={escalationUpdatingKey === key}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 disabled:opacity-60"
                    >
                      <FaCheckCircle /> {escalationUpdatingKey === key ? 'Resolving...' : 'Resolve Escalation'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toMs(value: any): number {
  if (!value) return NaN;
  if (typeof value === 'string') return new Date(value).getTime();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return NaN;
}

function priorityRank(priority: Ticket['priority']) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'normal') return 2;
  return 1;
}

function slaBadgeLabel(ticket: Ticket): string {
  const createdMs = toMs(ticket.createdAt);
  if (!Number.isFinite(createdMs)) return 'SLA Unknown';
  const ageMinutes = Math.max(0, Math.floor((Date.now() - createdMs) / 60000));
  return `${ageMinutes}m open`;
}

function slaBadgeClasses(ticket: Ticket): string {
  const dueMs = toMs(ticket.supportSlaAt);
  if (!Number.isFinite(dueMs)) return 'border-zinc-200 bg-zinc-50 text-zinc-600';
  const delta = dueMs - Date.now();
  if (delta <= 0) return 'border-red-200 bg-red-50 text-red-700';
  if (delta <= 5 * 60 * 1000) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}
