import express from 'express';
import { register, login } from '../services/authService.js';
import { randomBytes } from 'node:crypto';
import { verifyMessage, isAddress } from 'ethers';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Curator from '../models/Curator.js';
import Investor from '../models/Investor.js';


const router = express.Router();

// Temporary, one-time wallet-link challenges.
// They expire after 5 minutes and are consumed on confirmation.
const walletLinkChallenges = new Map();
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const findAccountByUsername = async (username) => {
  const normalizedUsername = username.trim();

  const [artist, curator, investor] = await Promise.all([
    User.findOne({ username: normalizedUsername }),
    Curator.findOne({ username: normalizedUsername }),
    Investor.findOne({ username: normalizedUsername })
  ]);

  const matches = [artist, curator, investor].filter(Boolean);

  // Refuse ambiguous accounts rather than updating the wrong one.
  if (matches.length > 1) {
    throw new Error('Multiple accounts match this username. Contact support.');
  }

  return matches[0] || null;
};

const getAccountRole = (user) => {
  return user.role ||
    (user.constructor.modelName === 'Curator' ? 'curator' :
     user.constructor.modelName === 'Investor' ? 'investor' : 'artist');
};

const createAccountSession = (user) => {
  const role = getAccountRole(user);

  const token = jwt.sign(
    {
      id: user._id,
      role,
      walletAddress: user.walletAddress
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      role,
      walletAddress: user.walletAddress,
      profile: user.profile
    }
  };
};

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
    //console.log('Full request body:', req.body);
    
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
// Step 1: Verify account credentials and issue a one-time challenge.
router.post('/wallet-link/challenge', async (req, res) => {
  try {
    const { username, password, walletAddress } = req.body;

    if (
      typeof username !== 'string' ||
      !username.trim() ||
      typeof password !== 'string' ||
      !password ||
      typeof walletAddress !== 'string' ||
      !isAddress(walletAddress)
    ) {
      return res.status(400).json({
        message: 'Enter your username and password and connect a valid wallet.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Authentication is not configured correctly.'
      });
    }

    const user = await findAccountByUsername(username);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const nonce = randomBytes(32).toString('hex');
    const challengeId = randomBytes(32).toString('hex');

    const message = [
      'ArtBlock Wallet Linking',
      '',
      'Action: Link this wallet to your existing ArtBlock account.',
      `Wallet: ${normalizedWallet}`,
      `Nonce: ${nonce}`,
      'This signature proves wallet ownership; it does not authorize a blockchain transaction.'
    ].join('\n');

    walletLinkChallenges.set(challengeId, {
      userId: user._id.toString(),
      modelName: user.constructor.modelName,
      walletAddress: normalizedWallet,
      message,
      expiresAt: Date.now() + CHALLENGE_TTL_MS
    });

    return res.json({ challengeId, message });
  } catch (error) {
    console.error('Wallet-link challenge failed:', error.message);
    return res.status(400).json({
      message: error.message || 'Could not start wallet linking.'
    });
  }
});

// Step 2: Verify the MetaMask signature, check conflicts, then update the account.
router.post('/wallet-link/confirm', async (req, res) => {
  try {
    const { challengeId, signature } = req.body;

    if (
      typeof challengeId !== 'string' ||
      typeof signature !== 'string'
    ) {
      return res.status(400).json({
        message: 'A challenge and wallet signature are required.'
      });
    }

    const challenge = walletLinkChallenges.get(challengeId);

    if (!challenge) {
      return res.status(400).json({
        message: 'Challenge is invalid or already used. Please try again.'
      });
    }

    // Consume it immediately so it cannot be replayed.
    walletLinkChallenges.delete(challengeId);

    if (Date.now() > challenge.expiresAt) {
      return res.status(400).json({
        message: 'Challenge expired. Please try again.'
      });
    }

    let recoveredAddress;

    try {
      recoveredAddress = verifyMessage(challenge.message, signature);
    } catch {
      return res.status(401).json({
        message: 'Invalid wallet signature.'
      });
    }

    if (recoveredAddress.toLowerCase() !== challenge.walletAddress) {
      return res.status(401).json({
        message: 'The signature does not match the connected wallet.'
      });
    }

    const models = { User, Curator, Investor };
    const AccountModel = models[challenge.modelName];

    if (!AccountModel) {
      return res.status(400).json({
        message: 'Unsupported account type.'
      });
    }

    const user = await AccountModel.findById(challenge.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Your ArtBlock account could not be found.'
      });
    }

    // Check every collection. Never take a wallet away from another account.
    const [artistConflict, curatorConflict, investorConflict] =
      await Promise.all([
        User.findOne({ walletAddress: challenge.walletAddress }),
        Curator.findOne({ walletAddress: challenge.walletAddress }),
        Investor.findOne({ walletAddress: challenge.walletAddress })
      ]);

    const conflicts = [artistConflict, curatorConflict, investorConflict]
      .filter(Boolean)
      .filter(account =>
        !(
          account.constructor.modelName === challenge.modelName &&
          account._id.toString() === challenge.userId
        )
      );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: 'This wallet is already linked to another ArtBlock account.'
      });
    }

    user.walletAddress = challenge.walletAddress;
    await user.save();

    return res.json(createAccountSession(user));
  } catch (error) {
    console.error('Wallet-link confirmation failed:', error.message);
    return res.status(500).json({
      message: 'Could not complete wallet linking. Please try again.'
    });
  }
});
// Test auth route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

export default router; 