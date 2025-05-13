# LSP8Loogies Update Guide

This document explains how to update your LSP8Loogies NFT contract to fully comply with the latest LSP8 standard according to LUKSO recommendations.

## Background

The LSP8 standard has evolved with the following changes:
- New interface ID: `0x3a271706` (replacing the previous ID)
- Support for LSP17 Extendable by default
- New LSP4 Token Type data key to specify if the token is a Collection (2), NFT (1), or Token (0)
- New functions for token-specific metadata: `getDataForTokenId(...)` and `setDataForTokenId(...)`
- Deprecated `LSP8MetadataTokenURI` in favor of token-specific `LSP4Metadata`
- Properly formatted LSP4 metadata with verification bytes

## What's New in the Updated Contract

1. **Token Type Set to Collection (2)**: The contract now properly identifies as a Collection.
2. **Metadata Structure**: JSON metadata now follows the correct format: `{"LSP4Metadata": {...}}`.
3. **Verification Bytes**: All metadata includes the proper `0x00000000` verification bytes.
4. **Token-Specific Metadata**: Each token has its own LSP4-compliant metadata.
5. **Latest LSP8 Interface ID**: The contract now supports the latest interface ID.
6. **SVG Matrix Rain Animation**: Tokens include an improved SVG with dynamic animation.
7. **Proper UP Detection**: Enhanced support for Universal Profile detection.

## How to Migrate to the New Contract

### Step 1: Deploy the New Contract

```bash
npx hardhat deploy --network luksoTestnet --tags LSP8LoogiesUpdated
```

This will deploy the updated LSP8LoogiesUpdated contract on LUKSO Testnet.

### Step 2: Migrate Existing Tokens

After deploying the new contract, you'll need to migrate your tokens:

1. First, edit the `migrateLSP8Tokens.ts` script to set your newly deployed contract address:

```typescript
// Replace with your deployed contract addresses
const oldContractAddress = "0xAfEcAAE8FfD830F3Ca9B141546f5eea6E314cF1B"; // Original LSP8Loogies
const newContractAddress = "YOUR_NEW_CONTRACT_ADDRESS"; // Replace with your deployed address
```

2. Run the migration script:

```bash
npx hardhat run scripts/migrateLSP8Tokens.ts --network luksoTestnet
```

This script will:
- Fetch tokens from the original contract with their metadata
- Import them into the new contract
- Set proper LSP8-compliant metadata for each token

### Step 3: Update Metadata

If you need to update the metadata after migration:

```bash
npx hardhat run scripts/updateLSP8MetadataNew.ts --network luksoTestnet
```

This script will:
1. Update the collection metadata to LSP4 standard
2. Update all existing tokens with proper token-specific metadata
3. Set required data keys for LSP8 compliance

### Step 4: Verify Compliance

To verify that your contract properly implements the LSP8 standard:

```bash
npx hardhat run scripts/verifyLSP8Compliance.ts --network luksoTestnet
```

## Contract Improvements

### 1. Proper LSP8 Metadata Format

The new contract sets proper LSP4-compliant metadata with verification bytes:

```solidity
function _setTokenMetadata(bytes32 tokenId) internal {
    // Create proper LSP4 metadata for this token
    bytes memory metadataJSON = _createTokenMetadataJSON(tokenId);
    
    // Add verification bytes (0x00000000) + JSON data
    bytes memory metadataWithVerification = abi.encodePacked(
        hex"00000000",  // verification bytes
        metadataJSON
    );
    
    // Set the metadata using LSP8's token-specific data storage
    _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, metadataWithVerification);
}
```

### 2. LSP4-Compliant JSON Structure

The metadata now follows the required format:

```solidity
string memory json = string(
    abi.encodePacked(
        '{"LSP4Metadata":{"name":"',
        tokenName,
        '","description":"',
        description,
        '","links":[...],',
        '"images":[[...]],',
        '"attributes":[...]',
        '}}'
    )
);
```

### 3. Enhanced SVG Rendering

Each token contains a Matrix-themed animated SVG with:
- The original Loogie character
- Dynamic falling characters in the background
- Special styling for Universal Profile owners

### 4. Enhanced Universal Profile Support

The contract can detect if a token is owned by a Universal Profile and display the UP's name:

```solidity
function getUPName(address upAddress) public view returns (string memory) {
    if (!isUniversalProfile(upAddress)) {
        return "luksonaut";
    }
    
    try ILSP3Profile(upAddress).getName() returns (string memory profileName) {
        if (bytes(profileName).length > 0) {
            return profileName;
        }
    } catch {}
    
    // Additional fallback logic...
}
```

## Testing in the LUKSO Universal Explorer

After migrating, your tokens should be properly displayed in the LUKSO Universal Explorer at:

```
https://universaleverything.io/collection/YOUR_CONTRACT_ADDRESS?network=testnet
```

Individual tokens will be viewable at:

```
https://universaleverything.io/asset/YOUR_CONTRACT_ADDRESS/tokenId/0x0000000000000000000000000000000000000000000000000000000000000001?network=testnet
```

## Troubleshooting

If you encounter issues:

1. **Metadata Not Showing**: Check if the metadata JSON structure is correct.
2. **Tokens Not Migrated**: Check the migration logs for specific errors.
3. **High Gas Errors**: Try reducing the batch size in the migration script.
4. **SVG Rendering Issues**: The SVG might be too large; try optimizing.

## References

- [LUKSO LSP8 Updates Article](https://medium.com/lukso/updates-on-lsp7-digital-asset-and-lsp8-identifiable-digital-asset-be4347200671)
- [Build Your First NFT Collection on LUKSO](https://medium.com/lukso/build-your-first-nft-collection-on-lukso-a984743e07af)
- [LUKSO Explained: Asset Metadata](http://fhildeb.medium.com/lukso-explained-asset-metadata-3fe151a51181)
- [LUKSO Playground Examples](https://github.com/lukso-network/lukso-playground/tree/main/smart-contracts-hardhat/scripts) 