import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, credits, isPaid, plan, creditsLimit, billingCycleStart, stripeCustomerId, stripeSubscriptionId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  try {
    // Build metadata object with only defined values
    const metadata = {};
    if (credits !== undefined) metadata.credits = credits;
    if (isPaid !== undefined) metadata.isPaid = isPaid;
    if (plan !== undefined) metadata.plan = plan;
    if (creditsLimit !== undefined) metadata.creditsLimit = creditsLimit;
    if (billingCycleStart !== undefined) metadata.billingCycleStart = billingCycleStart;
    if (stripeCustomerId !== undefined) metadata.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId !== undefined) metadata.stripeSubscriptionId = stripeSubscriptionId;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: metadata,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    res.status(500).json({ error: error.message });
  }
}
