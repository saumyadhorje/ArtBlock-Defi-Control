const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gallery System", function () {
  let ArtBlockNFT;
  let GalleryFactory;
  let artBlock;
  let galleryFactory;
  let owner;
  let curator;
  let artist;
  let buyer;
  let gallery;

  beforeEach(async function () {
    // Get signers
    [owner, curator, artist, buyer] = await ethers.getSigners();

    // Deploy GalleryFactory
    GalleryFactory = await ethers.getContractFactory("GalleryFactory");
    galleryFactory = await GalleryFactory.deploy(await owner.getAddress());
    await galleryFactory.waitForDeployment();

    // Deploy ArtBlockNFT
    ArtBlockNFT = await ethers.getContractFactory("ArtBlockNFT");
    artBlock = await ArtBlockNFT.deploy(await owner.getAddress());
    await artBlock.waitForDeployment();

    // Set up contract references
    await galleryFactory.setArtBlockContract(await artBlock.getAddress());
    await artBlock.setGalleryFactory(await galleryFactory.getAddress());

    // Create a gallery
    const tx = await galleryFactory.connect(curator).createGallery(
      "Test Gallery",
      "A test gallery description"
    );
    const receipt = await tx.wait();
    
    // Get gallery address from event
    const event = receipt.logs.find(log => {
      try {
        const decoded = galleryFactory.interface.parseLog(log);
        return decoded.name === 'GalleryCreated';
      } catch (e) {
        return false;
      }
    });
    const galleryAddress = event.args[0]; // First argument is gallery address
    
    // Get Gallery contract instance
    const Gallery = await ethers.getContractFactory("Gallery");
    gallery = Gallery.attach(galleryAddress);
  });

  describe("Gallery Creation", function () {
    it("Should create a gallery with correct parameters", async function () {
      const details = await gallery.getGalleryDetails();
      expect(details._name).to.equal("Test Gallery");
      expect(details._description).to.equal("A test gallery description");
      expect(details._curator).to.equal(await curator.getAddress());
      expect(details._isActive).to.equal(true);
    });

    it("Should register gallery in factory", async function () {
      const isValid = await galleryFactory.validateGallery(await gallery.getAddress());
      expect(isValid).to.equal(true);
    });

    it("Should list gallery in curator's galleries", async function () {
      const galleries = await galleryFactory.getCuratorGalleries(await curator.getAddress());
      expect(galleries).to.include(await gallery.getAddress());
    });
  });

  describe("NFT Minting and Sales", function () {
    it("Should allow artist to mint NFT in gallery", async function () {
      const mintTx = await artBlock.connect(artist).mint(
        await artist.getAddress(),
        await gallery.getAddress(),
        "Test NFT",
        "Test Description",
        "ipfs://test",
        ethers.parseEther("1"),
        "test-uri"
      );

      await mintTx.wait();
      const tokenId = 0; // First token
      const artwork = await artBlock.artworks(tokenId);
      expect(artwork.creator).to.equal(await artist.getAddress());
    });

    it("Should distribute payments correctly on NFT sale", async function () {
      // Mint NFT
      await artBlock.connect(artist).mint(
        await artist.getAddress(),
        await gallery.getAddress(),
        "Test NFT",
        "Test Description",
        "ipfs://test",
        ethers.parseEther("1"),
        "test-uri"
      );

      // Record initial balances
      const initialArtistBalance = await ethers.provider.getBalance(await artist.getAddress());
      const initialGalleryBalance = await ethers.provider.getBalance(await gallery.getAddress());
      const initialPlatformBalance = await ethers.provider.getBalance(await owner.getAddress());

      // Buy NFT
      const price = ethers.parseEther("1");
      await artBlock.connect(buyer).buyArtwork(0, { value: price });

      // Check balances after sale
      const artistShare = price * 85n / 100n;
      const galleryShare = price * 10n / 100n;
      const platformShare = price * 5n / 100n;

      expect(await ethers.provider.getBalance(await artist.getAddress())).to.equal(
        initialArtistBalance + artistShare
      );
      expect(await ethers.provider.getBalance(await gallery.getAddress())).to.equal(
        initialGalleryBalance + galleryShare
      );
      expect(await ethers.provider.getBalance(await owner.getAddress())).to.equal(
        initialPlatformBalance + platformShare
      );
    });
  });

  describe("Gallery Revenue Management", function () {
    it("Should allow curator to claim revenue", async function () {
      // First, send some ETH to gallery (simulating a sale)
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await gallery.getAddress(),
        value: amount
      });

      const initialCuratorBalance = await ethers.provider.getBalance(await curator.getAddress());
      
      // Claim revenue
      await gallery.connect(curator).claimRevenue();

      // Check balances
      const finalCuratorBalance = await ethers.provider.getBalance(await curator.getAddress());
      expect(finalCuratorBalance > initialCuratorBalance).to.be.true;
    });

    it("Should track revenue correctly", async function () {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await gallery.getAddress(),
        value: amount
      });

      const details = await gallery.getGalleryDetails();
      expect(details._totalRevenue).to.equal(amount);
      expect(details._pendingRevenue).to.equal(amount);
    });
  });
}); 