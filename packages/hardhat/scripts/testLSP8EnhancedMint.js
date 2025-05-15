const { ethers } = require("hardhat");

async function main() {
  // Get the contract address from command line
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("❌ Please provide the contract address as a parameter");
    console.error("Example: npx hardhat run scripts/testLSP8EnhancedMint.js --network luksoTestnet 0x1234567890123456789012345678901234567890");
    process.exit(1);
  }

  const contractAddress = args[0];
  console.log(`🧪 Testing mint for LSP8LoogiesEnhanced at ${contractAddress}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Using account: ${deployer.address}`);

  // Get contract instance
  const loogiesContract = await ethers.getContractAt("LSP8LoogiesEnhanced", contractAddress);

  // Verify if minting is enabled
  const isMintingEnabled = await loogiesContract.publicMintSet();
  console.log(`🔓 Minting Status: ${isMintingEnabled ? 'Enabled' : 'Disabled'}`);

  if (!isMintingEnabled) {
    console.log("🔓 Enabling minting first...");
    const tx = await loogiesContract.setMintStatus(true);
    await tx.wait();
    console.log("✅ Minting enabled successfully");
  }

  // Get the mint price
  const mintPrice = await loogiesContract.PRICE();
  console.log(`💰 Mint price: ${ethers.utils.formatEther(mintPrice)} LYX`);

  // Mint with a custom username
  console.log("🪙 Minting a token with custom username...");
  const mintTx = await loogiesContract.mintItemWithUsername("Matrix Neo", {
    value: mintPrice
  });
  const receipt = await mintTx.wait();
  
  // Parse events to get the token ID
  const transferEvents = receipt.events.filter(e => e.event === "Transfer");
  if (transferEvents.length > 0) {
    const tokenId = transferEvents[0].args.tokenId;
    console.log(`✅ Successfully minted token ID: ${tokenId}`);
    
    // Get the token URI to verify metadata
    console.log("🔍 Metadata URLs:");
    console.log(`Universal Explorer: https://explorer.execution.testnet.lukso.network/address/${contractAddress}/tokens/${tokenId}`);
    
    console.log("✅ Try viewing the token in Universal Explorer to check if the SVG renders correctly");
  } else {
    console.log("❌ Could not find the Transfer event for the minted token");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 