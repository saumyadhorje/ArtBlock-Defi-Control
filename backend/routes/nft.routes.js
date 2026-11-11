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

    // Upsert NFT so re-indexing or re-minting updates cleanly without 400 error
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
          galleryAddress: galleryAddress.toLowerCase(),
          metadata,
          network,
          isListed
        }
      },
      { new: true, upsert: true }
    );

    // Optionally auto-link to matching Gallery if galleryAddress is registered
    try {
      const gallery = await Gallery.findOne({ galleryAddress: galleryAddress.toLowerCase() });
      if (gallery) {
        await Gallery.findByIdAndUpdate(gallery._id, {
          $addToSet: {
            submissions: {
              nftId: nft._id,
              tokenId,
              description: description || 'Minted via ArtBlock',
              status: 'approved',
              submittedAt: new Date()
            }
          },
          $inc: { 'stats.artworkCount': 1 }
        });
      }
    } catch (galErr) {
      console.warn('Could not auto-link NFT to gallery:', galErr.message);
    }

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
// Public marketplace: show listed NFTs from the local ArtBlock contract
router.get('/nfts/marketplace', async (req, res) => {
  try {
    const nfts = await NFT.find({
      isListed: true,
      contractAddress: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
    }).sort({ createdAt: -1 });

    res.json(nfts);
  } catch (err) {
    console.error('Marketplace fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
// Sync a confirmed blockchain purchase with MongoDB
router.post('/nfts/:tokenId/purchase-sync', async (req, res) => {
  try {
    const { buyer, transactionHash, price } = req.body;
    const tokenId = Number(req.params.tokenId);

    if (
      !Number.isInteger(tokenId) ||
      !buyer ||
      !/^0x[a-fA-F0-9]{40}$/.test(buyer) ||
      !transactionHash ||
      price === undefined
    ) {
      return res.status(400).json({
        message: 'Invalid purchase details'
      });
    }

    const nft = await NFT.findOneAndUpdate(
      {
        tokenId,
        contractAddress: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
        isListed: true
      },
      {
        $set: {
          isListed: false,
          owner: buyer.toLowerCase(),
          lastSalePrice: String(price),
          lastSaleDate: new Date()
        }
      },
      { new: true }
    );

    if (!nft) {
      return res.status(404).json({
        message: 'Listed NFT not found or already sold'
      });
    }

    console.log('Purchase synced:', {
      tokenId,
      buyer,
      transactionHash
    });

    res.json({
      message: 'Purchase synced successfully',
      nft
    });
  } catch (err) {
    console.error('Purchase sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get NFTs owned by a buyer
router.get('/nfts/purchased/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();

    if (!/^0x[a-f0-9]{40}$/.test(address)) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }

    const nfts = await NFT.find({
      owner: address,
      isListed: false,
      contractAddress: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
    }).sort({ lastSaleDate: -1 });

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