# LSP8LoogiesBasic Collection Scripts

This directory contains scripts for updating the LSP8LoogiesBasic NFT collection on LUKSO:

## Available Scripts

1. **setLSP8BasicCollectionMetadata.ts**
   - Updates the collection metadata with website and X links
   - Sets the collection URL to https://speedrunlukso.com

2. **setLSP8BasicVerifiedCreator.ts**
   - Sets the verified creator information using LSP4 standard

3. **updateLSP8LoogiesBasic.ts**
   - Combined script that does both operations (recommended)

## How to Run

To run these scripts, you must be the owner of the contract. The contract address is hardcoded as `0x1A591150667Ca86De0f8d48ada752115c2587826`.

### Running the Combined Script (Recommended)

```bash
# From the packages/hardhat directory
npx hardhat run scripts/updateLSP8LoogiesBasic.ts --network luksoTestnet
```

### Running Individual Scripts

Update metadata only:
```bash
npx hardhat run scripts/setLSP8BasicCollectionMetadata.ts --network luksoTestnet
```

Set verified creator only:
```bash
npx hardhat run scripts/setLSP8BasicVerifiedCreator.ts --network luksoTestnet
```

## Expected Output

When running the combined script, you should see output similar to:

```
🚀 Updating LSP8LoogiesBasic Collection 🚀
=========================================
Using account: 0xYourAddress...

1. UPDATING COLLECTION METADATA
===============================
Preparing LSP4 metadata...
Setting LSP4 metadata on contract...
✅ LSP4 Metadata updated successfully. Transaction hash: 0x...
Setting collection URL...
✅ Collection URL set successfully. Transaction hash: 0x...

2. SETTING VERIFIED CREATOR
===========================
Setting creator information...
✅ Creator information set successfully. Transaction hash: 0x...
Verified creator set to: 0xYourAddress...

✨ Collection update complete! ✨
The collection now has:
- Updated metadata with website and X links
- Collection URL set to: https://speedrunlukso.com
- Verified creator set to: 0xYourAddress...
```

After running these scripts, your LSP8LoogiesBasic collection will appear with proper creator information and links in Universal Profile Explorer and other LSP-compatible tools. 