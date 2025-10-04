import { SignIn, SignUp } from '@clerk/clerk-react';
import { Home } from 'lucide-react';

export default function AuthPage({ mode, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
              <Home className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold">ListingAI</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {mode === 'sign-in' ? 'Welcome Back' : 'Get Started Free'}
          </h2>
          <p className="text-slate-400">
            {mode === 'sign-in' ? 'Sign in to continue' : '3 free listings to get you started'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {mode === 'sign-in' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                  formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl",
                  formFieldInput: "bg-white/5 border-white/10 rounded-xl text-white",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300",
                }
              }}
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                  formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl",
                  formFieldInput: "bg-white/5 border-white/10 rounded-xl text-white",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300",
                }
              }}
            />
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full text-center text-slate-400 hover:text-white transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
