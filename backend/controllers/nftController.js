import NFT from '../models/nft.model.js';
import Gallery from '../models/gallery.model.js';
import { ethers } from 'ethers';
import contractABI from '../contracts/ArtBlockNFT.json';

export const createNFT = async (req, res) => {
    try {
        const { 
            tokenId,
            title,
            description,
            ipfsHash,
            price,
            artistAddress,
            galleryAddress,
            metadata,
            contractAddress,
            network
        } = req.body;

        // Check if NFT already exists
        const existingNFT = await NFT.findOne({ tokenId });
        if (existingNFT) {
            return res.status(400).json({ 
                message: 'NFT already exists' 
            });
        }

        // Create new NFT document
        const nft = new NFT({
            tokenId,
            title,
            description,
            ipfsHash,
            price,
            artistAddress: artistAddress.toLowerCase(),
            galleryAddress: galleryAddress.toLowerCase(),
            metadata,
            contractAddress: contractAddress.toLowerCase(),
            network,
            isListed: true,
            createdAt: new Date()
        });

        await nft.save();

        // Update gallery stats if gallery address is provided
        if (galleryAddress) {
            await Gallery.findOneAndUpdate(
                { galleryAddress: galleryAddress.toLowerCase() },
                { 
                    $inc: { 
                        'stats.artworksCount': 1 
                    }
                }
            );
        }

        console.log('NFT stored in database:', nft);
        res.status(201).json(nft);
    } catch (error) {
        console.error('Error creating NFT:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getArtistNFTs = async (req, res) => {
    try {
        const { address } = req.params;
        console.log('Fetching NFTs for artist address:', address);

        const nfts = await NFT.find({ 
            artistAddress: address.toLowerCase() 
        }).sort({ createdAt: -1 });

        console.log('Found NFTs:', nfts);
        res.json(nfts);
    } catch (error) {
        console.error('Error fetching artist NFTs:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getGalleryNFTs = async (req, res) => {
    try {
        const { address } = req.params;
        console.log('Fetching NFTs for gallery address:', address);

        const nfts = await NFT.find({ 
            galleryAddress: address.toLowerCase() 
        }).sort({ createdAt: -1 });

        console.log('Found NFTs:', nfts);
        res.json(nfts);
    } catch (error) {
        console.error('Error fetching gallery NFTs:', error);
        res.status(500).json({ message: error.message });
    }
};

export const mintArtwork = async (req, res) => {
    try {
        const { artist, gallery, uri, price } = req.body;

        // Setup blockchain connection
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(
            process.env.ARTBLOCK_CONTRACT_ADDRESS,
            contractABI.abi,
            signer
        );

        // Mint the NFT
        const tx = await contract.mintArtwork(artist, gallery, uri, ethers.parseEther(price));
        const receipt = await tx.wait();

        // Extract the tokenId from the event
        const event = receipt.events.find((e) => e.event === 'ArtworkMinted');
        const mintedTokenId = event.args.tokenId.toNumber();

        // Save NFT to the database
        const newNFT = new NFT({
            artist,
            gallery,
            uri,
            price,
            tokenId: mintedTokenId, 
            isListed: true,
           
        });

        await newNFT.save();

        res.status(201).json({ success: true, tokenId: mintedTokenId });
    } catch (error) {
        console.error('Minting error:', error);
        res.status(500).json({ success: false, message: 'Minting failed' });
    }
}; 