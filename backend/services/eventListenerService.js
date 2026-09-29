import { ethers } from 'ethers';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import Gallery from '../models/Gallery.js';
import Curator from '../models/Curator.js';

// Import JSON files using require
const GalleryFactory = require('../../artifacts/contracts/GalleryFactory.sol/GalleryFactory.json');
const GalleryContract = require('../../artifacts/contracts/Gallery.sol/Gallery.json');

class EventListenerService {
    constructor() {
        // Check if RPC URL is configured
        if (!process.env.LINEA_SEPOLIA_RPC_URL) {
            console.error('LINEA_SEPOLIA_RPC_URL not configured in .env');
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(
    process.env.LINEA_SEPOLIA_RPC_URL,
    {
        chainId: 31337,
        name: 'hardhat'
    }
);

            this.galleryFactory = new ethers.Contract(
                process.env.GALLERY_FACTORY_ADDRESS,
                GalleryFactory.abi,
                this.provider
            );
        } catch (error) {
            console.error('Failed to initialize EventListenerService:', error);
        }
    }

    async startListening() {
        // Check if provider is properly initialized
        if (!this.provider || !this.galleryFactory) {
            console.error('Provider or GalleryFactory not initialized. Skipping event listening.');
            return;
        }

        console.log('Starting blockchain event listeners...');
        
        try {
            // Test provider connection
            await this.provider.getNetwork();
            console.log('Successfully connected to Linea Sepolia');
            
            // Start polling if connection is successful
            this.pollForEvents();
        } catch (error) {
            console.error('Failed to connect to Linea Sepolia:', error);
        }
    }

    async handleGalleryCreated(galleryAddress, curator, name) {
        try {
            console.log(`New gallery created: ${galleryAddress} by curator: ${curator}`);
            
            // Update gallery status in MongoDB
            await Gallery.findOneAndUpdate(
                { galleryAddress: galleryAddress.toLowerCase() },
                { status: 'active' }
            );

            // Update curator's galleries list
            await Curator.findOneAndUpdate(
                { walletAddress: curator.toLowerCase() },
                { 
                    $push: { 
                        'contract.galleries': {
                            address: galleryAddress.toLowerCase(),
                            name: name,
                            status: 'active',
                            createdAt: new Date()
                        }
                    },
                    $inc: { 'profile.galleriesCount': 1 }
                }
            );
        } catch (error) {
            console.error('Error processing GalleryCreated event:', error);
        }
    }

    async pollForEvents() {
        const galleries = await Gallery.find({ status: 'active' });
        
        // Poll for gallery events
        setInterval(async () => {
            for (const gallery of galleries) {
                try {
                    const galleryContract = new ethers.Contract(
                        gallery.galleryAddress,
                        GalleryContract.abi,
                        this.provider
                    );

                    const latestBlock = await this.provider.getBlockNumber();
                    
                    // Check for revenue events
                    const revenueEvents = await galleryContract.queryFilter(
                        'RevenueReceived',
                        latestBlock - 10,
                        latestBlock
                    );

                    // Check for claim events
                    const claimEvents = await galleryContract.queryFilter(
                        'RevenueClaimed',
                        latestBlock - 10,
                        latestBlock
                    );

                    // Process events
                    for (const event of revenueEvents) {
                        await this.handleRevenueReceived(
                            gallery.galleryAddress,
                            event.args.amount,
                            event.args.timestamp
                        );
                    }

                    for (const event of claimEvents) {
                        await this.handleRevenueClaimed(
                            gallery.galleryAddress,
                            event.args.amount,
                            event.args.timestamp,
                            event.transactionHash
                        );
                    }
                } catch (error) {
                    console.error(`Error polling events for gallery ${gallery.galleryAddress}:`, error);
                }
            }
        }, 30000); // Poll every 30 seconds
    }

    async handleRevenueReceived(galleryAddress, amount, timestamp) {
       // this im gonna implement on hackathon day
    }

    async handleRevenueClaimed(galleryAddress, amount, timestamp, transactionHash) {
       // this im gonna implement on hackathon day 
    }
}

export default new EventListenerService(); 