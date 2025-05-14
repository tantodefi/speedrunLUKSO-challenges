import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to inspect the SVG generated for a token to determine why
 * animations aren't showing correctly in the Universal Explorer
 */
async function main() {
  console.log("\n=== INSPECTING TOKEN SVG ON LSP8LOOGIESUPDATED ===");
  
  // Get signers
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  
  // Use the contract address from deployment
  const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
  console.log(`Target contract: ${contractAddress}`);
  
  // Get contract instance
  const LSP8Loogies = await ethers.getContractAt("LSP8LoogiesUpdated", contractAddress);
  
  try {
    // Verify we have the right contract by checking the name
    const name = await LSP8Loogies.name();
    console.log(`Contract name: ${name}`);
    
    // Get token count
    const totalSupply = await LSP8Loogies.totalSupply();
    console.log(`Total supply: ${totalSupply.toString()}`);
    
    if (totalSupply.toString() === "0") {
      console.log("No tokens minted yet. Please mint a token first.");
      return;
    }
    
    // Get the tokenId - assume we want the first token
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`Inspecting token ID: ${tokenId}`);
    
    // Check if token exists
    try {
      const tokenOwner = await LSP8Loogies.tokenOwnerOf(tokenId);
      console.log(`Token owner: ${tokenOwner}`);
    } catch (error) {
      console.error("Token does not exist or error fetching owner:", error);
      return;
    }
    
    // Get metadata directly from contract
    console.log("Fetching LSP4 metadata for token...");
    const LSP4_METADATA_KEY = "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e";
    const metadataBytes = await LSP8Loogies.getData(LSP4_METADATA_KEY);
    console.log(`Metadata bytes length: ${metadataBytes.length}`);
    
    // Look at the first few bytes to determine if it's a LUKSO verification format (0x00006f357c6a0020...)
    if (metadataBytes.startsWith("0x00006f357c6a0020")) {
      console.log("Metadata is in LUKSO verification format");
      
      // Extract the actual data URI - skip the first 10 bytes (prefix) and 32 bytes (hash)
      const dataURI = ethers.toUtf8String(metadataBytes.slice(74));
      console.log(`Data URI prefix: ${dataURI.substring(0, 30)}...`);
      
      if (dataURI.startsWith("data:application/json;base64,")) {
        // Extract and decode the Base64 encoded JSON
        const base64Data = dataURI.replace("data:application/json;base64,", "");
        const jsonData = Buffer.from(base64Data, "base64").toString();
        
        console.log("=== TOKEN METADATA ===");
        console.log(jsonData.substring(0, 200) + "...");
        
        // Parse the JSON to extract the SVG
        try {
          const metadata = JSON.parse(jsonData);
          
          // Check for SVG in LSP4Metadata.images
          if (metadata.LSP4Metadata && 
              metadata.LSP4Metadata.images && 
              metadata.LSP4Metadata.images[0] && 
              metadata.LSP4Metadata.images[0][0] &&
              metadata.LSP4Metadata.images[0][0].url) {
            
            const svgUrl = metadata.LSP4Metadata.images[0][0].url;
            console.log(`SVG URL: ${svgUrl.substring(0, 30)}...`);
            
            if (svgUrl.startsWith("data:image/svg+xml;base64,")) {
              // Extract and decode the Base64 encoded SVG
              const base64Svg = svgUrl.replace("data:image/svg+xml;base64,", "");
              const svgData = Buffer.from(base64Svg, "base64").toString();
              
              // Save the SVG to a file
              const outputDir = path.join(__dirname, "../debug");
              if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
              }
              
              const svgFile = path.join(outputDir, `token_${tokenId.substring(0, 10)}.svg`);
              fs.writeFileSync(svgFile, svgData);
              console.log(`SVG saved to: ${svgFile}`);
              
              // Also create an HTML file to view the SVG with proper rendering
              const htmlContent = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Token ${tokenId.substring(0, 10)} SVG Preview</title>
                    <style>
                      body { 
                        background-color: #222; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0; 
                        font-family: Arial, sans-serif;
                        color: white;
                      }
                      .container { 
                        text-align: center;
                      }
                      pre {
                        background: #000;
                        color: #0f0;
                        padding: 10px;
                        border-radius: 5px;
                        max-height: 300px;
                        overflow: auto;
                        text-align: left;
                        font-size: 12px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>Token ${tokenId.substring(0, 10)} SVG Preview</h1>
                      ${svgData}
                      <h2>SVG Source Code</h2>
                      <pre>${svgData.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    </div>
                  </body>
                </html>
              `;
              
              const htmlFile = path.join(outputDir, `token_${tokenId.substring(0, 10)}.html`);
              fs.writeFileSync(htmlFile, htmlContent);
              console.log(`HTML preview saved to: ${htmlFile}`);
              
              // Check for animation issues - look for CSS animation styles
              if (svgData.includes("@keyframes") || svgData.includes("animation")) {
                console.log("✅ SVG contains animation styles");
                
                // Check specifically for the matrix character animations
                if (svgData.includes("matrix-char") && svgData.includes("animation: fade")) {
                  console.log("✅ Matrix character animations found");
                } else {
                  console.log("❌ Matrix character animations might be missing or different");
                }
              } else {
                console.log("❌ SVG does not contain animation styles");
              }
            } else {
              console.log("SVG URL is not in base64 format");
            }
          } else {
            console.log("Could not find image URL in metadata");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    } else {
      console.log("Metadata is not in the expected format");
      console.log(`Raw metadata: ${metadataBytes}`);
    }
    
    console.log("\n✅ Inspection complete!");
    console.log(`Check the SVG in your browser to see if animations work locally.`);
    console.log(`Note: Universal Explorer may have limitations displaying SVG animations.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 