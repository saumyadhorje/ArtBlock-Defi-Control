import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Investor from '../models/Investor.js';
import Curator from '../models/Curator.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        console.log(' Auth Check:', {
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
            headers: req.headers.authorization
        });

        if (!token) {
            console.log(' No token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(' Decoded token:', {
            id: decoded.id,
            role: decoded.role,
            exp: decoded.exp
        });

        // Try to find user in either Users or Curators collection
        let user = await User.findById(decoded.id);
        
        // If not in Users and role is curator, check Curators collection
        if (!user && decoded.role === 'curator') {
            console.log(' User not found in Users, checking Curators collection...');
            user = await Curator.findById(decoded.id);
        }

        // If still no user found, check Investors as fallback
        if (!user && decoded.role === 'investor') {
            console.log(' User not found in Users, checking Investors collection...');
            user = await Investor.findById(decoded.id);
        }

        if (!user) {
            console.log(' User not found in any collection:', {
                id: decoded.id,
                role: decoded.role
            });
            return res.status(401).json({ message: 'User not found' });
        }

        console.log(' User authenticated:', {
            id: user._id,
            role: user.role || decoded.role,
            collection: user.collection?.name
        });

        req.user = user;
        next();
    } catch (error) {
        console.error(' Auth error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                detail: error.message 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                detail: 'Please log in again'
            });
        }

        res.status(401).json({ message: 'Invalid token' });
    }
};

export const authenticateCurator = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id) || 
                    await Curator.findById(decoded.id);

        if (!user || user.role !== 'curator') {
            return res.status(403).json({ message: 'Curator access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Curator auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const authenticateArtist = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'artist') {
            return res.status(403).json({ message: 'Artist access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Artist auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}; 