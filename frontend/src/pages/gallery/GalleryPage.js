import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Image, Users, MessageSquare, ChevronLeft, PlusCircle,
  Heart, Share2, Eye, Zap, Award, BarChart2, Filter, Grid, Bookmark,
  Settings, Info, X, Bell, TrendingUp, ExternalLink, Layout, DollarSign
} from 'react-feather';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import useNFTContract from '../../hooks/useNFTContract';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { formatEther, parseEther } from 'ethers';

import { ARTBLOCK_NFT_ADDRESS } from '../../config';
import { contractABI } from '../../constants/contractABI';

// Helper function to check if a string is a valid number
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Helper function to format price from Wei to ETH
const formatPrice = (price) => {
  try {
    if (!price) return '0';

    // If price is already in ETH format (contains decimal)
    if (typeof price === 'string' && price.includes('.')) {
      const ethValue = parseFloat(price);
      return ethValue.toFixed(4);
    }

    // If price is in Wei format, convert to ETH
    const ethValue = parseFloat(formatEther(price));
    return ethValue.toFixed(4);
  } catch (error) {
    console.error('Error formatting price:', error);
    return '0';
  }
};

// Helper function to check if a price is already in Wei format
const isWeiFormat = (price) => {
  return typeof price === 'string' && price.length > 18 && !price.includes('.');
};

// Helper function to convert ETH to Wei
const convertToWei = (price) => {
  try {
    if (!price) return '0';
    
    // If already in Wei format, return as is
    if (isWeiFormat(price)) {
      console.log('Price is already in Wei:', price);
      return price;
    }

    // Convert ETH to Wei (price is in ETH format)
    console.log('Converting price from ETH to Wei:', price);
    const weiValue = parseEther(price.toString());
    return weiValue.toString();
  } catch (error) {
    console.error('Error converting to Wei:', error);
    return '0';
  }
};

// Helper function to convert price for display
const formatPriceForDisplay = (price) => {
  try {
    if (!price) return '0';
    
    // If price contains decimal, it's already in ETH format
    if (price.toString().includes('.')) {
      return parseFloat(price).toFixed(4);
    }
    
    // Convert Wei to ETH for display
    return parseFloat(formatEther(price)).toFixed(4);
  } catch (error) {
    console.error('Error formatting price for display:', error);
    return '0';
  }
};

const SubmitArtworkModal = ({ isOpen, onClose, galleryId }) => {
  const { getArtistNFTs } = useNFTContract();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  const [fetchingNFTs, setFetchingNFTs] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when modal opens
    if (!isOpen || hasFetchedRef.current) return;

    const fetchUserNFTs = async () => {
      try {
        setFetchingNFTs(true);
        const user = JSON.parse(localStorage.getItem('artblock_user'));
        
        if (!user?.walletAddress) {
          console.error('No wallet address found');
          return;
        }

        console.log('Fetching NFTs for address:', user.walletAddress);

        // Fetch NFTs from blockchain
        const nftsFromChain = await getArtistNFTs(user.walletAddress);
        console.log('NFTs from chain:', nftsFromChain);

        // Fetch NFTs from backend
        const response = await axiosInstance.get(`/api/nfts/artist/${user.walletAddress}`);
        console.log('NFTs from backend:', response.data);

        // Get locally stored NFTs for testing
        const localNFTs = JSON.parse(localStorage.getItem('mintedNFTs') || '[]');
        console.log('Local NFTs:', localNFTs);

        // Combine all NFT data
        const formattedNFTs = nftsFromChain.map(nft => {
          const backendNFT = response.data.find(
            b => b.tokenId?.toString() === nft.tokenId?.toString()
          );
          
          const localNFT = localNFTs.find(
            l => l.tokenId?.toString() === nft.tokenId?.toString()
          );
          
          return {
            _id: nft.tokenId?.toString() || 'unknown',
            title: nft.title || localNFT?.title || `Artwork #${nft.tokenId}`,
            description: nft.description || localNFT?.description || '',
            price: nft.price || localNFT?.price || '0',
            ipfsHash: nft.ipfsHash || localNFT?.ipfsHash,
            status: nft.isListed ? 'listed' : 'unlisted',
            blockchainTokenId: nft.tokenId?.toString(), // Important for purchases
            ...backendNFT
          };
        });

        console.log('Formatted NFTs:', formattedNFTs);
        setUserNFTs(formattedNFTs);
        hasFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setFetchingNFTs(false);
      }
    };

    fetchUserNFTs();
  }, [isOpen]); // Only depend on isOpen

  // Reset the fetch flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasFetchedRef.current = false;
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNFT) {
      toast.error('Please select an NFT to submit');
      return;
    }
    
    setLoading(true);
    try {
      // Find the selected NFT from userNFTs
      const nftToSubmit = userNFTs.find(nft => nft._id === selectedNFT);
      if (!nftToSubmit) {
        throw new Error('Selected NFT not found');
      }

      console.log('NFT to submit:', nftToSubmit);

      // Get user data for artist address
      const user = JSON.parse(localStorage.getItem('artblock_user'));
      
      // More robust token ID extraction
      const blockchainTokenId = parseInt(
        nftToSubmit.tokenId || 
        nftToSubmit.blockchainTokenId || 
        nftToSubmit._id
      );
      
      if (isNaN(blockchainTokenId) && blockchainTokenId !== 0) {
        throw new Error('Invalid token ID');
      }

      // Prepare submission data with explicit token ID
      const submissionData = {
        galleryId,
        description: description || nftToSubmit.description,
        title: nftToSubmit.title,
        ipfsHash: nftToSubmit.ipfsHash,
        price: nftToSubmit.price,
        artistAddress: user.walletAddress,
        contractAddress: process.env.REACT_APP_ARTBLOCK_CONTRACT_ADDRESS,
        tokenId: blockchainTokenId,
        blockchainTokenId: blockchainTokenId, // Add explicit blockchain token ID
        metadata: {
          name: nftToSubmit.title,
          description: description || nftToSubmit.description,
          image: `ipfs://${nftToSubmit.ipfsHash}`
        }
      };

      console.log('Submission data:', submissionData);

      // Changed the endpoint to use blockchainTokenId
      const response = await axiosInstance.post(
        `/api/nfts/${blockchainTokenId}/submit`, 
        submissionData
      );

      console.log('Submission response:', response.data);
      
      if (response.data) {
        toast.success('Artwork submitted to gallery successfully!');
        window.dispatchEvent(new CustomEvent('gallery-updated'));
        onClose();
        setSelectedNFT(null);
        setDescription('');
      }

    } catch (error) {
      console.error('Error submitting artwork:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to submit artwork to gallery'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center 
          justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#0A0A0A] border border-[#6366F1]/20 rounded-2xl 
            p-8 max-w-4xl w-full"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white font-['Space_Grotesk']">
                Submit Artwork
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-white/60 
                  hover:text-white transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-bold mb-4">Select NFT</label>
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto 
                  pr-2 custom-scrollbar"
                >
                  {userNFTs.map((nft) => (
                    <div
                      key={nft._id}
                      onClick={() => setSelectedNFT(nft._id)}
                      className={`cursor-pointer rounded-xl border-2 overflow-hidden
                        transition-all duration-300
                        ${selectedNFT === nft._id 
                          ? 'border-[#6366F1] shadow-lg shadow-[#6366F1]/20' 
                          : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                      <div className="aspect-square bg-black">
                        <img
                          src={`https://ipfs.io/ipfs/${nft.ipfsHash}`}
                          alt={nft.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 bg-[#0A0A0A]">
                        <p className="font-bold text-white truncate">{nft.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your submission..."
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl 
                    text-white placeholder-white/40 resize-none focus:outline-none 
                    focus:border-[#6366F1] transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-xl
                    text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNFT || loading}
                  className="flex-1 px-6 py-3 bg-[#6366F1] text-white rounded-xl
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-[#5457E5] transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Artwork'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ArtworkCard = ({ artwork, onPurchaseComplete }) => {
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();
  const [view, setView] = useState('grid');

  // Format price from Wei to ETH
  const formatPrice = (weiPrice) => {
    try {
      // If price is already in ETH format (contains decimal)
      if (typeof weiPrice === 'string' && weiPrice.includes('.')) {
        return parseFloat(weiPrice).toFixed(4);
      }
      // Convert from Wei to ETH
      const ethPrice = formatEther(weiPrice.toString());
      return parseFloat(ethPrice).toFixed(4);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0';
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      
      // Add detailed logging here
      console.log('🎨 Artwork purchase details:', {
        artwork: artwork,
        id: artwork._id,
        nftId: artwork.nftId,
        tokenId: artwork.tokenId,
        blockchainTokenId: artwork.nftId?.tokenId || artwork.tokenId || artwork.nftId?.blockchainTokenId
      });

      const blockchainTokenId = artwork.nftId?.tokenId || 
                               artwork.tokenId || 
                               artwork.nftId?.blockchainTokenId;
      
      // Get the raw price
      const rawPrice = artwork.price;
      
      // Convert to Wei if in ETH format
      const priceInWei = rawPrice.toString().includes('.') 
        ? parseEther(rawPrice.toString())
        : rawPrice;
      
      console.log('Price details:', {
        rawPrice,
        priceInWei: priceInWei.toString(),
        verificationEth: formatEther(priceInWei)
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      // Calculate shares
      const artistShareWei = Math.floor(Number(priceInWei) * 0.85).toString();
      const galleryShareWei = Math.floor(Number(priceInWei) * 0.10).toString();
      const platformShareWei = Math.floor(Number(priceInWei) * 0.05).toString();

      console.log('Payment splits:', {
        total: formatEther(priceInWei),
        artist: formatEther(artistShareWei),
        gallery: formatEther(galleryShareWei),
        platform: formatEther(platformShareWei)
      });
      
      const contract = new ethers.Contract(
        process.env.REACT_APP_ARTBLOCK_CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.buyArtwork(blockchainTokenId, {
        value: priceInWei
      });

      console.log('📝 Transaction sent:', tx.hash);
      const receipt = await tx.wait();

      console.log('💰 Transaction details:', {
        blockchainTokenId,
        priceInWei: priceInWei.toString(),
        signerAddress,
        artistShare: formatEther(artistShareWei),
        galleryShare: formatEther(galleryShareWei),
        platformShare: formatEther(platformShareWei)
      });

      // Update backend with detailed payment info
      const response = await axiosInstance.post(`/api/investor/purchase/${artwork.nftId._id}`, {
        transactionHash: receipt.hash,
        price: priceInWei.toString(),
        tokenId: blockchainTokenId,
        buyer: signerAddress,
        nftData: {
            ...artwork.nftId,  // Use the NFT data from nftId object
            tokenId: blockchainTokenId,
            price: priceInWei.toString()
        },
        paymentSplits: {
            artist: artistShareWei.toString(),
            gallery: galleryShareWei.toString(),
            platform: platformShareWei.toString()
        },
        gasInfo: {
            gasUsed: receipt.gasUsed?.toString(),
            gasPrice: receipt.gasPrice?.toString(),
            totalGasCost: ((receipt.gasPrice || 0) * (receipt.gasUsed || 0)).toString()
        }
      });

      if (response.data.success) {
        toast.success('Purchase successful! Check payment distribution in console.');
        if (typeof onPurchaseComplete === 'function') {
          await onPurchaseComplete();
        }
        const transactionData = {
            artwork: artwork.nftId,
            price: priceInWei.toString(),
            transactionHash: receipt.hash,
            paymentSplits: {
                artist: artistShareWei.toString(),
                gallery: galleryShareWei.toString(),
                platform: platformShareWei.toString()
            }
        };

        navigate('/transaction-success', { state: { transactionData } });
      }

    } catch (error) {
      console.error('❌ Purchase error details:', {
        error: error.message,
        artwork: artwork,
        id: artwork._id,
        nftId: artwork.nftId,
        stack: error.stack
      });
      setPurchasing(false);
      toast.error(error.message || 'Failed to purchase artwork');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, rotate: 1 }}
      className="group bg-white/[0.03] border border-white/10 rounded-xl 
        overflow-hidden hover:border-[#6366F1]/40 transition-all"
    >
      {/* Image Container */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={`https://ipfs.io/ipfs/${artwork.ipfsHash}`}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform 
            duration-300 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md 
          px-2 py-1 border border-white/20 rounded-lg"
        >
          <span className="text-sm font-bold text-white font-['Space_Grotesk']">
            {artwork.status || 'Listed'}
          </span>
        </div>

        {/* Hover Stats Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm 
            flex items-center justify-center gap-8 p-4"
        >
          <div className="text-center">
            <div className="p-3 bg-white/10 rounded-xl mb-2 
              group-hover:bg-white/20 transition-colors">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-['Space_Grotesk'] font-bold">
              {artwork.views || 0}
            </span>
          </div>
          <div className="text-center">
            <div className="p-3 bg-white/10 rounded-xl mb-2 
              group-hover:bg-white/20 transition-colors">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-['Space_Grotesk'] font-bold">
              {artwork.likes || 0}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h4 className="font-bold text-white font-['Space_Grotesk'] truncate">
          {artwork.title}
        </h4>
        <p className="text-sm text-white/60 font-['Plus_Jakarta_Sans'] line-clamp-2">
          {artwork.description}
        </p>

        {/* Artist Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 flex 
            items-center justify-center">
            <Users size={14} className="text-[#6366F1]" />
          </div>
          <div>
            <span className="text-xs text-white/40 font-['Plus_Jakarta_Sans'] block">
              Artist
            </span>
            <span className="text-sm text-white font-['Space_Grotesk'] font-bold">
              {artwork.artist?.name || 'Unknown Artist'}
            </span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center pt-2 
          border-t border-white/10"
        >
          <div>
            <span className="text-white/40 text-sm font-['Plus_Jakarta_Sans']">
              Price
            </span>
            <div className="text-[#6366F1] font-bold font-['Space_Grotesk']">
              {formatPrice(artwork.price)} ETH
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePurchase}
            disabled={purchasing}
            className="px-4 py-2 bg-[#6366F1] text-white rounded-xl 
              font-['Space_Grotesk'] text-sm font-bold hover:bg-[#5457E5] 
              transition-all flex items-center gap-2 disabled:opacity-50 
              disabled:cursor-not-allowed shadow-lg shadow-[#6366F1]/20"
          >
            {purchasing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white rounded-full 
                    border-t-transparent"
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign size={16} />
                <span>Purchase</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const GalleryStats = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
      { 
        label: 'Total Artworks',
        value: stats.artworksCount,
        icon: Image,
        color: 'from-[#6366F1] to-[#8B5CF6]',
        change: '+12% this week'
      },
      { 
        label: 'Active Artists',
        value: stats.artistsCount,
        icon: Users,
        color: 'from-[#EC4899] to-[#8B5CF6]',
        change: '+5 new artists'
      },
      { 
        label: 'Trading Volume',
        value: `${stats.totalSales} ETH`,
        icon: BarChart2,
        color: 'from-[#10B981] to-[#6366F1]',
        change: '+2.5 ETH today'
      },
      { 
        label: 'Floor Price',
        value: `${stats.floorPrice || '0'} ETH`,
        icon: Zap,
        color: 'from-[#F59E0B] to-[#EC4899]',
        change: 'Stable'
      }
    ].map((stat, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
          transition-opacity duration-300 blur-xl" 
          style={{ background: `linear-gradient(to right, ${stat.color})` }}
        />
        <div className="relative bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-6 
          backdrop-blur-lg hover:border-[#6366F1]/40 transition-all duration-300"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <p className="text-white/60 font-['Space_Grotesk']">{stat.label}</p>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2 font-['Space_Grotesk']">
            {stat.value}
          </h3>
          <p className="text-emerald-400 text-sm flex items-center gap-1">
            <TrendingUp size={14} />
            {stat.change}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-3 border-black
      ${active ? 'bg-[#FFE951] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}
      hover:bg-[#FFE951] transition-all duration-200`}
  >
    <Icon size={20} />
    <span className="font-bold">{label}</span>
  </motion.button>
);

const GalleryPage = () => {
  const { galleryId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('artblock_user'));
  const isArtist = user?.role === 'artist';

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      // Get gallery details
      const galleryResponse = await axiosInstance.get(`/api/galleries/${galleryId}`);
      console.log('Gallery data:', galleryResponse.data);
      const galleryData = galleryResponse.data;
      
      // Get gallery submissions
      const submissionsResponse = await axiosInstance.get(`/api/galleries/${galleryId}/submissions`);
      const submissions = submissionsResponse.data;

      console.log('Gallery Data:', galleryData);
      console.log('Submissions:', submissions);
      
      setGallery({
        ...galleryData,
        submissions: submissions
      });
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setError(error.response?.data?.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [galleryId]);

  // Add this effect to refresh gallery data when submissions change
  useEffect(() => {
    const handleGalleryUpdate = () => {
      fetchGalleryData();
    };

    window.addEventListener('gallery-updated', handleGalleryUpdate);
    return () => window.removeEventListener('gallery-updated', handleGalleryUpdate);
  }, []);

  // Add this to check if the component is rendering the nav section
  console.log('Rendering nav with buttons:', { isArtist, showSubmitModal });

  const handlePurchaseComplete = async () => {
    // Refresh gallery data or perform other updates
    await fetchGalleryData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <GalleryStats stats={gallery.stats} />
            
            {/* About Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#6366F1]/10">
                  <Info size={24} className="text-[#6366F1]" />
                </div>
                <h2 className="text-3xl font-bold text-white font-['Space_Grotesk']">About</h2>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/5 to-[#EC4899]/5 
                  rounded-2xl blur-xl opacity-50"
                />
                <div className="relative bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-8 
                  backdrop-blur-lg text-white/80 text-lg leading-relaxed"
                >
                  {gallery.description}
                </div>
              </div>

              {/* Submission Guidelines */}
              {gallery.submissionGuidelines && (
                <div className="mt-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-[#10B981]/10">
                      <MessageSquare size={24} className="text-[#10B981]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white font-['Space_Grotesk']">
                      Submission Guidelines
                    </h2>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 to-[#6366F1]/5 
                      rounded-2xl blur-xl opacity-50"
                    />
                    <div className="relative bg-white/[0.02] border border-[#10B981]/20 rounded-2xl p-8 
                      backdrop-blur-lg"
                    >
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white/80 text-lg leading-relaxed">
                          {gallery.submissionGuidelines}
                        </div>
                        {isArtist && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSubmitModal(true)}
                            className="mt-6 px-6 py-3 bg-[#10B981] text-white rounded-xl 
                              font-bold hover:bg-[#0D9488] transition-all flex items-center 
                              gap-2 shadow-lg shadow-[#10B981]/25"
                          >
                            <PlusCircle size={20} />
                            Submit Your Artwork
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      
      case 'artworks':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col space-y-8">
              {/* Controls Bar */}
              <div className="flex items-center justify-between bg-white/[0.02] 
                border border-[#6366F1]/20 rounded-xl p-4 backdrop-blur-lg"
              >
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg flex items-center gap-2 ${
                      viewMode === 'grid' 
                        ? 'bg-[#6366F1] text-white' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Grid size={20} />
                    <span>Grid</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('masonry')}
                    className={`p-2 rounded-lg flex items-center gap-2 ${
                      viewMode === 'masonry' 
                        ? 'bg-[#6366F1] text-white' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layout size={20} />
                    <span>Masonry</span>
                  </motion.button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/5 
                        rounded-lg flex items-center gap-2"
                    >
                      <Filter size={20} />
                      <span>Filter</span>
                    </motion.button>
                  </div>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/5 
                        rounded-lg flex items-center gap-2"
                    >
                      <TrendingUp size={20} />
                      <span>Sort</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Artworks Grid */}
              {gallery.submissions && gallery.submissions.length > 0 ? (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'columns-1 sm:columns-2 lg:columns-3 gap-8'
                  }
                `}>
                  {gallery.submissions.map((artwork, index) => (
                    <motion.div
                      key={artwork._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ArtworkCard
                        artwork={artwork}
                        onPurchaseComplete={handlePurchaseComplete}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/5 
                    to-[#EC4899]/5 rounded-2xl blur-xl opacity-50"
                  />
                  <div className="relative text-center py-16 bg-white/[0.02] border 
                    border-[#6366F1]/20 rounded-2xl backdrop-blur-lg"
                  >
                    <Image size={48} className="mx-auto mb-4 text-white/40" />
                    <p className="text-white/60 text-lg mb-6">No artworks submitted yet.</p>
                    {isArtist && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowSubmitModal(true)}
                        className="px-6 py-3 bg-[#6366F1] text-white rounded-xl 
                          font-bold hover:bg-[#5457E5] transition-all flex items-center 
                          gap-2 mx-auto"
                      >
                        <PlusCircle size={20} />
                        Submit First Artwork
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      
      // ... other tab cases ...
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-black rounded-full border-t-[#FFE951]"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Gallery Not Found</h2>
          <p className="text-gray-600">The requested gallery could not be found.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'applications', label: 'Applications', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Retro Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated Glow Effects */}
      <motion.div
        animate={{ 
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] 
          bg-[#6366F1]/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] 
          bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-[#6366F1]/20 
          bg-black/40 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.button 
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2 px-6 py-3 bg-[#6366F1]/10 
                  border border-[#6366F1]/20 rounded-xl text-white/80 
                  hover:text-[#6366F1] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/20 
                  transition-all duration-300"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </motion.button>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                {isArtist && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSubmitModal(true)}
                    className="px-6 py-3 bg-[#6366F1] text-white rounded-xl font-bold 
                      hover:bg-[#5457E5] transition-all flex items-center gap-2 
                      shadow-lg shadow-[#6366F1]/25 hover:shadow-[#6366F1]/40"
                  >
                    <PlusCircle size={20} />
                    Submit Artwork
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Gallery Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Gallery Header */}
          <div className="mb-12 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-white font-['Space_Grotesk'] 
                bg-clip-text text-transparent bg-gradient-to-r from-white to-[#6366F1]"
            >
              {gallery.name}
            </motion.h1>
            
            {/* Tabs with Neon Effect */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-lg
                    transition-all duration-300 font-['Space_Grotesk'] relative
                    ${activeTab === tab.id 
                      ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25' 
                      : 'bg-white/[0.02] border border-[#6366F1]/20 text-white/60 hover:text-white'
                    }
                  `}
                >
                  <tab.icon size={20} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-[#6366F1]/20 -z-10"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area with Glassmorphism */}
          <div className="bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-8 
            backdrop-blur-lg relative overflow-hidden group hover:border-[#6366F1]/40 
            transition-colors duration-300"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
              transition-opacity duration-300 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/5 
                to-purple-500/5"
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Artwork Modal */}
      <SubmitArtworkModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        galleryId={galleryId}
      />
    </div>
  );
};

export default GalleryPage; 