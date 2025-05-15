/**
 * Deployment script for LSP8LoogiesEnhanced
 * 
 * Run with:
 * npx hardhat run scripts/deploy-enhanced-loogies.js --network luksoTestnet
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying LSP8LoogiesEnhanced to LUKSO Testnet...");

  // Get the signer (deployer)
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  // Get the contract factory
  const LSP8LoogiesEnhanced = await hre.ethers.getContractFactory("LSP8LoogiesEnhanced");
  
  // Deploy the contract
  console.log("📝 Starting deployment transaction...");
  const loogies = await LSP8LoogiesEnhanced.deploy(deployer.address);
  console.log("⏳ Waiting for transaction to be mined...");
  await loogies.deployed();
  
  console.log(`✅ LSP8LoogiesEnhanced deployed to: ${loogies.address}`);

  // Enable minting
  console.log("🔓 Enabling minting...");
  const tx = await loogies.setMintStatus(true);
  await tx.wait();
  console.log("✅ Minting enabled successfully");

  console.log(`
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    ✨                                          ✨
    ✨  LSP8LoogiesEnhanced deployed and ready  ✨
    ✨                                          ✨
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
  `);
  console.log(`
    🔶 Contract: ${loogies.address}
    🔶 Name: LuksoLoogies
    🔶 Symbol: LUKLOOG
    🔶 Features: UP Detection, Matrix Rain, Username Display
    🔶 Explorer: https://explorer.execution.testnet.lukso.network/address/${loogies.address}
  `);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
 