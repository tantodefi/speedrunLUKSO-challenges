const { ethers } = require("hardhat");

async function main() {
  console.log("Resetting deployment nonce...");
  
  // Get the deployer address
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Send a tiny transaction to yourself to increase the nonce
  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: ethers.parseEther("0.0001"),
  });
  
  console.log(`Transaction sent: ${tx.hash}`);
  console.log("Nonce should be reset. Try deploying again.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 