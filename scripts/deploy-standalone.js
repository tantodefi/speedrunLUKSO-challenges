// Load environment variables
require('dotenv').config();

async function main() {
  console.log("💽 Deploying LSP8LoogiesEnhanced to testnet...");

  // Get the signer using ethers directly
  const { ethers } = require("hardhat");
  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Deploying with the account: ${deployer.address}`);

  // Get the contract factory
  const loogiesFactory = await ethers.getContractFactory("LSP8LoogiesEnhanced");

  console.log("⚡ Deploying with parameters:");
  console.log(`📛 Name: LuksoLoogies`);
  console.log(`🔣 Symbol: LUKLOOG`);
  console.log(`👤 Owner: ${deployer.address}`);

  // Deploy the contract
  const loogiesContract = await loogiesFactory.deploy(deployer.address);
  
  // Wait for deployment
  console.log("Waiting for deployment transaction to be mined...");
  await loogiesContract.deployed();
  
  console.log(`✅ LSP8LoogiesEnhanced deployed to: ${loogiesContract.address}`);

  // Enable minting
  console.log("🔓 Setting minting status to true...");
  const tx = await loogiesContract.setMintStatus(true);
  await tx.wait();
  console.log("✅ Minting enabled successfully");

  console.log("");
  console.log(`
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    ✨                                          ✨
    ✨  LSP8LoogiesEnhanced deployed and ready  ✨
    ✨                                          ✨
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
  `);
  console.log(`
    🔶 Contract: ${loogiesContract.address}
    🔶 Name: LuksoLoogies
    🔶 Symbol: LUKLOOG
    🔶 Max Supply: 3728
    🔶 Mint Price: 0.1 LYX
  `);
  console.log("Verify contract on Universal Explorer:");
  console.log(`https://explorer.execution.testnet.lukso.network/address/${loogiesContract.address}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 