import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { hexlify, toUtf8Bytes } from "ethers";
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

  // Set LSP4 metadata (name, symbol, metadata)
  const tokenContract = await ethers.getContractAt("YourLSP7Token", yourToken.address);

  // LSP4 schema keys (see https://docs.lukso.tech/standards/universal-profile/lsp4-digital-asset-metadata/#lsp4-metadata-keys)
  const LSP4TokenName =
    "0xdcafbab2e0b1b6e0a8e7b7a8e0b1b6e0a8e7b7a8e0b1b6e0a8e7b7a8e0b1b6e0";
  const LSP4TokenSymbol =
    "0x3ae85a3f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f9b1f";
  const LSP4Metadata =
    "0x5ef4c411a5b2b5f2e2d1b5c8c2b1b4e4c4b9b1b5c8c2b1b4e4c4b9b1b5c8c2b1";

  // Set name and symbol
  await tokenContract.setData(LSP4TokenName, hexlify(toUtf8Bytes("LUKSO Token")));
  await tokenContract.setData(LSP4TokenSymbol, hexlify(toUtf8Bytes("LXS")));

  // Set simple metadata JSON (icon, description, links)
  const metadata = {
    description: "A sample LUKSO LSP7 token.",
    icon: [
      {
        width: 256,
        height: 256,
        url: "ipfs://QmExampleIconHash",
      },
    ],
    links: [
      {
        title: "Website",
        url: "https://lukso.network",
      },
    ],
  };
  await tokenContract.setData(LSP4Metadata, hexlify(toUtf8Bytes(JSON.stringify(metadata))));
};

export default deployYourToken;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourLSP7Token
deployYourToken.tags = ["YourLSP7Token"];
