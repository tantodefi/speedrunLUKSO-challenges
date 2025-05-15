// Import only hardhat
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment for LSP8LoogiesEnhanced...");

  // Get the signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`💳 Deploying with account: ${deployer.address}`);

  // Compile first to make sure artifacts are up to date
  console.log("📦 Compiling contracts...");
  await hre.run("compile");
  console.log("✅ Compilation successful");

  // Get the contract factory
  console.log("🏭 Getting contract factory...");
  const LSP8LoogiesEnhanced = await hre.ethers.getContractFactory("LSP8LoogiesEnhanced");
  
  // Deploy the contract with owner parameter
  console.log("📄 Deploying contract...");
  const loogies = await LSP8LoogiesEnhanced.deploy(deployer.address);
  
  // Wait for deployment to finish
  console.log("⏳ Waiting for deployment transaction to be mined...");
  await loogies.deployed();
  
  console.log(`🎉 LSP8LoogiesEnhanced deployed at: ${loogies.address}`);
  console.log(`🌐 View on Universal Explorer: https://explorer.execution.testnet.lukso.network/address/${loogies.address}`);

  // Enable minting
  console.log("🔓 Enabling minting...");
  try {
    const tx = await loogies.setMintStatus(true);
    console.log("⏳ Waiting for minting status to be set...");
    await tx.wait();
    console.log("✅ Minting enabled successfully");
  } catch (error) {
    console.error("❌ Failed to enable minting:", error.message);
  }
  
  // Summary
  console.log(`
    🎊 DEPLOYMENT SUMMARY 🎊
    ========================
    Contract: LSP8LoogiesEnhanced
    Address: ${loogies.address}
    Network: LUKSO Testnet
    Owner: ${deployer.address}
    Status: Minting enabled
  `);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 