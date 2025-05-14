import { ethers } from "hardhat";

/**
 * Script to check the metadata returned by the LSP8LoogiesUpdated contract
 * This will help diagnose why the SVG isn't displaying properly
 */
async function main() {
  console.log("\n=== CHECKING TOKEN METADATA ON LSP8LOOGIESUPDATED ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract address from deployment
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Define ABI for getData and _getDataForTokenId
    const lsp8LoogiesABI = [
      "function getData(bytes32 dataKey) public view returns (bytes)",
      "function tokenOwnerOf(bytes32 tokenId) public view returns (address)",
      "function totalSupply() public view returns (uint256)",
      "function generateSVGofTokenById(bytes32 tokenId) public view returns (string)",
      "function color(bytes32 tokenId) public view returns (bytes3)",
      "function chubbiness(bytes32 tokenId) public view returns (uint256)",
      "function mouthLength(bytes32 tokenId) public view returns (uint256)",
      "function upUsernames(bytes32 tokenId) public view returns (string)"
    ];
    
    const contract = new ethers.Contract(contractAddress, lsp8LoogiesABI, signer);
    
    // Get total supply to determine token ID
    const totalSupply = await contract.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    // Create token ID for the most recently minted token (ID 2)
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000002";
    console.log(`Checking token ID: ${tokenId}`);
    
    // Check if we can get the token owner
    try {
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`Token owner: ${owner}`);
    } catch (error) {
      console.log(`Error getting token owner: ${error.message}`);
    }
    
    // Try to get token properties
    try {
      const color = await contract.color(tokenId);
      console.log(`Token color: ${color}`);
      
      const chubbiness = await contract.chubbiness(tokenId);
      console.log(`Token chubbiness: ${chubbiness}`);
      
      const mouthLength = await contract.mouthLength(tokenId);
      console.log(`Token mouth length: ${mouthLength}`);
      
      const username = await contract.upUsernames(tokenId);
      console.log(`Token username: ${username}`);
      
    } catch (error) {
      console.log(`Error getting token properties: ${error.message}`);
    }
    
    // Try to get LSP4 metadata directly from contract
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    
    try {
      // Get collection metadata
      const collectionMetadata = await contract.getData(LSP4_METADATA_KEY);
      console.log(`\nCollection metadata found: ${collectionMetadata.length > 0 ? "YES" : "NO"}`);
      console.log(`Collection metadata: ${collectionMetadata.substring(0, 100)}...`);
      
      // Get token metadata (need to call ERC725Y directly since this is internal)
      console.log(`\nToken URI would be: https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenId}?network=testnet`);
      
    } catch (error) {
      console.log(`Error getting metadata: ${error.message}`);
    }
    
    // Check if the generateSVGofTokenById function is accessible
    try {
      // Note: This may fail as this function might be internal
      const svg = await contract.generateSVGofTokenById(tokenId);
      console.log(`\nSVG generated: ${svg.substring(0, 100)}...`);
    } catch (error) {
      console.log(`Error generating SVG (expected if function is internal): ${error.message}`);
    }
    
  } catch (error) {
    console.error("Error checking token metadata:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 