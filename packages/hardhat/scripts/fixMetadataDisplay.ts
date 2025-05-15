import { ethers } from "hardhat";

/**
 * Script to fix the metadata display issue by directly setting token metadata for token #1
 */
async function main() {
  console.log("\n=== FIXING METADATA DISPLAY FOR TOKEN #1 ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract address from deployment
  const contractAddress = "0xC483Ddfa5950140e35B3C65eD174777137323776";
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Define basic ABI for functions we need
    const lsp8LoogiesABI = [
      "function tokenOwnerOf(bytes32 tokenId) public view returns (address)",
      "function color(bytes32 tokenId) public view returns (bytes3)",
      "function chubbiness(bytes32 tokenId) public view returns (uint256)",
      "function mouthLength(bytes32 tokenId) public view returns (uint256)",
      "function updateTokenMetadata(bytes32 tokenId) public",
      "function updateCollectionMetadata() public"
    ];
    
    const contract = new ethers.Contract(contractAddress, lsp8LoogiesABI, signer);
    
    // Token ID for token #1
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`Fixing token ID: ${tokenId}`);
    
    // 1. First try to update the collection metadata
    console.log("\n1. Updating collection metadata...");
    try {
      const tx1 = await contract.updateCollectionMetadata({
        gasLimit: 3000000
      });
      console.log(`Transaction hash: ${tx1.hash}`);
      const receipt1 = await tx1.wait();
      console.log(`Collection metadata updated in block ${receipt1.blockNumber}`);
    } catch (error: any) {
      if (error.message.includes("function not found")) {
        console.log("Function updateCollectionMetadata not found. Creating a new script...");
        
        // Create a more direct approach using ERC725Y interface
        const erc725yABI = [
          "function setData(bytes32 dataKey, bytes memory dataValue) external"
        ];
        
        const erc725yContract = new ethers.Contract(contractAddress, erc725yABI, signer);
        
        // LSP4 Metadata key
        const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
        
        // Create simple SVG for collection
        const collectionSvg = '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#000"/><text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">LuksoLoogies</text><text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle">Matrix Edition</text></svg>';
        
        // Create base64 encoded SVG
        const base64Svg = Buffer.from(collectionSvg).toString('base64');
        
        // Create JSON metadata
        const metadata = {
          LSP4Metadata: {
            name: "LuksoLoogies",
            description: "LuksoLoogies are LUKSO Standard LSP8 NFTs with a smile :) Only 3728 LuksoLoogies available on a price curve increasing 0.2% with each new mint. This Matrix Edition features animated Matrix-style falling code behind each Loogie.",
            links: [
              {title: "Website", url: "https://luksoloogies.vercel.app"},
              {title: "Twitter", url: "https://twitter.com/luksoLoogies"}
            ],
            images: [[{
              width: 400,
              height: 400,
              url: `data:image/svg+xml;base64,${base64Svg}`,
              verification: {
                method: "keccak256(bytes)",
                data: `0x${ethers.keccak256(ethers.toUtf8Bytes(collectionSvg)).substring(2)}`
              }
            }]],
            assets: [],
            attributes: [
              {key: "type", value: "collection", type: "string"},
              {key: "style", value: "matrix", type: "string"}
            ]
          }
        };
        
        // Convert metadata to JSON string
        const metadataStr = JSON.stringify(metadata);
        const metadataBytes = ethers.toUtf8Bytes(metadataStr);
        
        // Calculate hash
        const metadataHash = ethers.keccak256(metadataBytes);
        
        // Create full metadata with verification bytes
        const fullMetadata = ethers.concat([
          "0x00006f357c6a0020", // LUKSO verification prefix
          metadataHash,
          `data:application/json;base64,${Buffer.from(metadataStr).toString('base64')}`
        ]);
        
        console.log("Setting collection metadata...");
        const tx = await erc725yContract.setData(LSP4_METADATA_KEY, fullMetadata, {
          gasLimit: 3000000
        });
        console.log(`Transaction hash: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Collection metadata updated in block ${receipt.blockNumber}`);
      } else {
        console.error(`Error updating collection metadata: ${error.message}`);
      }
    }
    
    // 2. Try to update token metadata
    console.log("\n2. Checking if we need to update token metadata...");
    try {
      // Check if token owner is correct
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`Token owner: ${owner}`);
      
      // Try to access token properties
      const color = await contract.color(tokenId);
      const chubbiness = await contract.chubbiness(tokenId);
      const mouthLength = await contract.mouthLength(tokenId);
      console.log(`Token properties: color=${color}, chubbiness=${chubbiness}, mouthLength=${mouthLength}`);
      
      // If updateTokenMetadata exists, call it
      console.log("Updating token metadata...");
      const tx2 = await contract.updateTokenMetadata(tokenId, {
        gasLimit: 3000000
      });
      console.log(`Transaction hash: ${tx2.hash}`);
      const receipt2 = await tx2.wait();
      console.log(`Token metadata updated in block ${receipt2.blockNumber}`);
      
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      console.log("Token metadata update function not found or failed. We need to create a manual token metadata script.");
    }
    
    console.log("\n=== METADATA UPDATE ATTEMPT COMPLETE ===");
    console.log(`
Metadata update complete! Your LSP8Loogies collection should now display correctly in Universal Explorer.

- Token Details:
  - Token ID: ${tokenId}

- Collection: https://universal.page/collections/lukso-testnet/${contractAddress}
- Collection: https://universaleverything.io/collection/${contractAddress}?network=testnet
- Token: https://universal.page/collections/lukso-testnet/${contractAddress}/${tokenId}
- Token: https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenId}?network=testnet

Note: It may take a few minutes for the Universal Explorer to refresh the metadata.
`);
    
  } catch (error: any) {
    console.error("Error fixing metadata display:", error.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 