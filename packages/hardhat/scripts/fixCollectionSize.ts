import { ethers } from "hardhat";

/**
 * Script to fix the collection size (total supply) metadata so it's recognized by the 
 * Universal Explorer. This sets the correct LSP4 metadata key for the collection size.
 */
async function main() {
  console.log("\n=== FIXING COLLECTION SIZE METADATA FOR UNIVERSAL EXPLORER ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from latest deployment
  // Replace with your actual contract address
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance 
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  try {
    // Verify we have the right contract by checking the name
    const name = await LSP8Loogies.name();
    console.log(`Contract name: ${name}`);
    
    // Define the correct keys for LSP4 token total supply
    // These are the official keys that the Universal Explorer recognizes
    // Note: We previously added totalSupply to the attributes field in collection metadata
    // but this doesn't affect the main collection size display in the explorer
    
    // Standard LSP4 total supply key (used by explorer for collection size)
    const LSP4_METADATA_TOTAL_SUPPLY = "0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f";
    
    // Max supply key (sometimes used as well)
    const LSP4_METADATA_MAX_SUPPLY = "0xd28c95357cf4c94d638a4f572d5d3df8d7e1415c8b650e747a219c559d1435c8";
    
    // Set the value to 3728 (the collection limit)
    const COLLECTION_LIMIT = 3728;
    console.log(`Setting collection size to: ${COLLECTION_LIMIT}`);
    
    // Convert value to bytes32 as uint256 (not string)
    const COLLECTION_LIMIT_BYTES = ethers.zeroPadValue(ethers.toBeHex(COLLECTION_LIMIT), 32);
    
    // Set the data on the contract for both keys
    console.log("Updating collection size metadata with standard total supply key...");
    const tx1 = await LSP8Loogies.setData(LSP4_METADATA_TOTAL_SUPPLY, COLLECTION_LIMIT_BYTES);
    console.log(`Transaction hash: ${tx1.hash}`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt1 = await tx1.wait();
    if (receipt1) {
      console.log(`Transaction confirmed in block: ${receipt1.blockNumber}`);
    } else {
      console.log("Transaction submitted but no receipt available");
    }
    
    console.log("Updating collection size metadata with max supply key...");
    const tx2 = await LSP8Loogies.setData(LSP4_METADATA_MAX_SUPPLY, COLLECTION_LIMIT_BYTES);
    console.log(`Transaction hash: ${tx2.hash}`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt2 = await tx2.wait();
    if (receipt2) {
      console.log(`Transaction confirmed in block: ${receipt2.blockNumber}`);
    } else {
      console.log("Transaction submitted but no receipt available");
    }
    
    // Also update the collection metadata to ensure it contains the right info
    console.log("Updating full collection metadata...");
    const updateTx = await LSP8Loogies.updateCollectionMetadata();
    console.log(`Transaction hash: ${updateTx.hash}`);
    
    const updateReceipt = await updateTx.wait();
    if (updateReceipt) {
      console.log(`Transaction confirmed in block: ${updateReceipt.blockNumber}`);
    } else {
      console.log("Transaction submitted but no receipt available");
    }
    
    console.log("\n✅ Collection size metadata updated successfully!");
    console.log(`Check your contract on the Universal Explorer:`);
    console.log(`https://universalexplorer.io/collections/${contractAddress}?network=testnet`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 