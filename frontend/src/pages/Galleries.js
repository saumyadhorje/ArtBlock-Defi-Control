import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Users, Image as ImageIcon, 
  DollarSign, Trending, Award
} from 'react-feather';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { ethers } from 'ethers';

// Array of retro-futuristic NFT art images for gallery covers
const GALLERY_IMAGES = [
  // Cyberpunk / Retro-futuristic Art imported from unsplash lmao 
  'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=2070', // Neon city
  'https://images.unsplash.com/photo-1592492152545-9695d3f473f4?q=80&w=2070', // Digital landscape
  'https://images.unsplash.com/photo-1558244661-d248897f7bc4?q=80&w=2070', // Abstract tech
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2070', // Digital art
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2070', // Geometric abstract
  'https://images.unsplash.com/photo-1633355444132-695d5876cd00?q=80&w=2070', // Cyber aesthetic
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2070', // Digital waves
 
];

const getRandomImage = () => {
  return GALLERY_IMAGES[Math.floor(Math.random() * GALLERY_IMAGES.length)];
};

const formatEthValue = (value) => {
  if (!value) return '0';
  // If the value is already a string and contains 'ETH', return as is
  if (typeof value === 'string' && value.includes('ETH')) return value;
  
  try {
    // Convert to proper ETH value
    const ethValue = ethers.formatEther(value.toString());
    // Format to max 2 decimal places if it's a small number
    return parseFloat(ethValue).toFixed(2);
  } catch (error) {
    console.error('Error formatting ETH value:', error);
    return value;
  }
};

const Galleries = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await axiosInstance.get('/api/curator/galleries');
      console.log('Fetched galleries:', response.data);
      setGalleries(response.data.galleries || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#6366F1] rounded-full border-t-transparent"
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
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block"
            >
              <span className="px-6 py-2 bg-[#6366F1]/10 border border-[#6366F1]/40 
                rounded-xl text-[#6366F1] text-base font-bold inline-block"
              >
                Explore Galleries 
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-white 
              font-['Space_Grotesk']"
            >
              Discover Amazing<br />Art Collections
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-white/[0.02] border border-white/10 
                  rounded-xl backdrop-blur-lg text-white placeholder-white/40 
                  focus:border-[#6366F1]/40 focus:ring-[#6366F1]/40 transition-all 
                  duration-300 outline-none pl-12 font-['Space_Grotesk']"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                text-white/40" 
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-4">
              {['all', 'trending', 'new', 'featured'].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilter(status)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl font-bold capitalize backdrop-blur-lg
                    transition-all duration-300 font-['Space_Grotesk'] ${
                    filter === status 
                      ? 'bg-[#6366F1] text-white' 
                      : 'bg-white/[0.02] border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Galleries Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries
            .filter(gallery => 
              gallery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              gallery.curator.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((gallery) => (
              <motion.div
                key={gallery._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/[0.02] border border-white/10 rounded-2xl 
                  overflow-hidden backdrop-blur-lg hover:border-[#6366F1]/40 
                  transition-all cursor-pointer group"
                onClick={() => navigate(`/gallery/${gallery._id}`)}
              >
                {/* Gallery Cover Image */}
                <div className="aspect-[4/3] bg-black/20 relative overflow-hidden">
                  <img
                    src={gallery.coverImage || getRandomImage()}
                    alt={gallery.name}
                    className="w-full h-full object-cover group-hover:scale-110 
                      transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm 
                    px-3 py-1 rounded-lg text-sm font-bold text-white border 
                    border-white/10"
                  >
                    {gallery.nftCount} NFTs
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white line-clamp-1 
                    font-['Space_Grotesk']"
                  >
                    {gallery.name}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2 
                    font-['Plus_Jakarta_Sans']"
                  >
                    {gallery.description || "A unique collection of digital artworks"}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                      { label: 'Artists', value: gallery.artistCount },
                      { label: 'Volume', value: `${formatEthValue(gallery.totalVolume)} ETH` },
                      { label: 'Floor', value: `${formatEthValue(gallery.floorPrice)} ETH` }
                    ].map((stat, index) => (
                      <div key={index} className="text-center p-2 bg-white/[0.02] 
                        rounded-lg border border-white/10"
                      >
                        <div className="text-sm text-white/60 
                          font-['Plus_Jakarta_Sans']"
                        >
                          {stat.label}
                        </div>
                        <div className="font-bold text-white font-['Space_Grotesk']">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Curator Info */}
                  <div className="flex items-center justify-between pt-4 
                    border-t border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#6366F1]/10 rounded-full">
                        <Users size={16} className="text-[#6366F1]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white 
                          font-['Space_Grotesk']"
                        >
                          Curator
                        </div>
                        <div className="text-sm text-white/60 
                          font-['Plus_Jakarta_Sans']"
                        >
                          {gallery.curator || formatAddress(gallery.curatorAddress)}
                        </div>
                      </div>
                    </div>
                    {gallery.verified && (
                      <Award className="text-[#6366F1]" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Background Decoration */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="fixed top-0 right-0 w-96 h-96 bg-[#6366F1]/10 
          rounded-full blur-3xl -z-10"
      />
    </div>
  );
};

export default Galleries; 