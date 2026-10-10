const hre = require("hardhat");

async function main() {
  const targetAddress = process.env.TARGET || process.argv[2] || "0xAF4c044D7D07BBaC772b5d54B96Fff0a8B346386";
  if (!targetAddress || !hre.ethers.isAddress(targetAddress)) {
    console.error("Invalid address");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Sending 100 ETH from deployer (${deployer.address}) to ${targetAddress}...`);

  const tx = await deployer.sendTransaction({
    to: targetAddress,
    value: hre.ethers.parseEther("100.0")
  });
  await tx.wait();

  console.log(`✅ Successfully sent 100 ETH to ${targetAddress}!`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
