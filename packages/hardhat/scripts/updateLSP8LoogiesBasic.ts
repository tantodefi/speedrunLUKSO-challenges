import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  console.log("🚀 Updating LSP8LoogiesBasic Collection 🚀");
  console.log("=========================================");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesBasic = await ethers.getContractAt("LSP8LoogiesBasic", CONTRACT_ADDRESS);
  
  // Check if the caller is the owner/controller
  const owner = await lsp8LoogiesBasic.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("You are not the owner of this contract. Only the owner can update the metadata.");
    process.exitCode = 1;
    return;
  }
  
  // Keys for LSP4 metadata
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  const LSP4_URL_KEY = "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5";
  const LSP4_CREATORS_KEY = "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7";
  
  // LSP0 interface ID for ERC725Account (required for creator verification)
  const LSP0_INTERFACE_ID = "0x3a271e58";
  
  try {
    // PART 1: Update metadata
    console.log("\n1. UPDATING COLLECTION METADATA");
    console.log("===============================");
    
    // Create collection metadata
    const collectionMetadata = {
      LSP4Metadata: {
        name: "Basic Loogies Collection",
        description: "A collection of adorable, on-chain generated Loogies using elliptical SVG drawing on LUKSO.",
        links: [
          { title: "Website", url: "https://speedrunlukso.com" },
          { title: "X", url: "https://x.com/speedrunLUKSO" }
        ],
        icon: [],
        images: [[{
          width: 400,
          height: 400,
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBpZD0iZXllMSI+PGVsbGlwc2Ugc3Ryb2tlLXdpZHRoPSIzIiByeT0iMjkuNSIgcng9IjI5LjUiIGlkPSJzdmdfMSIgY3k9IjE1NC41IiBjeD0iMTgxLjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0iI2ZmZiIvPjxlbGxpcHNlIHJ5PSIzLjUiIHJ4PSIyLjUiIGlkPSJzdmdfMyIgY3k9IjE1NC41IiBjeD0iMTczLjUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlPSIjMDAwIiBmaWxsPSIjMDAwMDAwIi8+PC9nPjxnIGlkPSJoZWFkIj48ZWxsaXBzZSBmaWxsPSIjYjRmZmZmIiBzdHJva2Utd2lkdGg9IjMiIGN4PSIyMDQuNSIgY3k9IjIxMS44MDA2NSIgaWQ9InN2Z181IiByeD0iNTAiIHJ5PSI1MS44MDA2NSIgc3Ryb2tlPSIjMDAwIi8+PC9nPjxnIGlkPSJleWUyIj48ZWxsaXBzZSBzdHJva2Utd2lkdGg9IjMiIHJ5PSIyOS41IiByeD0iMjkuNSIgaWQ9InN2Z18yIiBjeT0iMTY4LjUiIGN4PSIyMDkuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSIjZmZmIi8+PGVsbGlwc2Ugcnk9IjMuNSIgcng9IjMiIGlkPSJzdmdfNCIgY3k9IjE2OS41IiBjeD0iMjA4IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iIzAwMCIvPjwvZz48ZyBjbGFzcz0ibW91dGgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM0MiwwKSI+PHBhdGggZD0iTSAxMzAgMjQwIFEgMTY1IDI1MCAyMDAgMjM1IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9nPjwvc3ZnPg=="
        }]],
        attributes: [
          {
            key: "collection", 
            value: "Basic Loogies", 
            type: "string"
          },
          {
            key: "itemType", 
            value: "character", 
            type: "string"
          },
          {
            key: "svgType", 
            value: "elliptical", 
            type: "string"
          }
        ]
      }
    };
    
    // Convert to JSON
    const metadataJSON = JSON.stringify(collectionMetadata);
    
    // Encode the metadata
    const encodedMetadata = ethers.toUtf8Bytes(metadataJSON);
    
    console.log("Preparing LSP4 metadata...");
    
    // Create LUKSO verifiable metadata with prefix + hash + encoded data
    const metadataWithPrefix = ethers.concat([
      // LUKSO metadata prefix
      ethers.toBeHex("0x00006f357c6a0020", 8),
      // Hash of metadata
      ethers.keccak256(encodedMetadata),
      // Data URL with base64 encoded metadata
      ethers.toUtf8Bytes(`data:application/json;base64,${Buffer.from(encodedMetadata).toString('base64')}`)
    ]);
    
    console.log("Setting LSP4 metadata on contract...");
    
    // Set the LSP4 metadata
    const metadataTx = await lsp8LoogiesBasic.setData(LSP4_METADATA_KEY, metadataWithPrefix);
    await metadataTx.wait();
    
    console.log(`✅ LSP4 Metadata updated successfully. Transaction hash: ${metadataTx.hash}`);
    
    // Set the collection URL
    console.log("Setting collection URL...");
    const urlTx = await lsp8LoogiesBasic.setData(
      LSP4_URL_KEY,
      ethers.toUtf8Bytes("https://speedrunlukso.com")
    );
    await urlTx.wait();
    
    console.log(`✅ Collection URL set successfully. Transaction hash: ${urlTx.hash}`);
    
    // PART 2: Set verified creator
    console.log("\n2. SETTING VERIFIED CREATOR");
    console.log("===========================");
    
    // Format for creator: [address + interfaceId]
    // LSP4 Creators uses format: address(bytes20) + interfaceId(bytes4)
    const creatorValue = ethers.concat([
      deployer.address,                    // Address of creator
      ethers.toBeHex(LSP0_INTERFACE_ID, 4) // LSP0 interface ID
    ]);
    
    console.log("Setting creator information...");
    const creatorTx = await lsp8LoogiesBasic.setData(LSP4_CREATORS_KEY, creatorValue);
    await creatorTx.wait();
    
    console.log(`✅ Creator information set successfully. Transaction hash: ${creatorTx.hash}`);
    console.log(`Verified creator set to: ${deployer.address}`);
    
    console.log("\n✨ Collection update complete! ✨");
    console.log("The collection now has:");
    console.log("- Updated metadata with website and X links");
    console.log("- Collection URL set to: https://speedrunlukso.com");
    console.log(`- Verified creator set to: ${deployer.address}`);
    
  } catch (error) {
    console.error("Error updating collection:", error);
    process.exitCode = 1;
  }
}

// Execute the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 