const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Deploy YourLSP7Token with correct arguments
  const result = await deploy("YourLSP7Token", {
    from: deployer,
    // Make sure args match the constructor exactly
    args: ["LUKSO Token", "LXS", deployer], // name, symbol, owner
    log: true,
    waitConfirmations: 1,
  });

  console.log("YourLSP7Token deployed to:", result.address);
};

module.exports.tags = ["YourLSP7Token"]; 