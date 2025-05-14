import { ethers } from "hardhat";

/**
 * Script to update the LSP8LoogiesUpdated contract with fixed metadata for
 * proper rendering of the collection size and token SVGs in Universal Explorer
 */
async function main() {
  console.log("\n=== UPDATING LSP8LOOGIESUPDATED CONTRACT METADATA ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  try {
    // Verify we have the right contract by checking the name
    const name = await LSP8Loogies.name();
    console.log(`Contract name: ${name}`);
    
    // Get total supply
    const totalSupply = await LSP8Loogies.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    // Set the collection size with correct number format (not a string)
    console.log("Updating collection size metadata...");
    
    // Standard LSP4 total supply key (used by explorer for collection size)
    const LSP4_METADATA_TOTAL_SUPPLY = "0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f";
    
    // The collection size limit
    const COLLECTION_LIMIT = 3728;
    console.log(`Setting collection size to: ${COLLECTION_LIMIT}`);
    
    // Convert value to bytes32 as uint256 (not string)
    const COLLECTION_LIMIT_BYTES = ethers.zeroPadValue(ethers.toBeHex(COLLECTION_LIMIT), 32);
    
    // Set the data on the contract
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
    
    // Update collection metadata to use the new format
    console.log("Updating full collection metadata...");
    const updateTx = await LSP8Loogies.updateCollectionMetadata();
    console.log(`Transaction hash: ${updateTx.hash}`);
    
    // Wait for transaction to be mined
    const updateReceipt = await updateTx.wait();
    if (updateReceipt) {
      console.log(`Transaction confirmed in block: ${updateReceipt.blockNumber}`);
    } else {
      console.log("Transaction submitted but no receipt available");
    }
    
    // Try to verify the collection metadata key 
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    const metadataBytes = await LSP8Loogies.getData(LSP4_METADATA_KEY);
    console.log(`Updated collection metadata length: ${metadataBytes.length} bytes`);
    
    console.log("\n✅ Collection metadata updated successfully!");
    console.log(`\nCheck your collection in Universal Explorer to verify the changes:`);
    console.log(`https://universalexplorer.io/collections/${contractAddress}?network=testnet`);
    
    // If there are tokens, force update their metadata too
    if (totalSupply.toString() !== "0") {
      console.log(`\nUpdating metadata for ${totalSupply.toString()} tokens...`);
      
      // Set updated fixed values for each token one by one
      for (let i = 1; i <= parseInt(totalSupply.toString()); i++) {
        // Convert to bytes32 token ID
        const tokenId = ethers.zeroPadValue(ethers.toBeHex(i), 32);
        console.log(`\nUpdating token #${i} (ID: ${tokenId.substring(0, 10)}...)...`);
        
        try {
          // Get token owner
          const owner = await LSP8Loogies.tokenOwnerOf(tokenId);
          console.log(`Token owner: ${owner}`);
          
          // For each token, touch it to refresh metadata 
          // We can do this by setting the username to force a refresh
          const username = await LSP8Loogies.upUsernames(tokenId);
          console.log(`Current username: ${username}`);
          
          // Set username again to trigger metadata update
          const setUsernameTx = await LSP8Loogies.setUPUsername(tokenId, username);
          console.log(`Update transaction hash: ${setUsernameTx.hash}`);
          
          const setUsernameReceipt = await setUsernameTx.wait();
          if (setUsernameReceipt) {
            console.log(`Transaction confirmed in block: ${setUsernameReceipt.blockNumber}`);
          } else {
            console.log("Transaction submitted but no receipt available");
          }
        } catch (error) {
          console.error(`Error updating token #${i}:`, error);
          continue;
        }
      }
      
      console.log("\n✅ All tokens updated successfully!");
      console.log(`\nCheck your tokens in Universal Explorer:`);
      console.log(`https://universalexplorer.io/collections/${contractAddress}/1?network=testnet`);
    }
    
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