import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { ClerkProvider } from './lib/clerk';
import { getStripe } from './lib/stripe';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ListingForm from './components/ListingForm';
import ResultsPage from './components/ResultsPage';
import PricingPage from './components/PricingPage';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function AppContent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('sign-up');
  const [listing, setListing] = useState('');
  const [userCredits, setUserCredits] = useState(3);
  const [isPaid, setIsPaid] = useState(false);

  // Initialize user credits from metadata
  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        const credits = user.publicMetadata?.credits;
        const paid = user.publicMetadata?.isPaid;

        // If new user (no metadata set), initialize with 3 credits
        if (credits === undefined && paid === undefined) {
          try {
            await user.update({
              publicMetadata: {
                credits: 3,
                isPaid: false
              }
            });
            setUserCredits(3);
            setIsPaid(false);
          } catch (error) {
            console.error('Failed to initialize user metadata:', error);
          }
        } else {
          // Load existing metadata
          setUserCredits(credits ?? 3);
          setIsPaid(paid ?? false);
        }
      }
    };

    initializeUser();
  }, [user]);

  const handleGetStarted = () => {
    setAuthMode('sign-up');
    setView('auth');
  };

  const handleSignIn = () => {
    setAuthMode('sign-in');
    setView('auth');
  };

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
    setListing('');
  };

  const handleGenerate = async (formData) => {
    try {
      console.log('Calling API...');
      // Call serverless function instead of Anthropic directly
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      console.log('API success, listing received');
      setListing(data.listing);

      // Deduct credit if not paid
      if (!isPaid) {
        console.log('Deducting credit...');
        const newCredits = userCredits - 1;
        setUserCredits(newCredits);

        // Update Clerk user metadata
        if (user) {
          try {
            await user.update({
              publicMetadata: {
                credits: newCredits,
                isPaid: false
              }
            });
            console.log('Clerk metadata updated');
          } catch (clerkError) {
            console.error('Clerk update failed:', clerkError);
            // Don't fail the whole flow if Clerk update fails
          }
        }
      }

      console.log('Switching to results view');
      setView('results');
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Failed to generate listing: ${error.message}`);
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing page
    setView('pricing');
  };

  const handleSelectPlan = async (planType) => {
    if (!user) {
      alert('Please sign in to upgrade');
      return;
    }

    try {
      // Get Stripe price IDs from environment variables
      const priceId = planType === 'professional'
        ? import.meta.env.VITE_STRIPE_PRICE_ID_PROFESSIONAL
        : import.meta.env.VITE_STRIPE_PRICE_ID_AGENCY;

      if (!priceId) {
        alert(`Please add VITE_STRIPE_PRICE_ID_${planType.toUpperCase()} to your environment variables`);
        return;
      }

      // Create checkout session via API
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          priceId: priceId,
          mode: 'subscription',
        }),
      });

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is signed in, show app
  if (user && view !== 'landing') {
    const currentUser = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      credits: userCredits,
      isPaid: isPaid
    };

    if (view === 'pricing') {
      return (
        <PricingPage
          user={currentUser}
          onBack={() => setView('app')}
          onSelectPlan={handleSelectPlan}
        />
      );
    }

    if (view === 'results') {
      return (
        <ResultsPage
          listing={listing}
          user={currentUser}
          onNewListing={() => setView('app')}
          onSignOut={handleSignOut}
          onUpgrade={handleUpgrade}
        />
      );
    }

    return (
      <ListingForm
        user={currentUser}
        onGenerate={handleGenerate}
        onSignOut={handleSignOut}
        onUpgrade={handleUpgrade}
      />
    );
  }

  // Show auth or landing
  if (view === 'auth') {
    return (
      <AuthPage
        mode={authMode}
        onBack={() => setView('landing')}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
    />
  );
}

export default function App() {
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'YOUR_PUBLISHABLE_KEY') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4">⚠️ Setup Required</h1>
          <div className="space-y-4 text-slate-300">
            <p>Before you can use ListingAI, you need to set up your API keys:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Create a Clerk account at <a href="https://clerk.com" target="_blank" className="text-indigo-400 hover:underline">clerk.com</a></li>
              <li>Create a new application and get your Publishable Key</li>
              <li>Enable Email and Google OAuth in Clerk settings</li>
              <li>Add your key to <code className="bg-black/30 px-2 py-1 rounded">.env.local</code></li>
            </ol>
            <div className="bg-black/30 p-4 rounded-xl mt-4">
              <code className="text-sm text-green-400">
                VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
              </code>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              See the README or .env.example for complete setup instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}
