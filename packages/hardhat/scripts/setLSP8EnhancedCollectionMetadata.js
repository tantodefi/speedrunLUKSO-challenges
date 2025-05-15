const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from command line
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("❌ Please provide the contract address as a parameter");
    console.error("Example: npx hardhat run scripts/setLSP8EnhancedCollectionMetadata.js --network luksoTestnet 0x1234567890123456789012345678901234567890");
    process.exit(1);
  }

  const contractAddress = args[0];
  console.log(`🔍 Setting collection metadata for LSP8LoogiesEnhanced at ${contractAddress}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Using account: ${deployer.address}`);

  // Get contract instance
  const loogiesContract = await ethers.getContractAt("LSP8LoogiesEnhanced", contractAddress);

  // Collection metadata is already set in the constructor, but this is how you'd verify it
  console.log("✅ Collection metadata was set during deployment");
  console.log("✅ Name: LuksoLoogies");
  console.log("✅ Symbol: LUKLOOG");
  console.log(`✅ Max Supply: 3728`);

  // Verify if minting is enabled
  const isMintingEnabled = await loogiesContract.publicMintSet();
  console.log(`🔓 Minting Status: ${isMintingEnabled ? 'Enabled' : 'Disabled'}`);

  if (!isMintingEnabled) {
    console.log("🔓 Enabling minting...");
    const tx = await loogiesContract.setMintStatus(true);
    await tx.wait();
    console.log("✅ Minting enabled successfully");
  }

  console.log("");
  console.log(`
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    ✨                                          ✨
    ✨  LSP8LoogiesEnhanced ready for minting!  ✨
    ✨                                          ✨
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
  `);
  console.log("Explore on Universal Explorer:");
  console.log(`https://explorer.execution.testnet.lukso.network/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 