# LSP8 Loogies Deployment Guide

This guide outlines the steps to deploy the LSP8LoogiesBasic contract to the LUKSO testnet, set up collection metadata, generate TypeScript typings, and integrate with the frontend.

## Prerequisites

- Node.js (v16+)
- Yarn or NPM
- LUKSO UP browser extension with testnet LYX

## 1. Setup Environment

First, set up your environment variables by creating a `.env` file in the `packages/hardhat` directory:

```
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

## 2. Deploying LSP8LoogiesBasic Contract

The LSP8LoogiesBasic contract is already deployed and available at [0x1a591150667ca86de0f8d48ada752115c2587826](https://universaleverything.io/collection/0x1a591150667ca86de0f8d48ada752115c2587826?network=testnet) on the LUKSO testnet.

To deploy your own instance, use the provided deployment script:

```bash
# Navigate to the hardhat package
cd packages/hardhat

# Run the deployment script
./scripts/deploy-loogies-basic.sh
```

This script performs the following steps:
1. Compiles the LSP8LoogiesBasic contract
2. Deploys it to the LUKSO testnet
3. Sets the initial parameters (name, symbol)
4. Outputs the deployed contract address

## 3. Setting Collection Metadata

After deployment, you need to set the collection metadata. Use the following script with your deployed contract address:

```bash
# Replace CONTRACT_ADDRESS with your deployed contract address
npx hardhat run scripts/setLSP8BasicCollectionMetadata.ts --config hardhat.loogies-basic.config.ts --network luksoTestnet CONTRACT_ADDRESS
```

This script sets:
- Collection metadata (name, description, images)
- Collection supply information
- Links to resources

## 4. Generating TypeScript Typings

To generate TypeScript typings and ABIs for the frontend, run:

```bash
# Generate TypeScript typings from contracts
yarn typechain
```

This creates type definitions in the `typechain-types` directory, which can be used by the frontend for type-safe contract interactions.

## 5. Testing Minting

To test minting a token:

```bash
# Replace CONTRACT_ADDRESS with your deployed contract address
npx hardhat run scripts/mintLSP8LoogiesBasic.ts --config hardhat.loogies-basic.config.ts --network luksoTestnet CONTRACT_ADDRESS
```

This will mint a token with random attributes and verify it's visible in the LUKSO Universal Explorer.

## 6. Integrating with Frontend

To integrate the deployed contract with the frontend:

1. Update the contract address in `packages/nextjs/generated/deployedContracts.ts`:

```typescript
// Example update
export const deployedContracts = {
  4201: {
    LSP8LoogiesBasic: {
      address: "0x1a591150667ca86de0f8d48ada752115c2587826",
      abi: [...] // This will be populated by the typechain step
    }
  }
}
```

2. In the LSP8Loogies page component, ensure the correct contract address is being used for minting interactions.

## 7. Directory Structure

```
packages/hardhat/
├── contracts/
│   └── LSP8LoogiesBasic.sol      # Main contract
├── deploy/
│   └── basic/                    # Deployment scripts
│       └── deploy_LSP8LoogiesBasic.ts
├── scripts/
│   ├── deploy-loogies-basic.sh   # Main deployment script
│   ├── setLSP8BasicCollectionMetadata.ts
│   ├── mintLSP8LoogiesBasic.ts
│   └── testLSP8LoogiesBasic.ts   # Testing utilities
├── hardhat.loogies-basic.config.ts  # Specialized config
└── .env                          # Environment variables
```

## 8. Troubleshooting

- **Deployment fails**: Ensure you have sufficient testnet LYX in your deployer account
- **Metadata not showing**: Verify the metadata format conforms to LSP4 standards
- **Contract not verified**: Use the LUKSO block explorer to verify your contract
- **TypeScript errors**: Regenerate typings after any contract changes

## References

- [LUKSO Technical Documentation](https://docs.lukso.tech/)
- [LSP8 Identifiable Digital Asset](https://docs.lukso.tech/standards/tokens/LSP8-Identifiable-Digital-Asset)
- [Deployed Example on Universal Explorer](https://universaleverything.io/collection/0x1a591150667ca86de0f8d48ada752115c2587826?network=testnet) 
 