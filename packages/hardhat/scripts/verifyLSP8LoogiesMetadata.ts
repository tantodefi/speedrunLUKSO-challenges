import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  console.log("Verifying metadata for LSP8LoogiesBasic...");
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  console.log("Fetching collection metadata...");
  try {
    const collectionMetadata = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
    console.log("Collection metadata:", collectionMetadata);
    
    // The metadata is encoded with a specific LUKSO format:
    // - First 8 bytes are the LUKSO metadata prefix (0x00006f357c6a0020)
    // - Next 32 bytes are the keccak256 hash of the metadata
    // - The rest is the data URL containing the encoded metadata
    
    if (collectionMetadata.length > 40) {
      const prefix = collectionMetadata.slice(0, 10); // First 8 bytes + 0x
      console.log("Prefix:", prefix);
      
      const hash = collectionMetadata.slice(10, 74); // 32 bytes hash
      console.log("Hash:", hash);
      
      const dataUrl = ethers.toUtf8String(
        ethers.dataSlice(collectionMetadata, 40, collectionMetadata.length)
      );
      console.log("Data URL prefix:", dataUrl.slice(0, 50) + "...");
      
      // Extract and decode the base64 part
      const base64Data = dataUrl.split('base64,')[1];
      if (base64Data) {
        const jsonMetadata = Buffer.from(base64Data, 'base64').toString('utf-8');
        console.log("Decoded metadata:", jsonMetadata);
      }
    }
  } catch (error) {
    console.log("Error getting collection metadata:", (error as Error).message);
  }
  
  // Try to get token data for token ID 1
  console.log("\nAttempting to get token #1 metadata...");
  try {
    // Mint a new token if needed
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);
    
    // Check if we have any token minted
    console.log("Minting a new token for testing...");
    const mintTx = await lsp8LoogiesBasic.mintItem({ value: ethers.parseEther("0.001") });
    const receipt = await mintTx.wait();
    
    if (!receipt) {
      console.log("Failed to get transaction receipt");
      return;
    }
    
    console.log(`Mint transaction hash: ${mintTx.hash}`);
    
    // Try to find tokenId from events
    let tokenId: string | undefined;
    
    console.log("Transaction events:", receipt.logs.length);
    
    try {
      // The NFT Transfer event should contain the tokenId
      const transferEvent = receipt.logs.find(log => 
        log.topics && log.topics[0] === ethers.id(
          "Transfer(address,address,bytes32,bool,bytes)"
        )
      );
      
      if (transferEvent && transferEvent.topics.length >= 3) {
        // The tokenId should be in the third topic
        tokenId = transferEvent.topics[3];
        console.log(`Minted token ID: ${tokenId}`);
        
        // Get token specific data
        if (tokenId) {
          console.log(`Fetching metadata for token ${tokenId}...`);
          try {
            // Use the contract's underlying ERC725Y storage for token data
            // We'll try direct interface call using the function signature
            const lsp8Interface = new ethers.Interface([
              "function getData(bytes32,bytes32) view returns (bytes)"
            ]);
            
            // Create the function data for the direct call
            const callData = lsp8Interface.encodeFunctionData("getData", [tokenId, LSP4_METADATA_KEY]);
            
            // Execute the call
            const tokenDataResult = await deployer.provider.call({
              to: CONTRACT_ADDRESS,
              data: callData
            });
            
            // Decode the result
            const tokenData = lsp8Interface.decodeFunctionResult("getData", tokenDataResult)[0];
            console.log("Token metadata:", tokenData);
            
            // Extract and decode the same way as collection metadata
            if (tokenData.length > 40) {
              const prefix = tokenData.slice(0, 10); 
              console.log("Token data prefix:", prefix);
              
              const hash = tokenData.slice(10, 74);
              console.log("Token data hash:", hash);
              
              const dataUrl = ethers.toUtf8String(
                ethers.dataSlice(tokenData, 40, tokenData.length)
              );
              console.log("Token data URL prefix:", dataUrl.slice(0, 50) + "...");
              
              // Extract and decode the base64 part
              const base64Data = dataUrl.split('base64,')[1];
              if (base64Data) {
                const jsonMetadata = Buffer.from(base64Data, 'base64').toString('utf-8');
                console.log("Decoded token metadata:", jsonMetadata);
              }
            }
          } catch (error) {
            console.log("Error getting token data:", (error as Error).message);
          }
        }
      } else {
        console.log("Could not find Transfer event with tokenId");
      }
    } catch (error) {
      console.log("Error parsing events:", (error as Error).message);
    }
  } catch (error) {
    console.log("Error minting or getting token:", (error as Error).message);
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
  
  console.log("Verifying metadata for LSP8LoogiesBasic...");
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  console.log("Fetching collection metadata...");
  try {
    const collectionMetadata = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
    console.log("Collection metadata:", collectionMetadata);
    
    // The metadata is encoded with a specific LUKSO format:
    // - First 8 bytes are the LUKSO metadata prefix (0x00006f357c6a0020)
    // - Next 32 bytes are the keccak256 hash of the metadata
    // - The rest is the data URL containing the encoded metadata
    
    if (collectionMetadata.length > 40) {
      const prefix = collectionMetadata.slice(0, 10); // First 8 bytes + 0x
      console.log("Prefix:", prefix);
      
      const hash = collectionMetadata.slice(10, 74); // 32 bytes hash
      console.log("Hash:", hash);
      
      const dataUrl = ethers.toUtf8String(
        ethers.dataSlice(collectionMetadata, 40, collectionMetadata.length)
      );
      console.log("Data URL prefix:", dataUrl.slice(0, 50) + "...");
      
      // Extract and decode the base64 part
      const base64Data = dataUrl.split('base64,')[1];
      if (base64Data) {
        const jsonMetadata = Buffer.from(base64Data, 'base64').toString('utf-8');
        console.log("Decoded metadata:", jsonMetadata);
      }
    }
  } catch (error) {
    console.log("Error getting collection metadata:", (error as Error).message);
  }
  
  // Try to get token data for token ID 1
  console.log("\nAttempting to get token #1 metadata...");
  try {
    // Mint a new token if needed
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);
    
    // Check if we have any token minted
    console.log("Minting a new token for testing...");
    const mintTx = await lsp8LoogiesBasic.mintItem({ value: ethers.parseEther("0.001") });
    const receipt = await mintTx.wait();
    
    if (!receipt) {
      console.log("Failed to get transaction receipt");
      return;
    }
    
    console.log(`Mint transaction hash: ${mintTx.hash}`);
    
    // Try to find tokenId from events
    let tokenId: string | undefined;
    
    console.log("Transaction events:", receipt.logs.length);
    
    try {
      // The NFT Transfer event should contain the tokenId
      const transferEvent = receipt.logs.find(log => 
        log.topics && log.topics[0] === ethers.id(
          "Transfer(address,address,bytes32,bool,bytes)"
        )
      );
      
      if (transferEvent && transferEvent.topics.length >= 3) {
        // The tokenId should be in the third topic
        tokenId = transferEvent.topics[3];
        console.log(`Minted token ID: ${tokenId}`);
        
        // Get token specific data
        if (tokenId) {
          console.log(`Fetching metadata for token ${tokenId}...`);
          try {
            // Use the contract's underlying ERC725Y storage for token data
            // We'll try direct interface call using the function signature
            const lsp8Interface = new ethers.Interface([
              "function getData(bytes32,bytes32) view returns (bytes)"
            ]);
            
            // Create the function data for the direct call
            const callData = lsp8Interface.encodeFunctionData("getData", [tokenId, LSP4_METADATA_KEY]);
            
            // Execute the call
            const tokenDataResult = await deployer.provider.call({
              to: CONTRACT_ADDRESS,
              data: callData
            });
            
            // Decode the result
            const tokenData = lsp8Interface.decodeFunctionResult("getData", tokenDataResult)[0];
            console.log("Token metadata:", tokenData);
            
            // Extract and decode the same way as collection metadata
            if (tokenData.length > 40) {
              const prefix = tokenData.slice(0, 10); 
              console.log("Token data prefix:", prefix);
              
              const hash = tokenData.slice(10, 74);
              console.log("Token data hash:", hash);
              
              const dataUrl = ethers.toUtf8String(
                ethers.dataSlice(tokenData, 40, tokenData.length)
              );
              console.log("Token data URL prefix:", dataUrl.slice(0, 50) + "...");
              
              // Extract and decode the base64 part
              const base64Data = dataUrl.split('base64,')[1];
              if (base64Data) {
                const jsonMetadata = Buffer.from(base64Data, 'base64').toString('utf-8');
                console.log("Decoded token metadata:", jsonMetadata);
              }
            }
          } catch (error) {
            console.log("Error getting token data:", (error as Error).message);
          }
        }
      } else {
        console.log("Could not find Transfer event with tokenId");
      }
    } catch (error) {
      console.log("Error parsing events:", (error as Error).message);
    }
  } catch (error) {
    console.log("Error minting or getting token:", (error as Error).message);
  }
  
  console.log("\nMetadata verification complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
 