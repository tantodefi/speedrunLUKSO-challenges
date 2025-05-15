#!/bin/bash

# First compile with custom config
echo "Compiling LSP8LoogiesEnhanced contract..."
npx hardhat compile --config hardhat.loogies-enhanced.config.ts

# Run the deployment script
echo "Deploying LSP8LoogiesEnhanced contract..."
npx hardhat run deploy/enhanced/deploy_LSP8LoogiesEnhanced.ts --config hardhat.loogies-enhanced.config.ts --network luksoTestnet 