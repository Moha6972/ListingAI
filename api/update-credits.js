import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, credits, isPaid } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: credits !== undefined ? credits : undefined,
        isPaid: isPaid !== undefined ? isPaid : undefined,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    res.status(500).json({ error: error.message });
  }
}
