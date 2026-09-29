import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axios';
import gsap from 'gsap';

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
    </motion.div>
  );
};

const RoleCard = ({ title, description, icon, benefits, onClick, isSelected, image }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        gsap.to(card, {
          '--mouseX': `${x}px`,
          '--mouseY': `${y}px`,
          duration: 0.3,
          ease: 'power3.out'
        });
      });
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl
        border border-white/10 p-6 cursor-pointer group
        before:absolute before:w-80 before:h-80 before:content-['']
        before:bg-[radial-gradient(circle,rgba(147,197,253,0.1),transparent_50%)]
        before:top-[var(--mouseY)] before:left-[var(--mouseX)]
        before:opacity-0 before:translate-x-[-50%] before:translate-y-[-50%]
        before:transition-opacity before:duration-300
        hover:before:opacity-100
        ${isSelected ? 'ring-2 ring-[#60A5FA] ring-offset-2 ring-offset-[#0A0A0A]' : ''}
      `}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 bg-[#60A5FA] 
            rounded-full flex items-center justify-center z-10"
        >
          <span className="text-black text-sm">✓</span>
        </motion.div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="text-4xl bg-white/[0.03] p-3 rounded-xl
              border border-white/10"
          >
            {icon}
          </motion.div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform 
              duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t 
            from-black/50 to-transparent" />
        </div>

        <p className="text-white/60 font-['Plus_Jakarta_Sans']">
          {description}
        </p>
        
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3 bg-white/[0.03] p-3 
                rounded-xl border border-white/10"
            >
              <span className="text-[#60A5FA]">✦</span>
              <span className="text-sm text-white/60">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const { userRole, saveUserRole, setUserSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If role exists, redirect kar dashboard la
    if (userRole) {
      navigate(`/dashboard/${userRole.toLowerCase()}`);
    }
  }, [userRole, navigate]);

  const roles = [
    {
      title: "Artist",
      description: "Create and sell your digital masterpieces as NFTs",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=1000",
      benefits: [
        "Create and mint unique NFTs",
        "Earn royalties from secondary sales",
        "Build your artist profile",
        "Join exclusive artist communities"
      ]
    },
    {
      title: "Curator",
      description: "Discover and promote the best digital art collections",
      icon: "🎯",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000",
      benefits: [
        "Create themed galleries",
        "Earn commission from sales",
        "Discover emerging artists",
        "Shape the future of digital art"
      ]
    },
    {
      title: "Investor",
      description: "Build your digital art portfolio and support artists",
      icon: "💎",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000",
      benefits: [
        "Early access to new drops",
        "Portfolio analytics tools",
        "Exclusive investment opportunities",
        "Connect with top artists"
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    const walletAddress = window.ethereum.selectedAddress;
    const roleMapping = {
      "Artist": "artist",
      "Curator": "curator",
      "Investor": "investor"
    };
    
    const normalizedRole = roleMapping[role];
    if (!normalizedRole) {
      console.error('Invalid role selected');
      return;
    }
    
    saveUserRole(normalizedRole, walletAddress);
    navigate(`/dashboard/${normalizedRole}`);
  };

  const handleContinue = async () => {
    if (selectedRole) {
      try {
        setLoading(true);
        const roleMapping = {
          "Artist": "artist",
          "Curator": "curator",
          "Investor": "investor"
        };
        
        const normalizedRole = roleMapping[selectedRole];
        if (!normalizedRole) {
          console.error('Invalid role selected');
          return;
        }

        // Get stored signup data
        const signupData = JSON.parse(localStorage.getItem('signupData'));
        if (!signupData) {
          navigate('/auth');
          return;
        }

        // Complete registration with role
        const response = await axiosInstance.post('/api/auth/register', {
          ...signupData,
          role: normalizedRole
        });

        // Clear temporary storage
        localStorage.removeItem('signupData');

        // Set user session
        setUserSession(response.data.token, response.data.user);
        
        // Navigate to appropriate dashboard
        navigate(`/dashboard/${normalizedRole}`);
        
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Redirect to auth if no signup data exists
  useEffect(() => {
    const signupData = localStorage.getItem('signupData');
    if (!signupData) {
      navigate('/auth');
    }
  }, [navigate]);

  // If user already has a role, mag role option deu nakos tyala
  if (userRole) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-['Space_Grotesk']">
      <RetroBeams />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-7xl w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 
                bg-white/5 backdrop-blur-lg rounded-full 
                border border-white/10"
            >
              <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">
                Choose Your Role
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              How will you shape the future of digital art?
            </motion.h1>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                <RoleCard 
                  {...role} 
                  isSelected={selectedRole === role.title}
                  onClick={() => setSelectedRole(role.title)}
                />
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white/5 backdrop-blur-lg rounded-xl
                border border-white/10 text-white/60 hover:text-white
                transition-colors duration-300"
            >
              ← Go Back
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`
                px-8 py-3 rounded-xl font-medium
                flex items-center justify-center gap-2
                ${selectedRole 
                  ? 'bg-white/5 backdrop-blur-lg border border-white/10 text-white cursor-pointer hover:bg-white/10' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'}
              `}
            >
              Continue →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;