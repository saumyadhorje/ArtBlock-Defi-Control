import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNFTContract from '../hooks/useNFTContract';
import { Upload, X, Image as ImageIcon, DollarSign, Type, FileText, Home } from 'react-feather';
import { ethers } from 'ethers';
import { parseEther, formatEther } from 'ethers';

const CreateNFTModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    galleryAddress: ''
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState('');
  const { mintNFT, loading, error: contractError } = useNFTContract();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setLocalError('');
    } else {
      setLocalError('Please select a valid image file');
    }
  };

  const validatePrice = (price) => {
    if (isNaN(price) || price <= 0) {
      setLocalError('Please enter a valid price greater than 0');
      return false;
    }
    if (price > 1000) {
      setLocalError('Price cannot exceed 1000 ETH');
      return false;
    }
    return true;
  };

  const validateGalleryAddress = (address) => {
    try {
      // Simple regex for Ethereum address format
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      
      if (!addressRegex.test(address)) {
        setLocalError('Invalid gallery address format. Must be a valid Ethereum address.');
        return false;
      }

      // Additional check to ensure it's not the zero address
      if (address === '0x0000000000000000000000000000000000000000') {
        setLocalError('Cannot use zero address as gallery address');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Gallery address validation error:', error);
      setLocalError('Invalid gallery address');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      // Validate image
      if (!formData.image) {
        setLocalError('Please select an image file');
        return;
      }

      // Validate gallery address
      if (!validateGalleryAddress(formData.galleryAddress)) {
        return;
      }

      // Validate price
      const priceInEth = parseFloat(formData.price);
      if (!validatePrice(priceInEth)) {
        return;
      }

      console.log('Attempting to mint with gallery:', formData.galleryAddress);

      // Create mint data - keep price in ETH format
      const mintData = {
        ...formData,
        price: priceInEth.toString() // Keep original ETH value
      };

      console.log('Minting with data:', {
        ...mintData,
        imageSize: formData.image.size,
        imageType: formData.image.type,
        galleryAddress: formData.galleryAddress,
        priceInEth: priceInEth,
        priceInWei: parseEther(priceInEth.toString()).toString()
      });

      const receipt = await mintNFT(mintData, formData.galleryAddress);
      console.log("Mint receipt:", receipt);

      // Extract token ID from events
      const mintEvent = receipt.logs.find(
        log => log.fragment?.name === 'ArtworkMinted'
      );

      if (!mintEvent) {
        console.error('Full receipt:', receipt);
        throw new Error('Minting event not found in transaction receipt');
      }

      // Get the token ID and convert it to a number
      const tokenId = mintEvent.args[0].toString();
      console.log('Minted NFT Details:', {
        tokenId,
        price: priceInEth,
        title: formData.title,
        description: formData.description
      });
      
      // Store the token ID in localStorage for testing
      const existingNFTs = JSON.parse(localStorage.getItem('mintedNFTs') || '[]');
      existingNFTs.push({
        tokenId,
        price: priceInEth,
        title: formData.title,
        description: formData.description,
        ipfsHash: receipt.ipfsHash // Assuming this is returned
      });
      localStorage.setItem('mintedNFTs', JSON.stringify(existingNFTs));

      alert(`NFT minted successfully!\nToken ID: ${tokenId}\nPrice: ${priceInEth} ETH`);
      onClose();

    } catch (err) {
      console.error('Minting error:', err);
      setLocalError(err.message || 'Failed to mint NFT');
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    
    // Allow empty input or numbers with up to 18 decimal places
    if (value === '' || /^\d*\.?\d{0,18}$/.test(value)) {
      setFormData(prev => ({ ...prev, price: value }));
      setLocalError('');
      
      console.log('Price input:', {
        value,
        inEth: value ? parseFloat(value) : 0,
        inWei: value ? parseEther(value).toString() : '0'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center 
          justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-6xl 
            w-full backdrop-blur-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white font-['Space_Grotesk'] 
              flex items-center gap-3"
            >
              <div className="p-2 bg-[#6366F1]/10 rounded-xl">
                <ImageIcon className="w-6 h-6 text-[#6366F1]" />
              </div>
              Create NFT
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors 
                text-white/60 hover:text-white"
            >
              <X size={24} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-8">
            {/* Left Column - Image Upload */}
            <div className="w-1/2">
              <div className="relative group h-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="nft-image"
                />
                <label htmlFor="nft-image" className="block cursor-pointer h-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`h-full rounded-xl border border-white/10 
                      bg-white/[0.02] backdrop-blur-lg group-hover:border-[#6366F1]/40 
                      transition-all flex items-center justify-center
                      ${previewUrl ? 'p-0' : 'p-4'}`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="NFT Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <Upload className="mx-auto text-white/40" size={48} />
                        <p className="text-white/60 text-lg font-['Plus_Jakarta_Sans']">
                          Drop your artwork here
                          <br />or click to browse
                        </p>
                      </div>
                    )}
                  </motion.div>
                </label>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="w-1/2 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm 
                  font-['Plus_Jakarta_Sans'] mb-2"
                >
                  <Type size={16} />
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 bg-white/[0.02] border border-white/10 
                    rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                    focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                    font-['Space_Grotesk']"
                  placeholder="Enter NFT title"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white/60 text-sm 
                  font-['Plus_Jakarta_Sans'] mb-2"
                >
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 bg-white/[0.02] border border-white/10 
                    rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                    focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                    min-h-[120px] font-['Plus_Jakarta_Sans']"
                  placeholder="Describe your NFT"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm 
                    font-['Plus_Jakarta_Sans'] mb-2"
                  >
                    <DollarSign size={16} />
                    Price (ETH)
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    className="w-full p-4 bg-white/[0.02] border border-white/10 
                      rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                      focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                      font-['Space_Grotesk']"
                    placeholder="0.00"
                    required
                  />
                  {formData.price && (
                    <p className="text-[#6366F1] text-sm mt-2 font-['Plus_Jakarta_Sans']">
                      ≈ ${(parseFloat(formData.price) * 2500).toLocaleString()} USD
                      <br />
                      <span className="text-xs text-white/40">
                        {parseEther(formData.price || '0').toString()} Wei
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm 
                    font-['Plus_Jakarta_Sans'] mb-2"
                  >
                    <Home size={16} />
                    Gallery Address
                  </label>
                  <input
                    type="text"
                    value={formData.galleryAddress}
                    onChange={(e) => {
                      const address = e.target.value.trim();
                      setFormData(prev => ({ ...prev, galleryAddress: address }));
                      if (localError && localError.includes('gallery')) {
                        setLocalError('');
                      }
                    }}
                    className="w-full p-4 bg-white/[0.02] border border-white/10 
                      rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                      focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                      font-['Space_Grotesk']"
                    placeholder="0x..."
                    required
                  />
                  <p className="text-white/40 text-xs mt-2">
                    Enter the complete Ethereum address of a registered gallery (starting with 0x)
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {(localError || contractError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl 
                    text-red-500 text-sm font-medium font-['Plus_Jakarta_Sans']"
                >
                  {localError || contractError}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-white/10 rounded-xl font-bold 
                    text-white/60 hover:text-white hover:border-white/30 transition-all 
                    font-['Space_Grotesk']"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#6366F1] text-white rounded-xl font-bold 
                    hover:bg-[#5457E5] transition-all disabled:opacity-50 
                    disabled:cursor-not-allowed font-['Space_Grotesk'] flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                      />
                      Creating...
                    </>
                  ) : (
                    <>Create NFT</>
                  )}
                </motion.button>
              </div>
            </div>
          </form>

          {/* Background Decoration */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-0 right-0 w-72 h-72 bg-[#6366F1]/10 
              rounded-full blur-3xl -z-10"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateNFTModal; 