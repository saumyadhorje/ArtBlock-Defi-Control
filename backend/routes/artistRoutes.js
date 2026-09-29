import express from 'express';
import User from '../models/User.js';
import Artwork from '../models/Artwork.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Dashboard route
router.get('/dashboard/:walletAddress', authenticateToken, async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase(); 
    console.log('Fetching data for wallet:', walletAddress);

    // Find user by walletAddress
    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') } 
    });

    if (!user) {
      console.log('User not found for wallet:', walletAddress);
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Get artworks associated with this user
    const artworks = await Artwork.find({ 
      artist: user._id 
    }).sort({ createdAt: -1 });

    // Prepare dashboard data
    const dashboardData = {
      profile: {
        displayName: user.username || 'Artist',
        followersCount: user.profile?.followersCount || 0,
        artworksCount: artworks.length,
        followingCount: user.profile?.followingCount || 0,
        salesCount: user.profile?.salesCount || 0,
        role: user.role || 'Artist',
        badges: user.profile?.badges || ['🎨']
      },
      analytics: {
        totalArtworksListed: artworks.filter(art => art.isListed).length,
        totalSalesValue: user.analytics?.totalSalesValue || 0,
        averagePrice: user.analytics?.averagePrice || 0,
        totalViews: user.analytics?.totalViews || 0,
        totalLikes: user.analytics?.totalLikes || 0
      },
      distributionSettings: {
        artistShare: user.distributionSettings?.artistShare || 85,
        galleryShare: user.distributionSettings?.galleryShare || 10,
        platformFee: user.distributionSettings?.platformFee || 5
      },
      artworks
    };

    console.log('Sending dashboard data:', dashboardData);
    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
});

export default router; 