import { generateImageHash } from './imageHash';
import { checkImageHashExists, storeNFTData } from './api';


const HF_API_TOKEN = "";
export const MODELS = {
  FLUX_1_DEV: {
    url: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    name: "FLUX.1 Dev",
    prefix: "FLUX.1:",
    specialties: [
      'abstract', 'pattern', 'landscape', 'modern', 'minimal',
      'geometric', 'artistic', 'experimental'
    ],
    bestFor: {
      quickGeneration: true,
      abstractArt: true,
      simpleDesigns: true
    }
  }
};


const recentPrompts = new Set();

const generateUniquePrompt = (basePrompt, attempt = 0) => {
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  const uniqueIdentifier = `${timestamp}-${randomSeed}`;
  
  const cleanPrompt = basePrompt.replace(/\[seed:[^\]]+\]/, '').trim();
  
  if (recentPrompts.has(cleanPrompt) || attempt > 0) {
    const variations = [
      'with slightly different lighting',
      'with modified background',
      'with alternative color scheme',
      'from a different angle',
      'with subtle texture changes'
    ];
    const variation = variations[attempt % variations.length];
    console.log(` Detected duplicate prompt! Adding variation "${variation}" to create unique NFT`);
    return `${basePrompt} ${variation} [seed:${uniqueIdentifier}]`;
  }
  
  
  recentPrompts.add(cleanPrompt);
 
  if (recentPrompts.size > 10) {
    recentPrompts.delete(recentPrompts.values().next().value);
  }
  
  return `${basePrompt} [seed:${uniqueIdentifier}]`;
};


const imageCache = new Map();

export const generateImage = async (prompt) => {
  const model = MODELS.FLUX_1_DEV;
  const cacheKey = `FLUX_1_DEV:${prompt}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const response = await fetch(model.url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          wait_for_model: true,
          use_cache: true
        }
      }),
    });

    // Handle queue status
    if (response.status === 503) {
      const { estimated_time } = await response.json();
      await new Promise(resolve => setTimeout(resolve, estimated_time * 1000));
      return generateImage(prompt); // Retry
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    
    imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error(`Error generating image with ${model.name}:`, error);
    throw error;
  }
};

export const generateUniqueImage = async (prompt, maxAttempts = 3) => {
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      const uniquePrompt = generateUniquePrompt(prompt, attempt);
      console.log(` Using prompt with FLUX.1 Dev: "${uniquePrompt}"`);
      
      const imageUrl = await generateImage(uniquePrompt);
      const imageHash = await generateImageHash(imageUrl);
      
      // Check if hash exists in PostgreSQL here
      const exists = await checkImageHashExists(imageHash);
      
      if (exists) {
        console.log(` Hash ${imageHash} already exists. Attempting variation...`);
        attempt++;
        continue;
      }
      
      // Store in PostgreSQL
      await storeNFTData({
        imageHash,
        prompt: uniquePrompt,
        imageUrl,
        metadata: {
          generationAttempt: attempt,
          modelUsed: MODELS.FLUX_1_DEV.name,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(` Successfully generated unique NFT using FLUX.1 Dev on attempt ${attempt + 1}`);
      
      return {
        imageUrl,
        imageHash,
        prompt: uniquePrompt,
        modelUsed: MODELS.FLUX_1_DEV.name
      };
      
    } catch (error) {
      console.error(` Attempt ${attempt + 1} failed:`, error);
      attempt++;
    }
  }
  
  throw new Error('Failed to generate a unique image after multiple attempts');
}; 