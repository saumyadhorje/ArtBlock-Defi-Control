import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Users,
  Shield,
  Pencil,
  Trash2,
  AlertCircle,
  Upload
} from 'lucide-react';
import axiosInstance from '../../../utils/axios';

const GallerySettings = ({ gallery }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: gallery?.name || '',
    description: gallery?.description || '',
    theme: gallery?.theme || 'modern',
    submissionGuidelines: gallery?.submissionGuidelines || '',
    coverImage: gallery?.coverImage || '',
    isPublic: gallery?.isPublic ?? true,
    requireApproval: gallery?.requireApproval ?? true,
    maxArtists: gallery?.maxArtists || 100,
    allowedArtworkTypes: gallery?.allowedArtworkTypes || ['image', 'video', '3d'],
    commissionRate: gallery?.commissionRate || 2.5,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/api/galleries/${gallery._id}/settings`, formData);
      setIsEditing(false);
      // Optionally refresh gallery data
      window.location.reload();
    } catch (error) {
      console.error('Error saving gallery settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/api/galleries/${gallery._id}`);
        // Redirect to curator dashboard
        window.location.href = '/curator/dashboard';
      } catch (error) {
        console.error('Error deleting gallery:', error);
      }
    }
  };

  const SettingsSection = ({ title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-3 border-black rounded-xl overflow-hidden 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFE951] border-2 border-black rounded-lg">
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 border-2 border-black rounded-lg hover:bg-gray-100"
            >
              <Pencil size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Settings Navigation */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'appearance', label: 'Appearance', icon: ImageIcon },
          { id: 'permissions', label: 'Permissions', icon: Shield },
          { id: 'artists', label: 'Artist Settings', icon: Users },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-6 py-3 font-bold border-3 border-black rounded-xl 
              flex items-center gap-2 whitespace-nowrap transition-all
              ${activeSection === section.id 
                ? 'bg-[#FFE951] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white hover:bg-gray-50'}`}
          >
            <section.icon size={20} />
            {section.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeSection === 'general' && (
        <SettingsSection title="General Settings" icon={SettingsIcon}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Gallery Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!isEditing}
                rows="4"
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Commission Rate (%)</label>
              <input
                type="number"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                disabled={!isEditing}
                min="0"
                max="100"
                step="0.5"
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Appearance Settings */}
      {activeSection === 'appearance' && (
        <SettingsSection title="Appearance Settings" icon={ImageIcon}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Cover Image</label>
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden border-3 border-black">
                <img
                  src={formData.coverImage || '/default-gallery-cover.jpg'}
                  alt="Gallery Cover"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <button className="px-6 py-3 bg-white font-bold border-2 border-black rounded-xl 
                      flex items-center gap-2">
                      <Upload size={20} />
                      Upload New Cover
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Theme</label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                disabled={!isEditing}
                className="w-full p-3 border-2 border-black rounded-xl"
              >
                <option value="modern">Modern</option>
                <option value="classical">Classical</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Permissions Settings */}
      {activeSection === 'permissions' && (
        <SettingsSection title="Permissions & Access" icon={Shield}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 border-black rounded-xl">
              <div>
                <h4 className="font-bold">Public Gallery</h4>
                <p className="text-sm text-gray-600">Allow anyone to view the gallery</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-blue-300 rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border-2 border-black rounded-xl">
              <div>
                <h4 className="font-bold">Require Approval</h4>
                <p className="text-sm text-gray-600">Review artists before they can join</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireApproval}
                  onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-blue-300 rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:border-gray-300 after:border after:rounded-full 
                  after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                </div>
              </label>
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Artist Settings */}
      {activeSection === 'artists' && (
        <SettingsSection title="Artist Settings" icon={Users}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Maximum Artists</label>
              <input
                type="number"
                value={formData.maxArtists}
                onChange={(e) => setFormData({ ...formData, maxArtists: e.target.value })}
                disabled={!isEditing}
                min="1"
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Submission Guidelines</label>
              <textarea
                value={formData.submissionGuidelines}
                onChange={(e) => setFormData({ ...formData, submissionGuidelines: e.target.value })}
                disabled={!isEditing}
                rows="6"
                className="w-full p-3 border-2 border-black rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Allowed Artwork Types</label>
              <div className="space-y-2">
                {['image', 'video', '3d'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowedArtworkTypes.includes(type)}
                      onChange={(e) => {
                        const types = e.target.checked
                          ? [...formData.allowedArtworkTypes, type]
                          : formData.allowedArtworkTypes.filter(t => t !== type);
                        setFormData({ ...formData, allowedArtworkTypes: types });
                      }}
                      disabled={!isEditing}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-2 border-black"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-[#A8FF76] font-bold border-3 border-black rounded-xl 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all 
              flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 bg-gray-100 font-bold border-3 border-black rounded-xl 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertCircle size={24} />
          Danger Zone
        </h3>
        <div className="bg-red-50 border-3 border-red-600 rounded-xl p-6">
          <p className="text-red-600 mb-4">
            Deleting your gallery will remove all associated data and cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white font-bold border-3 border-black rounded-xl 
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all 
              flex items-center gap-2"
          >
            <Trash2 size={20} />
            Delete Gallery
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full 
              shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <h3 className="text-2xl font-bold mb-4">Delete Gallery?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All gallery data, including artworks and artist 
              relationships, will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold border-2 border-black 
                  rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none 
                  transition-all"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 font-bold border-2 border-black rounded-xl 
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GallerySettings; 