import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  ipfsHash: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  artistAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  galleryAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  metadata: {
    type: Object,
    required: true
  },
  network: {
    type: String,
    required: true,
    default: 'linea-sepolia'
  },
  isListed: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
nftSchema.index({ tokenId: 1, contractAddress: 1 }, { unique: true });
nftSchema.index({ artistAddress: 1 });
nftSchema.index({ galleryAddress: 1 });

const NFT = mongoose.model('NFT', nftSchema);
export default NFT; 