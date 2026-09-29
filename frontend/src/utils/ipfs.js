import axios from 'axios';

const pinataJWT = process.env.REACT_APP_PINATA_JWT;

export const uploadToIPFS = async (file) => {
  try {
    const formData = new FormData();

    if (file instanceof File) {
      formData.append('file', file);
    } 
    else {
      const blob = new Blob(
        [JSON.stringify(file)],
        { type: 'application/json' }
      );
      formData.append('file', blob, 'metadata.json');
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};