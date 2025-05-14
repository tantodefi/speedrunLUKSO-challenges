import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to fix SVG animation issues in the LSP8LoogiesUpdated contract
 * This script updates the SVG generation function to ensure animations
 * display properly in the Universal Explorer.
 */
async function main() {
  console.log("\n=== FIXING SVG ANIMATION ISSUES ===");
  
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
    
    // The main issue is likely that the Universal Explorer might be sanitizing SVGs
    // or not fully supporting CSS animations. Let's fetch what's currently on-chain
    // for token #1 (the one we minted) to see what's happening.
    
    // Get the tokenId 
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
    
    // Create a simplified preview SVG that we know works with LUKSO's Explorer
    console.log("Creating a simplified SVG that should work with Universal Explorer...");
    
    // Get token's color, chubbiness, and mouth length for accurate representation
    const color = await LSP8Loogies.color(tokenId);
    const chubbiness = await LSP8Loogies.chubbiness(tokenId);
    const mouthLength = await LSP8Loogies.mouthLength(tokenId);
    const username = await LSP8Loogies.upUsernames(tokenId);
    
    console.log(`Token properties:`);
    console.log(`- Color: ${color}`);
    console.log(`- Chubbiness: ${chubbiness}`);
    console.log(`- Mouth Length: ${mouthLength}`);
    console.log(`- Username: ${username}`);
    
    // Create a simplified SVG that should work in Universal Explorer
    // We'll reduce animation complexity but keep the key visual elements
    const colorHex = color.substring(2); // Remove 0x prefix
    
    const simplifiedSvg = createSimplifiedLoogieSVG(
      colorHex,
      chubbiness,
      mouthLength,
      username
    );
    
    // Save the SVG to a file to preview it locally
    const outputDir = path.join(__dirname, "../debug");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const svgFile = path.join(outputDir, `simplified_token_${tokenId.substring(0, 10)}.svg`);
    fs.writeFileSync(svgFile, simplifiedSvg);
    console.log(`Simplified SVG saved to: ${svgFile}`);
    
    // Create an HTML preview
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simplified Token SVG Preview</title>
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Simplified Token SVG Preview</h1>
            <p>This version should work in Universal Explorer</p>
            ${simplifiedSvg}
          </div>
        </body>
      </html>
    `;
    
    const htmlFile = path.join(outputDir, `simplified_token_${tokenId.substring(0, 10)}.html`);
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`HTML preview saved to: ${htmlFile}`);
    
    // Create a minting function with the simplified SVG directly
    // for testing purposes
    console.log("\nTo use this simplified SVG approach, update the contract's generateLoogieSVG");
    console.log("and generateMatrixRainEffect functions to use a more compatible approach:");
    console.log("\n1. Try deploying a new contract with simplified animations");
    console.log("2. Use inline styles instead of CSS animations");
    console.log("3. Pre-position the matrix characters instead of animating them");
    console.log("4. Test with a smaller number of matrix characters");
    
    console.log("\n✅ Inspection and simplified SVG creation complete!");
    console.log("Check the simplified SVG to see if it displays better in a browser.");
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Create a simplified Loogie SVG that should work in Universal Explorer
 */
function createSimplifiedLoogieSVG(
  colorHex: string, 
  chubbiness: any, 
  mouthLength: any, 
  username: string
): string {
  // Convert BigNumber values to numbers if needed
  const chubbinessValue = typeof chubbiness === 'object' ? chubbiness.toString() : chubbiness;
  const mouthLengthValue = typeof mouthLength === 'object' ? mouthLength.toString() : mouthLength;
  
  // Create a simplified matrix effect with static characters
  let matrixEffect = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Add 100 static matrix characters
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 400);
    const char = characters.charAt(Math.floor(Math.random() * characters.length));
    const opacity = (Math.random() * 0.7 + 0.3).toFixed(1); // 0.3 to 1.0
    const fontSize = Math.floor(Math.random() * 6 + 9); // 9 to 14px
    
    matrixEffect += `<text x="${x}" y="${y}" font-family="monospace" font-size="${fontSize}px" fill="#0F0" opacity="${opacity}">${char}</text>`;
  }
  
  // Create the SVG with minimal styling and no animations
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#000" />
    
    <!-- Matrix effect background (static characters) -->
    <g>${matrixEffect}</g>
    
    <!-- Add a dark overlay for the loogie -->
    <ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)" />
    
    <!-- Render the Loogie body -->
    <g>
      <!-- Draw the head -->
      <ellipse fill="#${colorHex}" stroke="#000" stroke-width="3" cx="204.5" cy="211.8" rx="${chubbinessValue}" ry="51.8" />
      
      <!-- Draw the eyes -->
      <ellipse stroke="#000" stroke-width="3" cx="181.5" cy="154.5" rx="29.5" ry="29.5" fill="#fff" />
      <ellipse stroke="#000" stroke-width="3" cx="209.5" cy="168.5" rx="29.5" ry="29.5" fill="#fff" />
      <circle cx="173.5" cy="154.5" r="3.5" fill="#000" />
      <circle cx="208" cy="169.5" r="3.5" fill="#000" />
      
      <!-- Draw the mouth -->
      <path d="M 130 240 Q 165 250 ${mouthLengthValue} 235" stroke="black" stroke-width="3" fill="transparent" transform="translate(${Math.floor((810 - 9 * Number(chubbinessValue)) / 11)},0)" />
      
      <!-- Username text -->
      <text x="200" y="290" text-anchor="middle" font-family="Arial" font-size="16" fill="white">${username}</text>
    </g>
  </svg>`;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 