export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { formData } = req.body;

  if (!formData) {
    res.status(400).json({ error: 'Missing form data' });
    return;
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_KEY') {
    res.status(500).json({ error: 'Anthropic API key not configured' });
    return;
  }

  const prompt = `You are an expert real estate copywriter who creates MLS-optimized listings that sell properties faster. Write a compelling, professional listing description that makes buyers want to schedule a showing immediately.

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

Requirements:
1. Start with a powerful, attention-grabbing opening line that creates emotion
2. Focus on lifestyle benefits and the buyer's future experience, not just features
3. Use vivid, sensory language that helps buyers visualize living there
4. Include a strong call-to-action at the end
5. Keep it 150-250 words
6. Write in an enthusiastic but professional tone
7. Avoid clichés like "dream home" or "one of a kind" - be specific and unique

Write the listing description now:`;

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
