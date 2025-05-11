import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLSP8Loogies: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Name and symbol are now hardcoded in the contract as "LuksoLoogies" and "LUKLOOG"
  
  await deploy("LSP8Loogies", {
    from: deployer,
    args: [deployer], // Only passing the contractOwner argument
    log: true,
    autoMine: true,
  });
};

export default deployLSP8Loogies;
deployLSP8Loogies.tags = ["LSP8Loogies"];
