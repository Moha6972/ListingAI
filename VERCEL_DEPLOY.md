# Vercel Deployment Guide

Complete step-by-step guide for deploying ListingAI to Vercel with full payment processing.

## Step 1: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `Moha6972/ListingAI`
3. Click "Deploy" (use default settings)
4. Wait for deployment to complete
5. Note your deployment URL (e.g., `https://listing-ai-xyz.vercel.app`)

## Step 2: Add Environment Variables

Go to your Vercel project → Settings → Environment Variables

Add ALL of the following:

### Frontend Variables:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
VITE_GOOGLE_PLACES_API_KEY=AIza_your_google_key
VITE_ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_STRIPE_PRICE_ID_UNLIMITED=price_your_79_monthly_price_id
VITE_STRIPE_PRICE_ID_SINGLE=price_your_29_single_price_id
```

### Backend Variables (for API routes):
```
CLERK_SECRET_KEY=sk_test_your_clerk_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

**Important:** Make sure to set `NEXT_PUBLIC_URL` to your actual Vercel deployment URL!

## Step 3: Set Up Stripe Webhook

### Create Webhook Endpoint:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://your-app.vercel.app/api/stripe-webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

### Update Environment Variable:

1. Go back to Vercel → Settings → Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Paste the webhook signing secret
4. Save

## Step 4: Get Stripe Price IDs

### For $79/month Unlimited Plan:

1. Stripe Dashboard → Products
2. Find "Unlimited Listings Plan"
3. Click on it
4. Copy the **Price ID** (looks like `price_1ABC123...`)
5. Add to Vercel as `VITE_STRIPE_PRICE_ID_UNLIMITED`

### For $29 Single Listing:

1. Find "Pay As You Go - Single Listing" product
2. Copy its **Price ID**
3. Add to Vercel as `VITE_STRIPE_PRICE_ID_SINGLE`

## Step 5: Redeploy

After adding all environment variables:

1. Go to Vercel → Deployments
2. Click on the three dots (...) next to latest deployment
3. Click "Redeploy"
4. Wait for completion

## Step 6: Test Payment Flow

### Test $79 Subscription:

1. Visit your app: `https://your-app.vercel.app`
2. Sign up with a test account
3. Use 3 free credits
4. Click "Upgrade Now"
5. Use Stripe test card: `4242 4242 4242 4242`
6. After payment, check Clerk user metadata: should show `isPaid: true`
7. Verify unlimited listings work

### Test $29 Single Listing:

1. Create another test account (or use incognito)
2. Use 3 free credits
3. Click upgrade but choose single listing option
4. Pay with test card
5. Check credits increased by 1

## Troubleshooting

### Webhook Not Working:

1. Check Stripe Dashboard → Webhooks → Your endpoint
2. View recent deliveries - should see `checkout.session.completed`
3. If failing, check the error message
4. Common issue: Wrong webhook secret - regenerate and update in Vercel

### Payments Not Granting Access:

1. Verify `CLERK_SECRET_KEY` is set in Vercel
2. Check Vercel logs: Deployments → Click deployment → Functions
3. Look for errors in `/api/stripe-webhook`
4. Ensure `userId` is being passed in Stripe metadata

### API Routes 404:

1. Verify `vercel.json` is committed to repo
2. Check `/api` folder exists in deployment
3. Redeploy from Vercel dashboard

## Environment Variables Checklist

Before going live, ensure ALL these are set in Vercel:

- [ ] VITE_CLERK_PUBLISHABLE_KEY
- [ ] VITE_GOOGLE_PLACES_API_KEY
- [ ] VITE_ANTHROPIC_API_KEY
- [ ] VITE_STRIPE_PUBLISHABLE_KEY
- [ ] VITE_STRIPE_PRICE_ID_UNLIMITED
- [ ] VITE_STRIPE_PRICE_ID_SINGLE
- [ ] CLERK_SECRET_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_URL

## Going Live (Production)

When ready for real payments:

1. **Stripe:** Switch to live mode
   - Get live API keys (pk_live_, sk_live_)
   - Create webhook for production URL
   - Update all Stripe env vars in Vercel

2. **Clerk:** Switch to production instance
   - Update publishable and secret keys

3. **Update Vercel env vars** with production keys

4. **Test thoroughly** with real (small) payment first

## Support

If payments still aren't working:
- Check Vercel function logs
- Verify webhook is receiving events in Stripe
- Ensure Clerk user metadata is updating
- Test with Stripe CLI locally first

---

🎉 Once everything is set up, your app will have fully automated payment processing!
