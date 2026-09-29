import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Curator from '../models/Curator.js';

export const register = async (req, res) => {
    try {
        const { username, walletAddress, password, role, profile } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { username: username?.toLowerCase() }, 
                { walletAddress: walletAddress?.toLowerCase() }
            ]
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or wallet address already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username: username.toLowerCase(),
            walletAddress: walletAddress.toLowerCase(),
            password: hashedPassword,
            role: role || 'curator',
            profile
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                walletAddress: user.walletAddress,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password, walletAddress } = req.body;
        
        console.log('Login attempt:', { username, walletAddress }); // Debug log

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Find user in either User or Curator collection
        let user = await User.findOne({ 
            $or: [
                { username: username?.toLowerCase() }, 
                { walletAddress: walletAddress?.toLowerCase() }
            ]
        });

        if (!user) {
            user = await Curator.findOne({ 
                $or: [
                    { username: username?.toLowerCase() }, 
                    { walletAddress: walletAddress?.toLowerCase() }
                ]
            });
        }

        console.log('Found user:', user ? 'Yes' : 'No'); // Debug log

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Verify password exists in user document
        if (!user.password) {
            console.error('User has no password hash:', user._id);
            return res.status(500).json({ message: 'Invalid user data' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                walletAddress: user.walletAddress,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: error.message,
            details: error.stack // Include stack trace for debugging
        });
    }
}; 