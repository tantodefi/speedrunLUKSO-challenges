require('dotenv').config();

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
  paths: {
    sources: "./contracts/standalone",
    scripts: "./scripts",
    artifacts: "./artifacts-standalone",
    cache: "./cache-standalone"
  },
  networks: {
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 4201
    }
  }
}; 