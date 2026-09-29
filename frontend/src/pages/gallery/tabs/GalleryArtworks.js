import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  List, 
  Filter,
  Search,
  ArrowUpDown,
  ExternalLink,
  Heart,
  DollarSign
} from 'lucide-react';

const GalleryArtworks = ({ gallery }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterOpen, setFilterOpen] = useState(false);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' }
  ];

  const ArtworkCard = ({ artwork }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white border-3 border-black rounded-xl overflow-hidden 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
    >
      {/* Artwork Image */}
      <div className="aspect-square relative group">
        <img
          src={artwork?.imageUrl || '/default-artwork.png'}
          alt={artwork?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 
          group-hover:opacity-100 transition-opacity flex items-center 
          justify-center gap-4">
          <button className="p-2 bg-white rounded-full border-2 border-black">
            <ExternalLink size={20} />
          </button>
          <button className="p-2 bg-white rounded-full border-2 border-black">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Artwork Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg truncate">{artwork?.title}</h3>
        <p className="text-sm text-gray-600 truncate">by {artwork?.artist?.name}</p>
        
        <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
          <div className="flex items-center gap-1">
            <DollarSign size={16} />
            <span className="font-bold">{artwork?.price} ETH</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Heart size={16} />
            <span>{artwork?.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border-3 border-black rounded-xl p-4 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-xl"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-black rounded-xl appearance-none bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 border-2 border-black rounded-xl ${filterOpen ? 'bg-[#FFE951]' : 'bg-white'}`}
            >
              <Filter size={20} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex border-2 border-black rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#FFE951]' : 'bg-white'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#FFE951]' : 'bg-white'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {gallery?.artworks?.map((artwork, index) => (
          <ArtworkCard key={index} artwork={artwork} />
        ))}
      </div>

      {/* Empty State */}
      {(!gallery?.artworks || gallery.artworks.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No artworks available in this gallery yet.</p>
        </div>
      )}
    </div>
  );
};

export default GalleryArtworks; 