import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { formData, userId } = req.body;

  if (!formData) {
    res.status(400).json({ error: 'Missing form data' });
    return;
  }

  // Check user credits and plan tier
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const plan = user.publicMetadata?.plan || 'free';
      const credits = user.publicMetadata?.credits || 0;

      // Agency plan has unlimited access
      if (plan === 'agency') {
        console.log('Agency plan: unlimited access');
      } else if (credits <= 0) {
        res.status(403).json({
          error: 'No credits remaining',
          message: plan === 'free'
            ? 'You have used all 3 free listings this month. Upgrade to Professional for 25 listings/month or Agency for unlimited.'
            : 'You have used all your credits this month. They will reset in your next billing cycle.'
        });
        return;
      }
    } catch (clerkError) {
      console.error('Error checking user plan:', clerkError);
      // Continue anyway - don't block generation if Clerk check fails
    }
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_KEY') {
    res.status(500).json({ error: 'Anthropic API key not configured' });
    return;
  }

  const prompt = `You are a top-tier real estate copywriter with 15+ years of experience. Your listings sell 40% faster than average because you master emotional storytelling and buyer psychology. Write a premium, MLS-optimized description that commands attention and drives immediate showings.

Property Details:
- Type: ${formData.propertyType}
- Address: ${formData.address}
- Price: $${formData.price}
- Bedrooms: ${formData.bedrooms}
- Bathrooms: ${formData.bathrooms}
- Square Footage: ${formData.sqft} sq ft
- Year Built: ${formData.yearBuilt || 'N/A'}
- Lot Size: ${formData.lotSize || 'N/A'}
- Key Features: ${formData.features || 'N/A'}
- Neighborhood: ${formData.neighborhood || 'N/A'}
- School District: ${formData.schoolDistrict || 'N/A'}

CRITICAL REQUIREMENTS - Follow exactly:

1. OPENING (First sentence): Create instant desire using "Imagine..." or paint a vivid scene. Make buyers FEEL the lifestyle immediately.

2. STORY FLOW: Structure as a visual journey through the home:
   - Exterior/arrival experience (curb appeal, first impressions)
   - Main living areas (entertaining, daily life scenes)
   - Private spaces (bedrooms, bathrooms - create sanctuary feeling)
   - Outdoor/special features (lifestyle benefits)

3. POWER WORDS: Use these emotions:
   - Luxury tier: "sophisticated," "curated," "elevated," "refined," "bespoke"
   - Family tier: "welcoming," "spacious," "bright," "flowing," "practical"
   - Modern tier: "sleek," "contemporary," "updated," "stylish," "pristine"

4. SENSORY DETAILS: Include at least 3:
   - Visual: "sun-drenched," "soaring ceilings," "gleaming hardwood"
   - Tactile: "plush carpet," "cool marble," "warm wood"
   - Spatial: "expansive," "intimate," "airy," "cozy"

5. BUYER PSYCHOLOGY:
   - Paint specific lifestyle scenes (e.g., "Sunday morning coffee on the deck overlooking...")
   - Use "you" and "your" to create ownership mentality
   - Highlight unique value propositions (what competitors lack)

6. STRUCTURE:
   - 200-280 words (longer = more premium feel)
   - 3-4 paragraphs
   - Each paragraph has a purpose (hook → tour → lifestyle → urgency)

7. CLOSING: Create FOMO with scarcity/urgency:
   - Reference market conditions, location desirability, or unique features
   - End with compelling call-to-action
   - Example: "Properties like this in [neighborhood] rarely last - schedule your private showing today."

8. ABSOLUTE BANS:
   - ❌ "Dream home," "must see," "don't miss," "won't last"
   - ❌ Generic phrases: "great location," "perfect for," "tons of"
   - ❌ Listing obvious things without adding value
   - ❌ Passive voice or weak verbs

9. PREMIUM UPGRADES vs STANDARD HOMES:
   - If price > $500k: Use sophisticated language, emphasize luxury/investment value
   - If price < $300k: Focus on value, practical benefits, family lifestyle
   - Always position as the BEST choice in this price range

10. NEIGHBORHOOD INTEGRATION:
   - Research the actual neighborhood and reference real landmarks/features
   - Mention lifestyle amenities within 5-10 minutes
   - Create local expertise credibility

Write the premium listing description now. Make it so compelling that buyers call within 30 minutes of reading:`;

  try {
    console.log('Starting Anthropic API call...');

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    console.log('Anthropic API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      res.status(response.status).json({ error: 'AI generation failed', details: error });
      return;
    }

    const data = await response.json();
    console.log('Anthropic API success');
    const listing = data.content[0].text;

    res.status(200).json({ listing });
  } catch (error) {
    console.error('Error generating listing:', error.message, error.stack);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
