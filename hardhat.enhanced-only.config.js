require('dotenv').config();

/**
 * Hardhat config for deploying LSP8LoogiesEnhanced only
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  defaultNetwork: "luksoTestnet",
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 4201
    }
  }
}; 