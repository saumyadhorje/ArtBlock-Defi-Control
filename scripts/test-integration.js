const hre = require("hardhat");

async function main() {
    // Get the deployer's signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", await deployer.getAddress());

    // Connect to deployed contracts
    const galleryFactory = await hre.ethers.getContractAt(
        "GalleryFactory",
        "0xD8079966c3365da901BD368Da7A48378e494962E"
    );
    
    const artBlockNFT = await hre.ethers.getContractAt(
        "ArtBlockNFT",
        "0xf60a49A8e31BEC743d5cd2841Ad01198c236d0Bc"
    );

    console.log("Creating test gallery...");
    const tx = await galleryFactory.createGallery(
        "Test Gallery",
        "This is a test gallery"
    );
    
    const receipt = await tx.wait();
    
    // Get gallery address from event
    const event = receipt.logs.find(log => {
        try {
            return galleryFactory.interface.parseLog(log).name === 'GalleryCreated';
        } catch (e) {
            return false;
        }
    });

    const galleryAddress = event.args[0];
    console.log("Test gallery created at:", galleryAddress);

    // Verify gallery is registered
    const isValid = await galleryFactory.validateGallery(galleryAddress);
    console.log("Gallery is valid:", isValid);

    // Get gallery details
    const gallery = await hre.ethers.getContractAt("Gallery", galleryAddress);
    const details = await gallery.getGalleryDetails();
    console.log("Gallery details:", {
        name: details._name,
        description: details._description,
        curator: details._curator,
        isActive: details._isActive
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 