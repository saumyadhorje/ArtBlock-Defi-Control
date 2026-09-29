const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Linea Sepolia...");

  // Get the deployer's signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  // Deploy GalleryFactory first
  const GalleryFactory = await hre.ethers.getContractFactory("GalleryFactory");
  const galleryFactory = await GalleryFactory.deploy(await deployer.getAddress());
  await galleryFactory.waitForDeployment();
  
  console.log("GalleryFactory deployed to:", await galleryFactory.getAddress());

  // Deploy ArtBlockNFT
  const ArtBlockNFT = await hre.ethers.getContractFactory("ArtBlockNFT");
  const artBlockNFT = await ArtBlockNFT.deploy(await deployer.getAddress());
  await artBlockNFT.waitForDeployment();

  console.log("ArtBlockNFT deployed to:", await artBlockNFT.getAddress());

  // Set up contract references
  await galleryFactory.setArtBlockContract(await artBlockNFT.getAddress());
  await artBlockNFT.setGalleryFactory(await galleryFactory.getAddress());

  console.log("Contract setup completed!");
  console.log("--------------------");
  console.log("Deployer:", await deployer.getAddress());
  console.log("GalleryFactory:", await galleryFactory.getAddress());
  console.log("ArtBlockNFT:", await artBlockNFT.getAddress());

  // Verify deployment
  console.log("\nVerifying contracts...");
  console.log("Please wait for a minute and then verify contracts on Linea Explorer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });