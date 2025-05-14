import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesEnhanced contract
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesEnhanced: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get network information
  const chainId = await hre.getChainId();
  console.log("\n 📡 Deploying LSP8LoogiesEnhanced to chain ID:", chainId);
  
  // Deploy the contract
  const lsp8LoogiesEnhanced = await deploy("LSP8LoogiesEnhanced", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  
  console.log("\n ✅ LSP8LoogiesEnhanced deployed at:", lsp8LoogiesEnhanced.address);
  
  // Set minting to active
  try {
    const contractInstance = await hre.ethers.getContractAt("LSP8LoogiesEnhanced", lsp8LoogiesEnhanced.address);
    const tx = await contractInstance.setMintStatus(true);
    await tx.wait();
    console.log("\n ✅ Minting activated for LSP8LoogiesEnhanced");
  } catch (error) {
    console.error("\n ❌ Error activating minting:", error);
  }
  
  // Team mint a few tokens to test
  try {
    const contractInstance = await hre.ethers.getContractAt("LSP8LoogiesEnhanced", lsp8LoogiesEnhanced.address);
    const tx = await contractInstance.teamMint(deployer, 3);
    await tx.wait();
    console.log("\n ✅ Minted 3 test tokens to deployer");
  } catch (error) {
    console.error("\n ❌ Error minting test tokens:", error);
  }
};

export default deployLSP8LoogiesEnhanced;

// Tags help with deploying selectively
deployLSP8LoogiesEnhanced.tags = ["LSP8LoogiesEnhanced", "loogies"]; 