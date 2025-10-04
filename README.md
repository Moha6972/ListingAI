# 🏡 ListingAI - Real Estate Listing Generator

AI-powered SaaS tool that generates professional MLS-optimized property descriptions in 30 seconds.

**Target:** Real estate agents who want to save time and close deals faster.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see below)
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run development server
npm run dev
```

Visit: `http://localhost:5173`

## 🔑 Required API Keys

### 1. Clerk (Authentication)
- Sign up at [clerk.com](https://clerk.com)
- Create new application
- Enable **Email/Password** and **Google OAuth**
- Copy Publishable Key → `.env.local`

### 2. Google Places (Address Autocomplete)
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Enable "Places API"
- Create API key
- Add to `.env.local` AND `index.html` line 13

### 3. Stripe (Payments)
- Create account at [stripe.com](https://stripe.com)
- Create product: $79/month subscription
- Copy Publishable Key → `.env.local`

### 4. Anthropic (AI Generation)
- Sign up at [console.anthropic.com](https://console.anthropic.com)
- Create API key
- Add to `.env.local`

## 📋 Features

✅ **Landing Page** - Dark gradient design with glassmorphism
✅ **Authentication** - Clerk (Email + Google OAuth)
✅ **Property Form** - Google Places autocomplete
✅ **AI Generation** - Claude API integration
✅ **Credits System** - 3 free trials, track usage
✅ **Stripe Payments** - $79/month unlimited plan
✅ **Results Page** - Copy to clipboard functionality

## 💰 Business Model

- **$79/month** - Unlimited listings (main revenue)
- **$29/listing** - Pay-as-you-go (backup option)
- **3 free trials** - New user onboarding
- **No contracts** - Cancel anytime

## 🛠 Tech Stack

- React (JavaScript - NO TypeScript)
- Clerk (Auth)
- Stripe (Payments)
- Anthropic Claude (AI)
- Google Places API
- Tailwind CSS
- Vercel (Deployment)

## 📁 Project Structure

```
/src
  /components
    LandingPage.jsx     # Marketing page
    AuthPage.jsx        # Sign in/up
    ListingForm.jsx     # Property input
    ResultsPage.jsx     # Generated listing
  /lib
    clerk.js            # Auth config
    stripe.js           # Payment config
  App.jsx               # Main logic
  main.jsx              # Entry point
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Or connect GitHub repo via Vercel dashboard.

**Don't forget:** Add all env variables in Vercel project settings!

## 📖 Full Documentation

See [SETUP.md](./SETUP.md) for:
- Detailed setup instructions
- Stripe webhook configuration
- User credits system
- Security best practices
- Troubleshooting guide

## 🎯 Success Metrics

- Deploy by Friday
- First paying customer within 7 days
- $500 MRR within 30 days

## 🔒 Security Notes

⚠️ **Current setup exposes Anthropic API key in frontend** - Demo purposes only!

**For production:**
1. Move AI generation to backend API route
2. Validate all inputs server-side
3. Set up Stripe webhooks properly
4. Enable rate limiting

## 📝 License

Built following spec from Claude.ai conversation.
Ready to launch and get paying customers! 🚀

---

**Need help?** Check SETUP.md or review the component files for implementation details.
