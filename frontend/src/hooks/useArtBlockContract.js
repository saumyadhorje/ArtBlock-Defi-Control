import { ethers } from 'ethers';
import { useCallback } from 'react';
import ArtBlockNFT from '../contracts/ArtBlockNFT.json';
import { useWallet } from '../context/WalletContext';

const useArtBlockContract = () => {
  const { provider, address } = useWallet();

  const purchaseArtwork = useCallback(async (tokenId, price) => {
    try {
      if (!provider || !address) {
        throw new Error('Wallet not connected');
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_ARTBLOCK_CONTRACT_ADDRESS,
        ArtBlockNFT.abi,
        signer
      );

      // Convert price to Wei
      const priceInWei = ethers.parseEther(price.toString());

      console.log('Initiating purchase:', {
        tokenId,
        price: priceInWei.toString(),
        buyer: address
      });

      // Call buyArtwork with the exact price
      const tx = await contract.buyArtwork(tokenId, {
        value: priceInWei
      });

      console.log('Purchase transaction submitted:', tx.hash);
      return tx;

    } catch (error) {
      console.error('Error in purchaseArtwork:', error);
      throw error;
    }
  }, [provider, address]);

  return { purchaseArtwork };
};

export default useArtBlockContract; 