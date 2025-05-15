import { ethers } from "hardhat";

async function main() {
  console.log("=== Testing LSP8LoogiesBasic Contract ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  try {
    // Get the deployed contract instance
    const contract = await ethers.getContract("LSP8LoogiesBasic", signer);
    console.log(`LSP8LoogiesBasic contract: ${contract.target}`);
    
    // Check contract functions
    // @ts-ignore - Will be available at runtime
    const price = await contract.price();
    console.log(`Contract price: ${ethers.formatEther(price)} ETH`);
    
    // @ts-ignore - Will be available at runtime
    const limit = await contract.LIMIT();
    console.log(`Contract limit: ${limit} tokens`);
    
    // Mint a token for testing
    console.log("\nMinting a token for testing...");
    // @ts-ignore - Will be available at runtime
    const mintTx = await contract.mintItem({
      value: price
    });
    const receipt = await mintTx.wait();
    console.log(`Mint transaction hash: ${receipt?.hash}`);
    
    // Get total supply (there should be at least 1 token now)
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    
    // Get token owner
    try {
      // @ts-ignore - Will be available at runtime
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`\nToken owner: ${owner}`);
      
      // Get token attributes
      // @ts-ignore - Will be available at runtime
      const tokenColor = await contract.color(tokenId);
      console.log(`Token color: ${tokenColor}`);
      
      // @ts-ignore - Will be available at runtime
      const tokenChubbiness = await contract.chubbiness(tokenId);
      console.log(`Token chubbiness: ${tokenChubbiness}`);
      
      // @ts-ignore - Will be available at runtime
      const tokenMouthLength = await contract.mouthLength(tokenId);
      console.log(`Token mouth length: ${tokenMouthLength}`);
      
      // Get SVG (calling the public view function)
      // @ts-ignore - Will be available at runtime
      const svg = await contract.renderTokenById(tokenId);
      console.log(`\nToken SVG snippet: ${svg.substring(0, 100)}...`);
      
      // Test metadata - LSP4 key
      const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
      
      // Get token metadata via getData
      console.log("\nFetching token metadata...");
      
      // Generate the LSP8MetadataToken:[tokenId]:[dataKey] key
      const tokenDataKey = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes("LSP8MetadataToken"),
          tokenId,
          LSP4_METADATA_KEY
        ])
      );
      
      // @ts-ignore - Will be available at runtime
      const metadata = await contract.getData(tokenDataKey);
      console.log(`Metadata retrieved: ${metadata.slice(0, 100)}...`);
      
      // Verify metadata format (should start with LUKSO prefix 0x00006f357c6a0020)
      if (metadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected");
        
        // Extract base64 encoded part
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const encodedData = metadata.slice(prefixLength);
        
        if (encodedData.includes("data:application/json;base64,")) {
          const base64Start = encodedData.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = encodedData.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Check for SVG in metadata
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nImage URL found in metadata:");
                console.log(`${imageUrl.substring(0, 100)}...`);
                
                // Decode SVG if base64 encoded
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded SVG from metadata:");
                  console.log(`${svgString.substring(0, 300)}...`);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
          }
        } else {
          console.log("No base64 JSON data found in metadata");
        }
      } else {
        console.log("❌ Incorrect metadata format");
      }
      
    } catch (error: any) {
      console.error(`Error getting token details: ${error.message}`);
    }
    
  } catch (error: any) {
    console.log(`Contract not deployed or error accessing it: ${error.message}`);
    console.log("\nTo deploy the contract, run:");
    console.log("npx hardhat deploy --tags LSP8LoogiesBasic");
  }

  console.log("\n=== Test Complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 

async function main() {
  console.log("=== Testing LSP8LoogiesBasic Contract ===");
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  try {
    // Get the deployed contract instance
    const contract = await ethers.getContract("LSP8LoogiesBasic", signer);
    console.log(`LSP8LoogiesBasic contract: ${contract.target}`);
    
    // Check contract functions
    // @ts-ignore - Will be available at runtime
    const price = await contract.price();
    console.log(`Contract price: ${ethers.formatEther(price)} ETH`);
    
    // @ts-ignore - Will be available at runtime
    const limit = await contract.LIMIT();
    console.log(`Contract limit: ${limit} tokens`);
    
    // Mint a token for testing
    console.log("\nMinting a token for testing...");
    // @ts-ignore - Will be available at runtime
    const mintTx = await contract.mintItem({
      value: price
    });
    const receipt = await mintTx.wait();
    console.log(`Mint transaction hash: ${receipt?.hash}`);
    
    // Get total supply (there should be at least 1 token now)
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    
    // Get token owner
    try {
      // @ts-ignore - Will be available at runtime
      const owner = await contract.tokenOwnerOf(tokenId);
      console.log(`\nToken owner: ${owner}`);
      
      // Get token attributes
      // @ts-ignore - Will be available at runtime
      const tokenColor = await contract.color(tokenId);
      console.log(`Token color: ${tokenColor}`);
      
      // @ts-ignore - Will be available at runtime
      const tokenChubbiness = await contract.chubbiness(tokenId);
      console.log(`Token chubbiness: ${tokenChubbiness}`);
      
      // @ts-ignore - Will be available at runtime
      const tokenMouthLength = await contract.mouthLength(tokenId);
      console.log(`Token mouth length: ${tokenMouthLength}`);
      
      // Get SVG (calling the public view function)
      // @ts-ignore - Will be available at runtime
      const svg = await contract.renderTokenById(tokenId);
      console.log(`\nToken SVG snippet: ${svg.substring(0, 100)}...`);
      
      // Test metadata - LSP4 key
      const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
      
      // Get token metadata via getData
      console.log("\nFetching token metadata...");
      
      // Generate the LSP8MetadataToken:[tokenId]:[dataKey] key
      const tokenDataKey = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes("LSP8MetadataToken"),
          tokenId,
          LSP4_METADATA_KEY
        ])
      );
      
      // @ts-ignore - Will be available at runtime
      const metadata = await contract.getData(tokenDataKey);
      console.log(`Metadata retrieved: ${metadata.slice(0, 100)}...`);
      
      // Verify metadata format (should start with LUKSO prefix 0x00006f357c6a0020)
      if (metadata.startsWith("0x00006f357c6a0020")) {
        console.log("✅ Correct LUKSO metadata prefix detected");
        
        // Extract base64 encoded part
        const prefixLength = 42; // 0x00006f357c6a0020 + 32 bytes hash
        const encodedData = metadata.slice(prefixLength);
        
        if (encodedData.includes("data:application/json;base64,")) {
          const base64Start = encodedData.indexOf("data:application/json;base64,") + 29;
          const base64Metadata = encodedData.slice(base64Start);
          
          try {
            // Convert hex string to bytes, then decode base64
            const hexBytes = ethers.toBeArray(base64Metadata);
            const jsonString = Buffer.from(hexBytes).toString('utf8');
            console.log("\nDecoded metadata JSON:");
            
            try {
              const json = JSON.parse(jsonString);
              console.log(JSON.stringify(json, null, 2));
              
              // Check for SVG in metadata
              if (json.LSP4Metadata && json.LSP4Metadata.images && json.LSP4Metadata.images[0] && json.LSP4Metadata.images[0][0]) {
                const imageUrl = json.LSP4Metadata.images[0][0].url;
                console.log("\nImage URL found in metadata:");
                console.log(`${imageUrl.substring(0, 100)}...`);
                
                // Decode SVG if base64 encoded
                if (imageUrl.includes("data:image/svg+xml;base64,")) {
                  const svgBase64 = imageUrl.slice(imageUrl.indexOf("base64,") + 7);
                  const svgString = Buffer.from(svgBase64, 'base64').toString('utf8');
                  console.log("\nDecoded SVG from metadata:");
                  console.log(`${svgString.substring(0, 300)}...`);
                }
              }
            } catch (e) {
              console.log("Error parsing JSON:", e);
              console.log("Raw decoded content:", jsonString);
            }
          } catch (e) {
            console.log("Error decoding base64:", e);
          }
        } else {
          console.log("No base64 JSON data found in metadata");
        }
      } else {
        console.log("❌ Incorrect metadata format");
      }
      
    } catch (error: any) {
      console.error(`Error getting token details: ${error.message}`);
    }
    
  } catch (error: any) {
    console.log(`Contract not deployed or error accessing it: ${error.message}`);
    console.log("\nTo deploy the contract, run:");
    console.log("npx hardhat deploy --tags LSP8LoogiesBasic");
  }

  console.log("\n=== Test Complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 