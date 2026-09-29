import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Image, 
  TrendingUp, 
  DollarSign,
  Award,
  Clock,
  MessageSquare
} from 'lucide-react';

const GalleryOverview = ({ gallery }) => {
  const stats = [
    {
      icon: Users,
      label: 'Active Artists',
      value: gallery?.stats?.artistCount || 0,
      color: 'bg-[#FFE951]'
    },
    {
      icon: Image,
      label: 'Total Artworks',
      value: gallery?.stats?.artworkCount || 0,
      color: 'bg-[#A8FF76]'
    },
    {
      icon: TrendingUp,
      label: 'Monthly Visitors',
      value: gallery?.stats?.visitorCount || 0,
      color: 'bg-[#76DEFF]'
    },
    {
      icon: DollarSign,
      label: 'Total Sales',
      value: `${gallery?.stats?.totalSales || 0} ETH`,
      color: 'bg-[#FF76F6]'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-3 border-black rounded-xl p-6 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.color} border-2 border-black rounded-lg`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Featured Artists */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-3 border-black rounded-xl p-6 
            shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award size={24} />
            Featured Artists
          </h3>
          <div className="space-y-4">
            {gallery?.featuredArtists?.slice(0, 3).map((artist, index) => (
              <div key={index} className="flex items-center gap-4">
                <img
                  src={artist.avatar || '/default-avatar.png'}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full border-2 border-black"
                />
                <div>
                  <p className="font-bold">{artist.name}</p>
                  <p className="text-sm text-gray-600">{artist.artworksCount} artworks</p>
                </div>
              </div>
            ))} 
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-3 border-black rounded-xl p-6 
            shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={24} />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {gallery?.recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 border-2 border-black rounded-lg">
                  <activity.icon size={20} />
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gallery Rules & Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-3 border-black rounded-xl p-6 
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare size={24} />
          Submission Guidelines
        </h3>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: gallery?.submissionGuidelines || 'No guidelines available' 
          }} />
        </div>
      </motion.div>
    </div>
  );
};

export default GalleryOverview; 