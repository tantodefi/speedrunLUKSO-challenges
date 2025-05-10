// This deployment script is disabled. Only LSP8Loogies will be deployed.
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourLSP8Collectible: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("YourLSP8Collectible", {
    from: deployer,
    args: ["SVG NFT Collection", "SVGNFT", deployer],
    log: true,
    autoMine: true,
  });
};

export default deployYourLSP8Collectible;
deployYourLSP8Collectible.tags = ["YourLSP8Collectible"]; 