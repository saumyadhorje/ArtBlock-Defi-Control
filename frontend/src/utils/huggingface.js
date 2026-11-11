
import { generateImageHash } from './imageHash';
import { checkImageHashExists, storeNFTData } from './api';

export const MODELS = {
  FLUX_1_DEV: {
    name: 'FLUX.1 Dev',
    specialties: [
      'cyberpunk',
      'anime',
      'fantasy',
      'abstract',
      'pixel art',
      'digital painting'
    ],
    bestFor: {
      quickGeneration: true,
      artisticDetails: true,
      modernAesthetics: true
    }
  }
};

const generateUniquePrompt = (basePrompt, style = '', attempt = 0) => {
  const seed = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const cleanBase = basePrompt.replace(/\[seed:[^\]]+\]/, '').trim();
  const styleString = style ? `, in ${style} style` : '';

  const variations = [
    'cinematic lighting',
    'vivid color palette',
    'intricate textures',
    'dynamic composition'
  ];

  const suffix =
    attempt > 0 ? `, ${variations[attempt % variations.length]}` : '';

  return `${cleanBase}${styleString}${suffix} [seed:${seed}]`;
};

export const generateImage = async (prompt, style = '') => {
  try {
    const response = await fetch(
      'http://localhost:3001/api/public/generate-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.replace(/\[seed:[^\]]+\]/, '').trim(),
          style
        }),
        signal: AbortSignal.timeout(180000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          `Image generation failed with status ${response.status}.`
      );
    }

    if (
      typeof data.imageUrl !== 'string' ||
      !data.imageUrl.startsWith('data:image/')
    ) {
      throw new Error('The server did not return valid image data.');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('Backend image generation error:', error);
    throw new Error(
      error.message || 'AI image generation failed. Please try again.'
    );
  }
};

export const generateUniqueImage = async (
  prompt,
  style = '',
  maxAttempts = 3
) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const finalPrompt = generateUniquePrompt(prompt, style, attempt);
      const imageUrl = await generateImage(finalPrompt, style);

      let imageHash = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      try {
        imageHash = await generateImageHash(imageUrl);

        const exists = await checkImageHashExists(imageHash);

        if (exists && attempt < maxAttempts - 1) {
          continue;
        }
      } catch (hErr) {
        console.warn('Hash checking notice:', hErr.message);
      }

      await storeNFTData({
        imageHash,
        prompt: finalPrompt,
        imageUrl: null,
        metadata: {
          generationAttempt: attempt,
          modelUsed: MODELS.FLUX_1_DEV.name,
          style
        }
      });

      return {
        imageUrl,
        imageHash,
        prompt: finalPrompt,
        modelUsed: MODELS.FLUX_1_DEV.name
      };
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      console.error(
        `Image generation attempt ${attempt + 1} failed:`,
        error
      );
    }
  }

  throw new Error(
    'Failed to generate a unique image. Please adjust your prompt and try again.'
  );
};
