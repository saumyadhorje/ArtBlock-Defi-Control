
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, RefreshCw, Image as ImageIcon } from 'react-feather';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

import axiosInstance from '../utils/axios';
import { ARTBLOCK_NFT_ADDRESS } from '../config';
import { contractABI } from '../constants/contractABI';
import { ensureHardhatNetwork } from '../utils/network';
import { getIPFSUrl } from '../utils/ipfs';

const formatPrice = (price) => {
  try {
    if (price === undefined || price === null) return '0.0000';

    const value = String(price);
    const wei = value.includes('.') ? ethers.parseEther(value) : ethers.toBigInt(value);

    return Number(ethers.formatEther(wei)).toFixed(4);
  } catch (error) {
    console.error('Price formatting error:', error);
    return '0.0000';
  }
};

const Galleries = () => {
  const [nfts, setNfts] = useState([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [purchasingId, setPurchasingId] = useState(null);

const [activeTab, setActiveTab] = useState('marketplace');
const [purchasedNfts, setPurchasedNfts] = useState([]);
const [purchasedLoading, setPurchasedLoading] = useState(false);

  const fetchNFTs = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get('/api/nfts/marketplace');

      console.log('Marketplace NFTs:', response.data);

      setNfts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Marketplace fetch error:', error);
      toast.error('Could not load marketplace NFTs');
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchPurchasedNFTs = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }

      setPurchasedLoading(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        toast.error('Please connect your buyer wallet');
        return;
      }

      const address = accounts[0].toLowerCase();

      const response = await axiosInstance.get(
        `/api/nfts/purchased/${address}`
      );

      setPurchasedNfts(
        Array.isArray(response.data) ? response.data : []
      );

      console.log('My purchased NFTs:', response.data);

    } catch (error) {
      console.error('Purchase history error:', error);
      toast.error('Could not load your purchases');
    } finally {
      setPurchasedLoading(false);
    }
  }; //55-91
  useEffect(() => {
    fetchNFTs();
  }, []);

  const handlePurchase = async (nft) => {
    let blockchainConfirmed = false;
  try {
    if (!window.ethereum) {
      toast.error('Please install or unlock MetaMask');
      return;
    }

    if (nft.tokenId === undefined || nft.tokenId === null) {
      toast.error('NFT token ID is missing');
      return;
    }

    setPurchasingId(nft._id);

    await ensureHardhatNetwork();

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    console.log('Buyer wallet:', signerAddress);
    console.log('NFT being purchased:', nft);

    const rawPrice = String(nft.price);
    const priceInWei = rawPrice.includes('.')
      ? ethers.parseEther(rawPrice)
      : ethers.toBigInt(rawPrice);

    const contract = new ethers.Contract(
      ARTBLOCK_NFT_ADDRESS,
      contractABI,
      signer
    );

    toast.loading('Confirm the purchase in MetaMask...', {
      id: 'nft-purchase'
    });

    const tx = await contract.buyArtwork(Number(nft.tokenId), {
      value: priceInWei
    });

    toast.loading('Waiting for blockchain confirmation...', {
      id: 'nft-purchase'
    });

    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error('Blockchain transaction failed');
    }
    blockchainConfirmed = true;

// Sync the confirmed purchase with MongoDB
await axiosInstance.post(`/api/nfts/${nft.tokenId}/purchase-sync`, {
  buyer: signerAddress,
  transactionHash: receipt.hash,
  price: priceInWei.toString()
});

    console.log('Purchase confirmed:', receipt.hash);

    toast.success('NFT purchased successfully!', {
      id: 'nft-purchase'
    });

    // Remove the purchased NFT from the marketplace.
    setNfts(prev => prev.filter(item => item._id !== nft._id));

 } catch (error) {
  console.error('Purchase error:', error);

  if (blockchainConfirmed) {
    // Blockchain purchase succeeded, but database sync failed.
    setNfts(prev => prev.filter(item => item._id !== nft._id));

    toast.error(
      'Purchase succeeded on blockchain, but marketplace sync failed. Do not purchase again.',
      { id: 'nft-purchase' }
    );
  } else {
    toast.error(
      error.reason || error.shortMessage || error.message || 'Purchase failed',
      { id: 'nft-purchase' }
    );
  }

  } finally {
    setPurchasingId(null);
  }
};

  const displayedNFTs =
  activeTab === 'marketplace' ? nfts : purchasedNfts;

const filteredNFTs = displayedNFTs.filter((nft) =>
  (nft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  String(nft.tokenId).includes(searchTerm)
);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <span className="inline-block px-5 py-2 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/40 text-[#818CF8] font-bold mb-6">
            ARTBLOCK MARKETPLACE
          </span>

          <h1 className="text-5xl md:text-6xl font-black font-['Space_Grotesk']">
            Discover Digital Art
          </h1>

          <p className="text-white/60 mt-4 text-lg">
            Explore and collect artworks directly from their artists.
          </p>

          <p className="text-white/40 mt-2">
            {nfts.length} listed artwork{nfts.length === 1 ? '' : 's'} available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex gap-3 mb-8">
  <button
    onClick={() => {
      setActiveTab('marketplace');
      setSearchTerm('');
    }}
    className={`px-6 py-3 rounded-xl font-bold transition ${
      activeTab === 'marketplace'
        ? 'bg-[#6366F1] text-white'
        : 'bg-white/5 text-white/60 border border-white/10'
    }`}
  >
    <ShoppingCart size={16} className="inline mr-2" />
    Marketplace ({nfts.length})
  </button>

  <button
    onClick={() => {
      setActiveTab('purchases');
      setSearchTerm('');
      fetchPurchasedNFTs();
    }}
    className={`px-6 py-3 rounded-xl font-bold transition ${
      activeTab === 'purchases'
        ? 'bg-[#6366F1] text-white'
        : 'bg-white/5 text-white/60 border border-white/10'
    }`}
  >
    My Purchases ({purchasedNfts.length})
  </button>
</div>
        <div className="flex flex-wrap gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              size={19}
            />
            <input
              type="text"
              placeholder="Search artworks or token IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-[#6366F1]"
            />
          </div>

          <button
           onClick={activeTab === 'marketplace' ? fetchNFTs : fetchPurchasedNFTs}
            disabled={activeTab === 'marketplace' ? loading : purchasedLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

       {(activeTab === 'marketplace' ? loading : purchasedLoading) ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div className="text-center py-24 border border-white/10 rounded-2xl">
            <ImageIcon size={48} className="mx-auto text-white/30 mb-5" />
            <h2 className="text-2xl font-bold">
             {displayedNFTs.length === 0
  ? activeTab === 'marketplace'
    ? 'No artworks listed yet'
    : 'No purchases yet'
  : 'No matching artworks'}
            </h2>
            <p className="text-white/50 mt-3">
             {displayedNFTs.length === 0
  ? activeTab === 'marketplace'
    ? 'Listed artworks will appear here.'
    : 'Your purchased artworks will appear here.'
  : 'Try another search term.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNFTs.map((nft) => (
              <motion.div
                key={nft._id}
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-[#6366F1]/50 transition-colors"
              >
                <div className="aspect-square bg-black relative">
                  <img
                    src={getIPFSUrl(nft.ipfsHash)}
                    alt={nft.title || 'NFT artwork'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  <span className="absolute top-4 right-4 px-3 py-1 bg-black/70 rounded-lg text-xs font-bold border border-white/10">
                    TOKEN #{nft.tokenId}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold truncate">
                    {nft.title || `Artwork #${nft.tokenId}`}
                  </h3>

                  <p className="text-white/50 text-sm mt-2 line-clamp-2">
                    {nft.description || 'Digital artwork on ArtBlock.'}
                  </p>

                  <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/10">
                    <div>
                      <p className="text-xs text-white/40">PRICE</p>
                      <p className="text-xl font-black text-[#A5B4FC]">
                        {formatPrice(nft.price)} ETH
                      </p>
                    </div>

                   {activeTab === 'marketplace' ? (
  <button
    onClick={() => handlePurchase(nft)}
    disabled={purchasingId !== null}
    className="flex items-center gap-2 px-5 py-3 bg-[#6366F1] hover:bg-[#5457E5] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <ShoppingCart size={17} />
    {purchasingId === nft._id ? 'Buying...' : 'Buy'}
  </button>
) : (
  <span className="px-5 py-3 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl font-bold">
    ✓ OWNED
  </span>
)}
                  </div>

                  <p className="text-xs text-white/30 mt-4 truncate">
                    Artist: {nft.artistAddress || 'Unknown'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Galleries;
