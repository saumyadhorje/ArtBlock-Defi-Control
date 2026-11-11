import { useState } from 'react';
import { BrowserProvider, Contract, formatEther, isAddress, parseEther, ZeroAddress, getAddress } from 'ethers';
import { uploadToIPFS, getIPFSUrl } from '../utils/ipfs';
import { contractABI } from '../constants/contractABI';
import { ARTBLOCK_NFT_ADDRESS, NETWORK_ID } from '../config';
import { ensureHardhatNetwork } from '../utils/network';
import axiosInstance from '../utils/axios';

const getErrorMessage = (error) => {
  if (error?.code === 4001 || error?.info?.error?.code === 4001) return 'Transaction rejected in MetaMask.';
  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient ETH for gas. Switch MetaMask to your funded development account on Hardhat Localhost (Chain ID 31337); never use real funds for local development.';
  }
  if (error?.reason) return error.reason;
  return error?.shortMessage || error?.message || 'NFT transaction failed.';
};

const useNFTContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getContract = async (withSigner = false) => {
    if (!window.ethereum) throw new Error('MetaMask is not installed.');
    if (!ARTBLOCK_NFT_ADDRESS || !isAddress(ARTBLOCK_NFT_ADDRESS)) {
      throw new Error('NFT contract address is not configured for this deployment.');
    }
    await ensureHardhatNetwork();
    const provider = new BrowserProvider(window.ethereum);
    const code = await provider.getCode(ARTBLOCK_NFT_ADDRESS);
    if (code === '0x') throw new Error(`No NFT contract is deployed at ${ARTBLOCK_NFT_ADDRESS} on Hardhat Localhost.`);
    return {
      provider,
      contract: new Contract(ARTBLOCK_NFT_ADDRESS, contractABI, withSigner ? await provider.getSigner() : provider)
    };
  };

  const mintNFT = async (artwork, galleryAddress) => {
    if (loading) throw new Error('A mint transaction is already pending.');
    setLoading(true);
    setError(null);
    try {
      if (!artwork.image) throw new Error('Select or generate an artwork image before minting.');
      if (!artwork.title?.trim() || !artwork.description?.trim()) throw new Error('NFT title and description are required.');

      // Resolve valid gallery address (fallback to contract or default if empty)
      const validGalleryAddress = (galleryAddress && isAddress(galleryAddress.trim()))
        ? getAddress(galleryAddress.trim())
        : (process.env.REACT_APP_DEFAULT_GALLERY_ADDRESS && isAddress(process.env.REACT_APP_DEFAULT_GALLERY_ADDRESS))
          ? getAddress(process.env.REACT_APP_DEFAULT_GALLERY_ADDRESS)
          : getAddress(ARTBLOCK_NFT_ADDRESS);

      const { provider, contract } = await getContract(true);
      const signer = contract.runner;
      const rawArtistAddress = await signer.getAddress();
      const artistAddress = getAddress(rawArtistAddress);
      
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== NETWORK_ID) {
        throw new Error('Wrong network. Please connect MetaMask to Hardhat Localhost (Chain ID 31337).');
      }

      // Check balance and gas before prompting transaction
      const balance = await provider.getBalance(artistAddress);

      // Upload image and metadata to IPFS
      const imageHash = await uploadToIPFS(artwork.image);
      const metadata = {
        name: artwork.title.trim(),
        description: artwork.description.trim(),
        image: `ipfs://${imageHash}`,
        attributes: [
          { trait_type: 'Artist', value: artistAddress },
          { trait_type: 'Gallery', value: validGalleryAddress },
          { trait_type: 'Created', value: new Date().toISOString() }
        ]
      };
      const metadataHash = await uploadToIPFS(metadata);
      const price = parseEther(String(artwork.price || '0'));
      const args = [
        artistAddress,
        validGalleryAddress,
        metadata.name,
        metadata.description,
        imageHash,
        price,
        `ipfs://${metadataHash}`
      ];

      // Pre-flight gas check
      let gasLimit;
      try {
        gasLimit = await contract.mint.estimateGas(...args);
        // Add 20% safety margin to estimated gas
        gasLimit = (gasLimit * 120n) / 100n;
      } catch (gasErr) {
        console.warn('Gas estimation warning, using fallback gas limit:', gasErr);
        gasLimit = 600000n;
      }

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || 1000000000n;
      const estimatedCost = gasLimit * gasPrice;
      
      if (balance < estimatedCost) {
        throw new Error(
          `Insufficient ETH for gas (Balance: ${formatEther(balance)} ETH; estimated gas: ${formatEther(estimatedCost)} ETH). Switch MetaMask to your funded account with 10,000 ETH on Hardhat Localhost. Never use real funds for local development.`
        );
      }

      // Execute on-chain mint transaction
      const tx = await contract.mint(...args, { gasLimit });
      const receipt = await tx.wait();
      if (receipt.status !== 1) throw new Error('The mint transaction was reverted on-chain.');

      // Parse ArtworkMinted event from receipt
      const parsedEvent = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch (_) { return null; } })
        .find(event => event?.name === 'ArtworkMinted');

      let tokenId = '0';
      if (parsedEvent && parsedEvent.args?.tokenId !== undefined) {
        tokenId = parsedEvent.args.tokenId.toString();
      }

      // Verify ownership & tokenURI on contract
      let owner = artistAddress;
      let tokenURI = `ipfs://${metadataHash}`;
      try {
        owner = await contract.ownerOf(tokenId);
        tokenURI = await contract.tokenURI(tokenId);
      } catch (verifyErr) {
        console.warn('Contract view check warning:', verifyErr);
      }

      // Prepare unified NFT data for backend and local caching
      const nftData = {
        tokenId,
        title: metadata.name,
        description: metadata.description,
        ipfsHash: imageHash,
        price: price.toString(),
        artistAddress: artistAddress.toLowerCase(),
        galleryAddress: validGalleryAddress.toLowerCase(),
        metadata,
        contractAddress: ARTBLOCK_NFT_ADDRESS.toLowerCase(),
        network: 'hardhat',
        isListed: true,
        image: getIPFSUrl(imageHash),
        transactionHash: tx.hash
      };

      // 1. Persist locally in localStorage so it never disappears on refresh
      try {
        const localList = JSON.parse(localStorage.getItem('mintedNFTs') || '[]');
        const updatedList = [nftData, ...localList.filter(n => n.tokenId !== tokenId)];
        localStorage.setItem('mintedNFTs', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Could not cache to local storage:', e);
      }

      // 2. Persist in backend database
      try {
        await axiosInstance.post('/api/nfts', nftData);
      } catch (storageError) {
        console.error('NFT database persistence notice:', storageError?.response?.data || storageError.message);
      }

      // Dispatch global events so gallery and dashboards reload smoothly
      window.dispatchEvent(new CustomEvent('gallery-updated'));
      window.dispatchEvent(new CustomEvent('nft-minted', { detail: nftData }));

      return {
        receipt,
        tokenId,
        owner,
        tokenURI,
        transactionHash: tx.hash,
        contractAddress: ARTBLOCK_NFT_ADDRESS,
        metadata,
        image: getIPFSUrl(imageHash)
      };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getArtistNFTs = async (artistAddress) => {
    if (!artistAddress || !isAddress(artistAddress) || !window.ethereum) return [];
    try {
      const normalizedAddress = getAddress(artistAddress);
      const { contract } = await getContract();
      
      // Query on-chain ArtworkMinted events
      let events = [];
      try {
        events = await contract.queryFilter(contract.filters.ArtworkMinted(null, normalizedAddress));
      } catch (e) {
        console.warn('Filtered query failed, querying all mint events:', e);
        const allEvents = await contract.queryFilter(contract.filters.ArtworkMinted());
        events = allEvents.filter(ev => ev.args?.artist?.toLowerCase() === normalizedAddress.toLowerCase());
      }

      const results = [];
      for (const event of events) {
        const tokenId = event.args.tokenId.toString();
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() !== normalizedAddress.toLowerCase()) continue;
          
          let tokenURI = '';
          try {
            tokenURI = await contract.tokenURI(tokenId);
          } catch (_) {}

          let artworkDetails = null;
          try {
            artworkDetails = await contract.artworks(tokenId);
          } catch (_) {}

          const rawIpfs = event.args.ipfsHash;
          results.push({
            tokenId,
            artist: owner,
            title: artworkDetails?.title || `Artwork #${tokenId}`,
            description: artworkDetails?.description || '',
            ipfsHash: rawIpfs,
            price: formatEther(event.args.price),
            image: getIPFSUrl(rawIpfs),
            tokenURI,
            contractAddress: ARTBLOCK_NFT_ADDRESS,
            isListed: artworkDetails ? artworkDetails.isListed : true
          });
        } catch (tokenError) {
          console.error(`Unable to verify token ${tokenId}:`, tokenError);
        }
      }
      return results;
    } catch (err) {
      console.error('Unable to load on-chain NFTs:', err);
      return [];
    }
  };

  return { mintNFT, getArtistNFTs, loading, error };
};

export default useNFTContract;
