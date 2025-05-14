import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesUpdated contract with self-contained SVG generation
 * 
 * This contract now includes all SVG generation functionality directly without relying on OnChainMetadata
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesAll: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying LSP8LoogiesUpdated with Self-Contained SVG Generation...");
  console.log("  Network:", network.name);
  console.log("  Deployer:", deployer);
  console.log("  Note: Using maximum optimization (runs=1) to reduce contract size");
  
  try {
    // Deploy the LSP8LoogiesUpdated contract
    console.log("\nDeploying LSP8LoogiesUpdated contract...");
    const lsp8LoogiesUpdated = await deploy("LSP8LoogiesUpdated", {
      from: deployer,
      args: [deployer], // Pass the deployer as the contract owner
      log: true,
      autoMine: true,
      waitConfirmations: network.name === "hardhat" ? 1 : 5,
      gasLimit: 8000000, // Higher gas limit to accommodate the large contract
    });
    
    console.log("✅ LSP8LoogiesUpdated deployed at:", lsp8LoogiesUpdated.address);
    
    // If we're on a real network (not localhost/hardhat), verify the contract on the explorer
    if (network.name !== "hardhat" && network.name !== "localhost") {
      try {
        console.log("\n📝 Verifying contract on block explorer...");
        await hre.run("verify:verify", {
          address: lsp8LoogiesUpdated.address,
          constructorArguments: [deployer],
          contract: "contracts/LSP8LoogiesUpdated.sol:LSP8LoogiesUpdated",
        });
        console.log("✅ Contract verified successfully");
      } catch (error) {
        console.log("❌ Error verifying contract:", error);
      }
    }
    
    // Display next steps and validation info
    console.log("\n✅ Deployment complete!");
    console.log(`
🧪 To verify contract is working correctly:
- Mint a test token: npx hardhat run scripts/mintLoogiesToken.ts --network ${network.name}

🔍 Check your contract on the Universal Explorer:
https://universaleverything.io/collection/${lsp8LoogiesUpdated.address}?network=${network.name === "luksoTestnet" ? "testnet" : "mainnet"}
    `);
    
  } catch (error: any) {
    console.error("\n❌ Contract deployment failed:", error.message);
    console.log("Full error:", error);
  }
};

export default deployLSP8LoogiesAll;
deployLSP8LoogiesAll.tags = ["LSP8LoogiesAll"]; 