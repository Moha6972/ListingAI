import { useState } from 'react';
import { Copy, Check, Home, LogOut } from 'lucide-react';

export default function ResultsPage({ listing, user, onNewListing, onSignOut, onUpgrade }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ListingAI</span>
          </div>
          <div className="flex items-center gap-4">
            {!user.isPaid && (
              <div className="px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm">
                {user.credits} free listings left
              </div>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Listing Description</h2>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold transition-all shadow-lg"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={onNewListing}
                className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-semibold transition-all"
              >
                New Listing
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-8 mb-6 border border-white/10">
            <div className="whitespace-pre-wrap text-slate-200 leading-relaxed text-lg">
              {listing}
            </div>
          </div>

          {!user.isPaid && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg mb-1">Free trial: {user.credits} listings remaining</div>
                  <div className="text-sm text-slate-300">Upgrade for unlimited listings and priority support</div>
                </div>
                <button
                  onClick={onUpgrade}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold transition-all whitespace-nowrap"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
