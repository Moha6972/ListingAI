# Phase 1 Implementation - Remaining Manual Tasks

## ✅ What I've Completed (Tasks 1-10)

All code has been updated with the new plan tier system:

1. ✅ **Updated Clerk Metadata Schema**
   - New fields: `plan`, `creditsLimit`, `billingCycleStart`, `stripeCustomerId`, `stripeSubscriptionId`
   - Backwards compatible with legacy `isPaid` field

2. ✅ **Created Monthly Credit Reset API** (`/api/reset-credits.js`)
   - Automatically resets credits every 30 days
   - Triggered on user login
   - Tier-aware: Free (3) → Professional (25) → Agency (unlimited)

3. ✅ **Updated User Initialization** (App.jsx)
   - New users get: `plan: 'free', credits: 3, creditsLimit: 3`
   - Checks for credit reset on every login

4. ✅ **Updated Generation Logic** (`/api/generate-listing.js`)
   - Server-side plan tier checking
   - Agency plan bypasses credit checks
   - Custom error messages per plan

5. ✅ **Updated Stripe Webhook** (`/api/stripe-webhook.js`)
   - Handles Professional ($19) and Agency ($39) plans
   - Sets correct metadata on successful payment
   - Cancellation reverts to free tier (not 0 credits)

6. ✅ **Updated Frontend** (App.jsx)
   - Agency users don't deduct credits
   - Plan tier passed to all components
   - User object now includes: `{ id, email, credits, isPaid, plan }`

---

## 🔧 What YOU Need to Do Next

### Task 6: Create Stripe Products (5 minutes)

**Steps:**
1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add Product"**

**Professional Plan:**
- Name: `ListingAI Professional`
- Description: `25 listings per month`
- Pricing: **Recurring** → **$19.00/month**
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`)

**Agency Plan:**
- Name: `ListingAI Agency`
- Description: `Unlimited listings + team features`
- Pricing: **Recurring** → **$39.00/month**
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`)

**Add to `.env.local`:**
```env
VITE_STRIPE_PRICE_ID_PROFESSIONAL=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_ID_AGENCY=price_yyyyyyyyyyyyy
STRIPE_PRICE_ID_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_AGENCY=price_yyyyyyyyyyyyy
```

---

### Task 7: Update PricingPage.jsx (ALREADY DONE - Just verify)

The code already reads from environment variables. Just confirm these lines exist in `App.jsx:154-157`:

```javascript
const priceId = planType === 'professional'
  ? import.meta.env.VITE_STRIPE_PRICE_ID_PROFESSIONAL
  : import.meta.env.VITE_STRIPE_PRICE_ID_AGENCY;
```

✅ **No action needed if this code is present.**

---

### Task 11: Test Credits System Locally (15 minutes)

**Before testing, start dev server:**
```bash
npm run dev
```

**Test 1: Free Tier**
1. Sign up with new email
2. Check browser console: Should see `plan: 'free', credits: 3`
3. Generate 3 listings
4. Try 4th listing → Should show "No credits remaining" error

**Test 2: Professional Tier (Manual simulation)**
1. Go to Clerk Dashboard → Users → Your test user
2. Click "Metadata" tab
3. Add to `publicMetadata`:
```json
{
  "plan": "professional",
  "credits": 25,
  "creditsLimit": 25,
  "billingCycleStart": "2025-10-11T00:00:00.000Z"
}
```
4. Reload app → Should show 25 credits
5. Generate listing → Credits decrement

**Test 3: Agency Tier (Manual simulation)**
1. Update same user's metadata:
```json
{
  "plan": "agency",
  "credits": 999999,
  "creditsLimit": 999999
}
```
2. Reload app
3. Generate 5+ listings → Credits should NOT decrement (unlimited)

**Test 4: Credit Reset Logic**
1. Set `billingCycleStart` to 31 days ago:
```json
{
  "plan": "free",
  "credits": 0,
  "creditsLimit": 3,
  "billingCycleStart": "2025-09-10T00:00:00.000Z"
}
```
2. Reload app
3. Check console → Should see "Credits reset to: 3"

---

### Task 12: Deploy to Vercel (10 minutes)

```bash
vercel --prod
```

**In Vercel Dashboard (https://vercel.com/dashboard):**

1. Go to your project → **Settings** → **Environment Variables**

2. Add ALL of these:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-ant-...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get this in next step)
VITE_STRIPE_PRICE_ID_PROFESSIONAL=price_...
VITE_STRIPE_PRICE_ID_AGENCY=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_AGENCY=price_...
VITE_GOOGLE_PLACES_API_KEY=AIza...
```

3. Click **Save** → **Redeploy** when prompted

---

### Task 13: Configure Stripe Webhook (5 minutes)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://your-app.vercel.app/api/stripe-webhook`
   (Replace `your-app` with your actual Vercel domain)
4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
5. Click **Add endpoint**
6. Click **"Reveal signing secret"**
7. Copy the `whsec_...` value
8. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET=whsec_...`
9. Redeploy in Vercel

---

### Tasks 14-16: Test Production Payments (20 minutes)

**Test Card:** `4242 4242 4242 4242` (any future date, any CVC)

**Test 14: Professional Plan**
1. Sign up with new email on production
2. Click "Upgrade to Professional"
3. Complete Stripe checkout with test card
4. Verify redirect back to app
5. **Check Clerk Dashboard:**
   - User should have: `plan: 'professional', credits: 25`
6. Generate 1 listing → Credits should go to 24

**Test 15: Agency Plan**
1. Sign up with different email
2. Click "Upgrade to Agency"
3. Complete checkout
4. **Check Clerk Dashboard:**
   - User should have: `plan: 'agency', credits: 999999`
5. Generate 10 listings → Credits should NOT change

**Test 16: Cancellation**
1. Go to https://dashboard.stripe.com/test/subscriptions
2. Find your test subscription → Click **"Cancel subscription"**
3. Wait 30 seconds
4. **Check Clerk Dashboard:**
   - User should revert to: `plan: 'free', credits: 3`
5. Verify in app that user can generate 3 more free listings

---

### Task 17: Verify Credit Reset (Optional)

**Option A: Manual test (fast)**
1. In Clerk Dashboard, set user's `billingCycleStart` to 31 days ago
2. Log in to app
3. Should see credits reset

**Option B: Wait 30 days (production validation)**
- Credits will automatically reset for all users on their billing cycle

---

## ✅ Success Criteria

Phase 1 is complete when:
- [ ] All 3 plans exist in Stripe Dashboard
- [ ] Environment variables configured in Vercel
- [ ] Webhook endpoint responding (check Stripe logs)
- [ ] Professional plan payment works ($19 → 25 credits)
- [ ] Agency plan payment works ($39 → unlimited)
- [ ] Cancellation reverts to free tier (3 credits)
- [ ] Credit reset logic works (30-day cycle)

---

## 🚨 Troubleshooting

**Webhook not firing:**
- Check Stripe webhook logs: https://dashboard.stripe.com/test/webhooks
- Verify signing secret matches Vercel env var
- Ensure Vercel deployment succeeded

**Credits not updating:**
- Check Vercel function logs
- Verify Clerk secret key is set
- Check browser console for API errors

**Wrong credits amount:**
- Verify price IDs in `.env.local` match Stripe Dashboard
- Check webhook is mapping amounts correctly (1900 = $19, 3900 = $39)

**Credit reset not working:**
- Check console for "Credits reset to:" message
- Verify `billingCycleStart` is set in Clerk metadata
- Ensure `/api/reset-credits` endpoint is deployed

---

## 📞 Need Help?

If you get stuck, share:
1. Which task number you're on
2. Error messages (browser console + Vercel logs)
3. Screenshots of Stripe/Clerk Dashboard if relevant

I can help debug any issues!
