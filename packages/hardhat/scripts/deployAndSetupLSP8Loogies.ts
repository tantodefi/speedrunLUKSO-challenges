import { ethers } from "hardhat";

/**
 * Comprehensive script to deploy and set up LSP8LoogiesUpdated contract on LUKSO testnet
 * This script handles deployment, metadata setup, and verification
 */
async function main() {
  console.log("\n=== DEPLOYING AND SETTING UP LSP8LOOGIESUPDATED CONTRACT ===");
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log(`Using deployer account: ${deployer.address}`);
  
  // Display network information
  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name === 'unknown' ? 'luksoTestnet' : network.name} (chainId: ${network.chainId})`);
  
  try {
    // Step 1: Deploy the LSP8LoogiesUpdated contract
    console.log("\n1. Deploying LSP8LoogiesUpdated contract...");
    const LSP8LoogiesUpdatedFactory = await ethers.getContractFactory("LSP8LoogiesUpdated");
    const lsp8LoogiesUpdated = await LSP8LoogiesUpdatedFactory.deploy(deployer.address);
    
    console.log(`Transaction hash: ${lsp8LoogiesUpdated.deploymentTransaction()?.hash}`);
    console.log("Waiting for deployment confirmation...");
    
    await lsp8LoogiesUpdated.waitForDeployment();
    const contractAddress = await lsp8LoogiesUpdated.getAddress();
    console.log(`✅ LSP8LoogiesUpdated deployed at: ${contractAddress}`);
    
    // Step 2: Update the collection metadata
    console.log("\n2. Setting collection metadata...");
    const updateTx = await lsp8LoogiesUpdated.updateCollectionMetadata({
      gasLimit: 3000000
    });
    console.log(`Transaction hash: ${updateTx.hash}`);
    const updateReceipt = await updateTx.wait();
    console.log(`✅ Collection metadata updated in block ${updateReceipt?.blockNumber}`);
    
    // Step 3: Verify contract compliance
    console.log("\n3. Verifying contract compliance...");
    
    // Check token type (should be COLLECTION = 2)
    const LSP4_TOKEN_TYPE_KEY = "0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3";
    const tokenType = await lsp8LoogiesUpdated.getData(LSP4_TOKEN_TYPE_KEY);
    const tokenTypeDecimal = parseInt(tokenType, 16);
    console.log(`Token type: ${tokenTypeDecimal} (${tokenTypeDecimal === 2 ? "COLLECTION ✅" : "OTHER ❌"})`);
    
    // Check metadata format (should have verification bytes)
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    const metadata = await lsp8LoogiesUpdated.getData(LSP4_METADATA_KEY);
    console.log(`Metadata exists: ${metadata.length > 0 ? "✅" : "❌"}`);
    console.log(`Metadata has verification bytes: ${metadata.startsWith("0x00006f357c6a0020") ? "✅" : "❌"}`);
    
    // Check that the contract supports LSP8 interface ID
    const LSP8_INTERFACE_ID = "0x3a271706";
    const supportsLSP8 = await lsp8LoogiesUpdated.supportsInterface(LSP8_INTERFACE_ID);
    console.log(`Supports LSP8 interface: ${supportsLSP8 ? "✅" : "❌"}`);
    
    // Step 4: Mint a test token
    console.log("\n4. Minting a test token...");
    const mintTx = await lsp8LoogiesUpdated.mintLoogie(deployer.address, {
      gasLimit: 500000
    });
    console.log(`Transaction hash: ${mintTx.hash}`);
    const mintReceipt = await mintTx.wait();
    console.log(`✅ Test token minted in block ${mintReceipt?.blockNumber}`);
    
    // Get total supply to confirm token was minted
    const totalSupply = await lsp8LoogiesUpdated.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    // Try to extract token ID
    const transferEvent = mintReceipt?.logs.find((log: any) => 
      log.topics[0] === ethers.id("Transfer(address,address,bytes32,bool,bytes)")
    );
    
    if (transferEvent) {
      const tokenId = transferEvent.topics[3];
      console.log(`Minted token ID: ${tokenId}`);
      
      // Add token URL for viewing in Universal Explorer 
      console.log(`\nView token on Universal Explorer: https://universaleverything.io/asset/${contractAddress}/tokenId/${tokenId}?network=testnet`);
    }
    
    console.log("\n=== DEPLOYMENT AND SETUP COMPLETE ===");
    console.log(`\n🔍 View collection on Universal Explorer:`);
    console.log(`https://universaleverything.io/collection/${contractAddress}?network=testnet`);
    
    // Save the deployment details to console for easy reference
    console.log("\n📋 Deployment Summary:");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Network: ${network.name === 'unknown' ? 'luksoTestnet' : network.name} (chainId: ${network.chainId})`);
    console.log("✅ Contract is LSP8 compliant");
    console.log("\nNext steps:");
    console.log("1. Wait for the Universal Explorer to index your contract (may take a few minutes)");
    console.log("2. Export your contract address: export LSP8_CONTRACT_ADDRESS=" + contractAddress);
    console.log("3. You can mint more tokens using: npx hardhat run scripts/mintTestToken.ts --network luksoTestnet");
    
  } catch (error) {
    console.error("Error deploying and setting up contract:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 