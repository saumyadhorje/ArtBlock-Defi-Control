import express from 'express';
import { 
  getCuratorDashboard, 
  getAllGalleries,
  getCuratorGalleries
} from '../controllers/curatorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all galleries (public route, no auth required)
router.get('/galleries', getAllGalleries);

// Get galleries for a specific curator (requires auth)
router.get('/galleries/:curatorId', authenticateToken, getCuratorGalleries);

// Get curator dashboard (requires auth)
router.get('/dashboard/:id', authenticateToken, getCuratorDashboard);

export default router; 