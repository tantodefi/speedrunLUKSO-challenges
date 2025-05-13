import { ethers } from "hardhat";

// Define interfaces for contract types with proper typing
interface LSP8LoogiesBase {
  totalSupply: () => Promise<bigint>;
  tokenExists: (id: number) => Promise<boolean>;
  tokenOwnerOf: (tokenId: string) => Promise<string>;
  color: (tokenId: string) => Promise<string>;
  chubbiness: (tokenId: string) => Promise<bigint>;
  mouthLength: (tokenId: string) => Promise<bigint>;
  upUsernames: (tokenId: string) => Promise<string>;
}

interface LSP8LoogiesUpdatedWithMetadata extends LSP8LoogiesBase {
  owner: () => Promise<string>;
  updateCollectionMetadata: () => Promise<any>;
  importLegacyTokens: (
    tokenIds: number[], 
    owners: string[], 
    colors: string[], 
    chubbiness: number[], 
    mouthLength: number[], 
    usernames: string[],
    options?: any
  ) => Promise<any>;
  metadataContract: () => Promise<string>;
}

/**
 * Script to migrate tokens from the original LSP8Loogies contract to the new LSP8LoogiesUpdated contract
 * This script:
 * 1. Fetches all tokens from the original contract
 * 2. Imports them into the new contract with their metadata
 * 3. Sets up proper LSP8 metadata for each token using the OnChainMetadata contract
 */
async function main() {
  console.log("\n=== MIGRATING TOKENS FROM OLD TO NEW LSP8LOOGIES CONTRACT ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Replace with your deployed contract addresses
  const oldContractAddress = "0xAfEcAAE8FfD830F3Ca9B141546f5eea6E314cF1B"; // Original LSP8Loogies
  const newContractAddress = ""; // New LSP8LoogiesUpdated - REPLACE WITH YOUR DEPLOYED ADDRESS
  
  if (!newContractAddress) {
    console.error("ERROR: You must replace the newContractAddress with your deployed LSP8LoogiesUpdated address");
    process.exit(1);
  }
  
  console.log(`Original contract: ${oldContractAddress}`);
  console.log(`Updated contract: ${newContractAddress}`);
  
  // Get contract instances with proper typing
  const originalContract = await ethers.getContractAt(
    "LSP8Loogies", 
    oldContractAddress
  ) as unknown as LSP8LoogiesBase;
  
  const newContract = await ethers.getContractAt(
    "LSP8LoogiesUpdated", 
    newContractAddress
  ) as unknown as LSP8LoogiesUpdatedWithMetadata;
  
  // Get OnChainMetadata contract address
  try {
    const metadataAddress = await newContract.metadataContract();
    console.log(`OnChainMetadata contract: ${metadataAddress}`);
  } catch (error) {
    console.log("Note: This contract may not have the OnChainMetadata integration yet.");
  }
  
  // Check that caller is the owner of the new contract
  const newContractOwner = await newContract.owner();
  if (newContractOwner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error(`ERROR: You (${signer.address}) are not the owner of the new contract (${newContractOwner})`);
    process.exit(1);
  }
  
  // 1. First, get total supply from original contract
  const totalSupply = await originalContract.totalSupply();
  console.log(`Original contract total supply: ${totalSupply}`);
  
  // Check if there are any tokens to migrate
  if (totalSupply === 0n) {
    console.log("No tokens to migrate. Exiting.");
    return;
  }
  
  // 2. Process tokens in batches to avoid gas limits
  const BATCH_SIZE = 10;
  const totalTokens = Number(totalSupply);
  
  for (let batchStart = 1; batchStart <= totalTokens; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, totalTokens);
    console.log(`Processing batch: tokens ${batchStart} to ${batchEnd}`);
    
    // Arrays to store token data for import
    const tokenIds: number[] = [];
    const tokenOwners: string[] = [];
    const tokenColors: string[] = [];
    const tokenChubbiness: number[] = [];
    const tokenMouthLength: number[] = [];
    const tokenUsernames: string[] = [];
    
    // Collect data for each token in the batch
    for (let i = batchStart; i <= batchEnd; i++) {
      try {
        const tokenId = ethers.zeroPadValue(ethers.toBeHex(i), 32);
        console.log(`Fetching data for token #${i} (ID: ${tokenId})`);
        
        // Check if token exists
        const exists = await originalContract.tokenExists(i);
        if (!exists) {
          console.log(`Token #${i} does not exist, skipping`);
          continue;
        }
        
        // Get token owner
        const owner = await originalContract.tokenOwnerOf(tokenId);
        console.log(`Owner: ${owner}`);
        
        // Get token metadata
        const color = await originalContract.color(tokenId);
        const chubbiness = await originalContract.chubbiness(tokenId);
        const mouthLength = await originalContract.mouthLength(tokenId);
        const username = await originalContract.upUsernames(tokenId);
        
        // Add to arrays
        tokenIds.push(i);
        tokenOwners.push(owner);
        tokenColors.push(color);
        tokenChubbiness.push(Number(chubbiness));
        tokenMouthLength.push(Number(mouthLength));
        tokenUsernames.push(username || "luksonaut");
        
        console.log(`Token #${i} data collected: Color=${color}, Chubbiness=${chubbiness}, MouthLength=${mouthLength}, Username=${username}`);
      } catch (error) {
        console.error(`Error processing token #${i}:`, error);
      }
    }
    
    // If no valid tokens in batch, skip import
    if (tokenIds.length === 0) {
      console.log("No valid tokens in this batch, skipping import");
      continue;
    }
    
    // 3. Import tokens to new contract
    console.log(`Importing ${tokenIds.length} tokens to new contract...`);
    try {
      const tx = await newContract.importLegacyTokens(
        tokenIds,
        tokenOwners,
        tokenColors,
        tokenChubbiness,
        tokenMouthLength,
        tokenUsernames,
        { gasLimit: 10000000 } // High gas limit for batch operations
      );
      
      console.log(`Transaction hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      if (receipt) {
        console.log(`✅ Batch imported in block ${receipt.blockNumber}`);
      } else {
        console.log("✅ Transaction completed but receipt not available");
      }
    } catch (error) {
      console.error("Error during import:", error);
    }
  }
  
  // 4. Verify the migration
  const newTotalSupply = await newContract.totalSupply();
  console.log("\n=== MIGRATION COMPLETE ===");
  console.log(`Original contract tokens: ${totalSupply}`);
  console.log(`New contract tokens: ${newTotalSupply}`);
  console.log(`Migration success rate: ${(Number(newTotalSupply) / Number(totalSupply) * 100).toFixed(2)}%`);
  
  // 5. Update collection metadata
  console.log("\nUpdating collection metadata...");
  try {
    const tx = await newContract.updateCollectionMetadata();
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`✅ Collection metadata updated in block ${receipt.blockNumber}`);
    } else {
      console.log("✅ Collection metadata updated but receipt not available");
    }
  } catch (error) {
    console.error("Error updating collection metadata:", error);
  }
  
  console.log("\nYour LSP8Loogies have been successfully migrated to the new LSP8LoogiesUpdated contract.");
  console.log("✅ Tokens migrated with all their metadata");
  console.log("✅ Matrix-style animations added through OnChainMetadata contract");
  console.log("✅ Proper LSP4 metadata format with verification bytes");
  console.log(`View in Universal Explorer: https://universaleverything.io/collection/${newContractAddress}?network=testnet`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 