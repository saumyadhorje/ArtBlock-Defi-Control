import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    required: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  seller: {
    type: String,
    required: true,
    lowercase: true
  },
  buyer: {
    type: String,
    required: true,
    lowercase: true
  },
  price: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  paymentSplits: {
    artist: {
      address: String,
      amount: String
    },
    gallery: {
      address: String,
      amount: String
    },
    platform: {
      amount: String
    }
  },
  gasInfo: {
    gasUsed: String,
    gasPrice: String,
    totalGasCost: String
  }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema); 