import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    CheckCircle, ArrowRight, DollarSign, Users, Clock, 
    Hash, Calendar, Shield, Zap, Database, Share2
} from 'react-feather';
import { formatEther } from 'ethers';

const TransactionSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(5);
    const transactionData = location.state?.transactionData;

    useEffect(() => {
        if (!transactionData) {
            navigate('/');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, transactionData]);

    if (!transactionData) return null;

    const {
        price,
        transactionHash,
        paymentSplits,
        artwork
    } = transactionData;

    // Calculate total percentage
    const totalAmount = parseFloat(formatEther(price));
    const artistShare = (parseFloat(formatEther(paymentSplits.artist)) / totalAmount * 100).toFixed(0);
    const galleryShare = (parseFloat(formatEther(paymentSplits.gallery)) / totalAmount * 100).toFixed(0);
    const platformShare = (parseFloat(formatEther(paymentSplits.platform)) / totalAmount * 100).toFixed(0);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Enhanced Background Gradients */}
            <motion.div
                animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-[#6366F1]/10 to-purple-500/10 
                    rounded-full blur-3xl -z-10"
            />
            <motion.div
                animate={{ 
                    rotate: [360, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-[#6366F1]/10 to-purple-500/10 
                    rounded-full blur-3xl -z-10"
            />

            {/* Content */}
            <div className="max-w-3xl mx-auto">
                {/* Success Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                        />
                        <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold font-['Space_Grotesk'] mb-2">
                            Transaction Successful!
                        </h1>
                        <p className="text-white/60">
                            Redirecting to home in {countdown} seconds...
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* NFT Details */}
                            <div className="bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-6 
                                backdrop-blur-lg"
                            >
                                <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4 
                                    flex items-center gap-2"
                                >
                                    <Database className="w-5 h-5 text-[#6366F1]" />
                                    NFT Details
                                </h2>
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={`https://ipfs.io/ipfs/${artwork.ipfsHash}`}
                                        alt={artwork.title}
                                        className="w-24 h-24 rounded-xl object-cover border-2 
                                            border-[#6366F1]/20"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg">{artwork.title}</h3>
                                        <p className="text-white/60 text-sm mb-2">
                                            Token ID: {artwork.tokenId}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Share2 className="w-4 h-4 text-[#6366F1]" />
                                            <a 
                                                href={`https://ipfs.io/ipfs/${artwork.ipfsHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#6366F1] hover:text-[#5457E5]"
                                            >
                                                View on IPFS
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-6 
                                backdrop-blur-lg"
                            >
                                <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4 
                                    flex items-center gap-2"
                                >
                                    <Hash className="w-5 h-5 text-[#6366F1]" />
                                    Transaction Details
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-white/60 text-sm">Transaction Hash</p>
                                        <a 
                                            href={`https://explorer.linea.build/tx/${transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#6366F1] hover:text-[#5457E5] 
                                                transition-colors flex items-center gap-2 mt-1"
                                        >
                                            <span className="truncate">
                                                {transactionHash}
                                            </span>
                                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Timestamp</p>
                                        <p className="font-mono">
                                            {new Date().toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-sm">Network</p>
                                        <p className="font-mono">Linea</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Payment Summary */}
                            <div className="bg-white/[0.02] border border-[#6366F1]/20 rounded-2xl p-6 
                                backdrop-blur-lg"
                            >
                                <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4 
                                    flex items-center gap-2"
                                >
                                    <DollarSign className="w-5 h-5 text-[#6366F1]" />
                                    Payment Summary
                                </h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/[0.02] rounded-xl border 
                                        border-[#6366F1]/20"
                                    >
                                        <p className="text-sm text-white/60">Total Amount</p>
                                        <p className="text-2xl font-bold text-[#6366F1]">
                                            {formatEther(price)} ETH
                                        </p>
                                    </div>
                                    
                                    {/* Payment Distribution */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-[#6366F1]" />
                                                <span>Artist ({artistShare}%)</span>
                                            </div>
                                            <span className="font-mono">
                                                {formatEther(paymentSplits.artist)} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-[#6366F1]" />
                                                <span>Gallery ({galleryShare}%)</span>
                                            </div>
                                            <span className="font-mono">
                                                {formatEther(paymentSplits.gallery)} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-[#6366F1]" />
                                                <span>Platform ({platformShare}%)</span>
                                            </div>
                                            <span className="font-mono">
                                                {formatEther(paymentSplits.platform)} ETH
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/')}
                                    className="flex-1 py-3 px-6 bg-[#6366F1] text-white rounded-xl 
                                        font-['Space_Grotesk'] text-sm font-bold hover:bg-[#5457E5] 
                                        transition-all flex items-center justify-center gap-2"
                                >
                                    Return Home
                                </motion.button>
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={`https://explorer.linea.build/tx/${transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 px-6 border border-[#6366F1] text-white 
                                        rounded-xl font-['Space_Grotesk'] text-sm font-bold 
                                        hover:bg-[#6366F1]/10 transition-all flex items-center 
                                        justify-center gap-2"
                                >
                                    View on Explorer
                                    <ArrowRight className="w-4 h-4" />
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TransactionSuccess; 