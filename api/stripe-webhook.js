import { buffer } from 'micro';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('No userId in session metadata');
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    try {
      // Get the price ID to determine which plan
      const priceId = session.line_items?.data?.[0]?.price?.id || session.metadata?.priceId;

      // Map price IDs to plans (you'll need to update these with your actual Stripe price IDs)
      const PROFESSIONAL_PRICE_ID = process.env.STRIPE_PRICE_ID_PROFESSIONAL;
      const AGENCY_PRICE_ID = process.env.STRIPE_PRICE_ID_AGENCY;

      let plan, credits, creditsLimit;

      if (priceId === PROFESSIONAL_PRICE_ID || session.amount_total === 1900) {
        // $19/month Professional plan
        plan = 'professional';
        credits = 25;
        creditsLimit = 25;
        console.log(`User ${userId} upgraded to Professional plan`);
      } else if (priceId === AGENCY_PRICE_ID || session.amount_total === 3900) {
        // $39/month Agency plan
        plan = 'agency';
        credits = 999999; // Effectively unlimited
        creditsLimit = 999999;
        console.log(`User ${userId} upgraded to Agency plan`);
      } else {
        console.error('Unknown price ID:', priceId, 'amount:', session.amount_total);
        res.status(400).json({ error: 'Unknown plan type' });
        return;
      }

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: plan,
          credits: credits,
          creditsLimit: creditsLimit,
          isPaid: true,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          billingCycleStart: new Date().toISOString()
        },
      });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      // Find user by Stripe customer ID and revoke access
      const users = await clerkClient.users.getUserList();
      const user = users.find(u => u.publicMetadata?.stripeCustomerId === customerId);

      if (user) {
        // Revert to free plan
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            plan: 'free',
            credits: 3,
            creditsLimit: 3,
            isPaid: false,
            billingCycleStart: new Date().toISOString()
          },
        });
        console.log(`Subscription cancelled for user ${user.id} - reverted to free plan`);
      }
    } catch (error) {
      console.error('Error handling cancellation:', error);
    }
  }

  res.status(200).json({ received: true });
}
