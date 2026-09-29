import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import curatorRoutes from './routes/curatorRoutes.js';
import galleryRoutes from './routes/gallery.routes.js';
import eventListenerService from './services/eventListenerService.js';
import nftRoutes from './routes/nft.routes.js';
import investorRoutes from './routes/investorRoutes.js';
import aiImageRoutes from './routes/nft.js';

dotenv.config();

// Creating two separate express apps for the auth and ai services
const authApp = express();  // MongoDB services
const aiApp = express();    // PostgreSQL services

// Middleware for both apps
authApp.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
authApp.use(express.json());

aiApp.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
aiApp.use(express.json());

// AI Service Routes (PostgreSQL - port 3001)
aiApp.use('/api', aiImageRoutes);

// Auth and Other Routes (MongoDB - port 5000)
authApp.use('/api/auth', authRoutes);
authApp.use('/api/artist', artistRoutes);
authApp.use('/api/curator', curatorRoutes);
authApp.use('/api', galleryRoutes);
authApp.use('/api', nftRoutes);
authApp.use('/api/investor', investorRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start blockchain event listeners
eventListenerService.startListening()
  .then(() => console.log(' Blockchain event listeners started'))
  .catch(err => console.error('Failed to start blockchain listeners:', err));

// Start both servers
const AUTH_PORT = process.env.AUTH_PORT || 5000;
const AI_PORT = process.env.AI_SERVICE_PORT || 3001;

authApp.listen(AUTH_PORT, () => {
  console.log(` Auth Server (MongoDB) running on port ${AUTH_PORT}`);
});

aiApp.listen(AI_PORT, () => {
  console.log(` AI Service (PostgreSQL) running on port ${AI_PORT}`);
});