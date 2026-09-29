import axios from 'axios';
import FormData from 'form-data';
// were deploying this contract for the user when he initially signsup for the app, were not doing shit with this contract, just for verbwire's sake 
export const deployContractForUser = async (username) => {
  try {
    const formData = new FormData();
    formData.append('chain', 'sepolia');
    formData.append('contractType', 'nft721');
    formData.append('contractCategory', 'simple');
    formData.append('isCollectionContract', 'false');
    formData.append('contractName', `${username}Collection`);
    formData.append('contractSymbol', `${username.toUpperCase()}`);

    const response = await axios({
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/deploy/deployContract',
      headers: {
        accept: 'application/json',
        'X-API-Key': process.env.VERBWIRE_API_KEY,
        ...formData.getHeaders()
      },
      data: formData
    });

    const { transaction_details } = response.data;
    
    return {
      contractAddress: transaction_details.createdContractAddress,
      transactionHash: transaction_details.transactionHash,
      blockExplorerUrl: transaction_details.blockExplorer,
      transactionId: transaction_details.transactionID,
      status: transaction_details.status,
      network: 'sepolia'
    };

  } catch (error) {
    console.error('Contract Deployment Error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkDeploymentStatus = async (transactionId) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.verbwire.com/v1/nft/deploy/status/${transactionId}`,
      headers: {
        accept: 'application/json',
        'X-API-Key': process.env.VERBWIRE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Status Check Error:', error.response?.data || error.message);
    throw error;
  }
}; 