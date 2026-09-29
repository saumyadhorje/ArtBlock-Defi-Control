import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export const setupContracts = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    
    // For now, just return the provider since we're not using the contract directly
    return { provider };
    
  } catch (error) {
    console.error('Error setting up contracts:', error);
    throw error;
  }
}; 