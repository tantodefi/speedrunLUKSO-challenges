import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesUpdated contract using a two-step approach:
 * 1. First deploys the OnChainMetadata contract
 * 2. Then deploys the LSP8LoogiesUpdated contract that inherits from it
 * 
 * This approach helps manage contract size by splitting functionality.
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesSimplified: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying LSP8LoogiesUpdated with Simplified Approach...");
  console.log("  Network:", network.name);
  console.log("  Deployer:", deployer);
  console.log("  Note: Using maximum optimization (runs=1) to reduce contract size");
  
  try {
    // Step 1: Deploy OnChainMetadata contract first
    console.log("\n Step 1: Deploying OnChainMetadata contract...");
    const onChainMetadata = await deploy("OnChainMetadata", {
      from: deployer,
      args: [], // No constructor arguments
      log: true,
      autoMine: true,
      waitConfirmations: network.name === "hardhat" ? 1 : 5,
    });
    
    console.log("✅ OnChainMetadata deployed at:", onChainMetadata.address);
    
    // Step 2: Deploy the LSP8LoogiesUpdated contract
    console.log("\n Step 2: Deploying LSP8LoogiesUpdated contract...");
    const lsp8LoogiesUpdated = await deploy("LSP8LoogiesUpdated", {
      from: deployer,
      args: [deployer], // Pass the deployer as the contract owner
      log: true,
      autoMine: true,
      waitConfirmations: network.name === "hardhat" ? 1 : 5,
      gasLimit: 8000000, // Higher gas limit to accommodate the large contract
    });

    console.log("✅ LSP8LoogiesUpdated deployed at:", lsp8LoogiesUpdated.address);

    // If we're on a real network (not localhost/hardhat), verify the contracts on the explorer
    if (network.name !== "hardhat" && network.name !== "localhost") {
      try {
        console.log("\n📝 Verifying OnChainMetadata contract...");
        await hre.run("verify:verify", {
          address: onChainMetadata.address,
          constructorArguments: [],
          contract: "contracts/OnChainMetadata.sol:OnChainMetadata",
        });
        
        console.log("\n📝 Verifying LSP8LoogiesUpdated contract...");
        await hre.run("verify:verify", {
          address: lsp8LoogiesUpdated.address,
          constructorArguments: [deployer],
          contract: "contracts/LSP8LoogiesUpdated.sol:LSP8LoogiesUpdated",
        });
        
        console.log("✅ Contracts verified successfully");
      } catch (error) {
        console.log("❌ Error verifying contracts:", error);
      }
    }

    // Display next steps and validation info
    console.log("\n✅ Deployment complete!");
    console.log(`
🧪 To verify contract is working correctly:
- Mint a test token: npx hardhat run scripts/mintTestToken.ts --network ${network.name}
- Verify standard compliance: npx hardhat run scripts/verifyLSP8Compliance.ts --network ${network.name}

🔍 Check your contract on the Universal Explorer:
https://universaleverything.io/collection/${lsp8LoogiesUpdated.address}?network=${network.name === "luksoTestnet" ? "testnet" : "mainnet"}
    `);
    
  } catch (error) {
    console.error("\n❌ Contract deployment failed:", error);
    console.log("Error details:", error);
  }
};

export default deployLSP8LoogiesSimplified;
deployLSP8LoogiesSimplified.tags = ["LSP8LoogiesSimplified"]; 