const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtBlock NFT Minting & Retrieval Integration", function () {
  let ArtBlockNFT;
  let GalleryFactory;
  let artBlock;
  let galleryFactory;
  let owner;
  let artist;
  let curator;
  let buyer;
  let galleryAddress;

  before(async function () {
    [owner, curator, artist, buyer] = await ethers.getSigners();

    // 1. Deploy GalleryFactory
    GalleryFactory = await ethers.getContractFactory("GalleryFactory");
    galleryFactory = await GalleryFactory.deploy(owner.address);
    await galleryFactory.waitForDeployment();

    // 2. Deploy ArtBlockNFT
    ArtBlockNFT = await ethers.getContractFactory("ArtBlockNFT");
    artBlock = await ArtBlockNFT.deploy(owner.address);
    await artBlock.waitForDeployment();

    // 3. Connect contracts
    await galleryFactory.setArtBlockContract(await artBlock.getAddress());
    await artBlock.setGalleryFactory(await galleryFactory.getAddress());

    // 4. Create default gallery
    const createTx = await galleryFactory.connect(curator).createGallery("Cyberpunk Gallery", "Neon & Tech Art");
    const receipt = await createTx.wait();
    
    for (const log of receipt.logs) {
      try {
        const parsed = galleryFactory.interface.parseLog(log);
        if (parsed && parsed.name === "GalleryCreated") {
          galleryAddress = parsed.args.galleryAddress;
          break;
        }
      } catch (_) {}
    }
  });

  it("Should successfully mint an NFT with image IPFS CID and metadata URI", async function () {
    const title = "Neon Samurai 2099";
    const description = "Futuristic cyber warrior created with AI";
    const imageIpfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
    const price = ethers.parseEther("0.5");
    const tokenURI = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

    const mintTx = await artBlock.connect(artist).mint(
      artist.address,
      galleryAddress,
      title,
      description,
      imageIpfsHash,
      price,
      tokenURI
    );

    const receipt = await mintTx.wait();
    expect(receipt.status).to.equal(1);

    // Verify event
    const mintedEvent = receipt.logs
      .map(log => { try { return artBlock.interface.parseLog(log); } catch (_) { return null; } })
      .find(e => e?.name === 'ArtworkMinted');

    expect(mintedEvent).to.not.be.null;
    const tokenId = mintedEvent.args.tokenId;
    expect(tokenId).to.equal(0n);
    expect(mintedEvent.args.artist).to.equal(artist.address);

    // Verify on-chain ERC721 ownership and metadata
    const tokenOwner = await artBlock.ownerOf(tokenId);
    expect(tokenOwner).to.equal(artist.address);

    const retrievedURI = await artBlock.tokenURI(tokenId);
    expect(retrievedURI).to.equal(tokenURI);

    // Verify artwork struct
    const artwork = await artBlock.artworks(tokenId);
    expect(artwork.title).to.equal(title);
    expect(artwork.price).to.equal(price);
    expect(artwork.isListed).to.be.true;
  });

  it("Should support fallback when gallery address is zero/default address", async function () {
    const mintTx = await artBlock.connect(artist).mint(
      artist.address,
      ethers.ZeroAddress,
      "Abstract Dream",
      "Generated artwork with zero gallery address",
      "QmHashZeroAddressTest",
      ethers.parseEther("0.1"),
      "ipfs://QmZeroMetadata"
    );

    const receipt = await mintTx.wait();
    expect(receipt.status).to.equal(1);

    const split = await artBlock.paymentSplits(1);
    expect(split.gallery).to.equal(await artBlock.getAddress());
  });

  it("Should reliably filter and retrieve minted NFTs by artist address for gallery", async function () {
    const filter = artBlock.filters.ArtworkMinted(null, artist.address);
    const events = await artBlock.queryFilter(filter);
    
    expect(events.length).to.be.at.least(2);
    for (const event of events) {
      expect(event.args.artist).to.equal(artist.address);
      const owner = await artBlock.ownerOf(event.args.tokenId);
      expect(owner).to.equal(artist.address);
    }
  });

  it("Should allow purchasing artwork with correct payment splits (85% artist, 10% gallery, 5% platform)", async function () {
    const tokenId = 0;
    const price = ethers.parseEther("1.0");

    // Mint an artwork priced at 1.0 ETH
    await artBlock.connect(artist).mint(
      artist.address,
      galleryAddress,
      "Masterpiece",
      "Priced for purchase test",
      "QmMasterpieceHash",
      price,
      "ipfs://QmMasterpieceMeta"
    );

    const currentTokenId = 2; // Token 0 and 1 were minted above
    const artistBalanceBefore = await ethers.provider.getBalance(artist.address);

    const buyTx = await artBlock.connect(buyer).buyArtwork(currentTokenId, { value: price });
    const receipt = await buyTx.wait();
    expect(receipt.status).to.equal(1);

    // Verify ownership transferred to buyer
    const newOwner = await artBlock.ownerOf(currentTokenId);
    expect(newOwner).to.equal(buyer.address);

    // Verify artist received 85%
    const artistBalanceAfter = await ethers.provider.getBalance(artist.address);
    const expectedArtistPayment = (price * 85n) / 100n;
    expect(artistBalanceAfter - artistBalanceBefore).to.equal(expectedArtistPayment);
  });
});
