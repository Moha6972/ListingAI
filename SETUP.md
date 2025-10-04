# ListingAI - Setup & Deployment Guide

Real estate listing generator built with React, Clerk, Stripe, and Anthropic Claude API.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=AIza_your_key_here

# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Anthropic API
VITE_ANTHROPIC_API_KEY=sk-ant-your_key_here
```

### 3. Configure Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create account
2. Create new application
3. **Enable exactly 2 authentication methods:**
   - Email/Password (under "Email & Phone")
   - Google OAuth (under "Social Connections")
4. Copy Publishable Key to `.env.local`
5. In Clerk Dashboard → JWT Templates → Create new template for metadata

### 4. Set Up Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Places API"
4. Create API credentials (API Key)
5. Restrict key to "Places API" and your domain
6. Copy API key to `.env.local`
7. **Update `index.html`** line 13 - replace `YOUR_GOOGLE_PLACES_API_KEY` with your actual key

### 5. Configure Stripe Payments

1. Create account at [stripe.com](https://stripe.com)
2. Create Product:
   - Name: "Unlimited Listings Plan"
   - Price: $79/month
   - Recurring: Monthly
3. Get Publishable Key from Developers → API Keys
4. Copy to `.env.local`

**For production:** Set up webhook to update `user.publicMetadata.isPaid = true` after successful payment.

### 6. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Copy to `.env.local`

**Security Note:** For production, move API calls to backend to protect your key.

## Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Deploy to Vercel

### Option 1: CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

**Important:** Add all environment variables in Vercel project settings.

## User Credits System

### How it works:
- New users get 3 free credits stored in Clerk `publicMetadata`
- Each listing generation deducts 1 credit (if `isPaid === false`)
- Credits stored in: `user.publicMetadata.credits`
- Paid status: `user.publicMetadata.isPaid`

### To manually grant credits:
In Clerk Dashboard → Users → Select user → Metadata:
```json
{
  "credits": 3,
  "isPaid": false
}
```

### After Stripe payment:
Set up webhook to update:
```javascript
user.update({
  publicMetadata: {
    isPaid: true
  }
});
```

## Stripe Webhook Setup (Production)

1. Install Stripe CLI: `stripe login`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
3. Create webhook endpoint that:
   - Verifies payment success
   - Updates Clerk user metadata: `isPaid = true`

Example webhook handler:
```javascript
// pages/api/stripe-webhook.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  const event = stripe.webhooks.constructEvent(
    buf,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId; // Pass this when creating checkout

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { isPaid: true }
    });
  }

  res.json({ received: true });
}
```

## Tech Stack

- **Frontend:** React (NO TypeScript - per spec)
- **Auth:** Clerk (Email + Google OAuth)
- **Payments:** Stripe
- **AI:** Anthropic Claude API
- **Styling:** Tailwind CSS
- **Maps:** Google Places API
- **Icons:** lucide-react
- **Deployment:** Vercel

## Project Structure

```
/src
  /components
    LandingPage.jsx    - Marketing landing page
    AuthPage.jsx       - Clerk authentication
    ListingForm.jsx    - Property input form
    ResultsPage.jsx    - Generated listing display
  /lib
    clerk.js           - Clerk configuration
    stripe.js          - Stripe configuration
  App.jsx              - Main app logic
  main.jsx             - Entry point
  index.css            - Tailwind imports
```

## Troubleshooting

### "Missing Clerk Publishable Key" error
- Check `.env.local` has correct `VITE_CLERK_PUBLISHABLE_KEY`
- Restart dev server after adding env vars

### Google Places not working
- Verify API key in `index.html` line 13
- Check Places API is enabled in Google Cloud Console
- Check browser console for errors

### Stripe checkout not working
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Complete webhook setup for production
- Check Stripe Dashboard → Logs for errors

### AI generation fails
- Verify `VITE_ANTHROPIC_API_KEY` is correct
- Check API quota/billing in Anthropic console
- Review browser console for error details

## Security Best Practices

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Use backend for API calls** - don't expose Anthropic key in frontend (current setup is for demo)
3. **Validate webhooks** - verify Stripe signature
4. **Restrict API keys** - limit Google Places API to your domains
5. **Enable rate limiting** - prevent abuse

## Next Steps

- [ ] Move Anthropic API calls to backend
- [ ] Set up proper Stripe webhook handler
- [ ] Add email notifications (welcome, upgrade, etc.)
- [ ] Implement usage analytics
- [ ] Add listing history/saved listings
- [ ] A/B test different pricing
- [ ] Add social proof (recent signups ticker)
- [ ] Implement referral program

## Support

For issues, check:
- Clerk docs: https://clerk.com/docs
- Stripe docs: https://stripe.com/docs
- Anthropic docs: https://docs.anthropic.com
- Google Places: https://developers.google.com/maps/documentation/places

---

Built following the spec from the Claude.ai conversation.
Ready to launch and start getting paid customers! 🚀
