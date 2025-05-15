import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  console.log("Setting verified creator for LSP8LoogiesBasic...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // Check if the caller is the owner/controller
  const owner = await lsp8LoogiesBasic.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("You are not the owner of this contract. Only the owner can set the verified creator.");
    process.exitCode = 1;
    return;
  }
  
  // LSP4 Creators key
  const LSP4_CREATORS_KEY = "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7";
  
  // LSP0 interface ID for ERC725Account (required for creator verification)
  const LSP0_INTERFACE_ID = "0x3a271e58";
  
  console.log("Setting creator information...");
  
  try {
    // Format for creator: [address + interfaceId]
    // LSP4 Creators uses format: address(bytes20) + interfaceId(bytes4)
    const creatorValue = ethers.concat([
      deployer.address,                 // Address of creator (current deployer/owner)
      ethers.toBeHex(LSP0_INTERFACE_ID, 4)  // LSP0 interface ID
    ]);
    
    const tx = await lsp8LoogiesBasic.setData(LSP4_CREATORS_KEY, creatorValue);
    await tx.wait();
    
    console.log(`✅ Creator information set successfully! Transaction hash: ${tx.hash}`);
    console.log(`Verified creator set to: ${deployer.address}`);
  } catch (error) {
    console.error("Error setting verified creator:", error);
    process.exitCode = 1;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 