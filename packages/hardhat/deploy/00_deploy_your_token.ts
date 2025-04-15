import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { Contract } from "ethers";

/**
 * Deploys a contract named "YourLSP7Token" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying YourLSP7Token with the account:", deployer);

  const yourToken = await deploy("YourLSP7Token", {
    from: deployer,
    args: ["LUKSO Token", "LXS", deployer], // name, symbol, owner
    log: true,
    autoMine: true,
  });

  console.log("YourLSP7Token deployed to:", yourToken.address);

  // Get the deployed contract
  // const yourToken = await hre.ethers.getContract<Contract>("YourLSP7Token", deployer);
};

export default deployYourToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourLSP7Token
deployYourToken.tags = ["YourLSP7Token"];
