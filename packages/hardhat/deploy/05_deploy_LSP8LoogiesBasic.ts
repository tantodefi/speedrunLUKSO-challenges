import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the LSP8LoogiesBasic contract using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object
 */
const deployLSP8LoogiesBasic: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat
    In the testnet and mainnet, we set it in hardhat.config.ts
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("LSP8LoogiesBasic", {
    from: deployer,
    args: ["Loogies Basic", "LOOGB"],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const lsp8LoogiesBasic = await hre.ethers.getContract("LSP8LoogiesBasic", deployer);
  
  // For frontend: You might want to transfer an NFT to the frontend demo addr
  console.log("✅ LSP8LoogiesBasic deployed at:", lsp8LoogiesBasic.target);
};

export default deployLSP8LoogiesBasic;

// Tags represent the order in which this deployment script should run
deployLSP8LoogiesBasic.tags = ["LSP8LoogiesBasic"]; 
 