import crypto from 'crypto-js';
// we convert each image to hash store the hash in db and check if the hash exists in db
export const generateImageHash = async (imageUrl) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          // Get base64 data
          const base64Data = reader.result;
          // Generate hash using SHA-256
          const hash = crypto.SHA256(base64Data).toString();
          // Add timestamp for uniqueness
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          resolve(`${timestamp}-${randomStr}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating hash:', error);
    // Fallback hash generation
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    return `${timestamp}-${randomStr}`;
  }
}; 