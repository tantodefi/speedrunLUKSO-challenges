# LSP8LoogiesBasic Contract Update

This README contains instructions for updating the LSP8LoogiesBasic contract deployed at `0x1a591150667ca86de0f8d48ada752115c2587826` on the LUKSO testnet.

## Features

The update script:
1. Sets verified creator information
2. Updates collection metadata with website and X links
3. Verifies the contract on LUKSO Blockscout explorer

## Prerequisites

1. Make sure you have Node.js and npm installed
2. Install dependencies with:
   ```
   npm install
   ```
3. Set up your private key as an environment variable:
   ```
   export DEPLOYER_PRIVATE_KEY=your_private_key_here
   ```
   > ⚠️ Never commit or share your private key!

## Running the Update Script

To update the LSP8LoogiesBasic contract metadata and verify it:

```bash
npx hardhat run scripts/updateLoogiesBasic.js --network luksoTestnet
```

### Expected Output

```
🚀 Updating LSP8LoogiesBasic Collection 🚀
=========================================
1. UPDATING COLLECTION METADATA
===============================
Updating with account: 0xYourAddress...
Setting collection metadata...
Setting LSP4 Metadata...
✅ LSP4 Metadata updated successfully
Setting creator information...
✅ Creator information set successfully
Setting collection URL...
✅ Collection URL set successfully
Metadata update complete! Collection now has:
- Updated metadata with website and X links
- Verified creator set to: 0xYourAddress...
- Collection URL set to: https://speedrunlukso.com

2. VERIFYING CONTRACT
====================
Verifying LSP8LoogiesBasic contract on LUKSO explorer...
Contract address: 0x1a591150667ca86de0f8d48ada752115c2587826
Constructor arguments: ["Loogies Basic","LOOGB"]
Contract verified successfully! ✅

✨ All operations completed successfully! ✨
```

## Important Notes

- You must be the owner of the contract to update its metadata
- Contract verification only needs to be done once
- After verification, the contract will be visible with its source code on [LUKSO Blockscout](https://explorer.testnet.lukso.network/address/0x1a591150667ca86de0f8d48ada752115c2587826)
- After updating, your NFT collection will show the proper metadata in tools like Universal Explorer 