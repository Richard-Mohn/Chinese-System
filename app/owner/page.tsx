'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaUsers, FaBoxOpen, FaCog, FaSignOutAlt, FaPlus, FaClipboardList, FaTruck, FaUtensils, FaGift, FaBullhorn } from 'react-icons/fa';
import Link from 'next/link';

interface BusinessStatProps {
  title: string;
  value: string;
  change: string;
  delay: number;
}

const BusinessStat = ({ title, value, change, delay }: BusinessStatProps) => (
  <motion.div
    className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.02)] border border-zinc-100"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">{title}</p>
    <p className={`text-4xl font-black text-black mb-2`}>{value}</p>
    <p className={`text-xs font-bold ${change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
      {change} <span className="text-zinc-300 ml-1">vs last month</span>
    </p>
  </motion.div>
);

interface NavCardProps {
  icon: any;
  title: string;
  description: string;
  href: string;
  delay: number;
  colorClass: string;
}

const NavCard = ({ icon: Icon, title, description, href, delay, colorClass }: NavCardProps) => (
  <Link href={href} className="group">
    <motion.div
      className="bg-white p-10 rounded-[3rem] border border-zinc-100 group-hover:border-black transition-all duration-500 h-full flex flex-col items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500 ${colorClass}`}>
        <Icon className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm font-medium leading-relaxed">{description}</p>
    </motion.div>
  </Link>
);

export default function OwnerDashboard() {
  const { user, loclUser, currentBusiness, loading, isOwner, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isOwner())) {
      router.push('/login');
    }
  }, [user, loading, isOwner, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-zinc-400 font-bold">
        Loading Command Center...
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-black text-black mb-4 tracking-tighter">No Business Found</h1>
          <p className="text-zinc-500 font-medium mb-8">You haven't set up your local business profile yet. Let's get you started.</p>
          <Link href="/onboarding">
            <button className="px-10 py-4 bg-black text-white rounded-full font-bold shadow-xl hover:bg-zinc-800 transition-all">
              Create Your Business
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black mb-3">
              Command Center<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-xl font-medium text-zinc-500">
              Managing <span className="text-black font-bold">{currentBusiness.name}</span>
            </p>
          </motion.div>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/owner/orders">
              <button className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold shadow-xl hover:bg-zinc-800 transition-all active:scale-95">
                <FaPlus className="text-sm" />
                New Order
              </button>
            </Link>
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 px-8 py-4 bg-zinc-50 text-zinc-600 rounded-full font-bold hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <BusinessStat 
            title="Monthly Revenue" 
            value={`${(currentBusiness.monthlyRevenue || 0).toLocaleString()}`} 
            change="+12.5%" 
            delay={0.1} 
          />
          <BusinessStat 
            title="Total Orders" 
            value={(currentBusiness.totalOrders || 0).toLocaleString()} 
            change="+8.2%" 
            delay={0.2} 
          />
          <BusinessStat 
            title="Total Customers" 
            value={(currentBusiness.customerCount || 0).toLocaleString()} 
            change="+4.1%" 
            delay={0.3} 
          />
          <BusinessStat 
            title="Active Drivers" 
            value={`${currentBusiness.inHouseDriverIds?.length || 0}/${currentBusiness.maxInhouseDrivers}`} 
            change="+1" 
            delay={0.4} 
          />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <NavCard 
            icon={FaClipboardList} 
            title="Manage Orders" 
            description="Fulfill active orders and update statuses."
            href="/owner/orders"
            delay={0.1}
            colorClass="text-indigo-600"
          />
          <NavCard 
            icon={FaTruck} 
            title="Fleet Control" 
            description="Monitor and assign in-house delivery drivers."
            href="/owner/drivers"
            delay={0.2}
            colorClass="text-blue-600"
          />
          <NavCard 
            icon={FaUtensils} 
            title="Menu Editor" 
            description="Update items, prices, and availability."
            href="/owner/menu"
            delay={0.3}
            colorClass="text-emerald-600"
          />
          <NavCard 
            icon={FaChartLine} 
            title="Insights" 
            description="Deep dive into your sales and customer data."
            href="/owner/analytics"
            delay={0.4}
            colorClass="text-purple-600"
          />
          <NavCard 
            icon={FaGift} 
            title="Loyalty" 
            description="Manage points and customer retention."
            href="/owner/loyalty"
            delay={0.5}
            colorClass="text-pink-600"
          />
          <NavCard 
            icon={FaBullhorn} 
            title="Marketing" 
            description="Email and SMS campaign management."
            href="/owner/marketing"
            delay={0.6}
            colorClass="text-orange-600"
          />
        </div>

        {/* System Status */}
        <motion.div 
          className="bg-white rounded-[3rem] border border-zinc-100 p-12 shadow-[0_10px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex gap-12 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Order System: Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Payments: Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400">GPS Fleet: Tracking</span>
            </div>
          </div>
          <Link href="/owner/settings">
            <button className="flex items-center gap-3 px-8 py-4 bg-zinc-50 text-zinc-900 rounded-full font-bold hover:bg-black hover:text-white transition-all">
              <FaCog className="text-sm" />
              Settings
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
