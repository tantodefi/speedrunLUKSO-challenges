import { ethers } from "hardhat";

/**
 * Script to mint an LSP8 token on the deployed LSP8LoogiesUpdated contract
 */
async function main() {
  console.log("\n=== MINTING TOKEN ON LSP8LOOGIESUPDATED ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Contract address from deployment
  const contractAddress = "0xC483Ddfa5950140e35B3C65eD174777137323776";
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Attach to the deployed contract
    const lsp8LoogiesABI = [
      "function mintLoogie(address to) public returns (bytes32)",
      "function tokenOwnerOf(bytes32 tokenId) public view returns (address)",
      "function totalSupply() public view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, lsp8LoogiesABI, signer);
    
    // Check current total supply
    const totalSupplyBefore = await contract.totalSupply();
    console.log(`Current total supply: ${totalSupplyBefore.toString()}`);
    
    // Mint token
    console.log("Minting token...");
    const tx = await contract.mintLoogie(signer.address, {
      gasLimit: 500000
    });
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`Token minted in block ${receipt.blockNumber}`);
    
    // Check updated total supply
    const totalSupplyAfter = await contract.totalSupply();
    console.log(`Updated total supply: ${totalSupplyAfter.toString()}`);
    
    // Extract token ID from logs (if available)
    const tokenIdHex = "0x" + totalSupplyAfter.toString(16).padStart(64, '0');
    console.log(`Token ID (estimated): ${tokenIdHex}`);
    
    // Provide Universal Explorer link
    console.log(`\nView your token on Universal Explorer:`);
    console.log(`https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenIdHex}?network=testnet`);
    
  } catch (error) {
    console.error("Error minting token:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 