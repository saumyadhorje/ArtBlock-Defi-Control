import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Palette, FileText, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const FormField = ({ label, children, icon: Icon }) => (
  <div>
    <label className="block text-white/60 text-sm font-['Plus_Jakarta_Sans'] mb-2 
      flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    {children}
  </div>
);

const CreateGalleryModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: 'modern',
    submissionGuidelines: '',
    coverImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        console.log('🔒 Request Config:', {
            url: '/api/galleries/create',
            hasToken: !!axiosInstance.defaults.headers.common['Authorization'],
            tokenPreview: axiosInstance.defaults.headers.common['Authorization']?.substring(0, 20) + '...'
        });

        const response = await axiosInstance.post('/api/galleries/create', formData);
        
        console.log('✅ Gallery created:', response.data);
        
        onClose();
        setFormData({
            name: '',
            description: '',
            theme: 'modern',
            submissionGuidelines: '',
            coverImage: ''
        });
        
        if (typeof onSuccess === 'function') {
            onSuccess(response.data.gallery);
        }
        
    } catch (err) {
        console.error('❌ Gallery creation error:', {
            status: err.response?.status,
            message: err.response?.data?.message || err.message,
            data: err.response?.data
        });
        
        setError(err.response?.data?.message || 'Failed to create gallery. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center 
            justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 w-full 
              max-w-lg relative overflow-hidden"
          >
            {/* Background Grid */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }}
            />

            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-white/5 rounded-full 
                text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </motion.button>

            <h2 className="text-3xl font-black text-white mb-6 font-['Space_Grotesk']">
              Create New Gallery
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <FormField label="Gallery Name" icon={ImageIcon}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl 
                    text-white focus:border-[#6366F1]/40 transition-colors outline-none 
                    font-['Plus_Jakarta_Sans']"
                  required
                />
              </FormField>

              <FormField label="Description" icon={FileText}>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl 
                    text-white focus:border-[#6366F1]/40 transition-colors outline-none 
                    font-['Plus_Jakarta_Sans']"
                  rows="3"
                  required
                />
              </FormField>

              <FormField label="Theme" icon={Palette}>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl 
                    text-white focus:border-[#6366F1]/40 transition-colors outline-none 
                    font-['Plus_Jakarta_Sans']"
                >
                  <option value="modern">Modern</option>
                  <option value="classical">Classical</option>
                  <option value="contemporary">Contemporary</option>
                  <option value="minimalist">Minimalist</option>
                </select>
              </FormField>

              <FormField label="Submission Guidelines" icon={Upload}>
                <textarea
                  value={formData.submissionGuidelines}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    submissionGuidelines: e.target.value 
                  })}
                  className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl 
                    text-white focus:border-[#6366F1]/40 transition-colors outline-none 
                    font-['Plus_Jakarta_Sans']"
                  rows="3"
                  required
                />
              </FormField>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#F43F5E] text-sm font-['Plus_Jakarta_Sans']"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 bg-[#6366F1] text-white font-bold rounded-xl 
                  hover:bg-[#5457E5] transition-all font-['Space_Grotesk'] flex 
                  items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white rounded-full 
                      border-t-transparent"
                  />
                ) : null}
                {loading ? 'Creating...' : 'Create Gallery'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateGalleryModal; 