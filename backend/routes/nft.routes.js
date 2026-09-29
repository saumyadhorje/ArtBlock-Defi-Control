import express from 'express';
import NFT from '../models/nft.model.js';
import Gallery from '../models/Gallery.js';

const router = express.Router();

router.post('/nfts', async (req, res) => {
  try {
    const {
      tokenId,
      title,
      description,
      ipfsHash,
      price,
      artistAddress,
      galleryAddress,
      contractAddress,
      metadata,
      network = 'linea-sepolia',
      isListed = true
    } = req.body;

    // Validate required fields
    if (!tokenId || !contractAddress || !artistAddress || !galleryAddress) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['tokenId', 'contractAddress', 'artistAddress', 'galleryAddress']
      });
    }

    // Check for existing NFT
    const existingNFT = await NFT.findOne({ 
      tokenId, 
      contractAddress: contractAddress.toLowerCase() 
    });

    if (existingNFT) {
      return res.status(400).json({ 
        message: 'NFT already exists' 
      });
    }

    // Create new NFT
    const nft = new NFT({
      tokenId,
      title,
      description,
      ipfsHash,
      price,
      artistAddress: artistAddress.toLowerCase(),
      galleryAddress: galleryAddress.toLowerCase(),
      contractAddress: contractAddress.toLowerCase(),
      metadata,
      network,
      isListed
    });

    await nft.save();
    console.log('NFT stored successfully:', nft);
    res.status(201).json(nft);

  } catch (err) {
    console.error('Error storing NFT:', err);
    res.status(500).json({ 
      message: 'Failed to store NFT', 
      error: err.message 
    });
  }
});

router.get('/nfts/artist/:address', async (req, res) => {
  try {
    const nfts = await NFT.find({ 
      artistAddress: req.params.address.toLowerCase() 
    }).sort({ createdAt: -1 });
    res.json(nfts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 

router.get('/nfts/gallery/:address', async (req, res) => {
  try {
    const nfts = await NFT.find({ 
      galleryAddress: req.params.address.toLowerCase() 
    }).sort({ createdAt: -1 });
    res.json(nfts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/nfts/:tokenId/submit', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { 
      galleryId,
      description,
      title,
      ipfsHash,
      price,
      artistAddress,
      contractAddress,
      metadata 
    } = req.body;

    console.log('Received submission request:', {
      tokenId,
      galleryId,
      artistAddress,
      contractAddress
    });

    // Validate required fields
    if (!tokenId || !galleryId || !artistAddress || !contractAddress) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['tokenId', 'galleryId', 'artistAddress', 'contractAddress'],
        received: { tokenId, galleryId, artistAddress, contractAddress }
      });
    }

    // Find the gallery
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Update or create NFT document
    const nft = await NFT.findOneAndUpdate(
      { 
        tokenId,
        contractAddress: contractAddress.toLowerCase()
      },
      {
        $set: {
          title,
          description,
          ipfsHash,
          price,
          artistAddress: artistAddress.toLowerCase(),
          galleryAddress: gallery.galleryAddress.toLowerCase(),
          metadata,
          isListed: true,
          submittedAt: new Date()
        }
      },
      { 
        new: true,
        upsert: true
      }
    );

    // Add NFT to gallery's submissions if not already present
    await Gallery.findByIdAndUpdate(
      galleryId,
      {
        $addToSet: {
          submissions: {
            nftId: nft._id,
            tokenId,
            description,
            status: 'pending',
            submittedAt: new Date()
          }
        }
      }
    );

    console.log('NFT submitted to gallery successfully:', nft);
    res.status(200).json(nft);

  } catch (err) {
    console.error('Error submitting NFT to gallery:', err);
    res.status(500).json({ 
      message: 'Failed to submit NFT to gallery', 
      error: err.message 
    });
  }
});

export default router; 