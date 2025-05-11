import { ethers } from "hardhat";
import { LSP8Loogies__factory } from "../typechain-types";

async function main() {
  console.log("Starting legacy token import script...");

  // Address of the previous contract deployment
  const oldContractAddress = "0xYourOldContractAddress"; // REPLACE WITH YOUR OLD CONTRACT ADDRESS
  
  // Get the new contract instance
  const [deployer] = await ethers.getSigners();
  console.log(`Using deployer address: ${deployer.address}`);
  
  const deployments = await import("../deployments/localhost/LSP8Loogies.json");
  const newContractAddress = deployments.address;
  console.log(`New contract address: ${newContractAddress}`);
  
  // Create instances of both contracts
  const oldContract = LSP8Loogies__factory.connect(oldContractAddress, deployer);
  const newContract = LSP8Loogies__factory.connect(newContractAddress, deployer);
  
  try {
    // Get highest token ID from old contract
    const tokenCount = await oldContract.totalSupply();
    console.log(`Old contract has ${tokenCount} tokens`);
    
    if (tokenCount.toString() === "0") {
      console.log("No tokens to import!");
      return;
    }
    
    // Try to get all token IDs using the getAllTokenIds function (if available)
    let tokenIds: bigint[] = [];
    try {
      tokenIds = await oldContract.getAllTokenIds();
      console.log(`Successfully retrieved ${tokenIds.length} token IDs from getAllTokenIds`);
    } catch (error) {
      console.log("getAllTokenIds not available on old contract, using sequential scan...");
      
      // Scan for tokens sequentially
      for (let i = 1; i <= parseInt(tokenCount.toString()); i++) {
        try {
          const tokenIdBytes = ethers.encodeBytes32String(i.toString());
          const owner = await oldContract.tokenOwnerOf(tokenIdBytes);
          if (owner !== ethers.ZeroAddress) {
            tokenIds.push(BigInt(i));
          }
        } catch (error) {
          // Token doesn't exist, skip
        }
      }
    }
    
    console.log(`Found ${tokenIds.length} valid tokens`);
    
    // Split into manageable chunks to avoid gas limits
    const CHUNK_SIZE = 25;
    const chunks = [];
    for (let i = 0; i < tokenIds.length; i += CHUNK_SIZE) {
      chunks.push(tokenIds.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`Split into ${chunks.length} chunks of up to ${CHUNK_SIZE} tokens each`);
    
    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} tokens`);
      
      const tokenIdsToImport: bigint[] = [];
      const ownersToImport: string[] = [];
      
      // Collect data for this chunk
      for (const id of chunk) {
        const tokenIdBytes = ethers.toBeHex(id, 32);
        try {
          const owner = await oldContract.tokenOwnerOf(tokenIdBytes);
          tokenIdsToImport.push(id);
          ownersToImport.push(owner);
        } catch (error) {
          console.log(`Error getting owner for token ${id}, skipping...`);
        }
      }
      
      // Import tokens into new contract
      if (tokenIdsToImport.length > 0) {
        console.log(`Importing ${tokenIdsToImport.length} tokens...`);
        const tx = await newContract.importLegacyTokensSimple(tokenIdsToImport, ownersToImport);
        await tx.wait();
        console.log(`Imported chunk ${chunkIndex + 1} successfully!`);
      }
    }
    
    console.log("Import completed successfully!");
    
    // Verify the _tokenIds counter was updated correctly
    const totalSupply = await newContract.totalSupply();
    console.log(`New contract total supply: ${totalSupply}`);
    
  } catch (error) {
    console.error("Error importing tokens:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 