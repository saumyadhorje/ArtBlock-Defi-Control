import User from '../models/User.js';
import Curator from '../models/Curator.js';
import Investor from '../models/Investor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (username, password, walletAddress, role) => {
  try {
    // Check if user exists across all roles
    const existingUser = await Promise.all([
      User.findOne({ $or: [{ username }, { walletAddress }] }),
      Curator.findOne({ $or: [{ username }, { walletAddress }] }),
      Investor.findOne({ $or: [{ username }, { walletAddress }] })
    ]);

    if (existingUser.some(user => user !== null)) {
      throw new Error('Username or wallet address already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'curator') {
      user = new Curator({
        username,
        password: hashedPassword,
        walletAddress: walletAddress.toLowerCase(),
        profile: {
          displayName: username,
          followersCount: 0,
          galleriesCount: 0,
          followingCount: 0,
          curatedArtworks: 0
        },
        analytics: {
          totalGalleries: 0,
          totalArtistsCurated: 0,
          totalVisitors: 0,
          totalRevenue: 0,
          mostPopularGallery: 'N/A',
          topArtist: 'N/A',
          avgVisitDuration: 15
        },
        contract: {
          network: 'sepolia',
          totalMinted: 0,
          deploymentStatus: 'pending'
        }
      });
    } else if (role === 'investor') {
      user = new Investor({
        username,
        password: hashedPassword,
        walletAddress: walletAddress.toLowerCase(),
        profile: {
          displayName: username,
          followersCount: 0,
          followingCount: 0,
          investmentsCount: 0,
          badges: ['💎', '📈', '🚀']
        },
        analytics: {
          totalInvested: 0,
          totalROI: 0,
          portfolioValue: 0,
          totalTransactions: 0,
          avgInvestmentSize: 0,
          topPerformingArtist: 'N/A',
          bestROI: 0
        },
        portfolio: {
          watchlist: [],
          ownedNFTs: [],
          investmentHistory: []
        }
      });
    } else {
      user = new User({
        username,
        password: hashedPassword,
        walletAddress: walletAddress.toLowerCase(),
        role: 'artist',
        profile: {
          displayName: username,
          followersCount: 0,
          artworksCount: 0,
          followingCount: 0,
          salesCount: 0
        },
        analytics: {
          totalArtworksListed: 0,
          totalSalesValue: 0,
          averagePrice: 0,
          totalViews: 0,
          totalLikes: 0
        }
      });
    }

    await user.save();

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
        role: user.role,
        walletAddress: user.walletAddress,
        profile: user.profile
      }
    };
  } catch (error) {
    throw error;
  }
};

export const login = async (password, walletAddress) => {
  try {
    console.log('Login attempt for wallet:', walletAddress);

    // Check all collections for the user by wallet address
    let user = null;
    
    // Try to find user in any of the role collections using wallet address
    console.log('Searching for user by wallet address...');
    const [artistUser, curatorUser, investorUser] = await Promise.all([
      User.findOne({ walletAddress: walletAddress.toLowerCase() }),
      Curator.findOne({ walletAddress: walletAddress.toLowerCase() }),
      Investor.findOne({ walletAddress: walletAddress.toLowerCase() })
    ]);

    console.log('Search results:', {
      artistFound: !!artistUser,
      curatorFound: !!curatorUser,
      investorFound: !!investorUser
    });

    // Assign the first non-null user found
    user = artistUser || curatorUser || investorUser;

    if (!user) {
      console.log('No user found with wallet:', walletAddress);
      throw new Error('User not found');
    }

    console.log('User found:', {
      id: user._id,
      walletAddress: user.walletAddress,
      role: user.role || (user instanceof Curator ? 'curator' : user instanceof Investor ? 'investor' : 'artist')
    });

    console.log('Attempting password comparison...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const userRole = user.role || (user instanceof Curator ? 'curator' : user instanceof Investor ? 'investor' : 'artist');
    console.log('Determined user role:', userRole);

    const token = jwt.sign(
      { 
        id: user._id,
        role: userRole,
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
        role: userRole,
        walletAddress: user.walletAddress,
        profile: user.profile
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 