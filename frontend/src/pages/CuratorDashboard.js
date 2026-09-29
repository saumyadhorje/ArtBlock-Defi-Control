import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  DollarSign, 
  Eye, 
  PieChart, 
  Settings,
  Plus,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as ReChart, 
  Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import axiosInstance from '../utils/axios';
import { LOCAL_STORAGE_KEYS } from '../utils/auth';
import useWalletConnection from '../hooks/useWalletConnection';
import CreateGalleryModal from '../components/curator/CreateGalleryModal';

const CuratorDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    profile: {
      displayName: '',
      followersCount: 0,
      galleriesCount: 0,
      followingCount: 0,
      curatedArtworks: 0,
      role: 'Curator',
      badges: ['🏛️', '👨‍🎨', '🎭']
    },
    analytics: {
      totalGalleries: 0,
      totalArtistsCurated: 0,
      totalVisitors: 0,
      totalRevenue: 0,
      mostPopularGallery: 'N/A',
      topArtist: 'N/A',
      avgVisitDuration: 15
    },
    contract: {
      network: 'sepolia',
      totalMinted: 0,
      deploymentStatus: 'pending'
    },
    galleries: [],
    loading: true,
    error: null
  });

  useWalletConnection();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER));
        
        console.log(' Auth Check:', {
          hasToken: !!token,
          hasUser: !!user,
          userId: user?.id,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
        });

        if (!token || !user?.id) {
          throw new Error('Missing auth credentials');
        }

        const response = await axiosInstance.get(`/api/curator/dashboard/${user.id}`);
        console.log('Received dashboard data:', response.data); // Debug log

        if (!mounted) return;

        setDashboardData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...response.data.profile
          },
          analytics: {
            ...prev.analytics,
            ...response.data.analytics
          },
          contract: {
            ...prev.contract,
            ...response.data.contract
          },
          galleries: response.data.galleries || [],
          loading: false,
          error: null
        }));

      } catch (err) {
        console.error('Error fetching data:', err);
        if (!mounted) return;
        
        setDashboardData(prev => ({
          ...prev,
          error: err.message || 'Failed to load data',
          loading: false
        }));
        
        
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const DistributionCard = ({ title, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-gray-50 border-2 border-black rounded-xl"
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-600">{title}</span>
        <span className={`font-bold ${color}`}>{value}</span>
      </div>
    </motion.div>
  );

  const AnalyticCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-3 border-black rounded-xl p-6 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${color} border-2 border-black rounded-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-sm text-gray-600">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  const GalleryGrid = () => (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Galleries</h2>
        <div className="flex gap-4">
          <motion.button
            onClick={openModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-[#FFE951] font-bold border-2 border-black 
              rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
              transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Create Gallery
          </motion.button>
        </div>
      </div>

      {dashboardData.galleries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No galleries yet. Create your first gallery!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.galleries.map((gallery) => (
            <motion.div
              key={gallery._id}
              whileHover={{ scale: 1.02, rotate: 1 }}
              className="bg-white border-3 border-black rounded-xl overflow-hidden 
                shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
                transition-all cursor-pointer"
              onClick={() => {
                console.log('Navigating to gallery:', gallery._id);
                navigate(`/gallery/${gallery._id}`);
              }}
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={gallery.coverImage}
                  alt={gallery.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <span className="px-3 py-1 bg-white border-2 border-black rounded-full 
                    text-sm font-bold hover:bg-[#FFE951] transition-colors"
                  >
                    {gallery.pendingApplications || 0} Pending Applications
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-lg">{gallery.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{gallery.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">
                    {gallery.artworksCount} Artworks
                  </span>
                  <span className="text-sm font-bold">
                    {gallery.artistsCount} Artists
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );

  const AnalyticsSection = () => {
    const pieData = [
      { name: 'Active Galleries', value: dashboardData.analytics.totalGalleries },
      { name: 'Curated Artists', value: dashboardData.analytics.totalArtistsCurated },
    ];

    const barData = [
      { name: 'Visitors', value: dashboardData.analytics.totalVisitors },
      { name: 'Revenue', value: dashboardData.analytics.totalRevenue },
      { name: 'Artists', value: dashboardData.analytics.totalArtistsCurated },
    ];

    const COLORS = ['#FFE951', '#A8FF76', '#76DEFF', '#FF76F6'];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Gallery Performance */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 
          shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart2 size={24} />
            Gallery Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gallery Distribution */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 
          shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PieChart size={24} />
            Gallery Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#FFE951"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Legend />
            </ReChart>
          </ResponsiveContainer>
        </div>

        {/* Visitor Trends */}
        <div className="md:col-span-2 bg-white border-4 border-black rounded-2xl p-6 
          shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={24} />
            Visitor Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={[
                { name: 'Jan', visitors: dashboardData.analytics.totalVisitors * 0.7 },
                { name: 'Feb', visitors: dashboardData.analytics.totalVisitors * 0.9 },
                { name: 'Mar', visitors: dashboardData.analytics.totalVisitors },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid black',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#FFE951"
                fill="#FFE951"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  if (dashboardData.loading) {
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

  return (
    <div className="min-h-screen bg-[#F7F5FF]">
      {/* Hero Section */}
      <div className="bg-white border-b-4 border-black">
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
                <span className="px-6 py-2 bg-[#FFE951] border-3 border-black 
                  rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-base 
                  font-bold inline-block transform -rotate-2"
                >
                  {dashboardData.profile.role} Dashboard 🏛️
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black">
                Welcome back,<br />
                {dashboardData.profile.displayName}!
              </h1>
            </div>
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#FFE951] text-lg font-bold border-3 
                border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
                hover:shadow-none transition-all flex items-center gap-2"
            >
              <Plus className="animate-pulse" />
              Create Gallery
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticCard
              title="Total Galleries"
              value={dashboardData.analytics.totalGalleries}
              icon={LayoutGrid}
              color="bg-[#FFE951]"
            />
            <AnalyticCard
              title="Artists Curated"
              value={dashboardData.analytics.totalArtistsCurated}
              icon={Users}
              color="bg-[#A8FF76]"
            />
            <AnalyticCard
              title="Gallery Visitors"
              value={dashboardData.analytics.totalVisitors}
              icon={Eye}
              color="bg-[#76DEFF]"
            />
            <AnalyticCard
              title="Total Revenue"
              value={`${dashboardData.analytics.totalRevenue} ETH`}
              icon={DollarSign}
              color="bg-[#FF76F6]"
            />
          </div>

          {/* Profile and Revenue Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-1 bg-white border-4 border-black rounded-2xl 
                overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-[#FFE951] border-3 
                    border-black rounded-full">
                    <Users size={32} />
                  </div>
                  <h2 className="text-2xl font-black">
                    {dashboardData.profile.displayName}
                  </h2>
                  <div className="flex justify-center gap-2">
                    {dashboardData.profile.badges.map((badge, index) => (
                      <span key={index} className="text-2xl">{badge}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border-2 border-black rounded-xl 
                    text-center">
                    <div className="text-sm text-gray-600">Followers</div>
                    <div className="text-xl font-bold">
                      {dashboardData.profile.followersCount}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-2 border-black rounded-xl 
                    text-center">
                    <div className="text-sm text-gray-600">Following</div>
                    <div className="text-xl font-bold">
                      {dashboardData.profile.followingCount}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Revenue Distribution Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-white border-4 border-black rounded-2xl 
                p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <PieChart size={24} />
                  Gallery Performance
                </h3>
                <span className="p-2 bg-gray-100 border-2 border-black rounded-lg">
                  <Settings size={20} />
                </span>
              </div>
              
              <div className="space-y-4">
                <DistributionCard
                  title="Most Popular Gallery"
                  value={`${dashboardData.analytics.mostPopularGallery || 'N/A'}`}
                  color="text-green-600"
                />
                <DistributionCard
                  title="Top Artist"
                  value={`${dashboardData.analytics.topArtist || 'N/A'}`}
                  color="text-blue-600"
                />
                <DistributionCard
                  title="Average Visit Duration"
                  value={`${dashboardData.analytics.avgVisitDuration || 0} mins`}
                  color="text-purple-600"
                />
              </div>
            </motion.div>
          </div>

          {/* Analytics Section */}
          <AnalyticsSection />

          {/* Galleries Grid */}
          <GalleryGrid />
        </div>
      </div>

      <CreateGalleryModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default CuratorDashboard; 