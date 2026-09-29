import express from 'express';
import { 
    createGallery,
    getGalleryDetails,
    claimGalleryRevenue,
    getCuratorGalleries,
    updateGalleryStats
} from '../controllers/galleryController.js';
import { authenticateCurator, authenticateToken } from '../middleware/auth.js';
import { 
    validateGalleryOwnership,
    validateGalleryStatus,
    validateGalleryRevenue 
} from '../middleware/galleryValidation.js';
import Gallery from '../models/Gallery.js';

const router = express.Router();

// Public routes
router.get('/galleries/:galleryId', getGalleryDetails);

// Get gallery submissions
router.get('/galleries/:galleryId/submissions', async (req, res) => {
  try {
    const { galleryId } = req.params;
    console.log('Fetching submissions for gallery:', galleryId);
    
    const gallery = await Gallery.findById(galleryId)
      .populate({
        path: 'submissions.nftId',
        model: 'NFT',
        select: 'tokenId title description ipfsHash price artistAddress'
      });

    if (!gallery) {
      console.log('Gallery not found:', galleryId);
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Format submissions with NFT data
    const submissions = gallery.submissions.map(sub => {
      const nftData = sub.nftId ? sub.nftId.toObject() : {};
      return {
        ...sub.toObject(),
        ...nftData,
        _id: sub._id, // Ensure we keep the submission ID
        status: sub.status,
        submittedAt: sub.submittedAt
      };
    });

    console.log('Formatted submissions:', submissions);
    res.json(submissions);

  } catch (error) {
    console.error('Error fetching gallery submissions:', error);
    res.status(500).json({ 
      message: 'Error fetching gallery submissions',
      error: error.message 
    });
  }
});

// Protected routes
router.use(authenticateToken);
router.post('/galleries/create', authenticateCurator, async (req, res) => {
    try {
        console.log(' Create Gallery Request:', {
            body: req.body,
            curator: req.user._id
        });

        const gallery = await createGallery(req);
        
        console.log(' Gallery created:', {
            id: gallery._id,
            name: gallery.name,
            curator: gallery.curator
        });

        res.status(201).json({
            success: true,
            gallery
        });

    } catch (error) {
        console.error(' Gallery creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
router.get('/curator/galleries', authenticateCurator, getCuratorGalleries);

// Gallery-specific routes
router.post(
  '/galleries/:galleryId/claim',
  authenticateCurator,
  validateGalleryOwnership,
  validateGalleryStatus,
  validateGalleryRevenue,
  claimGalleryRevenue
);

router.patch(
  '/galleries/:galleryId/stats',
  authenticateToken,
  updateGalleryStats
);

// Get gallery details (authenticated)
router.get('/galleries/:galleryId/details', authenticateToken, async (req, res) => {
  try {
    const { galleryId } = req.params;
    const gallery = await Gallery.findById(galleryId)
      .populate('curator', 'username walletAddress')
      .populate('artists', 'username walletAddress')
      .populate({
        path: 'submissions.nftId',
        model: 'NFT'
      });

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery details:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 