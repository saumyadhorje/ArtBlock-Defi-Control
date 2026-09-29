// For AI image generation
const AI_SERVICE_URL = 'http://localhost:3001/api';
// i mistakenly named two ports in backend env to be diff 
// For authentication and other services
const AUTH_SERVICE_URL = 'http://localhost:5000/api';

export const checkImageHashExists = async (imageHash) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/public/ai-hash/${imageHash}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking hash:', error);
    throw error;
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
    return await response.json();
  } catch (error) {
    console.error('Error storing NFT:', error);
    throw error;
  }
}; 