// Script specifically for setting the verified creator for LSP8LoogiesBasic
const ethers = require("ethers");
require("dotenv").config();

// Constants
const CONTRACT_ADDRESS = "0x1A591150667Ca86De0f8d48ada752115c2587826";
const RPC_URL = "https://rpc.testnet.lukso.network";

// LSP4 Creator key
const LSP4_CREATORS_KEY = "0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7";

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
    console.log("\n🚀 SETTING VERIFIED CREATOR FOR LSP8 LOOGIES BASIC 🚀");
    console.log("===================================================");
    
    // Set the creator with proper hexadecimal formatting
    // Format: [ Address (20 bytes) | Interface ID (4 bytes) ]
    
    // For LSP0 ERC725Account interface ID
    const LSP0_INTERFACE_ID = "0x3a271e58";
    
    // Pad the address to ensure it's 20 bytes with 0x prefix
    const paddedAddress = wallet.address.toLowerCase();
    console.log(`Using address: ${paddedAddress} as verified creator`);
    console.log(`Using interface ID: ${LSP0_INTERFACE_ID}`);
    
    // Format creator value for LSP4DigitalAsset
    // The value must be a byte array of [ Address | InterfaceID ]
    const creatorValue = ethers.concat([
      ethers.getBytes(paddedAddress),
      ethers.getBytes(LSP0_INTERFACE_ID)
    ]);
    
    console.log(`Creator value (hex): ${ethers.hexlify(creatorValue)}`);
    console.log(`Creator data key: ${LSP4_CREATORS_KEY}`);
    
    console.log("\nSetting creator information...");
    const creatorTx = await contract.setData(LSP4_CREATORS_KEY, creatorValue);
    console.log(`Transaction hash: ${creatorTx.hash}`);
    console.log("Waiting for transaction confirmation...");
    await creatorTx.wait();
    
    console.log(`\n✅ Creator information set successfully!`);
    console.log(`\nVerified creator set to: ${wallet.address}`);
    console.log(`Transaction hash: ${creatorTx.hash}`);
    console.log("\nView on Universal.page:");
    console.log(`https://universal.page/collections/lukso-testnet/${CONTRACT_ADDRESS}`);
    console.log("\nView on Universal Everything:");
    console.log(`https://universaleverything.io/collection/${CONTRACT_ADDRESS}?network=testnet`);
    
  } catch (error) {
    console.error("Error setting creator:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  }); 