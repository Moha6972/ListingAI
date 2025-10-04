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
      // Check the amount to determine which plan
      if (session.amount_total === 7900) {
        // $79 subscription - grant unlimited access
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPaid: true,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
          },
        });
        console.log(`User ${userId} upgraded to unlimited plan`);
      } else if (session.amount_total === 2900) {
        // $29 single listing - add 1 credit
        const user = await clerkClient.users.getUser(userId);
        const currentCredits = user.publicMetadata?.credits || 0;

        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            credits: currentCredits + 1,
          },
        });
        console.log(`User ${userId} purchased 1 listing credit`);
      }
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
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            isPaid: false,
            credits: 0,
          },
        });
        console.log(`Subscription cancelled for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling cancellation:', error);
    }
  }

  res.status(200).json({ received: true });
}
