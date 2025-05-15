// Simple script for updating LSP8LoogiesBasic collection metadata
// This script doesn't rely on hardhat or typechain

const ethers = require("ethers");
require("dotenv").config();

// Constants
const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
const RPC_URL = "https://rpc.testnet.lukso.network";

// LSP4 Keys
const LSP4_URL_KEY = "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5";
const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
const LSP4_CREATORS_KEY = "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7";
const LSP0_INTERFACE_ID = "0x3a271e58"; // LSP0 ERC725Account interface ID

// ABI for LSP8 contract functions
const ABI = [
  "function setData(bytes32 dataKey, bytes dataValue) external",
  "function owner() view returns (address)"
];

async function main() {
  // Check for private key
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.error("ERROR: DEPLOYER_PRIVATE_KEY environment variable is not set");
    console.log("Create a .env file with: DEPLOYER_PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }

  // Connect to LUKSO network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  console.log(`Connected to LUKSO testnet with address: ${wallet.address}`);

  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

  // Check ownership
  try {
    const owner = await contract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error("You are not the owner of this contract. Only the owner can update the metadata.");
      console.error(`Contract owner: ${owner}`);
      console.error(`Your address: ${wallet.address}`);
      process.exit(1);
    }
    console.log("✅ Verified you are the owner of the contract");
  } catch (error) {
    console.error("Error checking ownership:", error);
    process.exit(1);
  }

  try {
    console.log("\n🚀 UPDATING LSP8LOOGIESBASIC COLLECTION 🚀");
    console.log("=========================================");

    // 1. Update collection metadata with website and X links
    console.log("\n1. SETTING COLLECTION METADATA");
    console.log("===============================");
    
    const metadata = {
      LSP4Metadata: {
        name: "LSP8 Loogies Basic",
        description: "A collection of adorable, on-chain generated Loogies using elliptical SVG drawing on LUKSO. Shoutout to the original Loogies collection by @buidlguidl",
        links: [
          { title: "Website", url: "https://speedrunlukso.com" },
          { title: "X", url: "https://x.com/speedrunLUKSO" },
          { title: "Ethereum Loogies", url: "https://loogies.io" },
          { title: "Universal.page", url: `https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}` },
          { title: "Universal Everything", url: `https://universaleverything.io/collection/${CONTRACT_ADDRESS}?network=testnet` }
        ],
        icon: [],
        images: [[{ width: 400, height: 400, url: "ipfs://QmZM9NyAQsGYQvDTaYPxVhkkfFHLPQ1DoN4VXSy41EFEG6" }]],
        assets: []
      }
    };
    
    const metadataJSON = JSON.stringify(metadata);
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataJSON));
    const verifiableURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;
    
    // Format metadata hash properly with 0x prefix
    const hashWithPrefix = `0x${metadataHash.slice(2)}`;
    
    const metadataValue = ethers.concat([
      ethers.hexlify('0x00006f357c6a0020'), // LUKSO metadata prefix
      hashWithPrefix,                       // Hash with 0x prefix
      ethers.toUtf8Bytes(verifiableURI)
    ]);
    
    console.log("Setting LSP4 Metadata...");
    const metadataTx = await contract.setData(LSP4_METADATA_KEY, metadataValue);
    await metadataTx.wait();
    console.log(`✅ Metadata updated successfully. TX: ${metadataTx.hash}`);
    
    // 2. Set URL
    console.log("\nSetting collection URL...");
    const urlTx = await contract.setData(
      LSP4_URL_KEY,
      ethers.toUtf8Bytes("https://universal.page/collections/lukso-testnet/" + CONTRACT_ADDRESS)
    );
    await urlTx.wait();
    console.log(`✅ Collection URL set successfully. TX: ${urlTx.hash}`);
    
    // 3. Set creator information
    console.log("\n2. SETTING VERIFIED CREATOR");
    console.log("===========================");
    
    // Pad the address to ensure it's 20 bytes with 0x prefix
    const paddedAddress = wallet.address.toLowerCase();
    console.log(`Using address: ${paddedAddress} as verified creator`);
    console.log(`Using interface ID: ${LSP0_INTERFACE_ID}`);
    
    // Format creator value properly for LSP4DigitalAsset
    const creatorValue = ethers.concat([
      ethers.getBytes(paddedAddress),  // Convert address to bytes
      ethers.getBytes(LSP0_INTERFACE_ID) // Convert interface ID to bytes
    ]);
    
    console.log(`Creator value (hex): ${ethers.hexlify(creatorValue)}`);
    
    console.log("Setting creator information...");
    const creatorTx = await contract.setData(LSP4_CREATORS_KEY, creatorValue);
    await creatorTx.wait();
    console.log(`✅ Creator info set successfully. TX: ${creatorTx.hash}`);
    
    console.log(`\n✨ All operations completed successfully! ✨`);
    console.log("The collection now has:");
    console.log("- Updated metadata with website and X links");
    console.log(`- Collection URL set to: https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}`);
    console.log(`- Verified creator set to: ${wallet.address}`);
    console.log("\nView on Universal.page:");
    console.log(`https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}`);
    console.log("\nView on Universal Everything:");
    console.log(`https://universaleverything.io/collection/${CONTRACT_ADDRESS}?network=testnet`);
    console.log("\nView a token:");
    console.log(`https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}/3`);
    
  } catch (error) {
    console.error("Error updating collection:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 