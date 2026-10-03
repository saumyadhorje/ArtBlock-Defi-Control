const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy GalleryFactory first
  console.log("\nDeploying GalleryFactory...");
  const GalleryFactory = await hre.ethers.getContractFactory("GalleryFactory");
  const galleryFactory = await GalleryFactory.deploy(deployer.address);
  await galleryFactory.waitForDeployment();
  const GALLERY_FACTORY_ADDRESS = await galleryFactory.getAddress();
  console.log("GalleryFactory deployed to:", GALLERY_FACTORY_ADDRESS);

  // 2. Deploy ArtBlockNFT
  console.log("\nDeploying ArtBlockNFT...");
  const ArtBlockNFT = await hre.ethers.getContractFactory("ArtBlockNFT");
  const artBlockNFT = await ArtBlockNFT.deploy(deployer.address);
  await artBlockNFT.waitForDeployment();
  const ARTBLOCK_ADDRESS = await artBlockNFT.getAddress();
  console.log("ArtBlockNFT deployed to:", ARTBLOCK_ADDRESS);

  // 3. Set up connections
  console.log("\nSetting up contract connections...");
  
  const setArtBlockTx = await galleryFactory.setArtBlockContract(ARTBLOCK_ADDRESS);
  await setArtBlockTx.wait();
  console.log("✅ ArtBlockNFT set in GalleryFactory");

  const setGalleryFactoryTx = await artBlockNFT.setGalleryFactory(GALLERY_FACTORY_ADDRESS);
  await setGalleryFactoryTx.wait();
  console.log("✅ GalleryFactory set in ArtBlockNFT");

  // 4. Create initial test gallery so there's always a valid gallery ready to use
  console.log("\nCreating initial default gallery...");
  const createTx = await galleryFactory.createGallery("Default Art Gallery", "Initial test gallery for minting NFTs");
  const receipt = await createTx.wait();

  let DEFAULT_GALLERY_ADDRESS = null;
  for (const log of receipt.logs) {
    try {
      const parsed = galleryFactory.interface.parseLog(log);
      if (parsed && parsed.name === "GalleryCreated") {
        DEFAULT_GALLERY_ADDRESS = parsed.args.galleryAddress;
        break;
      }
    } catch (e) {}
  }

  console.log("\n✅ Deployment complete! Addresses:");
  console.log("GalleryFactory:       ", GALLERY_FACTORY_ADDRESS);
  console.log("ArtBlockNFT:          ", ARTBLOCK_ADDRESS);
  console.log("Valid Test Gallery:   ", DEFAULT_GALLERY_ADDRESS);
  console.log("\nUse 'Valid Test Gallery' address when minting NFTs!");
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 