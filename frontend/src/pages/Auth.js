import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import axiosInstance from '../utils/axios';
import useWalletConnection from '../hooks/useWalletConnection';
import { Wallet, Loader2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const LOCAL_STORAGE_KEYS = {
  TOKEN: 'artblock_token',
  USER: 'artblock_user',
  WALLET: 'artblock_wallet'
};

const setUserSession = (token, user) => {
  console.log('Setting user session:', { token, user });
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET, user.walletAddress);
    
    // Verify the data was set correctly
    const savedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    
    console.log('Verified localStorage after setting:', {
      tokenSaved: !!savedToken,
      userSaved: !!savedUser,
      savedUserData: JSON.parse(savedUser)
    });
  } catch (error) {
    console.error('Error setting user session:', error);
  }
};

const clearUserSession = () => {
  Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

const RetroBeams = () => {
  const beamsRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animateRandomBeam = () => {
      if (beamsRef.current) {
        const beams = Array.from(beamsRef.current.querySelectorAll('.beam'));
        const randomBeam = beams[Math.floor(Math.random() * beams.length)];
        
        if (randomBeam) {
          gsap.to(randomBeam, {
            opacity: 0.8,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              gsap.to(randomBeam, {
                opacity: 0.1,
                duration: 1,
                ease: "power2.out"
              });
            }
          });
        }
      }
    };

    const interval = setInterval(animateRandomBeam, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      ref={beamsRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(147, 197, 253, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(147, 197, 253, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `translateY(${mousePosition.y * 10}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      />

      {/* Beams */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="beam absolute w-full h-[2px] left-0"
            style={{
              top: `${25 + i * 20}%`,
              background: 'linear-gradient(90deg, transparent, rgba(147, 197, 253, 0.1), transparent)',
              opacity: 0.1
            }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="beam absolute h-full w-[2px]"
            style={{
              left: `${20 + i * 15}%`,
              background: 'linear-gradient(180deg, transparent, rgba(147, 197, 253, 0.1), transparent)',
              opacity: 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    role: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add wallet connection listener
  useWalletConnection();

  // Add refs for GSAP animations
  const glowRef = useRef(null);
  const containerRef = useRef(null);
  const beamsRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    const wallet = localStorage.getItem(LOCAL_STORAGE_KEYS.WALLET);
    
    console.log('Auth initial check:', { token, user, wallet });
    
    if (token && user && wallet) {
      const userData = JSON.parse(user);
      const path = `/dashboard/${userData.role.toLowerCase()}`;
      console.log('User already logged in, navigating to:', path);
      navigate(path);
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user came from role selection
    const searchParams = new URLSearchParams(window.location.search);
    const fromRole = searchParams.get('fromRole');
    const selectedRole = localStorage.getItem('selectedRole');
    
    if (fromRole && selectedRole) {
      setFormData(prev => ({
        ...prev,
        role: selectedRole
      }));
      // Clear the temporary storage
      localStorage.removeItem('selectedRole');
      // Clear the URL parameter
      window.history.replaceState({}, '', '/auth');
    }
  }, []);

  // Glow animation
  useEffect(() => {
    const glowElement = glowRef.current;
    if (glowElement) {
      gsap.to(glowElement, {
        rotate: 360,
        duration: 10,
        repeat: -1,
        ease: 'none',
      });
    }
    return () => gsap.killTweensOf(glowElement);
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }

      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setFormData(prev => ({ ...prev, walletAddress: address }));
      
    } catch (err) {
      setError(err.message);
      clearUserSession();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // For signup, first collect user details then redirect to role selection
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        localStorage.setItem('signupData', JSON.stringify({
          username: formData.username,
          password: formData.password,
          walletAddress: formData.walletAddress
        }));
        
        navigate('/role-selection');
        return;
      }

      // Handle login
      const response = await axiosInstance.post('/api/auth/login', {
        password: formData.password,
        walletAddress: formData.walletAddress
      });

      console.log('Login successful:', {
        token: response.data.token,
        user: response.data.user
      });

      setUserSession(response.data.token, response.data.user);
      
      const userRole = response.data.user.role.toLowerCase();
      console.log('Navigating to dashboard for role:', userRole);

      switch(userRole) {
        case 'curator':
          navigate('/dashboard/curator');
          break;
        case 'artist':
          navigate('/dashboard/artist');
          break;
        case 'investor':
          console.log('Redirecting to investor dashboard');
          navigate('/dashboard/investor');
          break;
        default:
          console.error('Unknown role:', response.data.user.role);
          navigate('/dashboard');
      }

      console.log('Login response:', response.data);

    } catch (err) {
      console.error('Auth error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message);
      clearUserSession();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Render connect wallet screen if no wallet is connected
  if (!formData.walletAddress) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-['Space_Grotesk']">
        <RetroBeams />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 
                bg-white/5 backdrop-blur-lg rounded-full 
                border border-white/10"
            >
              <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">
                Secure Authentication
              </span>
            </motion.div>

            {/* Main Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <motion.h1 className="text-5xl font-bold text-white leading-none tracking-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="block"
                  >
                    Welcome to
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="block text-[#60A5FA]"
                  >
                    ArtBlock
                  </motion.span>
                </motion.h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/60 text-lg font-['Plus_Jakarta_Sans']"
              >
                Connect your wallet to {isLogin ? 'access your account' : 'create a new account'} 
                and join the future of digital art.
              </motion.p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 
                      flex items-center justify-center shrink-0"
                    >
                      <span className="text-red-500">⚠️</span>
                    </div>
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={connectWallet}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`
                    w-full px-8 py-4 bg-white/5 backdrop-blur-lg rounded-xl
                    font-medium text-white border border-white/10
                    flex items-center justify-center gap-3
                    hover:bg-white/10 transition-all duration-300
                    ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setIsLogin(!isLogin)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 text-white/60 hover:text-white
                    font-medium transition-colors duration-300"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form after wallet connection
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-['Space_Grotesk']">
      <RetroBeams />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Connected Wallet Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 
              bg-white/5 backdrop-blur-lg rounded-full 
              border border-white/10"
          >
            <div className="w-2 h-2 bg-[#60A5FA] rounded-full" />
            <span className="text-white/80 text-sm font-medium">
              Wallet Connected: {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
            </span>
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 
              rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-white/60 font-['Plus_Jakarta_Sans']">
                {isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Fill in your details to create an account'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white/5 backdrop-blur-lg rounded-xl 
                  border border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 
                    flex items-center justify-center shrink-0"
                  >
                    <span className="text-red-500">⚠️</span>
                  </div>
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-white/60 text-sm mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 
                      rounded-xl text-white placeholder-white/30
                      focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]
                      transition-colors duration-200 outline-none"
                    placeholder="Enter your username"
                    required
                  />
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-white/60 text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 
                    rounded-xl text-white placeholder-white/30
                    focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]
                    transition-colors duration-200 outline-none"
                  placeholder="Enter your password"
                  required
                />
              </motion.div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-white/60 text-sm mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 
                      rounded-xl text-white placeholder-white/30
                      focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]
                      transition-colors duration-200 outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`
                  w-full px-8 py-4 bg-white/5 backdrop-blur-lg rounded-xl
                  font-medium text-white border border-white/10
                  flex items-center justify-center gap-3 mt-8
                  hover:bg-white/10 transition-all duration-300
                  ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0A0A0A] text-white/40">
                  or
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  ...formData,
                  username: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 text-white/60 hover:text-white
                font-medium transition-colors duration-300"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth; 