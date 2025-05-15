import { ethers } from "hardhat";

/**
 * Script to query the deployed LSP8Loogies contract
 * This examines the metadata and SVG generation issues without modifying the contract
 */
async function main() {
  console.log("\n=== QUERYING DEPLOYED LOOGIES CONTRACT ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract address from deployment
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Define minimal ABI for querying
    const minimalABI = [
      "function getData(bytes32 dataKey) external view returns (bytes)",
      "function tokenOwnerOf(bytes32 tokenId) external view returns (address)",
      "function totalSupply() external view returns (uint256)",
      "function color(bytes32 tokenId) external view returns (bytes3)",
      "function chubbiness(bytes32 tokenId) external view returns (uint256)",
      "function mouthLength(bytes32 tokenId) external view returns (uint256)",
      "function loogieTypes(bytes32 tokenId) external view returns (string)",
      "function upUsernames(bytes32 tokenId) external view returns (string)"
    ];
    
    const contract = new ethers.Contract(contractAddress, minimalABI, signer);
    
    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    // Check token ID 1
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`\nChecking token ID: ${tokenId}`);
    
    try {
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`Token owner: ${owner}`);
    } catch (error: any) {
      console.log(`Error getting token owner: ${error.message}`);
    }
    
    try {
      const colorBytes = await contract.color(tokenId);
      console.log(`Token color: ${colorBytes} (hex: #${colorBytes.substring(2)})`);
      
      const chubbiness = await contract.chubbiness(tokenId);
      console.log(`Token chubbiness: ${chubbiness}`);
      
      const mouthLength = await contract.mouthLength(tokenId);
      console.log(`Token mouth length: ${mouthLength}`);
      
      const loogieType = await contract.loogieTypes(tokenId);
      console.log(`Token type: ${loogieType}`);
      
      const username = await contract.upUsernames(tokenId);
      console.log(`Token username: ${username}`);
    } catch (error: any) {
      console.log(`Error getting token properties: ${error.message}`);
    }
    
    // Check LSP4 metadata
    console.log("\n=== CHECKING LSP4 METADATA ===");
    
    // LSP4 Metadata key
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    
    try {
      // Get collection metadata
      console.log("Fetching collection metadata...");
      const collectionMetadata = await contract.getData(LSP4_METADATA_KEY);
      console.log(`Collection metadata retrieved (${collectionMetadata.length} bytes)`);
      
      if (collectionMetadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected");
        
        // Extract the base64 encoded JSON part
        // The format is: 0x00006f357c6a0020 + keccak256(metadata) + base64EncodedMetadata
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const base64Data = collectionMetadata.slice(prefixLength);
        
        // Check if data starts with "data:application/json;base64,"
        if (base64Data.includes("data:application/json;base64,")) {
          const base64Start = base64Data.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = base64Data.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Look for image URL
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nImage URL found:");
                console.log(imageUrl);
                
                // Check if it's SVG
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded SVG:");
                  console.log(svgString);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
            console.log("Raw base64 content:", base64Metadata);
          }
        } else {
          console.log("No base64 JSON data found");
          console.log("Raw metadata:", base64Data);
        }
      } else {
        console.log("❌ Incorrect metadata format. Raw data:");
        console.log(collectionMetadata);
      }
    } catch (error: any) {
      console.log(`Error getting collection metadata: ${error.message}`);
    }
    
    // Try to get metadata for a specific token
    console.log("\n=== CHECKING TOKEN METADATA ===");
    
    // LSP8 token data key for LSP4 metadata
    const tokenDataKey = ethers.keccak256(
      ethers.concat([
        ethers.hexlify(ethers.toUtf8Bytes("LSP8MetadataToken")),
        ethers.zeroPadValue(tokenId, 32),
        LSP4_METADATA_KEY
      ])
    );
    
    try {
      const tokenMetadata = await contract.getData(tokenDataKey);
      console.log(`Token metadata retrieved (${tokenMetadata.length} bytes)`);
      
      if (tokenMetadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected for token");
        
        // Extract the base64 encoded JSON part
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const base64Data = tokenMetadata.slice(prefixLength);
        
        if (base64Data.includes("data:application/json;base64,")) {
          const base64Start = base64Data.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = base64Data.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded token metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Look for image URL
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nToken image URL found:");
                console.log(imageUrl);
                
                // Check if it's SVG
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded Token SVG:");
                  console.log(svgString);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
            console.log("Raw base64 content:", base64Metadata);
          }
        } else {
          console.log("No base64 JSON data found in token metadata");
          console.log("Raw token metadata:", base64Data);
        }
      } else {
        console.log("❌ Incorrect token metadata format or no token metadata found. Raw data:");
        console.log(tokenMetadata);
      }
    } catch (error: any) {
      console.log(`Error getting token metadata: ${error.message}`);
    }
    
    console.log("\n=== QUERY COMPLETE ===");
    
  } catch (error: any) {
    console.error("Error querying contract:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 

/**
 * Script to query the deployed LSP8Loogies contract
 * This examines the metadata and SVG generation issues without modifying the contract
 */
async function main() {
  console.log("\n=== QUERYING DEPLOYED LOOGIES CONTRACT ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract address from deployment
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Define minimal ABI for querying
    const minimalABI = [
      "function getData(bytes32 dataKey) external view returns (bytes)",
      "function tokenOwnerOf(bytes32 tokenId) external view returns (address)",
      "function totalSupply() external view returns (uint256)",
      "function color(bytes32 tokenId) external view returns (bytes3)",
      "function chubbiness(bytes32 tokenId) external view returns (uint256)",
      "function mouthLength(bytes32 tokenId) external view returns (uint256)",
      "function loogieTypes(bytes32 tokenId) external view returns (string)",
      "function upUsernames(bytes32 tokenId) external view returns (string)"
    ];
    
    const contract = new ethers.Contract(contractAddress, minimalABI, signer);
    
    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    // Check token ID 1
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`\nChecking token ID: ${tokenId}`);
    
    try {
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`Token owner: ${owner}`);
    } catch (error: any) {
      console.log(`Error getting token owner: ${error.message}`);
    }
    
    try {
      const colorBytes = await contract.color(tokenId);
      console.log(`Token color: ${colorBytes} (hex: #${colorBytes.substring(2)})`);
      
      const chubbiness = await contract.chubbiness(tokenId);
      console.log(`Token chubbiness: ${chubbiness}`);
      
      const mouthLength = await contract.mouthLength(tokenId);
      console.log(`Token mouth length: ${mouthLength}`);
      
      const loogieType = await contract.loogieTypes(tokenId);
      console.log(`Token type: ${loogieType}`);
      
      const username = await contract.upUsernames(tokenId);
      console.log(`Token username: ${username}`);
    } catch (error: any) {
      console.log(`Error getting token properties: ${error.message}`);
    }
    
    // Check LSP4 metadata
    console.log("\n=== CHECKING LSP4 METADATA ===");
    
    // LSP4 Metadata key
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    
    try {
      // Get collection metadata
      console.log("Fetching collection metadata...");
      const collectionMetadata = await contract.getData(LSP4_METADATA_KEY);
      console.log(`Collection metadata retrieved (${collectionMetadata.length} bytes)`);
      
      if (collectionMetadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected");
        
        // Extract the base64 encoded JSON part
        // The format is: 0x00006f357c6a0020 + keccak256(metadata) + base64EncodedMetadata
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const base64Data = collectionMetadata.slice(prefixLength);
        
        // Check if data starts with "data:application/json;base64,"
        if (base64Data.includes("data:application/json;base64,")) {
          const base64Start = base64Data.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = base64Data.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Look for image URL
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nImage URL found:");
                console.log(imageUrl);
                
                // Check if it's SVG
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded SVG:");
                  console.log(svgString);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
            console.log("Raw base64 content:", base64Metadata);
          }
        } else {
          console.log("No base64 JSON data found");
          console.log("Raw metadata:", base64Data);
        }
      } else {
        console.log("❌ Incorrect metadata format. Raw data:");
        console.log(collectionMetadata);
      }
    } catch (error: any) {
      console.log(`Error getting collection metadata: ${error.message}`);
    }
    
    // Try to get metadata for a specific token
    console.log("\n=== CHECKING TOKEN METADATA ===");
    
    // LSP8 token data key for LSP4 metadata
    const tokenDataKey = ethers.keccak256(
      ethers.concat([
        ethers.hexlify(ethers.toUtf8Bytes("LSP8MetadataToken")),
        ethers.zeroPadValue(tokenId, 32),
        LSP4_METADATA_KEY
      ])
    );
    
    try {
      const tokenMetadata = await contract.getData(tokenDataKey);
      console.log(`Token metadata retrieved (${tokenMetadata.length} bytes)`);
      
      if (tokenMetadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected for token");
        
        // Extract the base64 encoded JSON part
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const base64Data = tokenMetadata.slice(prefixLength);
        
        if (base64Data.includes("data:application/json;base64,")) {
          const base64Start = base64Data.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = base64Data.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded token metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Look for image URL
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nToken image URL found:");
                console.log(imageUrl);
                
                // Check if it's SVG
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded Token SVG:");
                  console.log(svgString);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
            console.log("Raw base64 content:", base64Metadata);
          }
        } else {
          console.log("No base64 JSON data found in token metadata");
          console.log("Raw token metadata:", base64Data);
        }
      } else {
        console.log("❌ Incorrect token metadata format or no token metadata found. Raw data:");
        console.log(tokenMetadata);
      }
    } catch (error: any) {
      console.log(`Error getting token metadata: ${error.message}`);
    }
    
    console.log("\n=== QUERY COMPLETE ===");
    
  } catch (error: any) {
    console.error("Error querying contract:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 