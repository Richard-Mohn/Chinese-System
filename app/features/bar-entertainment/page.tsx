import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bar Entertainment System — Jukebox, Karaoke & Kiosk | MohnMenu',
  description: 'Transform your bar with a digital jukebox, karaoke system with lyrics display, kiosk ordering, and floor plan management. All built into MohnMenu.',
};

export default function BarEntertainmentFeaturePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-zinc-950 to-zinc-950" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />

        <div className="relative container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-bold mb-8">
            🎵 New Feature
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Bar Entertainment<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              All-In-One
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            Digital jukebox, karaoke with live lyrics, kiosk ordering, and floor plan management —
            everything your bar needs, built into one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all">
              Get Started Free
            </a>
            <a href="/demo/bars" className="px-8 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl font-bold text-lg hover:border-zinc-500 transition-all">
              View Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
            Everything Your Bar Needs
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Jukebox */}
            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-purple-500/30 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-purple-500/20">
                🎵
              </div>
              <h3 className="text-2xl font-black mb-3">Digital Jukebox</h3>
              <p className="text-zinc-400 mb-6">
                Customers request songs from their phone. Queue-based system with credit payments.
                No more fighting over the aux cord.
              </p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Customers browse & request songs</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Credit-based payments (configurable pricing)</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Real-time queue visible to everyone</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom song requests</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Owner controls: skip, remove, reorder</li>
              </ul>
            </div>

            {/* Karaoke */}
            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-yellow-500/30 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-yellow-500/20">
                🎤
              </div>
              <h3 className="text-2xl font-black mb-3">Karaoke System</h3>
              <p className="text-zinc-400 mb-6">
                Full karaoke with lyrics displayed on any TV or projector.
                Plug in a Fire Stick or Android TV and go.
              </p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Lyrics on TV/projector display</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Works with Fire Stick, Android TV, Chromecast</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Sync delay adjustment for hardware latency</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Singer name displayed on screen</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Beautiful animated visuals</li>
              </ul>
            </div>

            {/* Kiosk */}
            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-blue-500/30 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-blue-500/20">
                📱
              </div>
              <h3 className="text-2xl font-black mb-3">Kiosk Ordering</h3>
              <p className="text-zinc-400 mb-6">
                Put a tablet at the bar and let customers order themselves.
                One tap, pay from their phone, get a notification when it&apos;s ready.
              </p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Touch-friendly ordering interface</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full menu with categories & search</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Mobile payment integration</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> SMS notifications when ready</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No app download required</li>
              </ul>
            </div>

            {/* Floor Plan */}
            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-green-500/30 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-green-500/20">
                🗺️
              </div>
              <h3 className="text-2xl font-black mb-3">Floor Plan Manager</h3>
              <p className="text-zinc-400 mb-6">
                Visual drag-and-drop layout builder. Map your indoor, patio, bar, and VIP areas.
                Track capacity in real-time.
              </p>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Drag-and-drop table placement</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Indoor, patio, bar, private & VIP zones</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Set seats per table</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Total capacity tracking</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Links with reservation system</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Set Up', desc: 'Enable entertainment features from your dashboard. Set pricing and configure your display hardware.' },
              { step: '2', title: 'Connect a Screen', desc: 'Plug a Fire Stick, Android stick, or Chromecast into your TV or projector. Open the Now Playing page.' },
              { step: '3', title: 'Customers Play', desc: 'Customers scan a QR code, buy credits, and start requesting songs and singing karaoke.' },
            ].map(item => (
              <div key={item.step}>
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-black mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-8 md:p-12 border border-purple-500/20 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">New Revenue Stream</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
              At just $0.50 per song, a busy bar playing 100 songs per night generates $50/night or
              <span className="text-white font-bold"> $1,500/month</span> in pure jukebox revenue alone.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-zinc-900/50 rounded-2xl p-4">
                <p className="text-2xl font-black text-purple-400">$0.50</p>
                <p className="text-[10px] text-zinc-500 font-bold">Per Song</p>
              </div>
              <div className="bg-zinc-900/50 rounded-2xl p-4">
                <p className="text-2xl font-black text-pink-400">100+</p>
                <p className="text-[10px] text-zinc-500 font-bold">Songs/Night</p>
              </div>
              <div className="bg-zinc-900/50 rounded-2xl p-4">
                <p className="text-2xl font-black text-yellow-400">$1.5K</p>
                <p className="text-[10px] text-zinc-500 font-bold">Monthly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Ready to level up your bar?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join MohnMenu and get jukebox, karaoke, kiosk ordering, and more. No hardware required — just a screen and Wi-Fi.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-black text-lg shadow-xl">
              Start Free Today
            </a>
            <a href="/pricing" className="px-8 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl font-bold text-lg hover:border-zinc-500 transition-all">
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
