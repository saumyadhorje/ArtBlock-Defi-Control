import Gallery from '../models/Gallery.js';
import Curator from '../models/Curator.js';
import contractService from '../services/contractService.js';

export const createGallery = async (req) => {
    const curatorId = req.user.id;
    const {
        name,
        description,
        theme,
        submissionGuidelines,
        coverImage
    } = req.body;

    // Verify curator exists
    const curator = await Curator.findById(curatorId);
    if (!curator) {
        throw new Error('Curator not found');
    }

    // Create gallery on blockchain
    const { address: galleryAddress, transactionHash } = 
        await contractService.createGallery(
            curator.walletAddress,
            name,
            description
        );

    // Create gallery in MongoDB
    const gallery = new Gallery({
        name,
        description,
        curator: curatorId,
        galleryAddress,
        theme,
        submissionGuidelines,
        coverImage,
        transactionHash,
        status: 'active',
        stats: {
            artistCount: 0,
            artworkCount: 0,
            visitorCount: 0,
            totalSales: 0
        }
    });

    await gallery.save();

    // Update curator's gallery count
    await Curator.findByIdAndUpdate(curatorId, {
        $inc: { 'profile.galleriesCount': 1 }
    });

    return gallery;
};

export const getGalleryDetails = async (req, res) => {
    try {
        const { galleryId } = req.params;
        console.log('Fetching gallery with ID:', galleryId);

        const gallery = await Gallery.findById(galleryId)
            .populate('curator', 'username profile.displayName walletAddress')
            .populate('artists', 'username walletAddress')
            .populate({
                path: 'submissions.nftId',
                model: 'NFT',
                select: 'tokenId title description ipfsHash price artistAddress'
            })
            .populate({
                path: 'artworks.nft',
                model: 'NFT'
            });

        if (!gallery) {
            console.log('Gallery not found for ID:', galleryId);
            return res.status(404).json({ message: 'Gallery not found' });
        }

        const response = {
            ...gallery.toObject(),
            stats: {
                artworksCount: gallery.artworks?.length || 0,
                artistsCount: gallery.artists?.length || 0,
                visitorCount: gallery.stats?.visitorCount || 0,
                totalSales: gallery.stats?.totalSales || 0
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching gallery details:', error);
        res.status(500).json({ message: error.message });
    }
};

export const claimGalleryRevenue = async (req, res) => {
    try {
        const { galleryId } = req.params;
        const curatorId = req.user.id;

        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        // Verify curator owns the gallery
        if (gallery.curator.toString() !== curatorId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Claim revenue on blockchain
        const { success, transactionHash } = await contractService.claimGalleryRevenue(
            gallery.galleryAddress,
            req.user.walletAddress
        );

        res.json({
            success,
            transactionHash,
            message: 'Revenue claimed successfully'
        });

    } catch (error) {
        console.error('Revenue claim error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getCuratorGalleries = async (req, res) => {
    try {
        const curatorId = req.params.curatorId || req.user.id;

        const galleries = await Gallery.find({ curator: curatorId })
            .select('name description coverImage stats status galleryAddress')
            .sort('-createdAt');

        // Get on-chain data for each gallery
        const galleriesWithRevenue = await Promise.all(
            galleries.map(async (gallery) => {
                const revenueData = await contractService.trackGalleryRevenue(
                    gallery.galleryAddress
                );
                return {
                    ...gallery.toObject(),
                    revenue: revenueData
                };
            })
        );

        res.json(galleriesWithRevenue);

    } catch (error) {
        console.error('Error fetching curator galleries:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateGalleryStats = async (req, res) => {
    try {
        const { galleryId } = req.params;
        const { visitorCount, artworkCount, artistCount, totalSales } = req.body;

        const gallery = await Gallery.findByIdAndUpdate(
            galleryId,
            {
                $set: {
                    'stats.visitorCount': visitorCount,
                    'stats.artworkCount': artworkCount,
                    'stats.artistCount': artistCount,
                    'stats.totalSales': totalSales
                }
            },
            { new: true }
        );

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }

        res.json(gallery);

    } catch (error) {
        console.error('Error updating gallery stats:', error);
        res.status(500).json({ message: error.message });
    }
}; 