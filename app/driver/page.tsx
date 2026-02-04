'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTruck, FaRoute, FaCheckCircle, FaSignOutAlt, FaMapMarkerAlt, FaHistory, FaUserCircle, FaMoneyBillWave } from 'react-icons/fa';

interface DriverStatProps {
  title: string;
  value: string;
  color: string;
  delay: number;
}

const DriverStat = ({ title, value, color, delay }: DriverStatProps) => (
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

interface NavCardProps {
  icon: any;
  title: string;
  description: string;
  href: string;
  delay: number;
}

const NavCard = ({ icon: Icon, title, description, href, delay }: NavCardProps) => (
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

export default function DriverDashboard() {
  const { user, loclUser, loading, isDriver, logout } = useAuth();
  const router = useRouter();
  const [driverStatus, setDriverStatus] = useState<'offline' | 'online' | 'on_delivery' | 'on_break'>('offline');

  useEffect(() => {
    if (!loading && (!user || !isDriver())) {
      router.push('/login');
    }
  }, [user, loading, isDriver, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg font-black text-zinc-400 animate-pulse uppercase tracking-widest">Driver Mode...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-2">
              Fleet View<span className="text-blue-600">.</span>
            </h1>
            <p className="text-lg font-medium text-zinc-500">
              Active Driver: <span className="text-black font-bold">{loclUser?.displayName || user?.email}</span>
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

        {/* Status Toggle Card */}
        <motion.div 
          className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-[0_10px_50px_rgba(0,0,0,0.02)] mb-12 flex flex-col md:flex-row justify-between items-center gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              driverStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
              driverStatus === 'on_delivery' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
              driverStatus === 'on_break' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
              'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            }`} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Live Status</p>
              <p className="text-2xl font-black text-black capitalize">{driverStatus.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => setDriverStatus('online')}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${driverStatus === 'online' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
            >
              Go Online
            </button>
            <button
              onClick={() => setDriverStatus('on_break')}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${driverStatus === 'on_break' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
            >
              Break
            </button>
            <button
              onClick={() => setDriverStatus('offline')}
              className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${driverStatus === 'offline' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
            >
              Go Offline
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <DriverStat title="Today's Deliveries" value="12" color="text-blue-600" delay={0.1} />
          <DriverStat title="Current Earnings" value="$47" color="text-emerald-600" delay={0.2} />
          <DriverStat title="Rating" value="4.9" color="text-indigo-600" delay={0.3} />
          <DriverStat title="Total Trips" value="127" color="text-black" delay={0.4} />
        </div>

        {/* Active Route */}
        {driverStatus === 'online' ? (
          <motion.div 
            className="bg-zinc-900 rounded-[3rem] p-12 text-white shadow-2xl mb-12 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest border border-blue-600/30">En Route</span>
                  <h2 className="text-4xl font-black mt-6 tracking-tight italic">Order #1234</h2>
                </div>
                <FaRoute className="text-5xl text-zinc-700" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 text-white/40">Pickup</p>
                  <p className="text-xl font-bold">China Wok Restaurant</p>
                  <p className="text-zinc-400">123 Main St</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 text-white/40">Drop-off</p>
                  <p className="text-xl font-bold">Customer Address</p>
                  <p className="text-zinc-400">456 Oak Ave (2.3 km)</p>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <button className="px-10 py-5 bg-white text-black rounded-full font-black text-lg hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Navigate
                </button>
                <button className="px-10 py-5 bg-emerald-600 text-white rounded-full font-black text-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-emerald-900/20">
                  <FaCheckCircle />
                  Complete
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full" />
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-[3rem] border border-zinc-100 p-20 shadow-[0_10px_50px_rgba(0,0,0,0.02)] mb-12 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">📡</div>
            <h3 className="text-2xl font-black text-black mb-4">Awaiting Signal</h3>
            <p className="text-zinc-500 font-medium max-w-sm mx-auto">Go online to begin receiving automated delivery assignments from the local fleet.</p>
          </motion.div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NavCard 
            icon={FaHistory} 
            title="History" 
            description="Review your past routes and completion times."
            href="/driver/history"
            delay={0.1}
          />
          <NavCard 
            icon={FaMoneyBillWave} 
            title="Earnings" 
            description="Detailed breakdown of your daily and weekly payouts."
            href="/driver/earnings"
            delay={0.2}
          />
          <NavCard 
            icon={FaUserCircle} 
            title="Profile" 
            description="Manage your documents, vehicle info, and settings."
            href="/driver/profile"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
}
