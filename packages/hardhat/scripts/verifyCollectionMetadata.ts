import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  console.log("Verifying collection metadata for LSP8LoogiesBasic...");
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  console.log("Fetching collection metadata...");
  try {
    const collectionMetadata = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
    console.log("Collection metadata hex length:", collectionMetadata.length);
    
    // The metadata is encoded with a specific LUKSO format:
    // - First 8 bytes are the LUKSO metadata prefix (0x00006f357c6a0020)
    // - Next 32 bytes are the keccak256 hash of the metadata
    // - The rest is the data URL containing the encoded metadata
    
    if (collectionMetadata.length > 40) {
      // Extract the components
      const prefix = collectionMetadata.slice(0, 18); // 0x + first 8 bytes
      console.log("Prefix:", prefix);
      
      const hash = "0x" + collectionMetadata.slice(18, 82); // 32 bytes hash
      console.log("Hash:", hash);
      
      // The dataUrl starts at position 82
      try {
        // Convert the remaining bytes to a string
        const dataUrl = Buffer.from(collectionMetadata.slice(82), 'hex').toString('utf8');
        console.log("Data URL:", dataUrl.substring(0, 100) + "...");
        
        // Extract the base64 part
        if (dataUrl.includes('base64,')) {
          const base64Data = dataUrl.split('base64,')[1];
          const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
          console.log("\nDecoded metadata (pretty):", JSON.stringify(JSON.parse(decodedData), null, 2));
        }
      } catch (error) {
        console.log("Error decoding data URL:", (error as Error).message);
      }
    }
  } catch (error) {
    console.log("Error getting collection metadata:", (error as Error).message);
  }
  
  console.log("\nMetadata verification complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  console.log("Verifying collection metadata for LSP8LoogiesBasic...");
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  console.log("Fetching collection metadata...");
  try {
    const collectionMetadata = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
    console.log("Collection metadata hex length:", collectionMetadata.length);
    
    // The metadata is encoded with a specific LUKSO format:
    // - First 8 bytes are the LUKSO metadata prefix (0x00006f357c6a0020)
    // - Next 32 bytes are the keccak256 hash of the metadata
    // - The rest is the data URL containing the encoded metadata
    
    if (collectionMetadata.length > 40) {
      // Extract the components
      const prefix = collectionMetadata.slice(0, 18); // 0x + first 8 bytes
      console.log("Prefix:", prefix);
      
      const hash = "0x" + collectionMetadata.slice(18, 82); // 32 bytes hash
      console.log("Hash:", hash);
      
      // The dataUrl starts at position 82
      try {
        // Convert the remaining bytes to a string
        const dataUrl = Buffer.from(collectionMetadata.slice(82), 'hex').toString('utf8');
        console.log("Data URL:", dataUrl.substring(0, 100) + "...");
        
        // Extract the base64 part
        if (dataUrl.includes('base64,')) {
          const base64Data = dataUrl.split('base64,')[1];
          const decodedData = Buffer.from(base64Data, 'base64').toString('utf8');
          console.log("\nDecoded metadata (pretty):", JSON.stringify(JSON.parse(decodedData), null, 2));
        }
      } catch (error) {
        console.log("Error decoding data URL:", (error as Error).message);
      }
    }
  } catch (error) {
    console.log("Error getting collection metadata:", (error as Error).message);
  }
  
  console.log("\nMetadata verification complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 