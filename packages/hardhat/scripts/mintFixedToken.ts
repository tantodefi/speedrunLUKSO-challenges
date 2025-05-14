import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to mint a test token on the LSP8LoogiesFixed contract
 * This will allow us to verify that the SVG and attributes display correctly
 */
async function main() {
  console.log("\n=== MINTING TEST TOKEN ON LSP8LOOGIESFIXED ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Try to find contract address
  let contractAddress: string;
  try {
    // Try to read deployment file
    const deploymentPath = path.join(__dirname, '../deployments/luksoTestnet/LSP8LoogiesFixed.json');
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      contractAddress = deployment.address;
      console.log(`Found deployment at: ${contractAddress}`);
    } else {
      throw new Error("Deployment file not found");
    }
  } catch (error) {
    console.error("Contract not deployed yet. Please deploy the contract first using:");
    console.error("npx hardhat deploy --tags LSP8LoogiesFixed --network luksoTestnet");
    process.exit(1);
  }
  
  console.log(`Target contract: ${contractAddress}`);
  
  try {
    // Get contract instance
    const LSP8LoogiesFixed = await ethers.getContractAt("LSP8LoogiesFixed", contractAddress);
    
    // Verify we have the right contract by checking the name
    const name = await LSP8LoogiesFixed.name();
    console.log(`Contract name: ${name}`);
    
    // Get total supply before minting
    const totalSupplyBefore = await LSP8LoogiesFixed.totalSupply();
    console.log(`Total supply before: ${totalSupplyBefore.toString()}`);
    
    // Mint the token
    console.log("\nMinting token...");
    const tx = await LSP8LoogiesFixed.mintLoogie(signer.address);
    console.log(`Transaction hash: ${tx.hash}`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    if (receipt) {
      console.log(`Token minted in block: ${receipt.blockNumber}`);
    } else {
      console.log("Transaction submitted but no receipt available");
    }
    
    // Get total supply after minting
    const totalSupplyAfter = await LSP8LoogiesFixed.totalSupply();
    console.log(`Total supply after: ${totalSupplyAfter.toString()}`);
    
    // The token ID should be the total supply (as a bytes32)
    const tokenId = ethers.zeroPadValue(ethers.toBeHex(totalSupplyAfter), 32);
    console.log(`New token ID: ${tokenId}`);
    
    // Verify the token owner
    const tokenOwner = await LSP8LoogiesFixed.tokenOwnerOf(tokenId);
    console.log(`Token owner: ${tokenOwner}`);
    
    // Update the username to trigger a metadata refresh
    console.log("\nSetting custom username...");
    const setUsernameTx = await LSP8LoogiesFixed.setUPUsername(tokenId, "fixed_test");
    console.log(`Transaction hash: ${setUsernameTx.hash}`);
    
    const setUsernameReceipt = await setUsernameTx.wait();
    if (setUsernameReceipt) {
      console.log(`Username set in block: ${setUsernameReceipt.blockNumber}`);
    } else {
      console.log("Username transaction submitted but no receipt available");
    }
    
    // Get token attributes
    console.log("\nToken attributes:");
    const color = await LSP8LoogiesFixed.color(tokenId);
    console.log(`- Color: ${color}`);
    const chubbiness = await LSP8LoogiesFixed.chubbiness(tokenId);
    console.log(`- Chubbiness: ${chubbiness}`);
    const mouthLength = await LSP8LoogiesFixed.mouthLength(tokenId);
    console.log(`- Mouth length: ${mouthLength}`);
    const username = await LSP8LoogiesFixed.upUsernames(tokenId);
    console.log(`- Username: ${username}`);
    
    console.log("\n✅ Test token minted successfully!");
    console.log(`Check your token in Universal Explorer:`);
    console.log(`https://universalexplorer.io/collections/${contractAddress}/${totalSupplyAfter}?network=testnet`);
    
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 