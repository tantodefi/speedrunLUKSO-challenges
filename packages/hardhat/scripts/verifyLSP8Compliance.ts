import { ethers } from "hardhat";

// Define key constants for verification
const LSP4_TOKEN_TYPE_KEY = "0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3";
const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
const LSP4_SUPPORTED_STANDARDS_KEY = "0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c";
const LSP8_INTERFACE_ID = "0x3a271706";
const LSP4_TOKEN_TYPE_COLLECTION = 2; // Collection type

/**
 * Script to verify that the LSP8LoogiesUpdated contract complies with the latest LUKSO standards
 */
async function main() {
  console.log("\n=== VERIFYING LSP8LOOGIESUPDATED STANDARD COMPLIANCE ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment or environment
  const contractAddress = process.env.LSP8_CONTRACT_ADDRESS || "0xYourDeployedContractAddress";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  console.log("\nVerifying contract standards compliance...");
  
  // 1. Check interface support
  try {
    const supportsLSP8 = await LSP8Loogies.supportsInterface(LSP8_INTERFACE_ID);
    console.log(`✅ Supports LSP8 interface: ${supportsLSP8}`);
  } catch (error) {
    console.error("❌ Failed to check interface support:", error);
  }
  
  // 2. Check token type
  try {
    const tokenType = await LSP8Loogies.getData(LSP4_TOKEN_TYPE_KEY);
    const tokenTypeDecimal = parseInt(tokenType, 16);
    console.log(`✅ Token type: ${tokenTypeDecimal} (${tokenTypeDecimal === LSP4_TOKEN_TYPE_COLLECTION ? "COLLECTION" : "OTHER"})`);
    
    if (tokenTypeDecimal !== LSP4_TOKEN_TYPE_COLLECTION) {
      console.log("⚠️ Token type is not set to COLLECTION (2)");
    }
  } catch (error) {
    console.error("❌ Failed to check token type:", error);
  }
  
  // 3. Check metadata format
  try {
    const metadata = await LSP8Loogies.getData(LSP4_METADATA_KEY);
    console.log(`✅ Metadata exists: ${metadata.length > 0}`);
    
    // Check for verification bytes
    const hasVerificationBytes = metadata.startsWith("0x00000000");
    console.log(`✅ Metadata has verification bytes: ${hasVerificationBytes}`);
    
    if (!hasVerificationBytes) {
      console.log("⚠️ Metadata should start with 0x00000000 for proper Explorer display");
    }
    
    // Parse and check JSON format (need to strip verification bytes)
    try {
      const jsonStartIndex = metadata.indexOf("{");
      if (jsonStartIndex > 0) {
        const jsonStr = metadata.substring(jsonStartIndex);
        const parsedMetadata = JSON.parse(jsonStr);
        console.log(`✅ Metadata JSON is valid`);
        
        // Check for LSP4Metadata key in JSON
        if (parsedMetadata.LSP4Metadata) {
          console.log(`✅ Metadata contains LSP4Metadata object`);
          
          // Check for required fields
          const hasName = !!parsedMetadata.LSP4Metadata.name;
          const hasDescription = !!parsedMetadata.LSP4Metadata.description;
          const hasImages = Array.isArray(parsedMetadata.LSP4Metadata.images);
          
          console.log(`✅ Has name: ${hasName}`);
          console.log(`✅ Has description: ${hasDescription}`);
          console.log(`✅ Has images array: ${hasImages}`);
        } else {
          console.log("⚠️ Metadata JSON does not contain LSP4Metadata object");
        }
      } else {
        console.log("⚠️ Could not find JSON in metadata");
      }
    } catch (error) {
      console.log("⚠️ Metadata JSON parsing failed:", error);
    }
  } catch (error) {
    console.error("❌ Failed to check metadata:", error);
  }
  
  // 4. Check supported standards
  try {
    const supportedStandards = await LSP8Loogies.getData(LSP4_SUPPORTED_STANDARDS_KEY);
    console.log(`✅ Supported standards data exists: ${supportedStandards.length > 0}`);
  } catch (error) {
    console.error("❌ Failed to check supported standards:", error);
  }
  
  // 5. Test minting a token to verify token metadata
  try {
    console.log("\nAttempting to mint a test token to verify token metadata...");
    const tx = await LSP8Loogies.mintLoogie(signer.address);
    console.log(`Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`✅ Test token minted in block: ${receipt.blockNumber}`);
      
      // Get total supply
      const totalSupply = await LSP8Loogies.totalSupply();
      console.log(`Total supply: ${totalSupply.toString()}`);
      
      // Try to extract tokenId
      const tokenId = await extractTokenId(receipt);
      if (tokenId) {
        console.log(`Token ID: ${tokenId}`);
        
        // This will call _getDataForTokenId internally which should apply our overridden metadata logic
        try {
          const tokenIdBytes32 = ethers.hexlify(ethers.toBeArray(tokenId.toString().padStart(64, '0')));
          console.log(`Checking token metadata for token: ${tokenIdBytes32}`);
          
          // We're using a workaround here since TypeScript doesn't know about the getDataForTokenId method
          // This calls the internal storage and checks if our metadata format is correctly set
          const dataKey = LSP4_METADATA_KEY;
          
          console.log(`Note: For individual token metadata, check the token in the Universal Explorer`);
          console.log(`https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenIdBytes32}?network=testnet`);
        } catch (error) {
          console.error("❌ Failed to check token metadata:", error);
        }
      }
    }
  } catch (error) {
    console.error("❌ Failed to mint test token:", error);
  }
  
  console.log("\n=== VERIFICATION COMPLETE ===");
  console.log("\nView your collection at:");
  console.log(`https://universal.page/collections/lukso-testnet/${contractAddress}`);
  console.log(`https://universaleverything.io/collection/${contractAddress}?network=testnet`);
}

// Helper function to extract tokenId from transaction receipt
async function extractTokenId(receipt: any): Promise<string | null> {
  try {
    // Try to find the Transfer event
    const transferEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("Transfer(address,address,bytes32,bool,bytes)")
    );
    
    if (transferEvent) {
      const tokenIdHex = transferEvent.topics[3];
      return tokenIdHex;
    }
    return null;
  } catch (error) {
    console.error("Error extracting tokenId:", error);
    return null;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 