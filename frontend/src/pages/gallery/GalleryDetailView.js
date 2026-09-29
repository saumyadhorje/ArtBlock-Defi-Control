import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Image, 
  Users, 
  FileText, 
  Settings,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

// Import tab components
import GalleryOverview from './tabs/GalleryOverview';
import GalleryArtworks from './tabs/GalleryArtworks';
import GalleryArtists from './tabs/GalleryArtists';
import GalleryApplications from './tabs/GalleryApplications';
import GallerySettings from './tabs/GallerySettings';

// Import mock data
import { sampleGallery } from '../../utils/mockData';

const GalleryDetailView = () => {
  const { galleryId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call with mock data
    setGallery(sampleGallery);
    setLoading(false);
  }, [galleryId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'artworks', label: 'Artworks', icon: Image },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <GalleryOverview gallery={gallery} />;
      case 'artworks':
        return <GalleryArtworks gallery={gallery} />;
      case 'artists':
        return <GalleryArtists gallery={gallery} />;
      case 'applications':
        return <GalleryApplications gallery={gallery} />;
      case 'settings':
        return <GallerySettings gallery={gallery} />;
      default:
        return <GalleryOverview gallery={gallery} />;
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
          <h2 className="text-2xl font-bold mb-4">Error Loading Gallery</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5FF]">
      {/* Enhanced Gallery Header */}
      <div className="relative bg-white border-b-4 border-black">
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden border-b-4 border-black">
          {/* Cover Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={gallery?.coverImage || "https://images.unsplash.com/photo-1561840899-2d3b8e9c6047"}
              alt={gallery?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
          </div>

          {/* Gallery Info Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl w-full mx-auto px-6 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white space-y-6"
              >
                <h1 className="text-6xl font-black tracking-tight">
                  {gallery?.name}
                </h1>
                <p className="text-xl text-gray-200 max-w-2xl">
                  {gallery?.description}
                </p>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Users size={24} className="text-[#FFE951]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{gallery?.stats?.artistCount || 0}</p>
                      <p className="text-sm text-gray-300">Artists</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Image size={24} className="text-[#FFE951]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{gallery?.stats?.artworkCount || 0}</p>
                      <p className="text-sm text-gray-300">Artworks</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Eye size={24} className="text-[#FFE951]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{gallery?.stats?.visitorCount || 0}</p>
                      <p className="text-sm text-gray-300">Visitors</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Heart size={24} className="text-[#FFE951]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{gallery?.stats?.likesCount || 0}</p>
                      <p className="text-sm text-gray-300">Likes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-[#FFE951] font-bold border-3 border-black rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all
                flex items-center gap-2"
            >
              <Users size={20} />
              Apply as Artist
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white border-3 border-black rounded-xl
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <Share2 size={24} />
            </motion.button>
          </div>
        </div>

        {/* Featured Artists Preview */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <h3 className="font-bold text-gray-500">Featured Artists:</h3>
            <div className="flex -space-x-4">
              {gallery?.featuredArtists?.slice(0, 5).map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full border-3 border-white object-cover
                      ring-2 ring-black"
                  />
                  <div className="absolute inset-0 rounded-full hover:bg-black/20 
                    transition-colors cursor-pointer" />
                </motion.div>
              ))}
              {gallery?.featuredArtists?.length > 5 && (
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gray-100
                  flex items-center justify-center font-bold text-sm ring-2 ring-black">
                  +{gallery.featuredArtists.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b-4 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold border-b-4 
                    transition-all ${activeTab === tab.id 
                    ? 'border-black text-black' 
                    : 'border-transparent text-gray-400'}`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default GalleryDetailView; 