// Simple deployment script
const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying LSP8LoogiesEnhanced contract...");
  
  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👨‍💼 Deploying from: ${deployer.address}`);
  
  try {
    // Get contract factory
    console.log("📄 Loading contract factory...");
    const LSP8LoogiesEnhanced = await hre.ethers.getContractFactory("LSP8LoogiesEnhanced");
    
    // Deploy contract
    console.log("🚀 Deploying contract...");
    const contract = await LSP8LoogiesEnhanced.deploy(deployer.address);
    await contract.deployed();
    
    console.log(`✅ Contract deployed to: ${contract.address}`);
    
    // Enable minting
    console.log("🔓 Enabling minting...");
    const tx = await contract.setMintStatus(true);
    await tx.wait();
    console.log("✅ Minting enabled successfully");
    
    console.log(`
      🎉 DEPLOYMENT SUCCESSFUL! 🎉
      Contract address: ${contract.address}
      View on explorer: https://explorer.execution.testnet.lukso.network/address/${contract.address}
    `);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 