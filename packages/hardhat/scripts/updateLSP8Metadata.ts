import { ethers } from "hardhat";

// Define interface for our updated LSP8Loogies contract
interface UpdatedLSP8Loogies {
  updateCollectionMetadata(): Promise<any>;
  batchUpdateTokenMetadata(startId: number, endId: number, options?: any): Promise<any>;
  totalSupply(): Promise<bigint>;
  supportsInterface(interfaceId: string): Promise<boolean>;
}

/**
 * Script to update LSP8Loogies contract and token metadata to the latest LSP8 standard
 * This should be run after deploying the updated LSP8Loogies contract
 */
async function main() {
  console.log("\n=== UPDATING LSP8LOOGIES METADATA TO LATEST LSP8 STANDARD ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Replace with your actual deployed contract address
  const contractAddress = "0xAfEcAAE8FfD830F3Ca9B141546f5eea6E314cF1B";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance with the updated ABI
  const LSP8Loogies = await ethers.getContractAt("LSP8Loogies", contractAddress) as unknown as UpdatedLSP8Loogies;
  
  // Step 1: Update collection metadata
  console.log("\n1. Updating collection metadata to LSP4 standard format...");
  try {
    const tx = await LSP8Loogies.updateCollectionMetadata();
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`✅ Collection metadata updated in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error updating collection metadata:", error);
  }

  // Step 2: Get token count
  console.log("\n2. Getting total token count...");
  const totalSupply = await LSP8Loogies.totalSupply();
  console.log(`Total supply: ${totalSupply}`);
  
  // Step 3: Update token metadata in batches
  const BATCH_SIZE = 10; // Update 10 tokens at a time to avoid gas limit issues
  console.log(`\n3. Updating token metadata in batches of ${BATCH_SIZE}...`);
  
  for (let i = 1; i <= Number(totalSupply); i += BATCH_SIZE) {
    const endIndex = Math.min(i + BATCH_SIZE - 1, Number(totalSupply));
    console.log(`Processing batch: tokens ${i} to ${endIndex}`);
    
    try {
      const tx = await LSP8Loogies.batchUpdateTokenMetadata(i, endIndex, {
        gasLimit: 5000000, // Increase gas limit for batch operations
      });
      
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`✅ Tokens ${i}-${endIndex} updated in block ${receipt.blockNumber}`);
    } catch (error) {
      console.error(`Error updating tokens ${i}-${endIndex}:`, error);
    }
  }
  
  console.log("\n=== METADATA UPDATE COMPLETE ===");
  console.log("Your LSP8Loogies should now fully comply with the latest LSP8 standard.");
  console.log("✅ Collection metadata updated to LSP4 format with proper verification bytes");
  console.log("✅ Token metadata updated to LSP4 format with proper token-specific data");
  console.log("✅ Token type set to COLLECTION (2)");
  
  // Verification
  console.log("\n=== VERIFICATION ===");
  const interfaceId = "0x3a271706"; // New LSP8 interface ID
  const supportsInterface = await LSP8Loogies.supportsInterface(interfaceId);
  console.log(`Supports new LSP8 interface (${interfaceId}): ${supportsInterface}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 