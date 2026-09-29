import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload,
  Link as LinkIcon,
  Plus,
  X,
  Image as ImageIcon,
  Send,
  Info
} from 'lucide-react';
import axiosInstance from '../../utils/axios';

const GalleryApplicationForm = ({ gallery, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    artistStatement: '',
    portfolio: [],
    links: [{ title: '', url: '' }],
    previousExperience: '',
    proposedArtworks: '',
    agreement: false
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // In a real app, you'd upload these to your storage service
    // For now, we'll create object URLs
    const newPortfolio = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: '',
      description: ''
    }));

    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, ...newPortfolio]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In production, you'd first upload images to storage
      const response = await axiosInstance.post(`/api/galleries/${gallery._id}/apply`, formData);
      onSuccess?.(response.data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black rounded-2xl max-w-3xl w-full 
          max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Apply to {gallery.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Artist Statement */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Artist Statement
              </label>
              <textarea
                value={formData.artistStatement}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  artistStatement: e.target.value 
                })}
                rows="4"
                required
                placeholder="Tell us about yourself and your art..."
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>

            {/* Portfolio Upload */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Portfolio Pieces
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.portfolio.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-black relative group">
                      <img
                        src={item.preview}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPortfolio = [...formData.portfolio];
                          newPortfolio.splice(index, 1);
                          setFormData({ ...formData, portfolio: newPortfolio });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Artwork title"
                      value={item.title}
                      onChange={(e) => {
                        const newPortfolio = [...formData.portfolio];
                        newPortfolio[index].title = e.target.value;
                        setFormData({ ...formData, portfolio: newPortfolio });
                      }}
                      className="w-full p-2 border-2 border-black rounded-lg text-sm"
                    />
                  </div>
                ))}
                
                {formData.portfolio.length < 6 && (
                  <label className="aspect-square rounded-xl border-3 border-dashed 
                    border-black flex items-center justify-center cursor-pointer 
                    hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-bold">Add Artwork</span>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload up to 6 pieces of your best work
              </p>
            </div>

            {/* Social/Portfolio Links */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Links & Social Media
              </label>
              <div className="space-y-3">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g., Portfolio, Instagram)"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[index].title = e.target.value;
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="flex-1 p-3 border-2 border-black rounded-xl"
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[index].url = e.target.value;
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="flex-1 p-3 border-2 border-black rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = [...formData.links];
                        newLinks.splice(index, 1);
                        setFormData({ ...formData, links: newLinks });
                      }}
                      className="p-3 border-2 border-black rounded-xl hover:bg-gray-50"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                {formData.links.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      links: [...formData.links, { title: '', url: '' }]
                    })}
                    className="w-full p-3 border-2 border-black rounded-xl 
                      flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <Plus size={20} />
                    Add Link
                  </button>
                )}
              </div>
            </div>

            {/* Previous Experience */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Previous Experience
              </label>
              <textarea
                value={formData.previousExperience}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  previousExperience: e.target.value 
                })}
                rows="3"
                placeholder="Tell us about your previous exhibitions, sales, or relevant experience..."
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>

            {/* Proposed Artworks */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Proposed Artworks
              </label>
              <textarea
                value={formData.proposedArtworks}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  proposedArtworks: e.target.value 
                })}
                rows="3"
                placeholder="Describe the type of artworks you plan to exhibit in this gallery..."
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>

            {/* Terms Agreement */}
            <div className="p-4 border-2 border-black rounded-xl bg-gray-50">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreement}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    agreement: e.target.checked 
                  })}
                  className="mt-1"
                  required
                />
                <div className="text-sm">
                  <p className="font-bold">Terms & Conditions</p>
                  <p className="text-gray-600">
                    I agree to the gallery's submission guidelines and understand that 
                    the gallery takes a {gallery.commissionRate}% commission on sales. 
                    I confirm that all submitted artworks are my original creations.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !formData.agreement}
                className={`flex-1 py-3 bg-[#FFE951] font-bold border-3 border-black 
                  rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
                  transition-all flex items-center justify-center gap-2
                  ${(loading || !formData.agreement) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send size={20} />
                Submit Application
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 font-bold border-3 border-black 
                  rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
                  transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GalleryApplicationForm; 