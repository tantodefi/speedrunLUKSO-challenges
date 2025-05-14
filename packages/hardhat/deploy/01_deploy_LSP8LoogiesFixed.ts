import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesFixed contract
 * 
 * This contract has a simplified SVG format and properly formatted token attributes
 * to fix the issues with displaying SVG animations and attributes in Universal Explorer
 * 
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesFixed: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying LSP8LoogiesFixed contract...");
  console.log("  Network:", network.name);
  console.log("  Deployer:", deployer);
  console.log("  Note: This version focuses on SVG compatibility and proper token attributes");

  try {
    // Deploy the LSP8LoogiesFixed contract
    const lsp8LoogiesFixed = await deploy("LSP8LoogiesFixed", {
      from: deployer,
      args: [deployer], // Pass the deployer as the contract owner
      log: true,
      autoMine: true,
      waitConfirmations: network.name === "hardhat" ? 1 : 5,
      gasLimit: 8000000, // Higher gas limit to accommodate the large contract
    });

    console.log("✅ LSP8LoogiesFixed deployed at:", lsp8LoogiesFixed.address);

    // Display next steps and validation info
    console.log("\n✅ Deployment complete!");
    console.log(`
🧪 To verify contract is working correctly:
- Mint a test token: npx hardhat run scripts/mintTestToken.ts --network ${network.name}
- Check token metadata: npx hardhat run scripts/verifyContractChanges.ts --network ${network.name}

🔍 Check your contract on the Universal Explorer:
https://universalexplorer.io/collections/${lsp8LoogiesFixed.address}?network=${network.name === "luksoTestnet" ? "testnet" : "mainnet"}
    `);
  } catch (error) {
    console.error("\n❌ Contract deployment failed:", error);
  }
};

export default deployLSP8LoogiesFixed;
deployLSP8LoogiesFixed.tags = ["LSP8LoogiesFixed"]; 