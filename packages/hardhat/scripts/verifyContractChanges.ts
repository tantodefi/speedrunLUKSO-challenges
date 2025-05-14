import { ethers } from "hardhat";

/**
 * Script to verify the changes made to the LSP8LoogiesFixed contract
 * - Collection size metadata
 * - SVG rendering
 * - Token attributes format
 */
async function main() {
  console.log("\n=== VERIFYING LSP8LOOGIESFIXED CHANGES ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment
  const contractAddress = "0xC7a17F95fA09b88242A1a3594c3d7f9f8897E70B";
  console.log(`Target contract: ${contractAddress}`);
  
  // Define ABI for needed functions
  const lsp8LoogiesABI = [
    "function getData(bytes32 dataKey) public view returns (bytes)",
    "function totalSupply() public view returns (uint256)",
    "function tokenOwnerOf(bytes32 tokenId) public view returns (address)",
    "function color(bytes32 tokenId) public view returns (bytes3)",
    "function chubbiness(bytes32 tokenId) public view returns (uint256)",
    "function mouthLength(bytes32 tokenId) public view returns (uint256)",
    "function upUsernames(bytes32 tokenId) public view returns (string)"
  ];
  
  try {
    // Connect to the contract
    const LSP8Loogies = new ethers.Contract(contractAddress, lsp8LoogiesABI, signer);
    
    // VERIFY CHANGE 1: COLLECTION SIZE DISPLAY
    console.log("\n1️⃣ VERIFYING COLLECTION SIZE METADATA:");
    
    // Standard LSP4 metadata key
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    const collectionMetadata = await LSP8Loogies.getData(LSP4_METADATA_KEY);
    console.log(`Collection metadata: ${collectionMetadata.substring(0, 100)}...`);
    
    // LSP4 metadata total supply key 
    const LSP4_METADATA_TOTAL_SUPPLY = "0xa23ea79c706be4641bfd97c9afb5b71a552c5bc320930dbe09b3530ed76dee0f";
    try {
      const totalSupplyMetadata = await LSP8Loogies.getData(LSP4_METADATA_TOTAL_SUPPLY);
      // Convert bytes to uint256
      const totalSupplyValue = ethers.toBigInt(totalSupplyMetadata);
      console.log(`Total supply from metadata: ${totalSupplyValue.toString()}`);
      
      // Check if it matches the expected value
      const expectedTotalSupply = 3728;
      console.log(`Expected total supply: ${expectedTotalSupply}`);
      console.log(`Collection size properly set: ${totalSupplyValue == BigInt(expectedTotalSupply) ? "✓ YES" : "✗ NO"}`);
    } catch (error) {
      console.log("Error reading total supply metadata:", error);
    }
    
    // VERIFY CHANGE 2: SVG RENDERING
    console.log("\n2️⃣ VERIFYING SVG RENDERING:");
    console.log("The SVG rendering can only be visually verified in the Universal Explorer");
    console.log(`Link to collection: https://universaleverything.io/collection/${contractAddress}?network=testnet`);
    
    // Get the first token ID
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`First token ID: ${tokenId}`);
    console.log(`Link to token: https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenId}?network=testnet`);
    
    // VERIFY CHANGE 3: TOKEN ATTRIBUTES FORMAT
    console.log("\n3️⃣ VERIFYING TOKEN ATTRIBUTES FORMAT:");
    
    // Get token details
    try {
      const owner = await LSP8Loogies.tokenOwnerOf(tokenId);
      const colorBytes = await LSP8Loogies.color(tokenId);
      const chubbiness = await LSP8Loogies.chubbiness(tokenId);
      const mouthLength = await LSP8Loogies.mouthLength(tokenId);
      const username = await LSP8Loogies.upUsernames(tokenId);
      
      // Convert bytes3 color to hex string without 0x prefix
      const colorHex = colorBytes.toString().substring(2);
      
      console.log("Token properties:");
      console.log(`- Owner: ${owner}`);
      console.log(`- Color: #${colorHex}`);
      console.log(`- Chubbiness: ${chubbiness}`);
      console.log(`- Mouth Length: ${mouthLength}`);
      console.log(`- Username: ${username}`);
      
      // Get expected token metadata JSON structure from token ID 
      console.log("\nExpected token metadata attributes structure:");
      console.log(`[
  {"key":"color","value":"#${colorHex}","type":"string"},
  {"key":"chubbiness","value":${chubbiness},"type":"number"},
  {"key":"mouthLength","value":${mouthLength},"type":"number"},
  {"key":"username","value":"${username}","type":"string"}
]`);
      
      // Note: The actual metadata JSON can only be viewed through the Universal Explorer
      // or by fetching it via the LUKSO metadata service
      console.log("\nTo verify actual metadata rendering, check the token in Universal Explorer.");
      
    } catch (error) {
      console.log("Error reading token attributes:", error);
    }
    
    console.log("\n✅ VERIFICATION COMPLETE");
    console.log(`
To fully verify all changes, please check the following:

1. Collection Size: Verify the collection size shows as 3728 in Universal Explorer 
   https://universaleverything.io/collection/${contractAddress}?network=testnet

2. SVG Rendering: Check that the Loogie SVG is properly displayed and formatted
   https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenId}?network=testnet

3. Token Attributes: Confirm token shows the correct attributes format (not collection metadata)
   - Look for proper attribute names: color, chubbiness, mouthLength, username
   - Numeric values should appear as numbers, not strings
`);
    
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