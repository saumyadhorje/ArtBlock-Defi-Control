import Curator from '../models/Curator.js';
import Gallery from '../models/Gallery.js';

export const getCuratorDashboard = async (req, res) => {
  try {
    const curator = await Curator.findById(req.params.id);
    if (!curator) {
      return res.status(404).json({ message: 'Curator not found' });
    }

    console.log('Raw curator data from DB:', curator); 

    const response = {
      profile: {
        ...curator.profile.toObject(),
        role: 'Curator',
        badges: ['🏛️', '👨‍🎨', '🎭']
      },
      analytics: {
        ...curator.analytics.toObject(),
      },
      contract: {
        ...curator.contract.toObject(),
      },
      galleries: await Gallery.find({ curator: curator._id })
        .select('name description coverImage artworksCount artistsCount visitorCount')
        .lean()
    };

    console.log('Sending response:', response); 
    res.json(response);

  } catch (error) {
    console.error('Curator Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
}; 

// Get all galleries
export const getAllGalleries = async (req, res) => {
  try {
    console.log('Fetching all galleries...'); 

    const galleries = await Gallery.find()
      .populate({
        path: 'curator',
        select: 'displayName walletAddress profile'
      })
      .sort({ createdAt: -1 })
      .lean(); 

    console.log('Found galleries:', galleries); 

    // Transform the data safely
    const transformedGalleries = galleries.map(gallery => ({
      _id: gallery._id,
      name: gallery.name || 'Untitled Gallery',
      description: gallery.description || '',
      coverImage: gallery.coverImage || '',
      curatorAddress: gallery.curator?.walletAddress || '',
      curator: gallery.curator?.displayName || 'Unknown Curator',
      nftCount: gallery.artworksCount || 0, 
      artistCount: gallery.artistsCount || 0, 
      floorPrice: gallery.floorPrice || 0,
      verified: gallery.verified || false,
      createdAt: gallery.createdAt
    }));

    console.log('Transformed galleries:', transformedGalleries); 

    res.json({
      galleries: transformedGalleries
    });
  } catch (error) {
    console.error('Error in getAllGalleries:', error);
    res.status(500).json({ 
      message: 'Error fetching galleries',
      error: error.message 
    });
  }
};

// Get galleries for a specific curator
export const getCuratorGalleries = async (req, res) => {
  try {
    const { curatorId } = req.params;
    const galleries = await Gallery.find({ curator: curatorId })
      .populate('curator', 'displayName walletAddress')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ galleries });
  } catch (error) {
    console.error('Error fetching curator galleries:', error);
    res.status(500).json({ message: 'Error fetching curator galleries' });
  }
}; 