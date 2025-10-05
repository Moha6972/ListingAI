import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PricingPage({ user, onBack, onSelectPlan }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-slate-400 text-xl">Upgrade to unlock more listings and premium features</p>
          {user && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20">
              <span className="text-slate-300">Current: </span>
              <span className="font-semibold text-white">
                {user.credits} listing{user.credits !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-sm font-semibold text-slate-400 mb-2">FREE FOREVER</div>
            <div className="text-5xl font-bold mb-2">$0<span className="text-2xl text-slate-400">/month</span></div>
            <div className="text-sm text-slate-400 mb-6">Perfect to get started</div>
            <ul className="space-y-4 mb-8">
              {[
                '3 listings per month',
                'Premium AI quality',
                'MLS optimized',
                'Copy-to-clipboard',
                'No credit card required'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-xl bg-white/5 text-slate-500 cursor-not-allowed font-semibold"
            >
              Current Plan
            </button>
          </div>

          {/* Professional Plan */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/50 backdrop-blur-sm relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-bold">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold text-indigo-400 mb-2">PROFESSIONAL</div>
            <div className="text-5xl font-bold mb-2">$19<span className="text-2xl text-slate-400">/month</span></div>
            <div className="text-sm text-slate-400 mb-6">Just $0.76 per listing</div>
            <ul className="space-y-4 mb-8">
              {[
                '25 listings per month',
                'Multiple variations',
                'SEO optimization',
                'Listing history',
                'Priority support'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan('professional')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-semibold shadow-xl"
            >
              Upgrade to Professional
            </button>
          </div>

          {/* Agency Plan */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-sm font-semibold text-purple-400 mb-2">AGENCY</div>
            <div className="text-5xl font-bold mb-2">$39<span className="text-2xl text-slate-400">/month</span></div>
            <div className="text-sm text-slate-400 mb-6">For teams & brokers</div>
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited listings',
                'Team access (5 agents)',
                'Custom branding',
                'API access',
                'Dedicated support'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan('agency')}
              className="w-full py-3 rounded-xl border border-purple-500/50 hover:bg-purple-500/10 transition-all font-semibold"
            >
              Upgrade to Agency
            </button>
          </div>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-slate-400">
            All plans include premium AI-powered listings. Cancel anytime, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
