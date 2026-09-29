// explaining the imports - react hooks are imported from react
// useState: Manage local component state
// useEffect: Handle side effects (data fetching)
// useNavigate: Handle routing
// useWalletConnection: Manage wallet connection
// framer motion for animations, feather icons for icons, recharts for charts, axios for API calls
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Image, DollarSign, Eye, Heart, 
  PieChart, Settings, Zap, BarChart2, 
  Activity, Share2, MessageCircle, Plus, Grid, List, LineChart 
} from 'react-feather';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as ReChart, Pie, 
  Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import CreateNFTModal from '../components/CreateNFTModal';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
// were using wallet connection hook to listen for wallet connection changes. if disconnected user will be redirected to auth page
import useWalletConnection from '../hooks/useWalletConnection';
import useNFTContract from '../hooks/useNFTContract';
import { ethers } from 'ethers';
import { formatEther } from 'ethers';

const LOCAL_STORAGE_KEYS = {
  TOKEN: 'artblock_token',
  USER: 'artblock_user',
  WALLET: 'artblock_wallet'
};

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const { getArtistNFTs } = useNFTContract();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    profile: {
      displayName: '',
      followersCount: 0,
      artworksCount: 0,
      followingCount: 0,
      salesCount: 0,
      role: 'Artist',
      badges: ['🎨', '⭐', '🏆']
    },
    analytics: {
      totalArtworksListed: 0,
      totalSalesValue: 0,
      averagePrice: 0,
      totalViews: 0,
      totalLikes: 0
    },
    distributionSettings: {
      artistShare: 85,
      galleryShare: 10,
      platformFee: 5
    },
    artworks: [],
    loading: true,
    error: null,
    chainNFTs: [],
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Add wallet connection listener
  useWalletConnection();

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER));
        if (!user?.walletAddress) {
          console.error('No user wallet address found');
          navigate('/auth');
          return;
        }
        console.log('Current User:', user);

        // Fetch NFTs from blockchain first
        const nftsFromChain = await getArtistNFTs(user.walletAddress);
        console.log('NFTs from blockchain:', nftsFromChain);

        if (!mounted) return;

        // Fetch dashboard data from backend with proper error handling
        try {
          const response = await axiosInstance.get(`/api/artist/dashboard/${user.walletAddress}`);
          
          if (!mounted) return;

          setDashboardData(prev => ({
            ...prev,
            ...response.data,
            chainNFTs: nftsFromChain || [],
            loading: false,
            error: null
          }));
        } catch (err) {
          console.error('Backend API Error:', err);
          
          // Set partial data even if backend fails
          setDashboardData(prev => ({
            ...prev,
            chainNFTs: nftsFromChain || [],
            loading: false,
            error: 'Failed to load some dashboard data'
          }));
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (!mounted) return;
        
        setDashboardData(prev => ({
          ...prev,
          chainNFTs: [],
          error: err.message || 'Failed to load data',
          loading: false
        }));
        
        // Only redirect on authentication errors
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array

  
  const AnalyticCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`p-6 ${color} border-4 border-black rounded-2xl 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
        transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-black/70">{title}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white/90 rounded-xl border-3 border-black">
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );

  
  const DistributionCard = ({ title, value, color }) => (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-4 bg-gray-50 
        border-3 border-black rounded-xl group hover:bg-white 
        transition-all duration-300"
    >
      <span className={`font-bold ${color}`}>{title}</span>
      <div className="flex items-center gap-2">
        <span className="font-black text-xl">{value}%</span>
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          →
        </motion.div>
      </div>
    </motion.div>
  );

  
  const AnalyticsSection = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Analytics Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-white flex items-center gap-3 
            font-['Space_Grotesk']"
          >
            <div className="p-2 bg-[#6366F1]/10 rounded-xl">
              <BarChart2 className="w-6 h-6 text-[#6366F1]" />
            </div>
            Performance Analytics
          </h3>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['1D', '1W', '1M', '1Y'].map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/[0.03] border border-white/10 
                  rounded-xl text-white/60 hover:text-white hover:border-[#6366F1]/40 
                  transition-all font-['Space_Grotesk']"
              >
                {range}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <motion.div
            className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
              rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all group"
          >
            <div className="h-[300px] relative">
              {/* Your chart component here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/40">Chart Placeholder</span>
              </div>
              {/* Cyberpunk Grid Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent 
                via-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 
                transition-opacity duration-500" 
              />
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
              rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
          >
            <h4 className="text-xl font-bold text-white mb-4 font-['Space_Grotesk']">
              Recent Activity
            </h4>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl 
                    border border-white/5 hover:border-[#6366F1]/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br 
                    from-[#6366F1] to-[#EC4899] flex items-center justify-center"
                  >
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-white font-medium font-['Space_Grotesk']">
                      NFT Sold for 2.5 ETH
                    </p>
                    <p className="text-white/60 text-sm font-['Plus_Jakarta_Sans']">
                      2 hours ago
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const PerformanceMetric = ({ label, value, trend }) => (
    <motion.div
      whileHover={{ x: 4 }}
      className="p-4 bg-gray-50 border-3 border-black rounded-xl 
        hover:bg-white transition-all duration-300"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-black/70">{label}</span>
        <span className={`font-black text-lg ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {value}
        </span>
      </div>
    </motion.div>
  );

  
  const NFTGrid = () => {
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState('grid');

    // Convert Wei to ETH and format the price
    const formatPrice = (weiPrice) => {
      try {
        // If the price is already in ETH format (contains decimal)
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

    // Combine backend and blockchain NFTs with price conversion
    const allNFTs = dashboardData.chainNFTs.map(nft => {
      console.log('NFT data:', {
        tokenId: nft.tokenId,
        rawPrice: nft.price,
        type: typeof nft.price
      });
      
      const formattedPrice = formatPrice(nft.price);
      
      return {
        _id: nft.tokenId.toString(),
        title: nft.title,
        description: nft.description,
        price: formattedPrice,
        ipfsHash: nft.image,
        status: nft.isListed ? 'listed' : 'sold',
        analytics: {
          views: 0,
          likes: 0
        }
      };
    });

    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* NFT Grid Header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 
              font-['Space_Grotesk']"
            >
              <div className="p-2 bg-[#6366F1]/10 rounded-xl">
                <Grid className="w-6 h-6 text-[#6366F1]" />
              </div>
              Your NFTs
            </h3>
            
            {/* View Toggle */}
            <div className="flex bg-white/[0.03] backdrop-blur-lg rounded-xl p-1 
              border border-white/10"
            >
              {[
                { value: 'grid', Icon: Grid },
                { value: 'list', Icon: List }
              ].map(({ value, Icon }) => (
                <motion.button
                  key={value}
                  onClick={() => setView(value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-all ${
                    view === value 
                      ? 'bg-[#6366F1] text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-4">
            {['all', 'listed', 'sold'].map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilter(status)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-bold capitalize backdrop-blur-lg
                  border-2 transition-all duration-300 ${
                  filter === status 
                    ? 'bg-[#6366F1] border-[#6366F1] text-white' 
                    : 'border-white/10 text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {allNFTs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative group"
          >
            <div className="text-center py-20 bg-white/[0.02] rounded-2xl border 
              border-dashed border-white/10 backdrop-blur-lg"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#6366F1] 
                  to-[#EC4899] rounded-full flex items-center justify-center 
                  group-hover:scale-110 transition-transform duration-500"
                >
                  <Image size={40} className="text-white" />
                </div>
                <p className="text-white/60 font-['Plus_Jakarta_Sans'] text-lg">
                  No NFTs found. Start your collection!
                </p>
                <motion.button
                  onClick={openModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-[#6366F1] text-white rounded-xl 
                    font-['Space_Grotesk'] inline-flex items-center gap-2 
                    hover:bg-[#5457E5] transition-all"
                >
                  <Plus size={24} />
                  Create NFT
                </motion.button>
              </div>
            </div>
            {/* Cyberpunk Grid Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/0 
              via-[#6366F1]/5 to-[#6366F1]/0 opacity-0 group-hover:opacity-100 
              transition-opacity duration-500 pointer-events-none" 
            />
          </motion.div>
        ) : (
          <div className={view === 'grid' 
            ? "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {allNFTs
              .filter(nft => filter === 'all' || nft.status === filter)
              .map((nft) => (
                <NFTCard key={nft._id} nft={nft} view={view} />
              ))}
          </div>
        )}
      </motion.section>
    );
  };

  const NFTCard = ({ nft, view }) => {
    if (view === 'list') {
      return (
        <motion.div
          whileHover={{ x: 4 }}
          className="bg-white/[0.03] border border-white/10 rounded-xl p-4 
            hover:border-[#6366F1]/40 transition-all flex items-center gap-4"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={nft.ipfsHash}
              alt={nft.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-white font-['Space_Grotesk']">
              {nft.title}
            </h4>
            <p className="text-white/60 text-sm font-['Plus_Jakarta_Sans']">
              {nft.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[#6366F1] font-bold font-['Space_Grotesk']">
              {nft.price} ETH
            </div>
            <span className="text-sm text-white/40 font-['Plus_Jakarta_Sans']">
              {nft.status}
            </span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02, rotate: 1 }}
        className="group bg-white/[0.03] border border-white/10 rounded-xl 
          overflow-hidden hover:border-[#6366F1]/40 transition-all"
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={nft.ipfsHash}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform 
              duration-300 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-md 
            px-2 py-1 border border-white/20 rounded-lg"
          >
            <span className="text-sm font-bold text-white font-['Space_Grotesk']">
              {nft.status}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h4 className="font-bold text-white font-['Space_Grotesk']">
            {nft.title}
          </h4>
          <p className="text-sm text-white/60 font-['Plus_Jakarta_Sans']">
            {nft.description}
          </p>
          <div className="flex justify-between items-center pt-2 
            border-t border-white/10"
          >
            <span className="text-white/40 font-['Plus_Jakarta_Sans']">Price</span>
            <span className="text-[#6366F1] font-bold font-['Space_Grotesk']">
              {nft.price} ETH
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#6366F1] rounded-full 
            border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* RetroBeams Background */}
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(147, 197, 253, 0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(147, 197, 253, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </motion.div>

      {/* Hero Section */}
      <div className="relative z-10 border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <span className="px-6 py-2 bg-[#6366F1] text-white rounded-full 
                  font-['Plus_Jakarta_Sans'] font-medium"
                >
                  {dashboardData.profile.role} Dashboard {dashboardData.profile.badges[0]}
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black text-white 
                font-['Space_Grotesk']"
              >
                Welcome back,
                <br />
                {dashboardData.profile.displayName}!
              </h1>
            </div>
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#6366F1] text-white text-lg font-bold 
                rounded-xl hover:bg-[#5457E5] transition-all flex items-center gap-2 
                font-['Space_Grotesk']"
            >
              <Zap className="animate-pulse" />
              Create New NFT
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Total Artworks",
                value: dashboardData.analytics.totalArtworksListed,
                icon: Image,
                color: "bg-[#6366F1]"
              },
              {
                title: "Total Sales",
                value: `${dashboardData.analytics.totalSalesValue} ETH`,
                icon: DollarSign,
                color: "bg-[#8B5CF6]"
              },
              {
                title: "Total Views",
                value: dashboardData.analytics.totalViews,
                icon: Eye,
                color: "bg-[#EC4899]"
              },
              {
                title: "Total Likes",
                value: dashboardData.analytics.totalLikes,
                icon: Heart,
                color: "bg-[#F43F5E]"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.03] backdrop-blur-lg border border-white/10 
                  rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-['Plus_Jakarta_Sans']">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profile and Distribution Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-1 bg-white/[0.03] backdrop-blur-lg border 
                border-white/10 rounded-2xl overflow-hidden hover:border-[#6366F1]/40 
                transition-all"
            >
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-[#6366F1] rounded-full">
                    <Users size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white font-['Space_Grotesk']">
                    {dashboardData.profile.displayName}
                  </h2>
                  <div className="flex justify-center gap-2">
                    {dashboardData.profile.badges.map((badge, index) => (
                      <span key={index} className="text-2xl">{badge}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] border border-white/10 
                    rounded-xl text-center">
                    <div className="text-sm text-white/60 font-['Plus_Jakarta_Sans']">
                      Followers
                    </div>
                    <div className="text-xl font-bold text-white font-['Space_Grotesk']">
                      {dashboardData.profile.followersCount}
                    </div>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/10 
                    rounded-xl text-center">
                    <div className="text-sm text-white/60 font-['Plus_Jakarta_Sans']">
                      Following
                    </div>
                    <div className="text-xl font-bold text-white font-['Space_Grotesk']">
                      {dashboardData.profile.followingCount}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Distribution Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-white/[0.03] backdrop-blur-lg border 
                border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/40 
                transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 
                  font-['Space_Grotesk']">
                  <PieChart size={24} />
                  Revenue Distribution
                </h3>
                <span className="p-2 bg-white/[0.03] border border-white/10 
                  rounded-lg hover:border-[#6366F1]/40 transition-all cursor-pointer">
                  <Settings size={20} className="text-white" />
                </span>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Artist Share",
                    value: dashboardData.distributionSettings?.artistShare || 0,
                    color: "bg-[#6366F1]"
                  },
                  {
                    title: "Gallery Share",
                    value: dashboardData.distributionSettings?.galleryShare || 0,
                    color: "bg-[#8B5CF6]"
                  },
                  {
                    title: "Platform Fee",
                    value: dashboardData.distributionSettings?.platformFee || 0,
                    color: "bg-[#EC4899]"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white/[0.03] border border-white/10 
                    rounded-xl p-4 hover:border-[#6366F1]/40 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 font-['Plus_Jakarta_Sans']">
                        {item.title}
                      </span>
                      <span className="text-white font-bold font-['Space_Grotesk']">
                        {item.value}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <AnalyticsSection />
          
          <NFTGrid />
        </div>
      </div>

      <CreateNFTModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ArtistDashboard; 