import { ethers } from "hardhat";

/**
 * Script to mint a test token on the LSP8LoogiesUpdated contract
 * This will allow us to verify the token metadata generation works correctly
 */
async function main() {
  console.log("\n=== MINTING TEST TOKEN ON LSP8LOOGIESUPDATED ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment
  // Hard-coding address here for simplicity - replace with your deployed contract address
  const contractAddress = process.env.LSP8_CONTRACT_ADDRESS || "0xYourDeployedContractAddress";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance with any type to avoid TypeScript errors
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  try {
    // Verify we have the right contract by checking the name
    const name = await LSP8Loogies.name();
    console.log(`Contract name: ${name}`);
    
    // Mint a new token
    console.log("Minting a new token using mintLoogie function...");
    const tx = await LSP8Loogies.mintLoogie(signer.address);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    } else {
      console.log("Transaction receipt is null, but transaction was submitted");
    }
    
    // Get total supply to confirm token was minted
    const totalSupply = await LSP8Loogies.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    console.log("\n✅ Token minted successfully!");
    console.log(`Check your contract on the Universal Explorer:`);
    console.log(`https://universaleverything.io/collection/${contractAddress}?network=testnet`);
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