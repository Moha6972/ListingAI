import { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { ClerkProvider } from './lib/clerk';
import { getStripe } from './lib/stripe';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ListingForm from './components/ListingForm';
import ResultsPage from './components/ResultsPage';

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
  useState(() => {
    if (user) {
      setUserCredits(user.publicMetadata?.credits || 3);
      setIsPaid(user.publicMetadata?.isPaid || false);
    }
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
    const prompt = `Write a compelling real estate listing description for the following property. Make it engaging, highlight key selling points, and optimize for MLS platforms. Use vivid language but stay professional.

Property Details:
- Type: ${formData.propertyType}
- Address: ${formData.address}
- Price: $${formData.price}
- Bedrooms: ${formData.bedrooms}
- Bathrooms: ${formData.bathrooms}
- Square Footage: ${formData.sqft} sq ft
- Year Built: ${formData.yearBuilt || 'N/A'}
- Lot Size: ${formData.lotSize || 'N/A'}
- Key Features: ${formData.features || 'N/A'}
- Neighborhood: ${formData.neighborhood || 'N/A'}
- School District: ${formData.schoolDistrict || 'N/A'}

Write a compelling 150-250 word listing description that will attract buyers. Start with an attention-grabbing opening line. Focus on lifestyle and benefits, not just specs.`;

    try {
      if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_KEY') {
        // Fallback to demo mode
        setListing(`Welcome to this stunning ${formData.propertyType} located at ${formData.address}!

This exceptional ${formData.bedrooms}-bedroom, ${formData.bathrooms}-bathroom residence offers ${formData.sqft} square feet of meticulously designed living space. ${formData.yearBuilt ? `Built in ${formData.yearBuilt},` : ''} this home combines modern elegance with timeless appeal.

${formData.features ? `Premium features include ${formData.features}.` : ''} The property sits on ${formData.lotSize || 'a well-maintained lot'}, offering the perfect blend of privacy and community.

${formData.neighborhood ? `Located in the highly sought-after ${formData.neighborhood} area,` : ''} this home provides easy access to shopping, dining, and entertainment. ${formData.schoolDistrict ? `Families will appreciate being in the ${formData.schoolDistrict}.` : ''}

Priced at $${formData.price}, this is an exceptional opportunity to own a piece of paradise. Schedule your private showing today and experience the lifestyle you've been dreaming of!

[DEMO MODE: Using fallback listing. Add VITE_ANTHROPIC_API_KEY to .env.local for AI-generated listings]`);
      } else {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              { role: "user", content: prompt }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();
        setListing(data.content[0].text);
      }

      // Deduct credit if not paid
      if (!isPaid) {
        const newCredits = userCredits - 1;
        setUserCredits(newCredits);

        // Update Clerk user metadata
        if (user) {
          await user.update({
            publicMetadata: {
              credits: newCredits,
              isPaid: false
            }
          });
        }
      }

      setView('results');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate listing. Please check your API key and try again.');
    }
  };

  const handleUpgrade = async () => {
    const stripe = getStripe();

    if (!stripe) {
      alert(`STRIPE SETUP REQUIRED:

1. Create Stripe account at stripe.com
2. Create a "Subscription" product for $79/month
3. Get your Stripe Publishable Key
4. Add VITE_STRIPE_PUBLISHABLE_KEY to .env.local
5. Set up a checkout session or payment link

For now, this is demo mode. In production, this would redirect to Stripe Checkout.

After successful payment, update user.publicMetadata.isPaid = true`);
      return;
    }

    // In production, redirect to Stripe Checkout
    alert('Stripe integration ready! Create checkout session on your backend.');
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
