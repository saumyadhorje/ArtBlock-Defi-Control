import express from 'express';
import { 
  getDashboardData, 
  addToWatchlist, 
  removeFromWatchlist,
  recordInvestment,
  buyArtwork 
} from '../controllers/investorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are prefixed with /api/investor
router.use(authenticateToken);

// Get dashboard data
router.get('/dashboard/:id', authenticateToken, async (req, res) => {
  try {
    console.log(' Dashboard request:', {
      requestedId: req.params.id,
      authenticatedUserId: req.user?._id,
      userRole: req.user?.role
    });

    // Check if user exists and has correct role
    if (!req.user) {
      console.log(' No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'investor') {
      console.log(' Wrong role:', req.user.role);
      return res.status(403).json({ message: 'Investor access required' });
    }

    // Check if requesting own dashboard
    if (req.user._id.toString() !== req.params.id) {
      console.log(' ID mismatch:', {
        requested: req.params.id,
        authenticated: req.user._id
      });
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get dashboard data
    const dashboardData = await getDashboardData(req);
    
    console.log(' Dashboard data retrieved:', {
      hasProfile: !!dashboardData?.profile,
      hasAnalytics: !!dashboardData?.analytics,
      hasPortfolio: !!dashboardData?.portfolio
    });

    return res.json(dashboardData);

  } catch (error) {
    console.error(' Dashboard error:', error);
    return res.status(500).json({ 
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
});

// Watchlist management
router.post('/watchlist/add', addToWatchlist);
router.delete('/watchlist/remove/:nftId', removeFromWatchlist);

// Investment management
router.post('/investment/record', recordInvestment);

// Purchase functionality
router.post('/purchase/:nftId', authenticateToken, async (req, res) => {
  try {
    console.log('Purchase request received:', {
      nftId: req.params.nftId,
      userId: req.user.id,
      body: req.body
    });

    const result = await buyArtwork(
      req.params.nftId,  
      req.user,         
      req.body           
    );
    res.json(result);
  } catch (error) {
    console.error('Purchase route error:', error);
    res.status(500).json({ 
      message: error.message || 'Error processing purchase',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;