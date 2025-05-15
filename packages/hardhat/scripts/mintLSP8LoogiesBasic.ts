import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826"; // Replace with your deployed contract address
  
  console.log("Minting a Loogie Basic NFT...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Minting from account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // Mint an NFT - use the contract's mintItem function
  console.log("Minting...");
  const mintTx = await lsp8LoogiesBasic.mintItem({ value: ethers.parseEther("0.001") });
  
  const receipt = await mintTx.wait();
  
  // Check if receipt exists
  if (!receipt) {
    console.log("Failed to get transaction receipt");
    return;
  }
  
  console.log(`Transaction hash: ${mintTx.hash}`);
  
  // Try to find tokenId from events
  let tokenId: string | undefined;
  
  // Log transaction receipt to inspect events
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
    } else {
      console.log("Could not find Transfer event with tokenId");
    }
  } catch (error) {
    console.log("Error parsing events:", (error as Error).message);
  }
  
  if (tokenId) {
    try {
      // The LSP4 Metadata key in the contract
      const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
      
      // Try to get token data using the key
      const tokenData = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
      console.log("LSP4 Metadata:", tokenData);
    } catch (error) {
      console.log("Could not get token data:", (error as Error).message);
    }
  }
  
  console.log("Minting complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826"; // Replace with your deployed contract address
  
  console.log("Minting a Loogie Basic NFT...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Minting from account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // Mint an NFT - use the contract's mintItem function
  console.log("Minting...");
  const mintTx = await lsp8LoogiesBasic.mintItem({ value: ethers.parseEther("0.001") });
  
  const receipt = await mintTx.wait();
  
  // Check if receipt exists
  if (!receipt) {
    console.log("Failed to get transaction receipt");
    return;
  }
  
  console.log(`Transaction hash: ${mintTx.hash}`);
  
  // Try to find tokenId from events
  let tokenId: string | undefined;
  
  // Log transaction receipt to inspect events
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
    } else {
      console.log("Could not find Transfer event with tokenId");
    }
  } catch (error) {
    console.log("Error parsing events:", (error as Error).message);
  }
  
  if (tokenId) {
    try {
      // The LSP4 Metadata key in the contract
      const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
      
      // Try to get token data using the key
      const tokenData = await lsp8LoogiesBasic.getData(LSP4_METADATA_KEY);
      console.log("LSP4 Metadata:", tokenData);
    } catch (error) {
      console.log("Could not get token data:", (error as Error).message);
    }
  }
  
  console.log("Minting complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
 