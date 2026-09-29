import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import JSON files using require
const GalleryFactory = require('../../artifacts/contracts/GalleryFactory.sol/GalleryFactory.json');
const Gallery = require('../../artifacts/contracts/Gallery.sol/Gallery.json');
const ArtBlockNFT = require('../../artifacts/contracts/ArtBlockNFT.sol/ArtBlockNFT.json');

dotenv.config();

class ContractService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.LINEA_SEPOLIA_RPC_URL);
        this.deployerWallet = new ethers.Wallet(
            process.env.PRIVATE_KEY,
            this.provider
        );
        
        // Contract addresses from deployment
        this.galleryFactoryAddress = process.env.GALLERY_FACTORY_ADDRESS;
        this.artBlockAddress = process.env.ARTBLOCK_NFT_ADDRESS;
        
        // Contract instances
        this.galleryFactory = new ethers.Contract(
            this.galleryFactoryAddress,
            GalleryFactory.abi,
            this.deployerWallet
        );
        
        this.artBlockNFT = new ethers.Contract(
            this.artBlockAddress,
            ArtBlockNFT.abi,
            this.deployerWallet
        );
    }

    // Create a new gallery
    async createGallery(curatorAddress, name, description) {
        try {
            console.log(`Creating gallery for curator: ${curatorAddress}`);
            
            const tx = await this.galleryFactory.createGallery(
                name,
                description
            );
            
            const receipt = await tx.wait();
            
            // Get gallery address from event
            const event = receipt.logs.find(log => {
                try {
                    const decoded = this.galleryFactory.interface.parseLog(log);
                    return decoded.name === 'GalleryCreated';
                } catch (e) {
                    return false;
                }
            });

            if (!event) {
                throw new Error('Gallery creation event not found');
            }

            const galleryAddress = event.args[0];
            console.log(`Gallery created at address: ${galleryAddress}`);

            return {
                address: galleryAddress,
                transactionHash: receipt.hash
            };
        } catch (error) {
            console.error('Gallery creation error:', error);
            throw error;
        }
    }

    // Get gallery details
    async getGalleryDetails(galleryAddress) {
        try {
            const gallery = new ethers.Contract(
                galleryAddress,
                Gallery.abi,
                this.provider
            );

            const details = await gallery.getGalleryDetails();
            return {
                name: details._name,
                description: details._description,
                curator: details._curator,
                totalRevenue: details._totalRevenue,
                pendingRevenue: details._pendingRevenue,
                isActive: details._isActive
            };
        } catch (error) {
            console.error('Error fetching gallery details:', error);
            throw error;
        }
    }

    // Claim gallery revenue
    async claimGalleryRevenue(galleryAddress, curatorAddress) {
        try {
            const gallery = new ethers.Contract(
                galleryAddress,
                Gallery.abi,
                this.deployerWallet
            );

            const tx = await gallery.claimRevenue();
            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash
            };
        } catch (error) {
            console.error('Revenue claim error:', error);
            throw error;
        }
    }

    // Validate gallery
    async validateGallery(galleryAddress) {
        try {
            return await this.galleryFactory.validateGallery(galleryAddress);
        } catch (error) {
            console.error('Gallery validation error:', error);
            throw error;
        }
    }

    // Get curator galleries
    async getCuratorGalleries(curatorAddress) {
        try {
            return await this.galleryFactory.getCuratorGalleries(curatorAddress);
        } catch (error) {
            console.error('Error fetching curator galleries:', error);
            throw error;
        }
    }

    // Track gallery revenue
    async trackGalleryRevenue(galleryAddress) {
        try {
            const gallery = new ethers.Contract(
                galleryAddress,
                Gallery.abi,
                this.provider
            );

            const details = await gallery.getGalleryDetails();
            return {
                totalRevenue: details._totalRevenue,
                pendingRevenue: details._pendingRevenue
            };
        } catch (error) {
            console.error('Revenue tracking error:', error);
            throw error;
        }
    }
}

export default new ContractService(); 