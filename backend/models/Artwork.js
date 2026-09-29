import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema({
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ipfsHash: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'listed', 'sold'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  gallery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallery'
  }
});

export default mongoose.model('Artwork', artworkSchema); 