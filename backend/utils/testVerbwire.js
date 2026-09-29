import axios from 'axios';
// im testing the verbwire api key here because verbwire is a pain in the ass and i need to make sure it works. verbwire is a pain in the ass
const testVerbwireKey = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.verbwire.com/v1/nft/data/owned',
      headers: {
        'X-API-Key': process.env.VERBWIRE_API_KEY
      }
    });
    console.log('Verbwire API Test Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verbwire API Test Error:', {
      status: error.response?.status,
      message: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

testVerbwireKey(); 