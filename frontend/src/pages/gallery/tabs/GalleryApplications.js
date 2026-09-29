import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  ExternalLink,
  MessageSquare,
  User,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import axiosInstance from '../../../utils/axios';

const GalleryApplications = ({ gallery }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApplicationAction = async (applicationId, status) => {
    try {
      await axiosInstance.patch(`/api/galleries/${gallery._id}/applications/${applicationId}`, {
        status
      });
      // Refresh applications list
      // This should be handled through proper state management in a real app
      window.location.reload();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const ApplicationCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-3 border-black rounded-xl overflow-hidden 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
    >
      <div className="p-6 space-y-4">
        {/* Artist Info */}
        <div className="flex items-center gap-4">
          <img
            src={application.artist.avatar || '/default-avatar.png'}
            alt={application.artist.name}
            className="w-16 h-16 rounded-full border-3 border-black object-cover"
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{application.artist.name}</h3>
            <p className="text-sm text-gray-600">{application.artist.bio}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold
            ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              application.status === 'approved' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'}`}
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </div>
        </div>

        {/* Application Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-800">{application.message}</p>
        </div>

        {/* Portfolio Preview */}
        {application.portfolio?.artworks?.length > 0 && (
          <div>
            <h4 className="font-bold mb-2">Portfolio Preview</h4>
            <div className="grid grid-cols-4 gap-2">
              {application.portfolio.artworks.slice(0, 4).map((artwork, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-black">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {application.status === 'pending' && (
          <div className="flex gap-4 pt-4 border-t-2 border-gray-100">
            <button
              onClick={() => handleApplicationAction(application._id, 'approved')}
              className="flex-1 py-2 bg-[#A8FF76] font-bold border-2 border-black rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all 
                flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Approve
            </button>
            <button
              onClick={() => handleApplicationAction(application._id, 'rejected')}
              className="flex-1 py-2 bg-[#FF7676] font-bold border-2 border-black rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all 
                flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              Reject
            </button>
            <button
              onClick={() => setSelectedApplication(application)}
              className="px-4 py-2 border-2 border-black rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ApplicationModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black rounded-2xl max-w-2xl w-full 
            max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="p-6 space-y-6">
            {/* Artist Details */}
            <div className="flex items-center gap-4">
              <img
                src={application.artist.avatar || '/default-avatar.png'}
                alt={application.artist.name}
                className="w-20 h-20 rounded-full border-3 border-black object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{application.artist.name}</h2>
                <p className="text-gray-600">{application.artist.bio}</p>
              </div>
            </div>

            {/* Application Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-black rounded-xl">
                <h3 className="font-bold mb-2">Application Message</h3>
                <p>{application.message}</p>
              </div>
            </div>

            {/* Portfolio */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Portfolio</h3>
              <div className="grid grid-cols-2 gap-4">
                {application.portfolio?.artworks?.map((artwork, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square rounded-xl overflow-hidden border-3 border-black">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-bold">{artwork.title}</p>
                    <p className="text-sm text-gray-600">{artwork.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Links & References</h3>
              <div className="grid grid-cols-2 gap-4">
                {application.links?.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border-2 border-black rounded-xl 
                      hover:bg-[#FFE951] transition-colors"
                  >
                    <LinkIcon size={20} />
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {application.status === 'pending' && (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    handleApplicationAction(application._id, 'approved');
                    onClose();
                  }}
                  className="flex-1 py-3 bg-[#A8FF76] font-bold border-2 border-black rounded-xl 
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    handleApplicationAction(application._id, 'rejected');
                    onClose();
                  }}
                  className="flex-1 py-3 bg-[#FF7676] font-bold border-2 border-black rounded-xl 
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  Reject Application
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 font-bold border-2 border-black rounded-xl 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
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
      {/* Tabs */}
      <div className="flex gap-4 border-b-2 border-gray-200">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 font-bold capitalize ${
              activeTab === status 
                ? 'border-b-4 border-black' 
                : 'text-gray-400'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {gallery?.applications
          ?.filter(app => activeTab === 'all' || app.status === activeTab)
          .map((application, index) => (
            <ApplicationCard key={index} application={application} />
          ))}
      </div>

      {/* Empty State */}
      {(!gallery?.applications || gallery.applications.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No applications to display.</p>
        </div>
      )}

      {/* Application Modal */}
      {selectedApplication && (
        <ApplicationModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}
    </div>
  );
};

export default GalleryApplications; 