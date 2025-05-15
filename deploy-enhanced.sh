#!/bin/bash

echo "🧩 Deploying LSP8LoogiesEnhanced contract..."

# Compile without running fixed contract compilation
echo "📦 Compiling contract..."
npx hardhat compile --config hardhat.enhanced-only.config.js

# Deploy using our specialized script
echo "🚀 Running deployment script..."
npx hardhat run scripts/deployLSP8LoogiesEnhanced.js --config hardhat.enhanced-only.config.js --network luksoTestnet 