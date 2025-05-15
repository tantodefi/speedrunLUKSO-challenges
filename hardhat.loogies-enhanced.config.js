require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // LUKSO testnet
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"]
    }
  },
  etherscan: {
    apiKey: {
      luksoTestnet: "no-api-key-needed"
    },
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://api.explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts-enhanced",
    cache: "./cache-enhanced",
    tests: "./test",
    // Only include LSP8LoogiesEnhanced.sol and its dependencies
    include: [
      "contracts/LSP8LoogiesEnhanced.sol",
      "contracts/OnChainMetadata.sol"
    ],
    // Exclude other contracts to avoid compilation issues
    exclude: [
      "contracts/LSP8LoogiesFixed.sol",
      "contracts/LSP8LoogiesBasic.sol",
      "contracts/LSP8LoogiesUpdated.sol",
      "contracts/enhanced",
      "contracts/basic"
    ]
  }
}; 