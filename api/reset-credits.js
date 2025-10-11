import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  try {
    // Get user data
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.publicMetadata;

    const plan = metadata?.plan || 'free';
    const billingCycleStart = metadata?.billingCycleStart;

    // Check if billing cycle has passed (30 days)
    if (billingCycleStart) {
      const cycleStartDate = new Date(billingCycleStart);
      const now = new Date();
      const daysPassed = Math.floor((now - cycleStartDate) / (1000 * 60 * 60 * 24));

      // If 30+ days have passed, reset credits
      if (daysPassed >= 30) {
        let newCredits;

        switch (plan) {
          case 'free':
            newCredits = 3;
            break;
          case 'professional':
            newCredits = 25;
            break;
          case 'agency':
            newCredits = 999999; // Effectively unlimited
            break;
          default:
            newCredits = 3;
        }

        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            credits: newCredits,
            billingCycleStart: now.toISOString()
          },
        });

        console.log(`Credits reset for user ${userId} on plan ${plan} to ${newCredits}`);
        res.status(200).json({ success: true, creditsReset: true, newCredits });
        return;
      }
    }

    // No reset needed
    res.status(200).json({ success: true, creditsReset: false });
  } catch (error) {
    console.error('Error resetting credits:', error);
    res.status(500).json({ error: error.message });
  }
}
