const hre = require("hardhat");

async function main() {
  const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
 // const factoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3";
  const factoryAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  console.log("Creating gallery with account:", deployer);

  const iface = new hre.ethers.Interface([
    "function createGallery(string _name, string _description)"
  ]);

  try {
    console.log("Creating new gallery...");

    // Encode the function call
    const data = iface.encodeFunctionData("createGallery", [
      "My New Gallery",
      "A test gallery description"
    ]);

    // Send directly through Hardhat's JSON-RPC
    const txHash = await hre.ethers.provider.send("eth_sendTransaction", [
      {
        from: deployer,
        to: factoryAddress,
        data: data
      }
    ]);

    console.log("Transaction sent:", txHash);
    console.log("Waiting for transaction...");

    let receipt = null;

    while (!receipt) {
      receipt = await hre.ethers.provider.send("eth_getTransactionReceipt", [
        txHash
      ]);

      if (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log("Transaction confirmed:", txHash);

    // Find GalleryCreated event
    const eventInterface = new hre.ethers.Interface([
      "event GalleryCreated(address indexed galleryAddress,address indexed curator,string name)"
    ]);

    for (const log of receipt.logs) {
      try {
        const parsed = eventInterface.parseLog({
          topics: log.topics,
          data: log.data
        });

        if (parsed && parsed.name === "GalleryCreated") {
          console.log("\nGallery created successfully!");
          console.log("Gallery address:", parsed.args.galleryAddress);
          console.log("Curator:", parsed.args.curator);
          console.log("Gallery name:", parsed.args.name);
          console.log("\nUse this gallery address for minting NFTs.");

          return;
        }
      } catch (error) {
        // Ignore logs that are not GalleryCreated
      }
    }

    console.log("\nTransaction succeeded, but GalleryCreated event was not found.");
    console.log("Receipt status:", receipt.status);

  } catch (error) {
    console.error("Error creating gallery:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });