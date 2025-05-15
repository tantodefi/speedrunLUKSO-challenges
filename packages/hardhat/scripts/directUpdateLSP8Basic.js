// Script to directly update LSP8LoogiesBasic contract metadata using ethers.js

const hre = require("hardhat");
require('dotenv').config();

// LSP4 constants
const INTERFACE_IDS = {
  LSP0ERC725Account: '0x3a271e58', // LSP0 ERC725Account MetaData interface ID
};

// LSP4 Keys
const LSP4_URL_KEY = '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5';
const LSP4_METADATA_KEY = '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e';
const LSP4_CREATORS_KEY = '0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7';

// ABI for LSP8 contract's setData function
const contractABI = [
  "function setData(bytes32 dataKey, bytes dataValue) external",
  "function owner() view returns (address)"
];

async function main() {
  // Import ethers from hardhat
  const { ethers } = hre;

  // Connect to LUKSO Testnet (using hardhat config)
  const [deployer] = await ethers.getSigners();
  
  console.log(`Connected to LUKSO testnet with account: ${deployer.address}`);
  
  // Contract address for LSP8LoogiesBasic
  const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
  
  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, deployer);

  // Check ownership
  try {
    const owner = await contract.owner();
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error(`You are not the owner of this contract. Only the owner can update the metadata.`);
      console.error(`Owner: ${owner}`);
      console.error(`Your address: ${deployer.address}`);
      process.exit(1);
    }
    console.log(`Verified you are the owner of the contract.`);
  } catch (error) {
    console.error("Error checking ownership:", error);
    process.exit(1);
  }

  try {
    console.log("🚀 Updating LSP8LoogiesBasic Collection 🚀");
    console.log("=========================================");
    
    // 1. Update collection metadata
    console.log("\n1. UPDATING COLLECTION METADATA");
    console.log("===============================");
    
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
    
    // Convert metadata to JSON
    const metadataJSON = JSON.stringify(metadata);
    
    // Convert metadata to verifiable format
    const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(metadataJSON));
    
    // Create LUKSO verifiable format
    const verifiableURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;
    
    // LSP4Digital Asset Metadata
    const metadataValue = ethers.utils.hexConcat([
      '0x00006f357c6a0020', // LUKSO metadata prefix
      metadataHash.slice(2),      // Remove 0x prefix
      ethers.utils.toUtf8Bytes(verifiableURI)
    ]);
    
    console.log("Setting LSP4 Metadata...");
    const metadataTx = await contract.setData(LSP4_METADATA_KEY, metadataValue);
    await metadataTx.wait();
    console.log(`✅ LSP4 Metadata updated successfully. Transaction hash: ${metadataTx.hash}`);
    
    // 2. Set the collection URL
    console.log("Setting collection URL...");
    const urlTx = await contract.setData(
      LSP4_URL_KEY,
      ethers.utils.toUtf8Bytes("https://speedrunlukso.com")
    );
    await urlTx.wait();
    console.log(`✅ Collection URL set successfully. Transaction hash: ${urlTx.hash}`);
    
    // 3. Set the creator information
    console.log("\n2. SETTING VERIFIED CREATOR");
    console.log("===========================");
    
    // Format for creator: [address + interfaceId]
    const creatorValue = ethers.utils.hexConcat([
      deployer.address, // Address of creator (current deployer)
      INTERFACE_IDS.LSP0ERC725Account
    ]);
    
    console.log("Setting creator information...");
    const creatorTx = await contract.setData(LSP4_CREATORS_KEY, creatorValue);
    await creatorTx.wait();
    
    console.log(`✅ Creator information set successfully. Transaction hash: ${creatorTx.hash}`);
    console.log(`Verified creator set to: ${deployer.address}`);
    
    console.log("\n✨ Collection update complete! ✨");
    console.log("The collection now has:");
    console.log("- Updated metadata with website and X links");
    console.log("- Collection URL set to: https://speedrunlukso.com");
    console.log(`- Verified creator set to: ${deployer.address}`);
    console.log("\nView your collection at:");
    console.log(`https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}`);
    console.log(`https://universaleverything.io/collection/${CONTRACT_ADDRESS}?network=testnet`);
    console.log("\nView a token example:");
    console.log(`https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}/3`);
    
  } catch (error) {
    console.error("Error updating collection:", error);
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 