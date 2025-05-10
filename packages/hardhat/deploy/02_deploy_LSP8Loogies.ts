import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLSP8Loogies: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Set your name and symbol here
  const name = "OptimisticLoogies";
  const symbol = "OPLOOG";

  await deploy("LSP8Loogies", {
    from: deployer,
    args: [name, symbol, deployer],
    log: true,
    autoMine: true,
  });
};

export default deployLSP8Loogies;
deployLSP8Loogies.tags = ["LSP8Loogies"];
