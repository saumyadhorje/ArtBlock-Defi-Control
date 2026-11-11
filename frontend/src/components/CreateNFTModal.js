import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNFTContract from '../hooks/useNFTContract';
import { Upload, X, Image as ImageIcon, DollarSign, Type, FileText, Home, CheckCircle, ExternalLink } from 'react-feather';
import { parseEther, isAddress } from 'ethers';
import { ARTBLOCK_NFT_ADDRESS, DEFAULT_GALLERY_ADDRESS } from '../config';

const CreateNFTModal = ({ isOpen, onClose, initialArtwork = null }) => {
  const navigate = useNavigate();
  const DEFAULT_GALLERY = process.env.REACT_APP_DEFAULT_GALLERY_ADDRESS || DEFAULT_GALLERY_ADDRESS;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    galleryAddress: DEFAULT_GALLERY
  });
  
  const [previewUrl, setPreviewUrl] = useState(initialArtwork?.image || null);
  const [localError, setLocalError] = useState('');
  const [mintSuccessData, setMintSuccessData] = useState(null);
  const { mintNFT, loading, error: contractError } = useNFTContract();

  useEffect(() => {
    if (initialArtwork) {
      setFormData(prev => ({
        ...prev,
        image: initialArtwork.image,
        title: initialArtwork.title || prev.title,
        description: initialArtwork.description || prev.description,
        galleryAddress: prev.galleryAddress || DEFAULT_GALLERY
      }));
      setPreviewUrl(initialArtwork.image);
      setMintSuccessData(null);
    }
  }, [initialArtwork, DEFAULT_GALLERY]);

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
    if (isNaN(price) || price < 0) {
      setLocalError('Please enter a valid non-negative price');
      return false;
    }
    if (price > 1000) {
      setLocalError('Price cannot exceed 1000 ETH');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setMintSuccessData(null);

    try {
      if (!formData.image) {
        setLocalError('Please select or generate an image artwork');
        return;
      }

      if (!formData.title?.trim()) {
        setLocalError('NFT title is required');
        return;
      }

      const priceInEth = formData.price === '' ? 0 : parseFloat(formData.price);
      if (!validatePrice(priceInEth)) {
        return;
      }

      let chosenGallery = formData.galleryAddress?.trim();
      if (!chosenGallery || !isAddress(chosenGallery)) {
        chosenGallery = DEFAULT_GALLERY;
      }

      const mintData = {
        title: formData.title.trim(),
        description: formData.description.trim() || 'AI Generated Masterpiece on ArtBlock',
        image: formData.image,
        price: priceInEth.toString()
      };

      const result = await mintNFT(mintData, chosenGallery);
      setMintSuccessData(result);

    } catch (err) {
      console.error('Minting error:', err);
      setLocalError(err.message || 'Failed to mint NFT');
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,18}$/.test(value)) {
      setFormData(prev => ({ ...prev, price: value }));
      setLocalError('');
    }
  };

  const handleDone = () => {
    setMintSuccessData(null);
    onClose();
    navigate('/dashboard/artist');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center 
          justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-4xl 
            w-full backdrop-blur-lg relative overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-white font-['Space_Grotesk'] 
              flex items-center gap-3"
            >
              <div className="p-2 bg-[#6366F1]/10 rounded-xl">
                <ImageIcon className="w-6 h-6 text-[#6366F1]" />
              </div>
              {mintSuccessData ? 'NFT Successfully Minted!' : 'Mint Artwork as NFT'}
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

          {mintSuccessData ? (
            /* Success Confirmation View */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#6366F1]/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-8 h-8 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Verified On-Chain
                  </h3>
                  <p className="text-white/70 text-sm font-['Plus_Jakarta_Sans']">
                    Your token was confirmed on Hardhat Localhost (Chain ID 31337) and its metadata is pinned to IPFS.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <span className="text-xs text-white/40 block mb-1">Token ID</span>
                  <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
                    #{mintSuccessData.tokenId}
                  </span>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <span className="text-xs text-white/40 block mb-1">Contract Address</span>
                  <span className="text-sm font-mono text-[#60A5FA] break-all">
                    {mintSuccessData.contractAddress}
                  </span>
                </div>
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl md:col-span-2">
                  <span className="text-xs text-white/40 block mb-1">Transaction Hash</span>
                  <span className="text-sm font-mono text-white/80 break-all">
                    {mintSuccessData.transactionHash}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleDone}
                  className="px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#5457E5] transition-all font-['Space_Grotesk']"
                >
                  View in Artist Dashboard →
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Minting Form */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="relative group aspect-square">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="nft-image"
                  />
                  <label htmlFor="nft-image" className="block cursor-pointer h-full">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`h-full rounded-xl border border-white/10 
                        bg-white/[0.02] backdrop-blur-lg group-hover:border-[#6366F1]/40 
                        transition-all flex items-center justify-center overflow-hidden
                        ${previewUrl ? 'p-0' : 'p-4'}`}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="NFT Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center space-y-4">
                          <Upload className="mx-auto text-white/40" size={48} />
                          <p className="text-white/60 text-base font-['Plus_Jakarta_Sans']">
                            Artwork Preview
                            <br /><span className="text-xs text-white/40">Click to upload custom file</span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </label>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm font-['Plus_Jakarta_Sans'] mb-1">
                    <Type size={16} />
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-white/[0.02] border border-white/10 
                      rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                      focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                      font-['Space_Grotesk']"
                    placeholder="Enter NFT title"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm font-['Plus_Jakarta_Sans'] mb-1">
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 bg-white/[0.02] border border-white/10 
                      rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                      focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                      min-h-[90px] font-['Plus_Jakarta_Sans']"
                    placeholder="Describe your NFT artwork"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-white/60 text-sm font-['Plus_Jakarta_Sans'] mb-1">
                      <DollarSign size={16} />
                      Price (ETH)
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={handlePriceChange}
                      className="w-full p-3 bg-white/[0.02] border border-white/10 
                        rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                        focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                        font-['Space_Grotesk']"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white/60 text-sm font-['Plus_Jakarta_Sans'] mb-1">
                      <Home size={16} />
                      Gallery (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.galleryAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, galleryAddress: e.target.value.trim() }))}
                      className="w-full p-3 bg-white/[0.02] border border-white/10 
                        rounded-xl text-white placeholder-white/40 focus:border-[#6366F1]/40 
                        focus:ring-[#6366F1]/40 transition-all duration-300 outline-none 
                        font-['Space_Grotesk'] text-xs font-mono"
                      placeholder="Default platform gallery"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {(localError || contractError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl 
                      text-red-400 text-xs font-medium font-['Plus_Jakarta_Sans']"
                  >
                    {localError || contractError}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-white/10 rounded-xl font-bold 
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
                    className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl font-bold 
                      hover:bg-[#5457E5] transition-all disabled:opacity-50 
                      disabled:cursor-not-allowed font-['Space_Grotesk'] flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                        />
                        Minting On-Chain...
                      </>
                    ) : (
                      <>Mint NFT</>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          )}

          {/* Background Decoration */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-0 right-0 w-72 h-72 bg-[#6366F1]/10 
              rounded-full blur-3xl -z-10 pointer-events-none"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateNFTModal;