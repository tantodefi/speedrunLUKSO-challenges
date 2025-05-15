import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract address when available
  const CONTRACT_ADDRESS = "REPLACE_WITH_DEPLOYED_CONTRACT_ADDRESS";
  
  console.log("Setting collection metadata for LSP8LoogiesEnhanced...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesEnhanced = await ethers.getContractAt("LSP8LoogiesEnhanced", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  // Create collection metadata
  const collectionMetadata = {
    LSP4Metadata: {
      name: "Enhanced Loogies Collection",
      description: "A collection of adorable, on-chain generated Loogies with UP detection, matrix rain effects, and username display on LUKSO.",
      links: [],
      icon: [],
      images: [[{
        width: 400,
        height: 400,
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJtYXRyaXgiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmZVR1cmJ1bGVuY2UgYmFzZUZyZXF1ZW5jeT0iMC4wNSIgbnVtT2N0YXZlcz0iMiIgcmVzdWx0PSJub2lzZSIgc2VlZD0iMSIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9Im5vaXNlIiBzY2FsZT0iNSIgeENoYW5uZWxTZWxlY3Rvcj0iUiIgeUNoYW5uZWxTZWxlY3Rvcj0iRyIvPjwvZmlsdGVyPjxsaW5lYXJHcmFkaWVudCBpZD0ibWF0cml4QmciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDAsMCwwLDAuMSkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9InJnYmEoMCwwLDAsMC4zKSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI21hdHJpeEJnKSIgb3BhY2l0eT0iMC43Ii8+PGcgZmlsdGVyPSJ1cmwoI21hdHJpeCkiPjx0ZXh0IHg9IjIwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMGZmMDAiIG9wYWNpdHk9IjAuNSI+VU5JVkVSU0FMIFBST0ZJTEU8L3RleHQ+PC9nPjxnIGlkPSJ1cE5hbWUiPjxyZWN0IHg9IjUwIiB5PSI0MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMCIgcng9IjUiIGZpbGw9InJnYmEoMCwwLDAsMC4zKSIgc3Ryb2tlPSIjZmY4ODg4IiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSIyMDAiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPkx1a3NvIFVzZXIgTmFtZTwvdGV4dD48L2c+PGcgaWQ9ImV5ZTEiPjxlbGxpcHNlIHN0cm9rZS13aWR0aD0iMyIgcnk9IjI5LjUiIHJ4PSIyOS41IiBpZD0ic3ZnXzEiIGN5PSIxNTQuNSIgY3g9IjE4MS41IiBzdHJva2U9IiMwMDAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSByeT0iMy41IiByeD0iMi41IiBpZD0ic3ZnXzMiIGN5PSIxNTQuNSIgY3g9IjE3My41IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCIvPjwvZz48ZyBpZD0iaGVhZCI+PGVsbGlwc2UgZmlsbD0iI2ZmODg4OCIgc3Ryb2tlLXdpZHRoPSIzIiBjeD0iMjA0LjUiIGN5PSIyMTEuODAwNjUiIGlkPSJzdmdfNSIgcng9IjUwIiByeT0iNTEuODAwNjUiIHN0cm9rZT0iIzAwMCIvPjwvZz48ZyBpZD0iZXllMiI+PGVsbGlwc2Ugc3Ryb2tlLXdpZHRoPSIzIiByeT0iMjkuNSIgcng9IjI5LjUiIGlkPSJzdmdfMiIgY3k9IjE2OC41IiBjeD0iMjA5LjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0iI2ZmZiIvPjxlbGxpcHNlIHJ5PSIzLjUiIHJ4PSIzIiBpZD0ic3ZnXzQiIGN5PSIxNjkuNSIgY3g9IjIwOCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSIjMDAwMDAwIiBzdHJva2U9IiMwMDAiLz48L2c+PGcgY2xhc3M9Im1vdXRoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMTIsMCkiPjxwYXRoIGQ9Ik0gMTMwIDI0MCBRIHAgMjUwIDIwMCAyMzUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0idHJhbnNwYXJlbnQiLz48L2c+PC9zdmc+"
      }]],
      attributes: [
        {
          key: "collection", 
          value: "Enhanced Loogies", 
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
        },
        {
          key: "features", 
          value: "UP detection, Matrix rain, Username display", 
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
  const tx = await lsp8LoogiesEnhanced.setData(LSP4_METADATA_KEY, metadataWithPrefix);
  await tx.wait();
  
  console.log(`Metadata set successfully. Transaction hash: ${tx.hash}`);
  console.log("Collection metadata setup complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 

async function main() {
  // Replace with your deployed contract address when available
  const CONTRACT_ADDRESS = "REPLACE_WITH_DEPLOYED_CONTRACT_ADDRESS";
  
  console.log("Setting collection metadata for LSP8LoogiesEnhanced...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Get contract instance
  const lsp8LoogiesEnhanced = await ethers.getContractAt("LSP8LoogiesEnhanced", CONTRACT_ADDRESS);
  
  // LSP4 Metadata key
  const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
  
  // Create collection metadata
  const collectionMetadata = {
    LSP4Metadata: {
      name: "Enhanced Loogies Collection",
      description: "A collection of adorable, on-chain generated Loogies with UP detection, matrix rain effects, and username display on LUKSO.",
      links: [],
      icon: [],
      images: [[{
        width: 400,
        height: 400,
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJtYXRyaXgiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmZVR1cmJ1bGVuY2UgYmFzZUZyZXF1ZW5jeT0iMC4wNSIgbnVtT2N0YXZlcz0iMiIgcmVzdWx0PSJub2lzZSIgc2VlZD0iMSIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlRGlzcGxhY2VtZW50TWFwIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9Im5vaXNlIiBzY2FsZT0iNSIgeENoYW5uZWxTZWxlY3Rvcj0iUiIgeUNoYW5uZWxTZWxlY3Rvcj0iRyIvPjwvZmlsdGVyPjxsaW5lYXJHcmFkaWVudCBpZD0ibWF0cml4QmciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDAsMCwwLDAuMSkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9InJnYmEoMCwwLDAsMC4zKSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI21hdHJpeEJnKSIgb3BhY2l0eT0iMC43Ii8+PGcgZmlsdGVyPSJ1cmwoI21hdHJpeCkiPjx0ZXh0IHg9IjIwMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMGZmMDAiIG9wYWNpdHk9IjAuNSI+VU5JVkVSU0FMIFBST0ZJTEU8L3RleHQ+PC9nPjxnIGlkPSJ1cE5hbWUiPjxyZWN0IHg9IjUwIiB5PSI0MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMCIgcng9IjUiIGZpbGw9InJnYmEoMCwwLDAsMC4zKSIgc3Ryb2tlPSIjZmY4ODg4IiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSIyMDAiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPkx1a3NvIFVzZXIgTmFtZTwvdGV4dD48L2c+PGcgaWQ9ImV5ZTEiPjxlbGxpcHNlIHN0cm9rZS13aWR0aD0iMyIgcnk9IjI5LjUiIHJ4PSIyOS41IiBpZD0ic3ZnXzEiIGN5PSIxNTQuNSIgY3g9IjE4MS41IiBzdHJva2U9IiMwMDAiIGZpbGw9IiNmZmYiLz48ZWxsaXBzZSByeT0iMy41IiByeD0iMi41IiBpZD0ic3ZnXzMiIGN5PSIxNTQuNSIgY3g9IjE3My41IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZT0iIzAwMCIgZmlsbD0iIzAwMDAwMCIvPjwvZz48ZyBpZD0iaGVhZCI+PGVsbGlwc2UgZmlsbD0iI2ZmODg4OCIgc3Ryb2tlLXdpZHRoPSIzIiBjeD0iMjA0LjUiIGN5PSIyMTEuODAwNjUiIGlkPSJzdmdfNSIgcng9IjUwIiByeT0iNTEuODAwNjUiIHN0cm9rZT0iIzAwMCIvPjwvZz48ZyBpZD0iZXllMiI+PGVsbGlwc2Ugc3Ryb2tlLXdpZHRoPSIzIiByeT0iMjkuNSIgcng9IjI5LjUiIGlkPSJzdmdfMiIgY3k9IjE2OC41IiBjeD0iMjA5LjUiIHN0cm9rZT0iIzAwMCIgZmlsbD0iI2ZmZiIvPjxlbGxpcHNlIHJ5PSIzLjUiIHJ4PSIzIiBpZD0ic3ZnXzQiIGN5PSIxNjkuNSIgY3g9IjIwOCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSIjMDAwMDAwIiBzdHJva2U9IiMwMDAiLz48L2c+PGcgY2xhc3M9Im1vdXRoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMTIsMCkiPjxwYXRoIGQ9Ik0gMTMwIDI0MCBRIHAgMjUwIDIwMCAyMzUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0idHJhbnNwYXJlbnQiLz48L2c+PC9zdmc+"
      }]],
      attributes: [
        {
          key: "collection", 
          value: "Enhanced Loogies", 
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
        },
        {
          key: "features", 
          value: "UP detection, Matrix rain, Username display", 
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
  const tx = await lsp8LoogiesEnhanced.setData(LSP4_METADATA_KEY, metadataWithPrefix);
  await tx.wait();
  
  console.log(`Metadata set successfully. Transaction hash: ${tx.hash}`);
  console.log("Collection metadata setup complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
 