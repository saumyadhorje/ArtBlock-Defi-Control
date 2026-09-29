const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Updating contracts with account:", deployer.address);

  // Hardcoded addresses
  const ARTBLOCK_ADDRESS = "0x28BE610Ad4F02c23D90ED6338Cb6764a3BAa825f";
  const GALLERY_FACTORY_ADDRESS = "0x13FBb3a495D54F85CFA1f0e60F8fb9F26ED406BC";

  console.log("ArtBlock Address:", ARTBLOCK_ADDRESS);
  console.log("GalleryFactory Address:", GALLERY_FACTORY_ADDRESS);

  try {
    // 1. Connect to GalleryFactory
    console.log("\nConnecting to GalleryFactory...");
    const galleryFactory = await hre.ethers.getContractAt(
      "GalleryFactory",
      GALLERY_FACTORY_ADDRESS
    );
    
    // 2. Connect to ArtBlockNFT
    console.log("Connecting to ArtBlockNFT...");
    const artBlockNFT = await hre.ethers.getContractAt(
      "ArtBlockNFT",
      ARTBLOCK_ADDRESS
    );

    // 3. Update GalleryFactory with new ArtBlockNFT address
    console.log("\nUpdating GalleryFactory with new ArtBlockNFT address...");
    const setArtBlockTx = await galleryFactory.setArtBlockContract(ARTBLOCK_ADDRESS);
    await setArtBlockTx.wait();
    console.log("✅ GalleryFactory updated with new ArtBlockNFT address");

    // 4. Update ArtBlockNFT with GalleryFactory address
    console.log("\nUpdating ArtBlockNFT with GalleryFactory address...");
    const setGalleryFactoryTx = await artBlockNFT.setGalleryFactory(GALLERY_FACTORY_ADDRESS);
    await setGalleryFactoryTx.wait();
    console.log("✅ ArtBlockNFT updated with GalleryFactory address");

    console.log("\n✅ Contract connections updated successfully!");

  } catch (error) {
    console.error("\n❌ Error updating contracts:", error);
    // Log more detailed error information
    if (error.reason) console.error("Error reason:", error.reason);
    if (error.code) console.error("Error code:", error.code);
    if (error.transaction) console.error("Failed transaction:", error.transaction);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });