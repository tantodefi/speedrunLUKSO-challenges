#!/bin/bash

# First compile with custom config
echo "Compiling LSP8LoogiesBasic contract..."
npx hardhat compile --config hardhat.loogies-basic.config.ts

# Run the deployment script
echo "Deploying LSP8LoogiesBasic contract..."
npx hardhat run deploy/basic/deploy_LSP8LoogiesBasic.ts --config hardhat.loogies-basic.config.ts --network localhost 

# First compile with custom config
echo "Compiling LSP8LoogiesBasic contract..."
npx hardhat compile --config hardhat.loogies-basic.config.ts

# Run the deployment script
echo "Deploying LSP8LoogiesBasic contract..."
npx hardhat run deploy/basic/deploy_LSP8LoogiesBasic.ts --config hardhat.loogies-basic.config.ts --network localhost 