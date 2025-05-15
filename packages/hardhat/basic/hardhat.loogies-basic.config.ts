// https://universaleverything.io/collection/0x1a591150667ca86de0f8d48ada752115c2587826?network=testnet
import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

// Simplified config just for LSP8LoogiesBasic
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
          viaIR: true,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/basic",
    tests: "./test",
    cache: "./cache/basic",
    artifacts: "./artifacts/basic"
  },
  defaultNetwork: "localhost",
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 4201,
    },
  },
};

export default config; 
 