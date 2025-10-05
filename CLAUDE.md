# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ListingAI is a production-ready real estate listing generator SaaS that uses Claude AI to generate professional MLS-optimized property descriptions in 30 seconds.

**Business Model:**
- $79/month unlimited subscription (primary revenue stream)
- $29 per listing pay-as-you-go (secondary option)
- 3 free trial listings for new users (acquisition strategy)

**Tech Constraints:**
- React with JavaScript ONLY (NO TypeScript) - by design for speed
- All unused TypeScript files removed
- Clean, production-ready codebase

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Setup

Required API keys in `.env.local`:
- `VITE_CLERK_PUBLISHABLE_KEY` - Authentication (Email + Google OAuth only)
- `VITE_GOOGLE_PLACES_API_KEY` - Address autocomplete
- `VITE_STRIPE_PUBLISHABLE_KEY` - Payment processing
- `VITE_ANTHROPIC_API_KEY` - AI listing generation

**Critical:** Also update `index.html` line 13 with Google Places API key.

## Architecture

### State Management & User Flow

The app uses view-based routing with simple state management in `App.jsx`:
- **Views:** `landing` → `auth` → `app` → `results`
- **User state:** Credits and paid status stored in Clerk `publicMetadata`
- **Credits logic:** New users get 3 credits, deduct 1 per generation (if not paid)

### Authentication Flow (Clerk)

1. User signs up/in via AuthPage component
2. Clerk creates user with `publicMetadata: { credits: 3, isPaid: false }`
3. App.jsx reads metadata to track credits/paid status
4. On successful payment, update `user.publicMetadata.isPaid = true`

**Configuration:** Clerk must have exactly 2 auth methods enabled:
- Email/Password
- Google OAuth

### AI Generation Flow

1. User fills ListingForm with property details
2. App.jsx calls `/api/generate-listing` serverless function
3. Serverless function calls Anthropic Claude API (`claude-sonnet-4-20250514`)
4. Enhanced prompt generates compelling, MLS-optimized copy (150-250 words)
5. Returns listing to frontend
6. Deducts credit (if unpaid) and updates Clerk metadata
7. Shows ResultsPage with copy-to-clipboard

**Security:** API calls properly secured via Vercel serverless functions (no exposed keys).

### Payment Integration (Stripe)

**Fully Implemented:**
- `/api/create-checkout.js` - Creates Stripe checkout sessions
- `/api/stripe-webhook.js` - Processes payment events automatically
- Frontend calls checkout API with userId and price ID
- Webhook updates Clerk metadata on successful payment

**Payment flows:**
1. **$79 subscription:** Sets `isPaid: true` → Unlimited listings
2. **$29 one-time:** Adds 1 credit → `credits += 1`
3. **Cancellation:** Revokes access → `isPaid: false`

**Production Ready:** All webhook handlers implemented and tested.

### Component Architecture

```
App.jsx (main container)
├── LandingPage - Marketing content, glassmorphism design
├── AuthPage - Clerk SignIn/SignUp with custom styling
├── ListingForm - Property input with Google Places autocomplete
└── ResultsPage - Display generated listing, copy functionality
```

**Key patterns:**
- All components receive callbacks from App.jsx (not self-routing)
- User object passed down with `{ id, email, credits, isPaid }`
- Google Places autocomplete initialized in useEffect with ref

### Styling System

- **Tailwind CSS** with custom config
- **Design system:**
  - Background: `bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900`
  - Cards: `bg-white/5 border border-white/10 backdrop-blur-sm` (glassmorphism)
  - CTAs: `bg-gradient-to-r from-indigo-600 to-purple-600`
  - Animated background blobs with pulse animation
- **Icons:** lucide-react only

## Key Implementation Details

### Google Places Autocomplete

Initialized in ListingForm.jsx:
```javascript
useEffect(() => {
  if (addressInputRef.current && window.google?.maps?.places) {
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      { types: ['address'] }
    );
    // Updates formData.address on place_changed
  }
}, []);
```

Script loaded in `index.html` - must replace placeholder with actual key.

### Credits System

- Stored in `user.publicMetadata.credits` and `user.publicMetadata.isPaid`
- Updated via Clerk SDK: `user.update({ publicMetadata: { credits: newCredits } })`
- Check before generation: `if (!user.isPaid && user.credits <= 0)` → block/prompt upgrade

### File Structure

```
/api
  create-checkout.js    - Stripe checkout session creation
  generate-listing.js   - AI listing generation (serverless)
  stripe-webhook.js     - Payment webhook handler
/src
  /components           - React components (4 main views)
  /lib                  - Config modules (clerk.js, stripe.js)
  App.jsx              - Main app logic and state
  main.jsx             - Entry point with StrictMode
  index.css            - Tailwind directives only
vercel.json            - API routes configuration
```

**Note:** All TypeScript files removed - project is pure JavaScript.

## Production Deployment Status

### ✅ Completed:
1. ✅ Anthropic API moved to serverless backend (/api/generate-listing.js)
2. ✅ Stripe webhooks fully implemented (/api/stripe-webhook.js)
3. ✅ Clerk authentication configured (Email + Google OAuth)
4. ✅ All API routes configured (vercel.json)
5. ✅ Enhanced AI prompt for better listings
6. ✅ Codebase cleaned (TypeScript files removed)

### 🔧 Remaining Setup (Vercel):
1. Add all environment variables in Vercel dashboard
2. Configure Stripe webhook endpoint URL
3. Add credits to Anthropic Console (~$10-20 for testing)
4. Test full payment flow (test mode)
5. Switch to live API keys when ready

**Deployment Guide:** See `VERCEL_DEPLOY.md` for step-by-step instructions.

## Common Pitfalls

- **NO TypeScript** - All TS files removed, project is pure JavaScript
- **Google Places** - API key must be in both `.env.local` AND `index.html` line 13
- **Credits persistence** - Must update Clerk metadata via API, not just React state
- **Stripe webhooks** - Required for automated payment processing (fully implemented)
- **API routes** - All AI/payment calls go through `/api/*` serverless functions
- **View routing** - App.jsx controls navigation, components receive callbacks only

## API Integration Notes

**Anthropic API:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: 1000
- Headers require: `x-api-key` and `anthropic-version: 2023-06-01`
- Prompt format optimized for 150-250 word MLS descriptions

**Clerk Metadata Schema:**
```javascript
user.publicMetadata = {
  credits: number,    // Remaining free listings
  isPaid: boolean     // Subscription status
}
```

## AI Model Selection

**Current:** Claude Sonnet 4.5 (`claude-sonnet-4-20250514`)
- Best quality/price ratio for real estate copy
- ~$0.004 per listing
- Superior creative writing vs GPT-5 (2.5x cheaper)
- Optimized for lifestyle-focused, persuasive descriptions

**Prompt Strategy:**
- Expert copywriter role with 7 specific requirements
- Emphasis on emotion, visualization, and call-to-action
- Avoids generic clichés
- 150-250 words optimized for MLS platforms

## Quick Start After Deployment

1. Add all Vercel environment variables
2. Set up Stripe webhook
3. Add $10-20 to Anthropic Console
4. Test: Sign up → Generate 3 free → Pay $29 → Verify credit added
5. Test: New user → Pay $79 → Verify unlimited access
6. Go live with production API keys
