import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, clearUserSession } from '../utils/auth';
import useWalletConnection from '../hooks/useWalletConnection';
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
          backgroundSize: '100px 100px', // Increased grid size
          transform: `translateY(${mousePosition.y * 10}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      />

      {/* Horizontal Beams */}
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
      </div>

      {/* Vertical Beams */}
      <div className="absolute inset-0">
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

const HeroSection = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const user = getUser();
  useWalletConnection();
  
  // Refs for GSAP animations
  const glowRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Create revolving glow animation
    const glowElement = glowRef.current;
    const containerElement = containerRef.current;

    if (glowElement && containerElement) {
      gsap.set(glowElement, {
        width: '150%',
        height: '150%',
        top: '-25%',
        left: '-25%',
      });

      gsap.to(glowElement, {
        rotate: 360,
        duration: 10,
        repeat: -1,
        ease: 'none',
      });
    }

    return () => {
      // Cleanup animation
      gsap.killTweensOf(glowElement);
    };
  }, []);

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    switch (user?.role?.toLowerCase()) {
      case 'artist':
        navigate('/dashboard/artist');
        break;
      case 'curator':
        navigate('/dashboard/curator');
        break;
      default:
        navigate('/auth');
        break;
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden font-['Space_Grotesk']">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [0, -360],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="relative z-10 space-y-12">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 
                bg-white/5 backdrop-blur-lg rounded-full 
                border border-white/10"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">
                Live on Ethereum
              </span>
            </motion.div>

            {/* Main Content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <motion.h1 className="text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="block"
                  >
                    The Future
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="block text-[#6366F1]"
                  >
                    of Digital Art
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="block"
                  >
                    is Here
                  </motion.span>
                </motion.h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-white/60 max-w-xl leading-relaxed"
              >
                Experience the next evolution of digital art creation and collection. 
                Join a thriving community of visionaries shaping the future of art.
              </motion.p>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-6"
              >
                {[
                  { value: '10K+', label: 'Artists' },
                  { value: '50K+', label: 'Artworks' },
                  { value: '2M+', label: 'Collections' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="p-6 bg-white/[0.03] backdrop-blur-lg rounded-2xl 
                      border border-white/10 group transition-all duration-300"
                  >
                    <motion.div 
                      className="font-bold text-3xl text-white group-hover:text-[#6366F1]
                        transition-colors duration-300"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-white/40">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-4 pt-8"
              >
                <motion.button
                  onClick={handleCreateClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#6366F1] text-white font-medium rounded-xl
                    flex items-center gap-3 transition-all duration-300"
                >
                  {isLoggedIn ? `Launch Studio` : 'Get Started'}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.div>
                </motion.button>
               <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => window.location.href = "/galleries"}
  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white 
    font-medium rounded-xl backdrop-blur-lg border border-white/10
    transition-all duration-300"
>
  Explore Gallery
</motion.button>
              </motion.div>
            </div>
          </div>

          {/* Right Column - Featured NFT Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10" ref={containerRef}>
              {/* Revolving Glow Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  ref={glowRef}
                  className="absolute bg-[#60A5FA]/20 blur-[64px]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, #60A5FA, transparent, transparent)',
                  }}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/5] bg-white/5 backdrop-blur-lg 
                  rounded-2xl overflow-hidden border border-white/10
                  group transition-all duration-500"
              >
                <img 
                  src="https://images.unsplash.com/photo-1634986666676-ec8fd927c23d"
                  alt="Featured Digital Art"
                  className="w-full h-full object-cover 
                    group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300" 
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute top-6 left-6 px-4 py-2 
                    bg-white/10 backdrop-blur-md rounded-full 
                    border border-white/20"
                >
                  <span className="text-white/90 text-sm font-medium">
                    Featured Artwork
                  </span>
                </motion.div>
                <div className="absolute bottom-6 left-6 right-6 transform
                  translate-y-full group-hover:translate-y-0 transition-transform
                  duration-300 space-y-2"
                >
                  <div className="text-white font-medium text-xl">
                    Digital Horizon
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white/60">by Digital Visionary</div>
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md 
                      rounded-full text-white/90 text-sm">
                      8.5 ETH
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -top-20 -right-20 w-40 h-40 
                  border border-white/10 rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: [0, -360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -bottom-10 -left-10 w-20 h-20 
                  border border-white/10 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CarouselSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef(null);
  const glowRef = useRef(null);

  const slides = [
    {
      title: ["Unleash", "Creative", "Power"],
      subtitle: "For Artists",
      image: "https://images.unsplash.com/photo-1558865869-c93f6f8482af?auto=format&fit=crop&q=80",
      description: "Create and sell your digital masterpieces as NFTs. Set your own terms, earn royalties, and join a community of creative pioneers.",
      features: [
        "Mint NFTs easily",
        "Earn royalties forever",
        "Build your collector base",
        "Join exclusive events"
      ]
    },
    {
      title: ["Curate", "Digital", "Future"],
      subtitle: "For Curators",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80",
      description: "Discover emerging artists, curate exclusive galleries, and earn through successful exhibitions and sales.",
      features: [
        "Create virtual galleries",
        "Earn curation rewards",
        "Launch exhibitions",
        "Support artists"
      ]
    },
    {
      title: ["Collect", "Digital", "Legacy"],
      subtitle: "For Collectors",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80",
      description: "Invest in the future of art. Build your collection, support artists, and join an exclusive community of art enthusiasts.",
      features: [
        "Build your portfolio",
        "Access exclusive drops",
        "Trade with confidence",
        "Join collector events"
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    if (containerRef.current && glowRef.current) {
      const glowElement = glowRef.current;
      
      gsap.set(glowElement, {
        width: '150%',
        height: '150%',
        top: '-25%',
        left: '-25%',
      });

      gsap.to(glowElement, {
        rotate: 360,
        duration: 10,
        repeat: -1,
        ease: 'none',
      });
    }

    return () => {
      clearInterval(timer);
      gsap.killTweensOf(glowRef.current);
    };
  }, []);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [0, -360],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 
              bg-white/5 backdrop-blur-lg rounded-full 
              border border-white/10"
          >
            <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-['Plus_Jakarta_Sans'] font-medium">
              Experience The Future
            </span>
          </motion.div>

          <h2 className="text-6xl md:text-7xl font-black text-white font-['Space_Grotesk']">
            Join The Revolution
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-['Outfit']">
            Discover how ArtBlock is transforming the digital art landscape
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative" ref={containerRef}>
          <motion.div
            animate={{ x: `${-currentSlide * 100}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex w-full"
          >
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="w-full flex-shrink-0 px-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="relative bg-white/[0.03] backdrop-blur-lg border 
                    border-white/10 rounded-2xl overflow-hidden p-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                      {/* Slide Header */}
                      <div className="space-y-2">
                        <motion.span 
                          className="text-[#6366F1] text-xl font-['Plus_Jakarta_Sans'] font-bold"
                        >
                          {slide.subtitle}
                        </motion.span>
                        <div className="space-y-1">
                          {slide.title.map((word, i) => (
                            <motion.h3
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-4xl font-black text-white font-['Space_Grotesk']"
                            >
                              {word}
                            </motion.h3>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xl text-white/60 font-['Outfit']">
                        {slide.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-4">
                        {slide.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 group"
                          >
                            <motion.div 
                              whileHover={{ scale: 1.2 }}
                              className="w-1 h-6 bg-[#6366F1] group-hover:h-8 
                                transition-all duration-300"
                            />
                            <span className="font-['Plus_Jakarta_Sans'] text-white/80 
                              group-hover:text-white transition-colors duration-300"
                            >
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-[#6366F1] text-white font-medium rounded-xl
                          flex items-center gap-3 transition-all duration-300
                          font-['Space_Grotesk']"
                      >
                        Learn More
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </motion.div>
                      </motion.button>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                      {/* Revolving Glow Effect */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div
                          ref={glowRef}
                          className="absolute bg-[#6366F1]/20 blur-[64px]"
                          style={{
                            background: 'conic-gradient(from 0deg, transparent, #6366F1, transparent, transparent)',
                          }}
                        />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative aspect-[4/5] bg-white/5 backdrop-blur-lg 
                          rounded-2xl overflow-hidden border border-white/10
                          group transition-all duration-500"
                      >
                        <img 
                          src={slide.image}
                          alt="Featured Digital Art"
                          className="w-full h-full object-cover 
                            group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Controls */}
          <div className="flex justify-center gap-6 mt-12">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-1 rounded-full transition-all duration-300
                  ${currentSlide === index ? 
                    'bg-[#6366F1] w-20' : 
                    'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const JoinUsSection = () => {
  const features = [
    {
      title: "Create & Earn",
      description: "Mint your digital art as NFTs and earn royalties forever",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80",
      stats: { value: "32K+", label: "Artists Earning" }
    },
    {
      title: "Trade & Collect",
      description: "Build your digital art portfolio with verified authenticity",
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&q=80",
      stats: { value: "2.5M+", label: "NFTs Traded" }
    },
    {
      title: "Connect & Grow",
      description: "Join exclusive events and connect with global artists",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80",
      stats: { value: "150+", label: "Events Monthly" }
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 
              bg-white/5 backdrop-blur-lg rounded-full border border-white/10"
          >
            <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-['Plus_Jakarta_Sans'] font-medium">
              The Future of Digital Art
            </span>
          </motion.div>

          <h2 className="text-6xl md:text-7xl font-black text-white font-['Space_Grotesk']">
            Join the NFT Revolution
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-['Outfit']">
            Step into the future of digital art ownership. Create, collect, and trade 
            NFTs in a thriving ecosystem built for artists and collectors.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                className="relative bg-white/[0.03] backdrop-blur-lg border 
                  border-white/10 rounded-2xl overflow-hidden h-full"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover 
                      group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300" 
                  />
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 font-['Outfit']">
                    {feature.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-3xl font-black text-[#6366F1] 
                      font-['Space_Grotesk']"
                    >
                      {feature.stats.value}
                    </div>
                    <div className="text-sm text-white/60 font-['Plus_Jakarta_Sans']">
                      {feature.stats.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white/[0.03] backdrop-blur-lg border 
            border-white/10 rounded-3xl p-12 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center 
            justify-between gap-8"
          >
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white font-['Space_Grotesk']">
                Ready to Start Your Journey?
              </h3>
              <p className="text-white/60 font-['Outfit']">
                Join thousands of artists and collectors in the NFT revolution
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#6366F1] text-white font-medium rounded-xl
                  flex items-center gap-3 transition-all duration-300
                  font-['Space_Grotesk']"
              >
                Start Creating
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </motion.div>
              </motion.button>
 <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => window.location.href = "#about"}
  className="px-8 py-4 bg-white/5 backdrop-blur-lg text-white 
    font-medium rounded-xl border border-white/10 
    transition-all duration-300 font-['Space_Grotesk']"
>
  Learn More
</motion.button>
            </div>
          </div>

          {/* Background Decoration */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-0 right-0 w-72 h-72 
              bg-[#6366F1]/10 rounded-full blur-3xl -z-10"
          />
        </motion.div>
      </div>
    </section>
  );
};

const TickerSection = () => {
  const techStack1 = [
    { 
      name: 'React.js', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      color: '#61DAFB'
    },
    { 
      name: 'Express.js', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
      color: '#000000'
    },
    { 
      name: 'MongoDB', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      color: '#47A248'
    },
    { 
      name: 'PostgreSQL', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
      color: '#336791'
    },
    { 
      name: 'Web3.js', 
      icon: 'https://seeklogo.com/images/W/web3js-logo-62DEE79B50-seeklogo.com.png',
      color: '#F16822'
    },
    { 
      name: 'IPFS', 
      icon: 'https://docs.ipfs.tech/images/ipfs-logo.svg',
      color: '#65C2CB'
    }
  ];

  const techStack2 = [
    { 
      name: 'Solidity', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidity/solidity-original.svg',
      color: '#363636'
    },
    
    { 
      name: 'Spring Boot', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
      color: '#6DB33F'
    },
    { 
      name: 'Flutter', 
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
      color: '#02569B'
    },
    { 
      name: 'MetaMask', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      color: '#E2761B'
    },
    
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 
            bg-white/5 backdrop-blur-lg rounded-full 
            border border-white/10 mb-6"
        >
          <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-['Plus_Jakarta_Sans'] font-medium">
            Powered By Latest Tech
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-white font-['Space_Grotesk'] mb-4">
          Our Tech Stack
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto font-['Outfit']">
          Built with cutting-edge technologies for optimal performance and security
        </p>
      </div>

      {/* First Ticker */}
      <div className="relative">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex gap-8 mb-8"
        >
          {[...techStack1, ...techStack1].map((tech, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="flex-shrink-0 px-6 py-4 bg-white/[0.02] backdrop-blur-lg 
                rounded-xl border border-white/10 flex items-center gap-4 
                group hover:border-[#6366F1]/40 transition-all duration-300
                min-w-[200px] justify-center"
            >
              <div className="w-10 h-10 relative flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${tech.color}15` }}
                  whileHover={{ scale: 1.2 }}
                />
                <img 
                  src={tech.icon} 
                  alt={tech.name}
                  className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <span className="text-white/60 group-hover:text-white font-['Plus_Jakarta_Sans'] font-medium">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Second Ticker (Reverse Direction) */}
      <div className="relative">
        <motion.div
          animate={{ x: [-1920, 0] }}
          transition={{ 
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex gap-8"
        >
          {[...techStack2, ...techStack2].map((tech, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="flex-shrink-0 px-6 py-4 bg-white/[0.02] backdrop-blur-lg 
                rounded-xl border border-white/10 flex items-center gap-4 
                group hover:border-[#6366F1]/40 transition-all duration-300
                min-w-[200px] justify-center"
            >
              <div className="w-10 h-10 relative flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${tech.color}15` }}
                  whileHover={{ scale: 1.2 }}
                />
                <img 
                  src={tech.icon} 
                  alt={tech.name}
                  className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <span className="text-white/60 group-hover:text-white font-['Plus_Jakarta_Sans'] font-medium">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <RetroBeams />
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="space-y-0"> {/* Remove spacing between sections */}
          <HeroSection />
          <CarouselSection />
          <TickerSection />
          <JoinUsSection />
        </div>
      </div>
    </div>
  );
};

export default Landing;