// For AI image generation
const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001/api';
// For authentication and other services
const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:5000/api';

export const checkImageHashExists = async (imageHash) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/public/ai-hash/${imageHash}`);
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.exists;
  } catch (error) {
    console.warn('AI hash verification service offline, skipping deduplication check:', error.message);
    return false;
  }
};

// Auth related API calls
export const login = async (credentials) => {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const storeNFTData = async (nftData) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/public/ai-hash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageHash: nftData.imageHash,
        prompt: nftData.prompt,
        imageUrl: nftData.imageUrl,
        metadata: nftData.metadata
      }),
    });
    if (!response.ok) return { success: false };
    return await response.json();
  } catch (error) {
    console.warn('AI hash recording service offline, proceeding:', error.message);
    return { success: false };
  }
};