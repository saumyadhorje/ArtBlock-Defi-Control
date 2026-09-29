import Gallery from '../models/Gallery.js';
import contractService from '../services/contractService.js';

export const validateGalleryOwnership = async (req, res, next) => {
    try {
        const galleryId = req.params.galleryId;
        const curatorId = req.user.id; // From auth middleware

        const gallery = await Gallery.findById(galleryId);
        
        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        if (gallery.curator.toString() !== curatorId) {
            return res.status(403).json({ message: 'Not authorized to manage this gallery' });
        }

        // Verify gallery is still valid on blockchain
        const isValid = await contractService.validateGallery(gallery.galleryAddress);
        if (!isValid) {
            return res.status(400).json({ message: 'Gallery is not valid on blockchain' });
        }

        // Attach gallery to request for use in route handlers
        req.gallery = gallery;
        next();

    } catch (error) {
        console.error('Gallery validation error:', error);
        res.status(500).json({ message: 'Error validating gallery access' });
    }
};

export const validateGalleryStatus = async (req, res, next) => {
    try {
        const gallery = req.gallery || await Gallery.findById(req.params.galleryId);
        
        if (gallery.status !== 'active') {
            return res.status(400).json({ 
                message: `Gallery is currently ${gallery.status}. Only active galleries can perform this operation.` 
            });
        }

        next();
    } catch (error) {
        console.error('Gallery status validation error:', error);
        res.status(500).json({ message: 'Error validating gallery status' });
    }
};

export const validateGalleryRevenue = async (req, res, next) => {
    try {
        const gallery = req.gallery;
        
        // Check if there's pending revenue to claim
        if (gallery.revenue.pendingPayout === "0") {
            return res.status(400).json({ message: 'No revenue available to claim' });
        }

        // Verify on-chain revenue matches database
        const onChainDetails = await contractService.getGalleryDetails(gallery.galleryAddress);
        if (onChainDetails.pendingRevenue.toString() === "0") {
            return res.status(400).json({ message: 'No on-chain revenue available' });
        }

        next();
    } catch (error) {
        console.error('Gallery revenue validation error:', error);
        res.status(500).json({ message: 'Error validating gallery revenue' });
    }
}; 