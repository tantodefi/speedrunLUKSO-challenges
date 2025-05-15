/**
 * Deployment script for LSP8LoogiesEnhanced
 * 
 * Run with:
 * npx hardhat run scripts/deployLSP8LoogiesEnhanced.js --config hardhat.enhanced-only.config.js --network luksoTestnet
 */

async function main() {
  // Get the hardhat runtime environment
  const hre = require("hardhat");
  
  console.log("💽 Deploying LSP8LoogiesEnhanced to testnet...");

  // Get the signer using the HRE
  const [deployer] = await hre.ethers.getSigners();
  console.log(`🔑 Deploying with the account: ${deployer.address}`);

  // Deploy the contract
  console.log("⚡ Getting contract factory...");
  const loogiesFactory = await hre.ethers.getContractFactory("LSP8LoogiesEnhanced");

  console.log("⚡ Deploying with parameters:");
  console.log(`📛 Name: LuksoLoogies`);
  console.log(`🔣 Symbol: LUKLOOG`);
  console.log(`👤 Owner: ${deployer.address}`);

  // Deploy the contract with the correct parameters
  console.log("🚀 Starting deployment transaction...");
  const loogiesContract = await loogiesFactory.deploy(deployer.address);
  
  console.log("⏳ Waiting for transaction to be mined...");
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
    console.error("❌ Error during deployment:", error);
    process.exit(1);
  }); 
 