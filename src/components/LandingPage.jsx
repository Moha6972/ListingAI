import { Home, Sparkles, DollarSign, Zap, ArrowRight, Star, Building2, Clock, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onGetStarted, onSignIn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ListingAI</span>
          </div>
          <button
            onClick={onSignIn}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Trusted by 2,000+ real estate professionals</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Write Listings That
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sell Faster
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Generate professional MLS-optimized property descriptions in 30 seconds.
            Save 2+ hours per listing and close deals faster with AI-powered copywriting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-lg shadow-2xl shadow-indigo-500/50 transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-sm text-slate-400">
              No credit card required · 3 free listings
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { icon: Clock, label: '30 Seconds', desc: 'Per listing' },
            { icon: Users, label: '2,000+', desc: 'Active agents' },
            { icon: TrendingUp, label: '47%', desc: 'Faster sales' },
            { icon: Star, label: '4.9/5', desc: 'Avg rating' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
              <stat.icon className="w-8 h-8 text-indigo-400 mb-3" />
              <div className="text-3xl font-bold mb-1">{stat.label}</div>
              <div className="text-sm text-slate-400">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Top Agents Choose ListingAI</h2>
          <p className="text-slate-400 text-lg">Everything you need to create listings that convert</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Generate professional listings in 30 seconds. No more staring at blank pages or struggling with words.',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              icon: Building2,
              title: 'MLS Optimized',
              desc: 'Descriptions crafted to rank well and attract serious buyers. Proven formats that convert.',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: DollarSign,
              title: 'Maximize ROI',
              desc: 'Better listings = faster sales = more commissions. Pay for itself with just one extra deal.',
              color: 'from-green-500 to-emerald-500'
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Real Estate Professionals</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "Cut my listing prep time by 80%. This tool pays for itself every single week.",
              name: "Sarah Chen",
              role: "Luxury Agent, SF Bay Area",
              rating: 5
            },
            {
              quote: "My listings get 3x more inquiries now. The AI really understands what buyers want to hear.",
              name: "Marcus Johnson",
              role: "Broker, Austin TX",
              rating: 5
            },
            {
              quote: "Finally, a tool that actually saves me time instead of adding to my workload. Game changer.",
              name: "Jennifer Mills",
              role: "Residential Agent, Miami",
              rating: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-slate-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-lg">No contracts. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-sm font-semibold text-indigo-400 mb-2">PAY AS YOU GO</div>
            <div className="text-5xl font-bold mb-6">$29<span className="text-2xl text-slate-400">/listing</span></div>
            <ul className="space-y-4 mb-8">
              {[
                'Single listing generation',
                'Full property details',
                'Instant copy-paste',
                'MLS optimized'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-semibold">
              Get Started
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/50 backdrop-blur-sm relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-bold">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold text-indigo-400 mb-2">UNLIMITED</div>
            <div className="text-5xl font-bold mb-2">$79<span className="text-2xl text-slate-400">/month</span></div>
            <div className="text-sm text-slate-400 mb-6">Only $3.95 per listing at 20/mo</div>
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited listings',
                'Priority support',
                'Advanced customization',
                'Early access to new features',
                'Cancel anytime'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onGetStarted}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-semibold shadow-xl"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 backdrop-blur-sm text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Write Listings That Sell?</h2>
          <p className="text-slate-300 text-lg mb-8">Join 2,000+ agents saving time and closing deals faster</p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-lg shadow-2xl shadow-indigo-500/50 transition-all inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="text-sm text-slate-400 mt-4">No credit card required · 3 free listings</div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-sm">
          © 2025 ListingAI. Built for real estate professionals who value their time.
        </div>
      </footer>
    </div>
  );
}
