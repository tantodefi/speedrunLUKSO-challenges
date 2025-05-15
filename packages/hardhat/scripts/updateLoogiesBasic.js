// Script to update LSP8LoogiesBasic contract and verify it on LUKSO Blockscout
// This script:
// 1. Sets verified creator information
// 2. Updates collection metadata with website and X links
// 3. Verifies the contract on LUKSO Blockscout

const hre = require("hardhat");
const { ethers } = require("hardhat");
const { ERC725YDataKeys } = require("@lukso/lsp-smart-contracts");

// LSP4 and LSP3 related constants
const INTERFACE_IDS = {
  LSP0ERC725Account: '0x3a271e58', // LSP0 ERC725Account MetaData interface ID
};

// LSP4 Constants
const LSP4_URL_KEY = '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5';
const LSP4_METADATA_KEY = '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e';
const LSP4_CREATORS_KEY = '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7';

async function setCollectionMetadata() {
  const [deployer] = await ethers.getSigners();
  
  // Address of the deployed LSP8LoogiesBasic contract
  const contractAddress = "0x1a591150667ca86de0f8d48ada752115c2587826";
  
  console.log("1. UPDATING COLLECTION METADATA");
  console.log("===============================");
  console.log("Updating with account:", deployer.address);
  
  // Connect to the deployed contract
  const LSP8LoogiesBasic = await ethers.getContractFactory("LSP8LoogiesBasic");
  const contract = await LSP8LoogiesBasic.attach(contractAddress);
  
  // Connect to the contract as an LSP8IdentifiableDigitalAsset to get access to setData
  const LSP8 = await ethers.getContractFactory("LSP8IdentifiableDigitalAsset");
  const lsp8Contract = await LSP8.attach(contractAddress);
  
  // Check if the caller is the owner/controller
  const owner = await contract.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("You are not the owner of this contract. Only the owner can update the metadata.");
    return false;
  }
  
  console.log("Setting collection metadata...");
  
  // Create JSON metadata structure with links to SpeedRunLUKSO website and X
  const metadata = {
    LSP4Metadata: {
      name: "LSP8 Loogies Basic",
      description: "Basic LSP8 Loogies NFT collection on LUKSO with a unique color and smile!",
      links: [
        { title: "Website", url: "https://speedrunlukso.com" },
        { title: "X", url: "https://x.com/speedrunLUKSO" }
      ],
      icon: [],
      images: [[{ width: 400, height: 400, url: "ipfs://QmZM9NyAQsGYQvDTaYPxVhkkfFHLPQ1DoN4VXSy41EFEG6" }]],
      assets: []
    }
  };
  
  // Encode the metadata - handle different ethers versions
  const metadataJSON = JSON.stringify(metadata);
  const metadataBytes = ethers.utils?.toUtf8Bytes 
    ? ethers.utils.toUtf8Bytes(metadataJSON) 
    : ethers.toUtf8Bytes(metadataJSON);
  
  // Convert metadata to verifiable format
  const metadataHash = ethers.utils?.keccak256 
    ? ethers.utils.keccak256(metadataBytes)
    : ethers.keccak256(metadataBytes);
  
  // Create LUKSO verifiable format
  const verifiableURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;
  
  // Get encoding function based on ethers version
  const hexConcat = ethers.utils?.hexConcat || ethers.concat;
  const toUtf8Bytes = ethers.utils?.toUtf8Bytes || ethers.toUtf8Bytes;
  
  // LSP4Digital Asset Metadata
  const metadataValue = hexConcat([
    '0x00006f357c6a0020', // LUKSO metadata prefix
    metadataHash.slice(2),      // Remove 0x prefix
    toUtf8Bytes(verifiableURI)
  ]);
  
  // Set the metadata
  try {
    // 1. Update collection metadata with the new JSON
    console.log("Setting LSP4 Metadata...");
    const metadataTx = await lsp8Contract.setData(LSP4_METADATA_KEY, metadataValue);
    await metadataTx.wait();
    console.log("✅ LSP4 Metadata updated successfully");
    
    // 2. Set the creator information
    console.log("Setting creator information...");
    
    // Format for creator: [address + interfaceId]
    const creatorValue = hexConcat([
      deployer.address, // Address of creator (current deployer/owner)
      INTERFACE_IDS.LSP0ERC725Account
    ]);
    
    const creatorTx = await lsp8Contract.setData(LSP4_CREATORS_KEY, creatorValue);
    await creatorTx.wait();
    console.log("✅ Creator information set successfully");
    
    // 3. Set custom URL if needed
    console.log("Setting collection URL...");
    const urlTx = await lsp8Contract.setData(
      LSP4_URL_KEY, 
      toUtf8Bytes("https://speedrunlukso.com")
    );
    await urlTx.wait();
    console.log("✅ Collection URL set successfully");
    
    console.log("Metadata update complete! Collection now has:");
    console.log("- Updated metadata with website and X links");
    console.log("- Verified creator set to:", deployer.address);
    console.log("- Collection URL set to: https://speedrunlukso.com");
    
    return true;
  } catch (error) {
    console.error("Error updating metadata:", error);
    return false;
  }
}

async function verifyContract() {
  const contractAddress = "0x1a591150667ca86de0f8d48ada752115c2587826";
  
  console.log("\n2. VERIFYING CONTRACT");
  console.log("====================");
  
  // Constructor arguments when the contract was deployed
  // LSP8LoogiesBasic constructor takes name and symbol
  const constructorArgs = [
    "Loogies Basic", // name
    "LOOGB"          // symbol
  ];
  
  console.log("Verifying LSP8LoogiesBasic contract on LUKSO explorer...");
  console.log("Contract address:", contractAddress);
  console.log("Constructor arguments:", constructorArgs);
  
  try {
    // Use the hardhat built-in verify task
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/LSP8LoogiesBasic.sol:LSP8LoogiesBasic",
    });
    
    console.log("Contract verified successfully! ✅");
    return true;
  } catch (error) {
    console.error("Error during verification:", error);
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified on the explorer.");
      return true;
    }
    return false;
  }
}

async function main() {
  console.log("🚀 Updating LSP8LoogiesBasic Collection 🚀");
  console.log("=========================================");
  
  // Step 1: Set collection metadata
  const metadataSuccess = await setCollectionMetadata();
  
  // Step 2: Verify contract
  if (metadataSuccess) {
    const verifySuccess = await verifyContract();
    
    if (metadataSuccess && verifySuccess) {
      console.log("\n✨ All operations completed successfully! ✨");
    } else {
      console.log("\n⚠️ Some operations failed. Check the logs above for details.");
    }
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 