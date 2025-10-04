# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ListingAI is a real estate listing generator SaaS application that uses AI to generate professional MLS-optimized property descriptions in 30 seconds.

**Business Model:**
- $79/month unlimited subscription (primary)
- $29 per listing pay-as-you-go (secondary)
- 3 free trial listings for new users

**Important Constraint:** This codebase uses React with JavaScript ONLY (NO TypeScript) by design for faster iteration.

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
2. App.jsx constructs prompt with all property data
3. Calls Anthropic Claude API (`claude-sonnet-4-20250514`)
4. If no API key, falls back to demo template
5. Deducts credit (if unpaid) and updates Clerk metadata
6. Shows ResultsPage with copy-to-clipboard

**Security Note:** API key currently exposed in frontend for demo. For production, move to backend API route.

### Payment Integration (Stripe)

Current implementation:
- `getStripe()` initializes Stripe.js client
- Upgrade flow shows setup instructions (not fully implemented)
- Production requires: webhook to set `isPaid = true` after payment

Webhook should:
1. Listen for `checkout.session.completed`
2. Update Clerk user: `publicMetadata.isPaid = true`
3. User gets unlimited generations

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
/src
  /components      - React components (4 main views)
  /lib            - Config modules (clerk.js, stripe.js)
  App.jsx         - Main app logic and statene
  main.jsx        - Entry point with StrictMode
  index.css       - Tailwind directives only
```

## Production Deployment Checklist

1. Move Anthropic API calls to backend (security)
2. Set up Stripe webhook for payment processing
3. Configure Clerk production instance with proper domains
4. Add all env vars to Vercel/hosting platform
5. Update Google Places API key restrictions (domain whitelist)
6. Enable rate limiting for API endpoints
7. Test full flow: signup → trial → upgrade → unlimited

## Common Pitfalls

- **TypeScript files exist** (tsconfig, .tsx) but are NOT used - only .jsx files run
- **Google Places won't work** until API key added to both `.env.local` AND `index.html`
- **Credits don't persist** - must update Clerk metadata, not just local state
- **Stripe webhook required** - frontend can't set isPaid=true without backend
- **View state resets** - App.jsx manages view transitions, components don't self-navigate

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

## Testing Without Full Setup

- App shows setup screen if Clerk key missing
- Google Places gracefully degrades (shows warning, manual input works)
- Anthropic falls back to template if no API key
- Stripe shows setup instructions instead of real checkout
