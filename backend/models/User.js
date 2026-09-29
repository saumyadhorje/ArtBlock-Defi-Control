import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    required: true,
    enum: ['artist', 'curator', 'investor']
  },
  // Add contract details
  contract: {
    address: {
      type: String,
      unique: true,
      sparse: true
    },
    deploymentDate: {
      type: Date
    },
    network: {
      type: String,
      default: 'sepolia'
    },
    totalMinted: {
      type: Number,
      default: 0
    },
    transactionHash: String,
    blockExplorerUrl: String,
    transactionId: String,
    deploymentStatus: {
      type: String,
      enum: ['pending', 'deployed', 'failed'],
      default: 'pending'
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  // Artist Profile Data
  profile: {
    displayName: {
      type: String,
      trim: true
    },
    followersCount: {
      type: Number,
      default: 0
    },
    artworksCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    },
    salesCount: {
      type: Number,
      default: 0
    },
    // Curator specific fields
    galleriesCount: {
      type: Number,
      default: 0
    },
    curatedArtworks: {
      type: Number,
      default: 0
    }
  },
  // Analytics Data
  analytics: {
    totalArtworksListed: {
      type: Number,
      default: 0
    },
    totalSalesValue: {
      type: Number,
      default: 0
    },
    averagePrice: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    // Curator specific fields
    totalGalleries: {
      type: Number,
      default: 0
    },
    totalArtistsCurated: {
      type: Number,
      default: 0
    },
    totalVisitors: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    mostPopularGallery: String,
    topArtist: String,
    avgVisitDuration: {
      type: Number,
      default: 0
    }
  },
  // Distribution Settings
  distributionSettings: {
    galleryShare: {
      type: Number,
      default: 10 // Default 10%
    },
    artistShare: {
      type: Number,
      default: 85 // Default 85%
    },
    platformFee: {
      type: Number,
      default: 5 // Default 5%
    }
  },
  galleries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallery'
  }]
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords for user:', this.username);
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

export default mongoose.model('User', userSchema);