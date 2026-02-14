'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	FaArrowRight, FaBatteryFull, FaCar, FaTools, FaMapMarkerAlt,
	FaClock, FaCheckCircle, FaShieldAlt, FaWrench, FaTruck, FaBolt,
} from 'react-icons/fa';
import FloatingStoreIcons from '@/components/FloatingStoreIcons';

const SERVICES = [
	{
		icon: FaBatteryFull,
		title: 'Jump Starts',
		desc: 'Customer requests battery help and gets matched with a nearby equipped driver in minutes.',
		eta: '8-15 min',
	},
	{
		icon: FaCar,
		title: 'Lockout Support',
		desc: 'Quick lockout requests dispatch to approved responders with live ETA and completion status.',
		eta: '10-20 min',
	},
	{
		icon: FaTools,
		title: 'Flat Tire Assist',
		desc: 'Drivers can accept tire-change support jobs while on-route to or from delivery requests.',
		eta: '12-25 min',
	},
];

const WORKFLOW = [
	{
		step: '01',
		title: 'Issue reported in customer app',
		desc: 'Customer selects service type, location, and notes from a simple roadside request flow.',
		icon: FaMapMarkerAlt,
	},
	{
		step: '02',
		title: 'Nearest qualified driver notified',
		desc: 'Only marketplace drivers with matching equipment and active status receive the request.',
		icon: FaTruck,
	},
	{
		step: '03',
		title: 'Live tracking + ETA updates',
		desc: 'Customer sees responder movement and ETA while waiting, reducing panic and uncertainty.',
		icon: FaClock,
	},
	{
		step: '04',
		title: 'Completion + payout confirmation',
		desc: 'Job completion is confirmed in-app and driver payout is recorded on the same marketplace rails.',
		icon: FaCheckCircle,
	},
];

export default function RoadsideDemoPage() {
	return (
		<div className="min-h-screen bg-white/90">
			<section className="pt-36 pb-20 px-4 relative overflow-hidden">
				<FloatingStoreIcons storeType="default" count={14} position="absolute" />
				<div className="container mx-auto max-w-5xl text-center relative z-10">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-50 border border-orange-100 text-xs font-black uppercase tracking-widest text-orange-600"
					>
						Roadside Assistance Demo
					</motion.div>

					<motion.h1
						className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-zinc-900 text-balance"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						QuickJump Assist<span className="text-orange-500">.</span>
					</motion.h1>

					<motion.p
						className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium max-w-3xl mx-auto mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						A live roadside demo powered by the same driver marketplace. Customers request help in-app and nearby equipped drivers respond with real-time tracking.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="flex flex-wrap justify-center gap-4"
					>
						<Link href="/features/roadside-assistance" className="group px-10 py-5 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
							Feature Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
						</Link>
						<Link href="/for-uber-drivers" className="group px-10 py-5 bg-white text-black border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-black transition-all flex items-center gap-3">
							For Drivers <FaWrench />
						</Link>
					</motion.div>
				</div>
				<div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-[120px] opacity-30" />
			</section>

			<section className="py-8 bg-linear-to-r from-orange-500 to-amber-500 text-white">
				<div className="container mx-auto max-w-4xl px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					{[
						{ stat: '24/7', label: 'Request Intake' },
						{ stat: '3', label: 'Core Services' },
						{ stat: 'Live', label: 'Driver Tracking' },
						{ stat: '< 2 min', label: 'Dispatch Match' },
					].map((s, i) => (
						<motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
							<div className="text-3xl md:text-4xl font-black">{s.stat}</div>
							<div className="text-orange-100 text-sm font-bold uppercase tracking-wider">{s.label}</div>
						</motion.div>
					))}
				</div>
			</section>

			<section className="py-24 px-4">
				<div className="container mx-auto max-w-5xl">
					<div className="text-center mb-16">
						<span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">Service Types</span>
						<h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Fast roadside help options.</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{SERVICES.map((service, i) => (
							<motion.div
								key={service.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.08 }}
								className="bg-white rounded-2xl p-7 border border-zinc-200 hover:border-orange-300 hover:shadow-lg transition-all"
							>
								<div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
									<service.icon className="text-orange-600" />
								</div>
								<h3 className="font-bold text-lg text-zinc-900 mb-2">{service.title}</h3>
								<p className="text-zinc-500 text-sm leading-relaxed mb-3">{service.desc}</p>
								<div className="text-xs font-bold text-orange-600 bg-orange-50 rounded-full inline-block px-3 py-1">
									Typical ETA: {service.eta}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 px-4 bg-zinc-50">
				<div className="container mx-auto max-w-6xl">
					<div className="text-center mb-16">
						<span className="text-orange-600 font-black uppercase tracking-widest text-xs mb-3 block">How It Works</span>
						<h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Roadside dispatch flow.</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{WORKFLOW.map((item, i) => (
							<motion.div
								key={item.step}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
								className="bg-white rounded-2xl p-6 border border-zinc-200 hover:border-orange-300 hover:shadow-lg transition-all"
							>
								<div className="text-4xl font-black text-orange-100 mb-2">{item.step}</div>
								<div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
									<item.icon className="text-orange-600" />
								</div>
								<h3 className="font-bold text-zinc-900 mb-2">{item.title}</h3>
								<p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="py-24 px-4">
				<div className="container mx-auto max-w-4xl text-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						className="bg-linear-to-br from-orange-500 to-amber-500 rounded-3xl p-12 md:p-16 text-white"
					>
						<div className="text-6xl mb-5">🚗</div>
						<h2 className="text-3xl md:text-4xl font-black mb-4">Roadside + Delivery in one network</h2>
						<p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
							Keep drivers active between deliveries and give customers a faster way to solve roadside issues from the same app ecosystem.
						</p>
						<div className="flex flex-wrap justify-center gap-3">
							<span className="px-5 py-2.5 bg-white/15 rounded-full text-sm font-bold"><FaBolt className="inline mr-2" /> Faster dispatch</span>
							<span className="px-5 py-2.5 bg-white/15 rounded-full text-sm font-bold"><FaShieldAlt className="inline mr-2" /> In-app verification</span>
							<span className="px-5 py-2.5 bg-white/15 rounded-full text-sm font-bold"><FaMapMarkerAlt className="inline mr-2" /> Live tracking</span>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
