// Deploy script for LSP8LoogiesEnhanced
const hre = require("hardhat");

async function main() {
  console.log("Deploying LSP8LoogiesEnhanced...");
  
  // Get the contract factory
  const LSP8LoogiesEnhanced = await hre.ethers.getContractFactory("LSP8LoogiesEnhanced");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Deploy the contract
  const loogies = await LSP8LoogiesEnhanced.deploy(deployer.address);
  console.log("Contract deployed, waiting for confirmation...");
  
  await loogies.deployed();
  console.log(`LSP8LoogiesEnhanced deployed to: ${loogies.address}`);
  
  // Enable minting
  console.log("Enabling minting...");
  const tx = await loogies.setMintStatus(true);
  await tx.wait();
  console.log("Minting enabled");
  
  console.log(`Contract is ready at ${loogies.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 