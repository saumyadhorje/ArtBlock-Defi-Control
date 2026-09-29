import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const investorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'investor'
  },
  profile: {
    displayName: String,
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    investmentsCount: { type: Number, default: 0 },
    badges: [String],
    bio: String,
    avatar: String
  },
  analytics: {
    totalInvested: { type: Number, default: 0 },
    totalROI: { type: Number, default: 0 },
    portfolioValue: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    avgInvestmentSize: { type: Number, default: 0 },
    topPerformingArtist: { type: String, default: 'N/A' },
    bestROI: { type: Number, default: 0 }
  },
  portfolio: {
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NFT' }],
    ownedNFTs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NFT' }],
    investmentHistory: [{
      nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'NFT' },
      purchasePrice: Number,
      purchaseDate: Date,
      currentValue: Number,
      roi: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password comparison method
investorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Investor = mongoose.model('Investor', investorSchema);

export default Investor;