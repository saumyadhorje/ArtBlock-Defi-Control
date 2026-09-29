import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const curatorSchema = new mongoose.Schema({
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
    default: 'curator',
    immutable: true
  },
  contract: {
    network: {
      type: String,
      default: 'sepolia'
    },
    galleries: [{
      address: String,
      name: String,
      status: String,
      createdAt: Date
    }],
    totalRevenue: {
      type: String,
      default: "0"
    },
    pendingRevenue: {
      type: String,
      default: "0"
    }
  },
  profile: {
    displayName: String,
    bio: String,
    avatar: String,
    socialLinks: {
      twitter: String,
      instagram: String,
      website: String
    },
    galleriesCount: {
      type: Number,
      default: 0
    }
  },
  analytics: {
    totalArtistsCurated: {
      type: Number,
      default: 0
    },
    totalArtworksSold: {
      type: Number,
      default: 0
    },
    totalVisitors: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Add comparePassword method to curator schema
curatorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Add password hashing middleware
curatorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Curator = mongoose.model('Curator', curatorSchema);
export default Curator; 