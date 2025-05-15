import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LSP8LoogiesEnhanced...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from account: ${deployer.address}`);
  
  // Deploy contract with owner parameter
  const LSP8LoogiesEnhanced = await ethers.getContractFactory("LSP8LoogiesEnhanced");
  const lsp8LoogiesEnhanced = await LSP8LoogiesEnhanced.deploy(deployer.address);
  
  // Wait for deployment to complete
  await lsp8LoogiesEnhanced.waitForDeployment();
  
  const contractAddress = await lsp8LoogiesEnhanced.getAddress();
  console.log(`LSP8LoogiesEnhanced deployed at: ${contractAddress}`);
  
  // Enable minting
  console.log("Enabling minting...");
  const tx = await lsp8LoogiesEnhanced.setMintStatus(true);
  await tx.wait();
  console.log("Minting enabled successfully");
  
  console.log("");
  console.log(`
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
    ✨                                          ✨
    ✨  LSP8LoogiesEnhanced deployed and ready  ✨
    ✨                                          ✨
    ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
  `);
  console.log(`
    🔶 Contract: ${contractAddress}
    🔶 Name: LuksoLoogies
    🔶 Symbol: LUKLOOG
    🔶 Max Supply: 3728
    🔶 Mint Price: 0.1 LYX
  `);
  console.log("Verify contract on Universal Explorer:");
  console.log(`https://explorer.execution.testnet.lukso.network/address/${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
 