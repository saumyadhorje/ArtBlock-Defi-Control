const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const ARTBLOCK_ADDRESS = "0x28BE610Ad4F02c23D90ED6338Cb6764a3BAa825f";

  // 1. Deploy new GalleryFactory
  console.log("\nDeploying new GalleryFactory...");
  const GalleryFactory = await hre.ethers.getContractFactory("GalleryFactory");
  const galleryFactory = await GalleryFactory.deploy(deployer.address);
  await galleryFactory.waitForDeployment();
  const GALLERY_FACTORY_ADDRESS = await galleryFactory.getAddress();
  console.log("New GalleryFactory deployed to:", GALLERY_FACTORY_ADDRESS);

  // 2. Set ArtBlockNFT in GalleryFactory
  console.log("\nSetting ArtBlockNFT in GalleryFactory...");
  const setArtBlockTx = await galleryFactory.setArtBlockContract(ARTBLOCK_ADDRESS);
  await setArtBlockTx.wait();
  console.log("✅ ArtBlockNFT set in GalleryFactory");

  // 3. Set GalleryFactory in ArtBlockNFT
  console.log("\nSetting GalleryFactory in ArtBlockNFT...");
  const artBlockNFT = await hre.ethers.getContractAt("ArtBlockNFT", ARTBLOCK_ADDRESS);
  const setGalleryFactoryTx = await artBlockNFT.setGalleryFactory(GALLERY_FACTORY_ADDRESS);
  await setGalleryFactoryTx.wait();
  console.log("✅ GalleryFactory set in ArtBlockNFT");

  console.log("\n✅ Deployment and connections complete!");
  console.log("New GalleryFactory Address:", GALLERY_FACTORY_ADDRESS);
  console.log("ArtBlockNFT Address:", ARTBLOCK_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 