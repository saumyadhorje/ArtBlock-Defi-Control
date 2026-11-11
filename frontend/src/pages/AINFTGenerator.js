import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Image as ImageIcon, Sparkles, Download, RefreshCw, Layers, Check } from 'lucide-react';
import { generateUniqueImage, MODELS } from '../utils/huggingface';
import gsap from 'gsap';
import { enhancePrompt } from '../utils/openai';
import CreateNFTModal from '../components/CreateNFTModal';

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

const ART_STYLES = [
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon, futuristic cities & chrome' },
  { id: 'anime', label: 'Anime', desc: 'Vibrant, expressive cel-shaded aesthetic' },
  { id: 'fantasy', label: 'Fantasy', desc: 'Ethereal, magical mythical realms' },
  { id: 'abstract', label: 'Abstract', desc: 'Geometric, fluid textural composition' },
  { id: 'pixel art', label: 'Pixel Art', desc: 'Nostalgic 16-bit retro game art' },
  { id: 'digital painting', label: 'Digital Painting', desc: 'Painterly chiaroscuro museum style' },
];

const AINFTGenerator = () => {
  const [prompt, setPrompt] = useState(() => sessionStorage.getItem('artblock_gen_prompt') || '');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(() => sessionStorage.getItem('artblock_gen_image') || null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState(() => sessionStorage.getItem('artblock_gen_enhanced') || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('cyberpunk');
  const [nftTitle, setNftTitle] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  // Sync to session storage for persistence across tab visits
  useEffect(() => {
    if (generatedImage) sessionStorage.setItem('artblock_gen_image', generatedImage);
  }, [generatedImage]);

  useEffect(() => {
    if (prompt) sessionStorage.setItem('artblock_gen_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    if (enhancedPrompt) sessionStorage.setItem('artblock_gen_enhanced', enhancedPrompt);
  }, [enhancedPrompt]);

  const startProgressSimulation = () => {
    setProgress(10);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) {
          clearInterval(progressInterval.current);
          return 92;
        }
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 800);
  };

  const stopProgressSimulation = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  };

  const handleManualEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const improved = await enhancePrompt(prompt.trim(), selectedStyle);
      setEnhancedPrompt(improved);
    } catch (err) {
      console.warn('Enhancement warning:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    startProgressSimulation();
    
    try {
      // Use enhanced prompt if present, or enrich with chosen style
      const promptToUse = enhancedPrompt?.trim() || `${prompt.trim()}, ${selectedStyle} style`;
      const result = await generateUniqueImage(promptToUse, selectedStyle);
      
      setGeneratedImage(result.imageUrl);
      setNftTitle(prompt.trim().slice(0, 40));
      setNftDescription(enhancedPrompt || `${prompt.trim()} in ${selectedStyle} style`);
    } catch (err) {
      console.error('Generation Error:', err);
      setError(err.message || 'Failed to generate unique artwork. Please retry.');
    } finally {
      stopProgressSimulation();
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${(nftTitle || 'artblock-ai-art').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenMintModal = () => {
    if (!generatedImage) return;
    setIsMintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <RetroBeams />
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 relative space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10">
              <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-['Plus_Jakarta_Sans'] font-medium">
                AI Studio • Powered by FLUX.1
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white font-['Space_Grotesk']">
              Create AI Artwork & Mint as NFT
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-['Outfit']">
              Describe your vision, select an aesthetic, generate unique on-chain art, and mint directly to the blockchain.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Input Controls */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-[#6366F1]" />
                      Prompt Description
                    </h2>
                    <button
                      type="button"
                      onClick={handleManualEnhance}
                      disabled={isEnhancing || !prompt.trim()}
                      className="text-xs text-[#60A5FA] hover:text-[#93C5FD] transition-colors flex items-center gap-1 disabled:opacity-40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A neon cybernetic samurai overlooking a foggy rain-slicked Tokyo boulevard..."
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 
                      text-white placeholder-white/30 focus:border-[#6366F1] focus:ring-1 
                      focus:ring-[#6366F1] transition-all duration-200 outline-none resize-none
                      font-['Outfit'] text-sm"
                  />
                </div>

                {/* Art Style Selector */}
                <div>
                  <label className="block text-white/80 font-['Space_Grotesk'] font-medium text-sm mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#6366F1]" />
                    Art Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ART_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedStyle === style.id
                            ? 'bg-[#6366F1]/20 border-[#6366F1] text-white shadow-lg shadow-[#6366F1]/10'
                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs capitalize flex items-center justify-between">
                          {style.label}
                          {selectedStyle === style.id && <Check className="w-3.5 h-3.5 text-[#60A5FA]" />}
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 truncate">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Prompt Display */}
                {enhancedPrompt && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#60A5FA] font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      Enhanced Prompt Ready
                    </div>
                    <p className="text-xs text-white/60 line-clamp-3 font-['Outfit']">{enhancedPrompt}</p>
                  </div>
                )}

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: loading || !prompt.trim() ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !prompt.trim() ? 1 : 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className={`w-full py-4 rounded-xl font-bold flex items-center 
                    justify-center gap-3 transition-all duration-300 font-['Space_Grotesk']
                    ${loading || !prompt.trim()
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
                      : 'bg-[#6366F1] text-white hover:bg-[#5558DD] shadow-lg shadow-[#6366F1]/30 cursor-pointer'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Generating Art ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>{generatedImage ? 'Generate New Art' : 'Generate Artwork'}</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Model Specifications */}
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] mb-3">Model Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {MODELS.FLUX_1_DEV.specialties.map((spec, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 capitalize">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Artwork Preview & Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-6"
            >
              <div className="bg-white/[0.03] backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#6366F1]" />
                    Artwork Preview
                  </h2>
                  {generatedImage && !loading && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerate}
                        title="Regenerate with different seed"
                        className="p-2 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white/70 hover:text-white flex items-center gap-1.5 text-xs"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Regenerate</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        title="Download image"
                        className="p-2 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white/70 hover:text-white flex items-center gap-1.5 text-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Preview Canvas Container */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="w-14 h-14 border-3 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin" />
                      <p className="text-white font-['Space_Grotesk'] font-medium">Creating your artwork...</p>
                      <p className="text-xs text-white/40 max-w-xs font-['Outfit']">
                        Synthesizing diffusion steps and rendering high-resolution pixels...
                      </p>
                      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-[#6366F1] transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center gap-3 p-8 text-center max-w-sm">
                      <p className="text-red-400 font-['Outfit'] text-sm">{error}</p>
                      <button
                        onClick={handleGenerate}
                        className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-bold hover:bg-[#5457E5] transition-all"
                      >
                        Retry Generation
                      </button>
                    </div>
                  ) : generatedImage ? (
                    <motion.img 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={generatedImage} 
                      alt="Generated Artwork" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center p-8 text-white/30 font-['Outfit']">
                      <ImageIcon className="w-16 h-16 stroke-1" />
                      <p className="text-base">Your generated artwork will appear here</p>
                      <p className="text-xs max-w-xs">Enter a prompt on the left and click "Generate Artwork" to start.</p>
                    </div>
                  )}
                </div>

                {/* NFT Details Preparation and Mint Button */}
                {generatedImage && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-white/60 block mb-1">Artwork Name</label>
                        <input
                          type="text"
                          value={nftTitle}
                          onChange={(e) => setNftTitle(e.target.value)}
                          placeholder="Name your NFT"
                          className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:border-[#6366F1] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/60 block mb-1">Artwork Description</label>
                        <input
                          type="text"
                          value={nftDescription}
                          onChange={(e) => setNftDescription(e.target.value)}
                          placeholder="Brief description"
                          className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm focus:border-[#6366F1] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleOpenMintModal}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-[#6366F1]/20 font-['Space_Grotesk'] text-base flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Mint this Artwork as NFT →</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Integrated NFT Mint Modal */}
          <CreateNFTModal
            isOpen={isMintModalOpen}
            onClose={() => setIsMintModalOpen(false)}
            initialArtwork={{
              image: generatedImage,
              title: nftTitle || prompt,
              description: nftDescription || enhancedPrompt || prompt
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AINFTGenerator;