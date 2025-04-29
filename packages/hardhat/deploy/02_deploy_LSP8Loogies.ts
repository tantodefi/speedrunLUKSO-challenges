import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Set your name and symbol here
  const name = "OptimisticLoogies";
  const symbol = "OPLOOG";

  const LSP8Loogies = await ethers.getContractFactory("LSP8Loogies");
  const loogies = await LSP8Loogies.deploy(name, symbol, deployer.address);
  await loogies.deployed();

  console.log(`LSP8Loogies deployed to: ${loogies.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
