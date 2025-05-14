import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesSimplified contract
 * 
 * This version uses static SVGs without animations for better compatibility
 * with the LUKSO Universal Explorer
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesSimplified: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying LSP8LoogiesSimplified contract...");
  console.log("  Network:", network.name);
  console.log("  Deployer:", deployer);
  console.log("  Note: This contract uses static SVGs for better explorer compatibility");

  try {
    // Deploy the LSP8LoogiesSimplified contract
    const lsp8LoogiesSimplified = await deploy("LSP8LoogiesSimplified", {
      from: deployer,
      args: [deployer], // Pass the deployer as the contract owner
      log: true,
      autoMine: true,
      waitConfirmations: network.name === "hardhat" ? 1 : 5,
      gasLimit: 8000000, // Higher gas limit to accommodate the large contract
    });

    console.log("✅ LSP8LoogiesSimplified deployed at:", lsp8LoogiesSimplified.address);

    // If we're on a real network (not localhost/hardhat), verify the contract on the explorer
    if (network.name !== "hardhat" && network.name !== "localhost") {
      try {
        console.log("\n📝 Verifying contract on block explorer...");
        await hre.run("verify:verify", {
          address: lsp8LoogiesSimplified.address,
          constructorArguments: [deployer],
          contract: "contracts/LSP8LoogiesSimplified.sol:LSP8LoogiesSimplified",
        });
        console.log("✅ Contract verified successfully");
      } catch (error) {
        console.log("❌ Error verifying contract:", error);
        console.log("  Note: LUKSO may not be supported by the verification plugin yet");
      }
    }

    // Display next steps and validation info
    console.log("\n✅ Deployment complete!");
    console.log(`
🧪 To verify contract is working correctly:
- Mint a test token: npx hardhat run scripts/mintSimplifiedTestToken.ts --network ${network.name}
- Check the collection size: npx hardhat run scripts/verifyCollectionSize.ts --network ${network.name}

🔍 Check your contract on the Universal Explorer:
https://universalexplorer.io/collections/${lsp8LoogiesSimplified.address}?network=${network.name === "luksoTestnet" ? "testnet" : "mainnet"}
    `);

    // Create a simple script to mint a test token
    console.log("Creating mintSimplifiedTestToken.ts script...");
    const fs = require("fs");
    const scriptPath = "./scripts/mintSimplifiedTestToken.ts";
    const scriptContent = `
import { ethers } from "hardhat";

/**
 * Script to mint a test token on the LSP8LoogiesSimplified contract
 * with static SVGs for better compatibility
 */
async function main() {
  console.log("\\n=== MINTING TEST TOKEN ON LSP8LOOGIESSIMPLIFIED ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(\`Using account: \${signer.address}\`);
  
  // Use the contract address from deployment
  const contractAddress = "${lsp8LoogiesSimplified.address}";
  console.log(\`Target contract: \${contractAddress}\`);
  
  // Get contract instance
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesSimplified", contractAddress);
  
  try {
    // Verify we have the right contract by checking the name
    const name = await LSP8Loogies.name();
    console.log(\`Contract name: \${name}\`);
    
    // Get current token count
    const beforeSupply = await LSP8Loogies.totalSupply();
    console.log(\`Current total supply: \${beforeSupply.toString()}\`);
    
    // Mint a new token
    console.log("Minting a new token using mintLoogie function...");
    const tx = await LSP8Loogies.mintLoogie(signer.address);
    console.log(\`Transaction hash: \${tx.hash}\`);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    if (receipt) {
      console.log(\`Transaction confirmed in block: \${receipt.blockNumber}\`);
    } else {
      console.log("Transaction receipt is null, but transaction was submitted");
    }
    
    // Get updated total supply to confirm token was minted
    const afterSupply = await LSP8Loogies.totalSupply();
    console.log(\`New total supply: \${afterSupply.toString()}\`);
    
    // Calculate the token ID (assuming sequential minting)
    const tokenId = afterSupply.toString();
    console.log(\`New token ID should be: \${tokenId} (in bytes32 format on chain)\`);
    
    console.log("\\n✅ Token minted successfully!");
    console.log(\`Check your token on the Universal Explorer:\`);
    console.log(\`https://universalexplorer.io/collections/\${contractAddress}/\${tokenId}?network=testnet\`);
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
    `;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`Script created at ${scriptPath}`);
    
  } catch (error) {
    console.error("\n❌ Contract deployment failed:", error);
  }
};

export default deployLSP8LoogiesSimplified;
deployLSP8LoogiesSimplified.tags = ["LSP8LoogiesSimplified"]; 