import { ethers } from "hardhat";

/**
 * Script to update LSP8LoogiesUpdated contract metadata to the latest LSP8 standard
 * This ensures metadata displays correctly in the Universal Explorer
 */
async function main() {
  console.log("\n=== UPDATING LSP8LOOGIESUPDATED METADATA TO LATEST LSP8 STANDARD ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment or environment
  const contractAddress = process.env.LSP8_CONTRACT_ADDRESS || "0xYourDeployedContractAddress";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  // Verify we have the right contract
  const name = await LSP8Loogies.name();
  console.log(`Contract name: ${name}`);
  
  // Get total supply
  const totalSupply = await LSP8Loogies.totalSupply();
  console.log(`Total supply: ${totalSupply.toString()}`);
  
  // First, update the collection metadata to ensure proper format
  console.log("\nUpdating collection metadata with proper LSP4 format...");
  try {
    const tx = await LSP8Loogies.updateCollectionMetadata();
    console.log(`Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`✅ Collection metadata updated in block ${receipt.blockNumber}`);
    }
    
    // Verify collection metadata format
    console.log("\nVerifying collection metadata...");
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    const metadata = await LSP8Loogies.getData(LSP4_METADATA_KEY);
    
    console.log(`✅ Metadata exists: ${metadata.length > 0}`);
    console.log(`✅ Metadata starts with verification bytes (0x00000000): ${metadata.startsWith("0x00000000")}`);
    
    // Display a preview
    console.log(`\nMetadata preview (first 200 chars): ${metadata.substring(0, 200)}...`);
    
    // If there are already tokens, update their metadata
    const totalSupplyNum = Number(totalSupply);
    if (totalSupplyNum > 0) {
      console.log(`\nUpdating metadata for ${totalSupply.toString()} tokens...`);
      // Update metadata for tokens in batches of 10
      const batchSize = 10;
      for (let i = 1; i <= totalSupplyNum; i += batchSize) {
        const endIndex = Math.min(i + batchSize - 1, totalSupplyNum);
        console.log(`Updating tokens ${i} to ${endIndex}...`);
        
        const batchTx = await LSP8Loogies.batchUpdateTokenMetadata(i, endIndex, {
          gasLimit: 3000000 // Add gas limit to avoid underestimation
        });
        
        console.log(`Batch transaction hash: ${batchTx.hash}`);
        await batchTx.wait();
        console.log(`✅ Tokens ${i} to ${endIndex} updated`);
      }
    } else {
      console.log("\nNo tokens to update (total supply is 0)");
    }
    
    console.log("\n=== METADATA UPDATE COMPLETE ===");
    console.log("Your collection metadata has been successfully updated!");
    console.log("\nView your collection at:");
    console.log(`https://universal.page/collections/lukso-testnet/${contractAddress}`);
    console.log(`https://universaleverything.io/collection/${contractAddress}?network=testnet`);
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 