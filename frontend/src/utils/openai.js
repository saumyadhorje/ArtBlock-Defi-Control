const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const enhancePrompt = async (userPrompt, style = '') => {
  if (!userPrompt || !userPrompt.trim()) return '';

  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert digital art curator. Enhance this art prompt with vivid visual details, atmosphere, lighting, dynamic composition, and rich textures. Keep it under 50 words and do not include quotes.'
            },
            { role: 'user', content: style ? `${userPrompt} in ${style} style` : userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });
      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }
    } catch (error) {
      console.warn('OpenAI enhancement service unavailable, using smart prompt enrichment:', error.message);
    }
  }

  // Intelligent client-side prompt expansion when OpenAI API key is not present
  const styleKeywords = {
    cyberpunk: 'futuristic neon city, volumetric fog, chromatic aberration, holographic glow, high-tech dystopian detailing',
    anime: 'vibrant anime aesthetic, Makoto Shinkai inspired skies, expressive linework, soft cinematic bloom',
    fantasy: 'mythical ethereal realm, enchanted ambient glow, epic atmospheric scale, ornate concept art',
    abstract: 'geometric rhythm, bold harmonious colors, tactile oil textures, multidimensional composition',
    'pixel art': 'meticulous 16-bit pixel precision, nostalgic retro palette, clean dithering, isometric perspective',
    'digital painting': 'painterly brushstrokes, masterclass chiaroscuro lighting, intricate focal details, gallery masterpiece'
  };

  const extraDetails = style && styleKeywords[style] 
    ? styleKeywords[style] 
    : 'cinematic lighting, ultra-detailed composition, vivid colors, gallery quality digital artwork';

  return `${userPrompt.trim()}, ${extraDetails}`;
};

export default enhancePrompt;
