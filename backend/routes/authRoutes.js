import express from 'express';
import { register, login } from '../services/authService.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, walletAddress, role } = req.body;
    
    if (!username || !password || !walletAddress || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    const result = await register(username, password, walletAddress, role);
    res.json(result);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    
    const { password, walletAddress } = req.body;
    
    // Validate input
    if (!password || !walletAddress) {
      console.log('Login validation failed:', {
        hasPassword: !!password,
        hasWallet: !!walletAddress,
        body: req.body
      });
      
      return res.status(400).json({ 
        message: 'Wallet address and password are required'
      });
    }

    console.log('Attempting login for wallet:', walletAddress);
    const result = await login(password, walletAddress);
    
    res.json(result);
  } catch (error) {
    console.error('Login route error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(400).json({ 
      message: error.message || 'Login failed'
    });
  }
});

// Test auth route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

export default router; 