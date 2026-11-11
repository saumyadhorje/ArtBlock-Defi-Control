import axios from 'axios';

const pinataJWT = process.env.REACT_APP_PINATA_JWT;

/**
 * Returns a displayable HTTPS URL for an IPFS hash or URI.
 */
export const getIPFSUrl = (hashOrUri) => {
  if (!hashOrUri) return '';
  if (hashOrUri.startsWith('http://') || hashOrUri.startsWith('https://')) {
    return hashOrUri;
  }
  const cleanHash = hashOrUri.replace('ipfs://', '').trim();
  // Using ipfs.io as default gateway, fallback to pinata/cloudflare
  return `https://ipfs.io/ipfs/${cleanHash}`;
};

/**
 * Converts a base64 Data URL to a Blob.
 */
const dataURLToBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const uploadToIPFS = async (file) => {
  if (!pinataJWT) {
    throw new Error('IPFS storage is not configured. Set REACT_APP_PINATA_JWT before minting.');
  }

  try {
    const formData = new FormData();
    if (typeof file === 'string') {
      if (file.startsWith('data:image/')) {
        const imageBlob = dataURLToBlob(file);
        formData.append('file', imageBlob, 'artwork.png');
      } else {
        const imageResponse = await fetch(file);
        if (!imageResponse.ok) throw new Error('Generated image is no longer available in browser memory.');
        const imageBlob = await imageResponse.blob();
        formData.append('file', imageBlob, 'artwork.png');
      }
    } else if (file instanceof File || file instanceof Blob) {
      formData.append('file', file, file.name || 'artwork.png');
    } else {
      formData.append(
        'file',
        new Blob([JSON.stringify(file)], { type: 'application/json' }),
        'metadata.json'
      );
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      { headers: { Authorization: `Bearer ${pinataJWT}` } }
    );

    if (!response.data?.IpfsHash) {
      throw new Error('IPFS returned no content hash.');
    }
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to upload to IPFS');
  }
};
