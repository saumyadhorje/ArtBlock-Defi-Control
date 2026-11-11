import Investor from '../models/Investor.js';
import NFT from '../models/nft.model.js';
import Transaction from '../models/Transaction.js';
import Gallery from '../models/Gallery.js';
import User from '../models/User.js';

// Get investor dashboard data
const getDashboardData = async (req) => {
  try {
    console.log(' Finding investor:', req.user._id);

    const investor = await Investor.findById(req.user._id)
      .populate('portfolio.watchlist')
      .populate('portfolio.ownedNFTs')
      .populate({
        path: 'portfolio.investmentHistory.nftId',
        model: 'NFT'
      });

    if (!investor) {
      console.log(' Investor not found:', req.user._id);
      throw new Error('Investor not found');
    }

    console.log(' Investor found, calculating analytics...');

    // Calculate additional analytics
    const portfolioValue = investor.portfolio.ownedNFTs.reduce(
      (total, nft) => total + (nft.currentPrice || 0), 
      0
    );

    const totalROI = investor.portfolio.investmentHistory.reduce(
      (total, investment) => total + (investment.roi || 0),
      0
    );

    // Update analytics
    investor.analytics = {
      ...investor.analytics,
      portfolioValue,
      totalROI,
      totalInvested: investor.analytics?.totalInvested || 0,
      activeInvestments: investor.portfolio?.ownedNFTs?.length || 0
    };

    await investor.save();

    console.log(' Returning dashboard data:', {
      hasProfile: !!investor.profile,
      hasAnalytics: !!investor.analytics,
      portfolioNFTs: investor.portfolio?.ownedNFTs?.length || 0
    });

    return {
      profile: {
        displayName: investor.profile?.displayName || 'Investor',
        investmentsCount: investor.portfolio?.ownedNFTs?.length || 0,
        portfolioValue,
        totalReturns: totalROI,
        role: 'investor',
        badges: investor.profile?.badges || ['💼']
      },
      analytics: {
        totalInvested: investor.analytics?.totalInvested || 0,
        totalROI,
        activeInvestments: investor.portfolio?.ownedNFTs?.length || 0,
        portfolioValue
      },
      portfolio: {
        investments: investor.portfolio?.ownedNFTs || [],
        watchlist: investor.portfolio?.watchlist || []
      }
    };
  } catch (error) {
    console.error(' Error in getDashboardData:', error);
    throw error; // Let the route handler catch this
  }
};

// Add NFT to watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { nftId } = req.body;
    const investor = await Investor.findById(req.user.id);
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    if (investor.portfolio.watchlist.includes(nftId)) {
      return res.status(400).json({ message: 'NFT already in watchlist' });
    }

    investor.portfolio.watchlist.push(nftId);
    await investor.save();

    res.json({ message: 'Added to watchlist', watchlist: investor.portfolio.watchlist });
  } catch (error) {
    console.error('Error in addToWatchlist:', error);
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
};

// Remove NFT from watchlist
const removeFromWatchlist = async (req, res) => {
  try {
    const { nftId } = req.params;
    const investor = await Investor.findById(req.user.id);
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    investor.portfolio.watchlist = investor.portfolio.watchlist.filter(
      id => id.toString() !== nftId
    );
    await investor.save();

    res.json({ message: 'Removed from watchlist', watchlist: investor.portfolio.watchlist });
  } catch (error) {
    console.error('Error in removeFromWatchlist:', error);
    res.status(500).json({ message: 'Error removing from watchlist' });
  }
};

// Record new investment
const recordInvestment = async (req, res) => {
  try {
    const { nftId, purchasePrice } = req.body;
    const investor = await Investor.findById(req.user.id);
    
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    const investment = {
      nftId,
      purchasePrice,
      purchaseDate: new Date(),
      currentValue: purchasePrice,
      roi: 0
    };

    investor.portfolio.investmentHistory.push(investment);
    investor.portfolio.ownedNFTs.push(nftId);
    investor.analytics.totalInvested += purchasePrice;
    investor.analytics.totalTransactions += 1;
    investor.analytics.avgInvestmentSize = 
      investor.analytics.totalInvested / investor.analytics.totalTransactions;
    
    await investor.save();

    res.json({ 
      message: 'Investment recorded', 
      investment,
      analytics: investor.analytics 
    });
  } catch (error) {
    console.error('Error in recordInvestment:', error);
    res.status(500).json({ message: 'Error recording investment' });
  }
};


export const buyArtwork = async (nftId, buyer, data) => {
  try {
    console.log('Buyer purchase sync:', {
      nftId,
      buyerId: buyer._id,
      tokenId: data.tokenId,
      transactionHash: data.transactionHash
    });

    // 1. Prevent duplicate processing of the same blockchain transaction
    let transaction = await Transaction.findOne({
      transactionHash: data.transactionHash
    });

    // 2. Find the NFT record
    let nft = await NFT.findById(nftId);

    if (!nft) {
      nft = await NFT.findOne({ tokenId: data.tokenId });
    }

    if (!nft && data.nftData) {
      nft = new NFT({
        tokenId: data.tokenId,
        title: data.nftData.title,
        description: data.nftData.description,
        ipfsHash: data.nftData.ipfsHash,
        price: data.price,
        artistAddress: data.nftData.artistAddress,
        galleryAddress: data.nftData.galleryAddress,
        contractAddress: data.nftData.contractAddress,
        metadata: data.nftData.metadata || {
          name: data.nftData.title,
          description: data.nftData.description,
          image: `ipfs://${data.nftData.ipfsHash}`
        },
        owner: buyer.walletAddress,
        isListed: false
      });

      await nft.save();
    }

    if (!nft) {
      throw new Error(`NFT not found: ${nftId} / token ${data.tokenId}`);
    }

    // 3. Create transaction record only once
    if (!transaction) {
      transaction = new Transaction({
        nftId: nft._id,
        tokenId: data.tokenId,
        seller: nft.artistAddress,
        buyer: buyer.walletAddress,
        price: data.price,
        transactionHash: data.transactionHash,
        paymentSplits: {
          artist: {
            address: nft.artistAddress,
            amount: data.paymentSplits.artist
          },
          gallery: {
            address: nft.galleryAddress,
            amount: data.paymentSplits.gallery
          },
          platform: {
            amount: data.paymentSplits.platform
          }
        },
        gasInfo: data.gasInfo
      });

      await transaction.save();
    }

    // 4. Sync NFT ownership to MongoDB
    nft.isListed = false;
    nft.owner = buyer.walletAddress;
    nft.lastSalePrice = data.price;
    nft.lastSaleDate = nft.lastSaleDate || new Date();
    await nft.save();

    // 5. Add NFT to buyer's portfolio (the missing functionality)
    const investor = await Investor.findById(buyer._id);

    if (!investor) {
      throw new Error('Buyer investor account not found');
    }

    const alreadyOwned = investor.portfolio.ownedNFTs.some(
      id => id.toString() === nft._id.toString()
    );

    if (!alreadyOwned) {
      investor.portfolio.ownedNFTs.push(nft._id);

      investor.portfolio.investmentHistory.push({
        nftId: nft._id,
        purchasePrice: Number(data.price) / 1e18,
        purchaseDate: new Date(),
        currentValue: Number(data.price) / 1e18,
        roi: 0
      });

      investor.analytics.totalInvested =
        (investor.analytics.totalInvested || 0) + Number(data.price) / 1e18;

      investor.analytics.totalTransactions =
        (investor.analytics.totalTransactions || 0) + 1;

      investor.analytics.avgInvestmentSize =
        investor.analytics.totalInvested /
        investor.analytics.totalTransactions;

      await investor.save();
    }

    console.log('Buyer purchase sync completed');

    return {
      success: true,
      message: 'NFT purchased successfully',
      transaction: transaction.toObject(),
      nft: nft.toObject()
    };

  } catch (error) {
    console.error('Buyer purchase sync error:', error);
    throw error;
  }
};

// Helper function to update gallery analytics
const updateGalleryAnalytics = async (galleryId, { saleAmount, commission }) => {
  await Gallery.findByIdAndUpdate(galleryId, {
    $inc: {
      'stats.totalSales': 1,
      'stats.totalVolume': saleAmount,
      'stats.totalCommission': commission
    }
  });
};

// Helper function to update artist analytics
const updateArtistAnalytics = async (artistId, { saleAmount, earnings }) => {
  await User.findByIdAndUpdate(artistId, {
    $inc: {
      'analytics.totalSalesValue': saleAmount,
      'analytics.totalArtworksListed': -1,
      'analytics.totalRevenue': earnings
    }
  });
};

export {
  getDashboardData,
  addToWatchlist,
  removeFromWatchlist,
  recordInvestment
}; 