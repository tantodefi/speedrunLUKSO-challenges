import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesUpdated contract
 * 
 * This contract combines both LSP8IdentifiableDigitalAsset and OnChainMetadata 
 * in a single contract for better metadata handling
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesUpdated: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying LSP8LoogiesUpdated contract...");
  console.log("  Network:", network.name);
  console.log("  Deployer:", deployer);
  console.log("  Note: Using maximum optimization (runs=1) to reduce contract size");

  try {
    // Deploy the LSP8LoogiesUpdated contract
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
- Mint a test token: npx hardhat run scripts/mintTestToken.ts --network ${network.name}
- Update metadata: npx hardhat run scripts/updateLSP8MetadataNew.ts --network ${network.name}
- Verify standard compliance: npx hardhat run scripts/verifyLSP8Compliance.ts --network ${network.name}

🔍 Check your contract on the Universal Explorer:
https://universaleverything.io/collection/${lsp8LoogiesUpdated.address}?network=${network.name === "luksoTestnet" ? "testnet" : "mainnet"}
    `);
  } catch (error) {
    console.error("\n❌ Contract deployment failed:", error);
    console.log(`
If you're encountering a "max code size exceeded" error, you need to simplify the contract:

1. Remove less essential functions (e.g., batch operations, extra helper methods)
2. Split into multiple contracts (move more functionality to OnChainMetadata)
3. Try deploying using the alternative script: 'yarn deploy --tags LSP8LoogiesSimplified'

To deploy a simplified version:
1. Edit contracts/LSP8LoogiesUpdated.sol to remove or simplify functions
2. Keep only core functionality required for proper metadata display
3. Try again with 'yarn deploy' or use the pre-configured minimal version if available
`);
  }
};

export default deployLSP8LoogiesUpdated;
deployLSP8LoogiesUpdated.tags = ["LSP8LoogiesUpdated"]; 