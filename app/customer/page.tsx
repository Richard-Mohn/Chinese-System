'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPizzaSlice, FaHistory, FaGift, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const StatCard = ({ title, value, color, delay }) => (
  <motion.div
    className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.02)] border border-zinc-100 flex flex-col items-start"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">{title}</p>
    <p className={`text-4xl font-black ${color}`}>{value}</p>
  </motion.div>
);

const NavCard = ({ icon: Icon, title, description, href, delay }) => (
  <Link href={href} className="group">
    <motion.div
      className="bg-white p-10 rounded-[3rem] border border-zinc-100 group-hover:border-black transition-all duration-500 h-full flex flex-col items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
        <Icon className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm font-medium leading-relaxed">{description}</p>
    </motion.div>
  </Link>
);

export default function CustomerDashboard() {
  const { user, loclUser, loading, isCustomer, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isCustomer())) {
      router.push('/login');
    }
  }, [user, loading, isCustomer, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading LOCL...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-2">
              My Orders<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-lg font-medium text-zinc-500">
              Welcome back, {loclUser?.displayName?.split(' ')[0] || 'User'}
            </p>
          </motion.div>
          <motion.button
            onClick={() => logout()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-50 text-zinc-600 rounded-full font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatCard title="Loyalty Points" value="450" color="text-indigo-600" delay={0.1} />
          <StatCard title="Total Orders" value="18" color="text-emerald-600" delay={0.2} />
          <StatCard title="Total Spent" value="$342" color="text-black" delay={0.3} />
          <StatCard title="Membership" value="6mo" color="text-blue-600" delay={0.4} />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <NavCard 
            icon={FaPizzaSlice} 
            title="Browse Menu" 
            description="Order from your favorite local shops."
            href="/menu"
            delay={0.1}
          />
          <NavCard 
            icon={FaHistory} 
            title="History" 
            description="Track and re-order past favorites."
            href="/customer/orders"
            delay={0.2}
          />
          <NavCard 
            icon={FaGift} 
            title="Rewards" 
            description="View and redeem your points."
            href="/customer/loyalty"
            delay={0.3}
          />
          <NavCard 
            icon={FaUserCircle} 
            title="Profile" 
            description="Manage your addresses and settings."
            href="/customer/profile"
            delay={0.4}
          />
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white rounded-[3rem] border border-zinc-100 p-12 shadow-[0_10px_50px_rgba(0,0,0,0.02)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl font-black text-black mb-10 tracking-tight">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between items-center py-6 border-b border-zinc-50 last:border-0 group cursor-pointer">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-black group-hover:text-white transition-colors">
                    🥡
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg">Order #882{i}</p>
                    <p className="text-zinc-400 font-medium">Nov 1{i}, 2025 • 3 items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-black text-lg">$24.50</p>
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
