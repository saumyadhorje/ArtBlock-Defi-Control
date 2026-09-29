import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  BarChart2,
  DollarSign,
  Activity,
  LineChart,
  Star
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart as ReChart, 
  Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const InvestorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    profile: {
      displayName: 'Loading...',
      investmentsCount: 0,
      portfolioValue: 0,
      totalReturns: 0,
      role: 'Investor',
      badges: ['💼']
    },
    analytics: {
      totalInvested: 0,
      totalROI: 0,
      activeInvestments: 0,
      portfolioValue: 0
    },
    portfolio: {
      investments: [],
      loading: true,
      error: null
    }
  });

  // Add state for portfolio distribution
  const [portfolioDistribution, setPortfolioDistribution] = useState([
    { name: 'Art', value: 30 },
    { name: 'Collectibles', value: 25 },
    { name: 'Music', value: 20 },
    { name: 'Virtual Real Estate', value: 25 }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('artblock_token');
        const userStr = localStorage.getItem('artblock_user');
        
        if (!token || !userStr) {
          console.log('Missing auth credentials:', { token: !!token, userStr: !!userStr });
          return;
        }

        const user = JSON.parse(userStr);
        console.log('Fetching data for user:', {
          id: user.id,
          role: user.role,
          token: token.substring(0, 20) + '...'
        });

        const response = await fetch(`http://localhost:5000/api/investor/dashboard/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          const errorData = await response.json();
          console.error('Authentication failed:', errorData);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully fetched dashboard data:', data);

        setDashboardData(prevState => ({
          profile: {
            displayName: data.profile?.displayName || user.username,
            investmentsCount: data.profile?.investmentsCount || 0,
            portfolioValue: data.analytics?.portfolioValue || 0,
            totalReturns: data.analytics?.totalROI || 0,
            role: 'Investor',
            badges: data.profile?.badges || ['💼']
          },
          analytics: {
            totalInvested: data.analytics?.totalInvested || 0,
            totalROI: data.analytics?.totalROI || 0,
            activeInvestments: data.analytics?.totalTransactions || 0,
            portfolioValue: data.analytics?.portfolioValue || 0
          },
          portfolio: {
            investments: data.portfolio?.ownedNFTs || [],
            loading: false,
            error: null
          }
        }));

        if (data.portfolio?.ownedNFTs?.length > 0) {
          setPortfolioDistribution(data.portfolio.ownedNFTs.map((nft, index) => ({
            name: nft.name || `Investment ${index + 1}`,
            value: nft.currentPrice || 0
          })));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array - fetch only on mount

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'];
  
  const performanceData = [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 900 },
    { month: 'Apr', value: 1500 },
    { month: 'May', value: 2000 },
    { month: 'Jun', value: 1800 },
  ];

  const stats = [
    {
      title: "Portfolio Value",
      value: `${dashboardData.analytics.portfolioValue.toFixed(2)} ETH`,
      icon: Wallet,
      color: "bg-[#6366F1]"
    },
    {
      title: "Total ROI",
      value: `${dashboardData.analytics.totalROI.toFixed(2)}%`,
      icon: TrendingUp,
      color: "bg-[#8B5CF6]"
    },
    {
      title: "Total Invested",
      value: `${dashboardData.analytics.totalInvested.toFixed(2)} ETH`,
      icon: DollarSign,
      color: "bg-[#EC4899]"
    },
    {
      title: "Active Investments",
      value: dashboardData.analytics.activeInvestments,
      icon: Star,
      color: "bg-[#F43F5E]"
    }
  ];

  const handlePurchase = async (nftId) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:5000/api/investor/purchase/${nftId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('artblock_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      console.log('Purchase successful:', result);

      // Update UI to reflect purchase
      setDashboardData(prev => ({
        ...prev,
        portfolio: {
          ...prev.portfolio,
          ownedNFTs: [...prev.portfolio.ownedNFTs, result.transaction.nftId]
        }
      }));

      // Show success message
      alert('Artwork purchased successfully!');

    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add purchase button to NFT display
  const renderNFT = (nft) => (
    <div key={nft._id} className="nft-card">
      <img src={nft.imageUrl} alt={nft.title} />
      <h3>{nft.title}</h3>
      <p>Price: {nft.price} ETH</p>
      <button 
        onClick={() => handlePurchase(nft._id)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Purchase'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
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
            className="flex flex-wrap items-center justify-between gap-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <span className="px-6 py-2 bg-[#6366F1] text-white rounded-full font-['Plus_Jakarta_Sans'] font-medium">
                  {dashboardData.profile.role} Dashboard {dashboardData.profile.badges[0]}
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black text-white font-['Space_Grotesk']">
                Welcome back,<br />
                {dashboardData.profile.displayName}!
              </h1>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-['Plus_Jakarta_Sans']">{stat.title}</p>
                    <p className="text-2xl font-bold text-white font-['Space_Grotesk']">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
            >
              <h4 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk'] flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Portfolio Performance
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#ffffff40" />
                    <YAxis stroke="#ffffff40" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a1a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366F1" 
                      fillOpacity={1}
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Portfolio Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
            >
              <h4 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk'] flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Portfolio Distribution
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReChart>
                    <Pie
                      data={portfolioDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a1a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span className="text-white/60 font-['Plus_Jakarta_Sans']">{value}</span>
                      )}
                    />
                  </ReChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-[#6366F1]/40 transition-all"
          >
            <h4 className="text-xl font-bold text-white mb-4 font-['Space_Grotesk']">Recent Activity</h4>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-[#6366F1]/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#EC4899] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-white font-medium font-['Space_Grotesk']">New Investment Made</p>
                    <p className="text-white/60 text-sm font-['Plus_Jakarta_Sans']">2 hours ago</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;

