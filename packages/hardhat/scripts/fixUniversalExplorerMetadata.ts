import { ethers } from "hardhat";

/**
 * This script fixes the metadata format for the Universal Explorer
 * Sometimes metadata doesn't display because of format issues
 */
async function main() {
  console.log("\n=== FIXING METADATA FOR UNIVERSAL EXPLORER DISPLAY ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract addresses
  const lsp8ContractAddress = "0xEa85496c542e10802b0488bbAaD1eC462C514934";
  const metadataContractAddress = "0xD4d17838687b9c76A196445fb1470964dacf27Ed";
  
  console.log(`LSP8 contract: ${lsp8ContractAddress}`);
  console.log(`Metadata contract: ${metadataContractAddress}`);
  
  // Get contract instances
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", lsp8ContractAddress);
  const MetadataContract = await ethers.getContractAt("OnChainMetadata", metadataContractAddress);
  
  // Define LSP4 metadata keys
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  console.log("\nGenerating properly formatted collection metadata...");
  
  // Create collection metadata with OnChainMetadata contract
  try {
    const [rawMetadata, encodedMetadata] = await MetadataContract.createCollectionMetadata();
    
    // Log a preview of the data
    const decodedJson = Buffer.from(ethers.toBeHex(rawMetadata).slice(2), 'hex').toString('utf8');
    console.log(`Raw metadata (preview): ${decodedJson.substring(0, 100)}...`);
    console.log(`Encoded metadata (preview): ${encodedMetadata.substring(0, 100)}...`);
    
    // Check the format - must start with proper verification bytes (0x00000000)
    if (!encodedMetadata.startsWith("0x00000000")) {
      console.log("⚠️ WARNING: Encoded metadata doesn't start with verification bytes");
    }
    
    // Ensure it's in the correct format expected by Universal Explorer
    console.log("\nSetting collection metadata with proper format...");
    const tx = await LSP8Loogies.updateCollectionMetadata({ gasLimit: 3000000 });
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    
    if (receipt) {
      console.log(`✅ Collection metadata updated in block ${receipt.blockNumber}`);
      
      // Verify the data was set correctly
      const storedMetadata = await LSP8Loogies.getData(LSP4_METADATA_KEY);
      console.log(`\nStored metadata (preview): ${storedMetadata.substring(0, 100)}...`);
      
      // Check if the verification bytes are present
      if (storedMetadata.startsWith("0x00000000")) {
        console.log("✅ Metadata has correct verification bytes");
      } else {
        console.log("❌ Metadata is missing verification bytes");
      }
      
      // Additional fix: set specific format directly if needed
      if (!storedMetadata.startsWith("0x00000000")) {
        console.log("\nApplying direct fix for verification bytes...");
        
        // Get the raw metadata from storage
        const contentHex = storedMetadata.substring(2); // Remove 0x prefix
        
        // Add verification bytes (0x00000000)
        const fixedMetadata = "0x00000000" + contentHex;
        
        // Set the fixed metadata
        const fixTx = await LSP8Loogies.setData(
          LSP4_METADATA_KEY,
          fixedMetadata,
          { gasLimit: 2000000 }
        );
        
        console.log(`Fix transaction hash: ${fixTx.hash}`);
        await fixTx.wait();
        console.log("✅ Verification bytes fixed");
      }
    }
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
  
  console.log("\n=== METADATA UPDATE COMPLETE ===");
  console.log("Check the Universal Explorer to see if metadata displays correctly now:");
  console.log(`https://universaleverything.io/collection/${lsp8ContractAddress}?network=testnet`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 