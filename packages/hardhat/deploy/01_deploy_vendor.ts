import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployVendor: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed YourLSP7Token
  const yourToken = await deployments.get("YourLSP7Token");
  console.log("YourLSP7Token found at:", yourToken.address);

  // Deploy the Vendor contract
  console.log("Deploying Vendor with the account:", deployer);
  const vendor = await deploy("Vendor", {
    from: deployer,
    args: [yourToken.address], // Pass the token address to the constructor
    log: true,
    autoMine: true,
  });

  console.log("Vendor deployed to:", vendor.address);

  // Transfer tokens to the Vendor
  console.log("Transferring tokens to the Vendor...");
  
  const tokenContract = await ethers.getContractAt("YourLSP7Token", yourToken.address);
  const vendorContract = await ethers.getContractAt("Vendor", vendor.address);
  
  // Transfer 100 tokens to the vendor
  const transferAmount = ethers.parseUnits("100", 18);
  
  // Use the correct transfer parameters for LSP7
  await tokenContract.transfer(deployer, vendor.address, transferAmount, true, "0x");
  
  const vendorBalance = await tokenContract.balanceOf(vendor.address);
  console.log("Vendor token balance:", ethers.formatUnits(vendorBalance, 18));
};

export default deployVendor;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Vendor
deployVendor.tags = ["Vendor"];
deployVendor.dependencies = ["YourLSP7Token"];
