import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LSP8LoogiesBasic...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Deploy contract
  const LSP8LoogiesBasic = await ethers.getContractFactory("LSP8LoogiesBasic");
  const lsp8LoogiesBasic = await LSP8LoogiesBasic.deploy("Loogies Basic", "LOOGB");
  
  // Wait for deployment to complete
  await lsp8LoogiesBasic.waitForDeployment();
  
  const contractAddress = await lsp8LoogiesBasic.getAddress();
  console.log(`LSP8LoogiesBasic deployed at: ${contractAddress}`);
  
  // Additional setup can be done here if needed
  console.log("Deployment complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
 