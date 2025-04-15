const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed YourLSP7Token address
  const tokenDeployment = await deployments.get("YourLSP7Token");
  const tokenAddress = tokenDeployment.address;

  // Deploy Vendor
  const vendorResult = await deploy("Vendor", {
    from: deployer,
    args: [tokenAddress], // pass the token address to the constructor
    log: true,
    waitConfirmations: 1,
  });

  console.log("Vendor deployed to:", vendorResult.address);

  // Get contract instances
  const token = await ethers.getContractAt("YourLSP7Token", tokenAddress);
  const vendor = await ethers.getContractAt("Vendor", vendorResult.address);

  // Transfer some tokens to the vendor for selling
  console.log("Transferring tokens to the vendor...");
  const transferAmount = ethers.parseUnits("100", 18); // 100 tokens
  
  // Use the correct transfer parameters for LSP7
  await token.transfer(deployer, vendorResult.address, transferAmount, true, "0x");
  
  const vendorBalance = await token.balanceOf(vendorResult.address);
  console.log("Tokens transferred to vendor:", vendorBalance.toString());
};

module.exports.tags = ["Vendor"];
module.exports.dependencies = ["YourLSP7Token"]; 