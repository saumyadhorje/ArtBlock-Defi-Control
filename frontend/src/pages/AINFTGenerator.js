import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Info, Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { generateImage, generateUniqueImage, MODELS } from '../utils/huggingface';
import gsap from 'gsap';
import _ from 'lodash'; 
import { enhancePrompt } from '../utils/openai';

// RetroBeams Component
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

  // Random beam animation effect
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
          backgroundSize: '100px 100px',
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

const AINFTGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [generationAttempt, setGenerationAttempt] = useState(0);
  const [selectedModel, setSelectedModel] = useState('FLUX_NFT_V4');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Debounced preview update
  const updatePreview = _.debounce((newPrompt) => {
    setPreviewPrompt(newPrompt);
  }, 500);

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    updatePreview(newPrompt);
  };

  // Simulate progress during generation
  const startProgressSimulation = () => {
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval.current);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
  };

  const stopProgressSimulation = () => {
    clearInterval(progressInterval.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setIsEnhancing(true);
    startProgressSimulation();
    
    try {
      // First, enhance the prompt using ChatGPT
      console.log('Original prompt:', prompt);
      const improvedPrompt = await enhancePrompt(prompt);
      setEnhancedPrompt(improvedPrompt);
      console.log('Enhanced prompt:', improvedPrompt);
      
      // Generate image with enhanced prompt
      const { imageUrl, imageHash, prompt: finalPrompt, modelUsed } = 
        await generateUniqueImage(improvedPrompt);
      
      setGeneratedImage(imageUrl);
      console.log('🖼️ Generated unique NFT with hash:', imageHash);
      console.log('📝 Final prompt used:', finalPrompt);
      console.log('🤖 Model used:', modelUsed);
      
      // Log the prompt transformation
      console.log('\nPrompt Transformation:');
      console.table({
        original: prompt,
        enhanced: improvedPrompt,
        final: finalPrompt
      });
      
    } catch (error) {
      setError(error.message || "Failed to generate unique image. Please try again.");
      console.error(" Error:", error);
    } finally {
      stopProgressSimulation();
      setLoading(false);
      setIsEnhancing(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated-nft.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const promptEnhancementSection = (
    <div className="mt-4 space-y-3">
      {isEnhancing && (
        <div className="flex items-center gap-2 text-white/60 font-['Outfit']">
          <div className="w-4 h-4 border-2 border-[#6366F1]/20 border-t-[#6366F1] 
            rounded-full animate-spin"
          />
          <span>Enhancing prompt with AI...</span>
        </div>
      )}
      {enhancedPrompt && !isEnhancing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6366F1]" />
            <span className="text-white/80 font-['Outfit'] text-sm">Enhanced Prompt:</span>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-white/10">
            <p className="text-white/60 font-['Outfit'] text-sm">{enhancedPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <RetroBeams />
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 relative space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 
                bg-white/5 backdrop-blur-lg rounded-full border border-white/10"
            >
              <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-['Plus_Jakarta_Sans'] font-medium">
                Powered by FLUX.1
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black text-white font-['Space_Grotesk']">
              AI Image Generation
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-['Outfit']">
              Transform your ideas into stunning digital art with our advanced AI technology.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Input */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Prompt Input */}
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                    Input Prompt
                  </h2>
                </div>
                <div className="p-6">
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Describe your NFT idea..."
                    className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 
                      text-white placeholder-white/40 focus:border-[#6366F1] focus:ring-1 
                      focus:ring-[#6366F1] transition-all duration-200 outline-none resize-none
                      font-['Outfit']"
                  />
                  {promptEnhancementSection}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={loading || !prompt}
                    className={`mt-4 w-full py-4 rounded-xl font-medium flex items-center 
                      justify-center gap-3 transition-all duration-300 font-['Space_Grotesk']
                      ${loading || !prompt 
                        ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                        : 'bg-[#6366F1] text-white hover:bg-[#5558DD]'
                      }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white 
                          rounded-full animate-spin"
                        />
                        {isEnhancing ? 'Enhancing...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Art
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Model Info */}
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                    Model Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {MODELS.FLUX_1_DEV.specialties.map((specialty, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-white/60 font-['Outfit']"
                    >
                      <Sparkles className="w-4 h-4 text-[#6366F1]" />
                      <span className="capitalize">{specialty}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Output */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                    Generated Art
                  </h2>
                  {generatedImage && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDownload}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                    >
                      <Download className="w-5 h-5 text-white/60" />
                    </motion.button>
                  )}
                </div>
                <div className="p-6">
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/20 
                    border border-white/10"
                  >
                    {loading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-3 border-[#6366F1]/20 
                            border-t-[#6366F1] rounded-full animate-spin"
                          />
                          <p className="text-white/60 font-['Outfit']">
                            Creating your masterpiece...
                          </p>
                          {progress > 0 && (
                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#6366F1] transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : error ? (
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <p className="text-red-400 text-center font-['Outfit']">{error}</p>
                      </div>
                    ) : generatedImage ? (
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={generatedImage} 
                        alt="Generated Art" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-white/40 font-['Outfit']">
                          Your creation will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINFTGenerator; 