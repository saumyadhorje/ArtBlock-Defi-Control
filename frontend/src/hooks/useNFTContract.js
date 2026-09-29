import { useState } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import { uploadToIPFS } from '../utils/ipfs';
import { contractABI } from '../constants/contractABI';
import axiosInstance from '../utils/axios';

const useNFTContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mintNFT = async (artwork, galleryAddress) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      setLoading(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('artblock_user'));
      const artistAddress = user.walletAddress;

      // Upload to IPFS and create metadata
      const imageHash = await uploadToIPFS(artwork.image);
      const metadata = {
        name: artwork.title,
        description: artwork.description,
        image: `ipfs://${imageHash}`,
        attributes: [
          {
            trait_type: "Artist",
            value: artistAddress
          },
          {
            trait_type: "Gallery",
            value: galleryAddress
          }
        ]
      };

      const metadataHash = await uploadToIPFS(JSON.stringify(metadata));

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = process.env.REACT_APP_ARTBLOCK_CONTRACT_ADDRESS;
      const contract = new Contract(
        contractAddress,
        contractABI,
        signer
      );

      const price = parseEther(artwork.price.toString());
      
      console.log('Minting with params:', {
        artist: artistAddress,
        gallery: galleryAddress,
        title: artwork.title,
        description: artwork.description,
        ipfsHash: imageHash,
        price: price.toString(),
        uri: `ipfs://${metadataHash}`
      });

      const tx = await contract.mint(
        artistAddress,
        galleryAddress,
        artwork.title,
        artwork.description,
        imageHash,
        price,
        `ipfs://${metadataHash}`
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      // Find the ArtworkMinted event
      const mintEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'ArtworkMinted'
      );

      if (!mintEvent) {
        throw new Error('Minting event not found in transaction receipt');
      }

      // Extract tokenId from event
      const tokenId = mintEvent.args[0];

      // Store NFT in MongoDB with all required fields
      const nftData = {
        tokenId: tokenId.toString(),
        title: artwork.title,
        description: artwork.description,
        ipfsHash: imageHash,
        price: price.toString(),
        artistAddress: artistAddress.toLowerCase(),
        galleryAddress: galleryAddress.toLowerCase(),
        metadata,
        contractAddress: contractAddress.toLowerCase(),
        network: 'linea-sepolia',
        isListed: true
      };

      console.log('Storing NFT data:', nftData);

      // Store in backend
      const storedNFT = await axiosInstance.post('/api/nfts', nftData);
      console.log('NFT stored in backend:', storedNFT.data);

      return receipt;

    } catch (err) {
      console.error('NFT minting error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getArtistNFTs = async (artistAddress) => {
    try {
      if (!artistAddress) {
        console.log('No artist address provided');
        return [];
      }

      console.log('Getting NFTs for artist:', artistAddress);
      
      // First get NFTs from backend
      let backendNFTs = [];
      try {
        const response = await axiosInstance.get(`/api/nfts/artist/${artistAddress.toLowerCase()}`);
        backendNFTs = response.data;
        console.log('NFTs from backend:', backendNFTs);
      } catch (error) {
        console.log('Error fetching from backend:', error);
      }

      // Then get from blockchain
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(
        process.env.REACT_APP_ARTBLOCK_CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const filter = contract.filters.ArtworkMinted(null, artistAddress);
      const events = await contract.queryFilter(filter);
      console.log('ArtworkMinted events:', events);

      const chainNFTs = await Promise.all(events.map(async (event) => {
        try {
          const { tokenId, artist, ipfsHash, price } = event.args;
          
          // Find matching backend data
          const backendNFT = backendNFTs.find(
            nft => nft.tokenId === tokenId.toString()
          );
          
          return {
            tokenId: tokenId.toString(),
            artist,
            ipfsHash,
            price: formatEther(price),
            image: `https://ipfs.io/ipfs/${ipfsHash}`,
            title: backendNFT?.title || `Artwork #${tokenId}`,
            description: backendNFT?.description || '',
            isListed: true,
            ...backendNFT
          };
        } catch (err) {
          console.error('Error processing event:', err);
          return null;
        }
      }));

      const validNFTs = chainNFTs.filter(nft => nft !== null);
      console.log('Found artist NFTs:', validNFTs);
      return validNFTs;

    } catch (err) {
      console.error('Error fetching artist NFTs:', err);
      return [];
    }
  };

  return {
    mintNFT,
    getArtistNFTs,
    loading,
    error
  };
};

export default useNFTContract; 