import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Image, 
  DollarSign, 
  Heart,
  ExternalLink,
  Twitter,
  Instagram,
  Globe,
  TrendingUp
} from 'lucide-react';

const GalleryArtists = ({ gallery }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);

  const ArtistCard = ({ artist }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => setSelectedArtist(artist)}
      className="bg-white border-3 border-black rounded-xl overflow-hidden 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all 
        cursor-pointer"
    >
      <div className="p-6 space-y-4">
        {/* Artist Header */}
        <div className="flex items-center gap-4">
          <img
            src={artist.avatar || '/default-avatar.png'}
            alt={artist.name}
            className="w-16 h-16 rounded-full border-3 border-black object-cover"
          />
          <div>
            <h3 className="font-bold text-lg">{artist.name}</h3>
            <p className="text-sm text-gray-600">{artist.bio}</p>
          </div>
        </div>

        {/* Artist Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600">Artworks</p>
            <p className="font-bold">{artist.stats?.artworksCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sales</p>
            <p className="font-bold">{artist.stats?.salesCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Likes</p>
            <p className="font-bold">{artist.stats?.likesCount || 0}</p>
          </div>
        </div>

        {/* Recent Artwork Preview */}
        {artist.recentArtworks?.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {artist.recentArtworks.slice(0, 3).map((artwork, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-black">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const ArtistModal = ({ artist, onClose }) => {
    if (!artist) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black rounded-2xl max-w-2xl w-full 
            max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="p-6 space-y-6">
            {/* Artist Header */}
            <div className="flex items-center gap-6">
              <img
                src={artist.avatar || '/default-avatar.png'}
                alt={artist.name}
                className="w-24 h-24 rounded-full border-4 border-black object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{artist.name}</h2>
                <p className="text-gray-600">{artist.bio}</p>
                
                {/* Social Links */}
                <div className="flex gap-4 mt-4">
                  {artist.social?.twitter && (
                    <a href={artist.social.twitter} target="_blank" rel="noopener noreferrer"
                      className="p-2 border-2 border-black rounded-full hover:bg-[#FFE951]">
                      <Twitter size={20} />
                    </a>
                  )}
                  {artist.social?.instagram && (
                    <a href={artist.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="p-2 border-2 border-black rounded-full hover:bg-[#FFE951]">
                      <Instagram size={20} />
                    </a>
                  )}
                  {artist.social?.website && (
                    <a href={artist.social.website} target="_blank" rel="noopener noreferrer"
                      className="p-2 border-2 border-black rounded-full hover:bg-[#FFE951]">
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Artist Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Image, label: 'Artworks', value: artist.stats?.artworksCount },
                { icon: DollarSign, label: 'Sales', value: artist.stats?.salesCount },
                { icon: Heart, label: 'Likes', value: artist.stats?.likesCount },
                { icon: TrendingUp, label: 'Views', value: artist.stats?.viewsCount }
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 border-2 border-black rounded-xl">
                  <stat.icon size={24} className="mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="font-bold">{stat.value || 0}</p>
                </div>
              ))}
            </div>

            {/* Artist's Gallery */}
            <div>
              <h3 className="text-xl font-bold mb-4">Recent Artworks</h3>
              <div className="grid grid-cols-3 gap-4">
                {artist.artworks?.map((artwork, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square rounded-xl overflow-hidden border-3 border-black">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 
                      group-hover:opacity-100 transition-opacity rounded-xl flex 
                      items-center justify-center">
                      <button className="p-2 bg-white rounded-full border-2 border-black">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#FFE951] font-bold border-2 border-black 
                rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
                transition-all mt-6"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white border-3 border-black rounded-xl p-4 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-xl"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gallery?.artists?.map((artist, index) => (
          <ArtistCard key={index} artist={artist} />
        ))}
      </div>

      {/* Empty State */}
      {(!gallery?.artists || gallery.artists.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No artists in this gallery yet.</p>
        </div>
      )}

      {/* Artist Modal */}
      {selectedArtist && (
        <ArtistModal 
          artist={selectedArtist} 
          onClose={() => setSelectedArtist(null)} 
        />
      )}
    </div>
  );
};

export default GalleryArtists; 