import { ethers } from "hardhat";

/**
 * Script to mint tokens from the LSP8LoogiesEnhanced contract
 * Run with: npx hardhat run scripts/mintLoogiesToken.ts --network luksoTestnet
 */
async function main() {
  console.log("\n=== MINTING TOKEN FROM LSP8LOOGIESENHANCED CONTRACT ===");
  
  // Get contract address from environment variable or use default
  const contractAddress = process.env.LSP8_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  if (contractAddress === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Please set the LSP8_CONTRACT_ADDRESS environment variable");
    console.log("Example: export LSP8_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890");
    return;
  }
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Create minimal ABI for minting and checking status
  const minimalABI = [
    "function mintItem() public payable returns (bytes32)",
    "function totalSupply() public view returns (uint256)",
    "function tokenSupplyCap() public view returns (uint256)",
    "function publicMintSet() public view returns (bool)",
    "function setMintStatus(bool _publicMintSet) external",
    "function PRICE() public view returns (uint256)"
  ];
  
  // Connect to the contract
  const lsp8LoogiesEnhanced = new ethers.Contract(contractAddress, minimalABI, signer);
  
  try {
    // Check if public minting is enabled
    const publicMintEnabled = await lsp8LoogiesEnhanced.publicMintSet();
    if (!publicMintEnabled) {
      console.log("⚠️ Public minting is not enabled. Enabling now...");
      const enableTx = await lsp8LoogiesEnhanced.setMintStatus(true);
      await enableTx.wait();
      console.log("✅ Public minting enabled");
    } else {
      console.log("✅ Public minting is already enabled");
    }
    
    // Get current total supply
    const totalSupply = await lsp8LoogiesEnhanced.totalSupply();
    const maxSupply = await lsp8LoogiesEnhanced.tokenSupplyCap();
    console.log(`Current supply: ${totalSupply} / ${maxSupply}`);
    
    if (totalSupply >= maxSupply) {
      console.log("❌ Maximum supply reached, cannot mint more tokens");
      return;
    }
    
    // Get minting price
    const price = await lsp8LoogiesEnhanced.PRICE();
    console.log(`Minting price: ${ethers.formatEther(price)} ETH`);
    
    // Mint a new token
    console.log("Minting new token...");
    const mintTx = await lsp8LoogiesEnhanced.mintItem({
      value: price,
      gasLimit: 500000
    });
    
    console.log(`Transaction hash: ${mintTx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await mintTx.wait();
    console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
    
    // Try to extract token ID from events
    const transferEvent = receipt?.logs.find((log: any) => 
      log.topics[0] === ethers.id("Transfer(address,address,bytes32,bool,bytes)")
    );
    
    if (transferEvent) {
      const tokenId = transferEvent.topics[3];
      console.log(`✅ Successfully minted token ID: ${tokenId}`);
      
      // Add token URL for viewing in Universal Explorer
      console.log(`\nView your new token on Universal Explorer:`);
      console.log(`https://universalexplorer.io/collections/${contractAddress}/${tokenId.replace(/^0x0+/, '')}?network=testnet`);
    } else {
      // If we can't find the event, just show the collection page
      console.log("✅ Token minted successfully");
      console.log(`\nView collection on Universal Explorer:`);
      console.log(`https://universalexplorer.io/collections/${contractAddress}?network=testnet`);
    }
    
    // Get updated total supply
    const newTotalSupply = await lsp8LoogiesEnhanced.totalSupply();
    console.log(`Updated supply: ${newTotalSupply} / ${maxSupply}`);
    
  } catch (error: any) {
    console.error("Error minting token:", error?.message || error);
    
    // Provide user-friendly error messages
    if (error?.message?.includes("insufficient funds")) {
      console.log("\n⚠️ You don't have enough funds to mint. Make sure you have enough LYX for the mint price and gas fees.");
    } else if (error?.message?.includes("NOT ENOUGH")) {
      console.log("\n⚠️ Sent value is less than the required mint price.");
    } else if (error?.message?.includes("MINT LIMIT REACHED")) {
      console.log("\n⚠️ You've reached the maximum number of tokens you can mint from this address.");
    }
  }
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 