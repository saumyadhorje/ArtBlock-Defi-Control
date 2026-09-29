const hre = require("hardhat");

async function main() {
  // Get the provider
  const provider = hre.ethers.provider;
  
  // Get the signer
  const [signer] = await hre.ethers.getSigners();
  
  // Log details
  console.log("Network:", await provider.getNetwork());
  console.log("Signer address:", await signer.getAddress());
  console.log("Signer balance:", await provider.getBalance(signer.address));
  console.log("Chain ID:", (await provider.getNetwork()).chainId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 