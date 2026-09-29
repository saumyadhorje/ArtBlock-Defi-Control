import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  curator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  galleryAddress: { type: String, required: true },
  theme: String,
  submissionGuidelines: String,
  coverImage: String,
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  artists: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  artworks: [{
    nft: { type: mongoose.Schema.Types.ObjectId, ref: 'NFT' },
    status: {
      type: String,
      enum: ['listed', 'sold', 'removed'],
      default: 'listed'
    }
  }],
  submissions: [{
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'NFT' },
    tokenId: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now }
  }],
  stats: {
    artistCount: { type: Number, default: 0 },
    artworkCount: { type: Number, default: 0 },
    visitorCount: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  revenue: {
    pendingPayout: { type: String, default: "0" },
    totalRevenue: { type: String, default: "0" }
  }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery; 