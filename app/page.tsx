import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100-5rem)] bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=2000"
            alt="Delicious Chinese Food"
            fill
            className="object-cover opacity-40 dark:opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-zinc-950" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-6">
              Now Open for 2026
            </span>
            <h1 className="text-7xl md:text-8xl font-black text-indigo-900 dark:text-indigo-400 leading-[0.9] tracking-tighter mb-8 uppercase">
              Fast. Fresh. <br />
              <span className="text-zinc-900 dark:text-zinc-100">Transparent.</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 font-medium mb-10 max-w-xl leading-relaxed">
              Experience the next generation of Chinese dining. Watch your food being prepared in real-time.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/menu" 
                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95 text-lg"
              >
                Order Now 🐉
              </Link>
              <Link 
                href="/menu" 
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 active:scale-95 text-lg"
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="text-4xl">⚡</div>
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">The Golden Rule</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Zero friction. We start cooking the moment your payment is confirmed. No phone calls, no waiting, just food.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="text-4xl">🎥</div>
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Chef's Eye Live</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Upgrade your order to see the kitchen in action. Watch our master chefs prepare your meal through our high-def live feed.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-4xl">📍</div>
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Hyper-Local Delivery</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Real-time GPS tracking for every delivery. Know exactly where your food is from our wok to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Chinese Footer */}
      <footer className="py-12 text-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          © 2026 Golden Dragon • Designed for the Future of Food
        </p>
      </footer>
    </div>
  );
}