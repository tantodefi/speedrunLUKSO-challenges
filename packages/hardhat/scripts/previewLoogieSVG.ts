import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to preview the enhanced SVG generation with Matrix animations
 * based on the same algorithm used in the LSP8LoogiesUpdated contract.
 */
async function main() {
  console.log("\n=== GENERATING ENHANCED MATRIX LOOGIES PREVIEW ===");
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, "../preview");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Try to get real token data from the contract
  console.log("Attempting to fetch real token data from the contract...");
  try {
    // Contract address from deployment
    const contractAddress = "0xcE9aB3dA3e73A8EeaADa34d68C06eb4b0c3Dd760";
    
    // Create minimal interface to read token data
    const tokenDataABI = [
      "function tokenOwnerOf(bytes32 tokenId) public view returns (address)",
      "function color(bytes32 tokenId) public view returns (bytes3)",
      "function chubbiness(bytes32 tokenId) public view returns (uint256)",
      "function mouthLength(bytes32 tokenId) public view returns (uint256)",
      "function upUsernames(bytes32 tokenId) public view returns (string)",
      "function isUniversalProfile(address account) public view returns (bool)"
    ];
    
    // Connect to contract
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, tokenDataABI, signer);
    
    // Token ID for the first token (from checkTokenMetadata)
    const tokenId = "0x0000000000000000000000000000000000000000000000000000000000000001";
    console.log(`Fetching data for token ID: ${tokenId}`);
    
    // Get token data
    const owner = await contract.tokenOwnerOf(tokenId);
    const colorBytes = await contract.color(tokenId);
    const chubbiness = await contract.chubbiness(tokenId);
    const mouthLength = await contract.mouthLength(tokenId);
    const username = await contract.upUsernames(tokenId);
    const isUP = await contract.isUniversalProfile(owner);
    
    // Convert bytes3 color to hex string without 0x prefix
    const colorHex = colorBytes.substring(2);
    
    console.log(`Found token with:`);
    console.log(`- Owner: ${owner}`);
    console.log(`- Color: #${colorHex}`);
    console.log(`- Chubbiness: ${chubbiness}`);
    console.log(`- Mouth Length: ${mouthLength}`);
    console.log(`- Username: ${username}`);
    console.log(`- Is Universal Profile: ${isUP}`);
    
    // Generate SVG preview for the real token
    console.log("Generating preview for the real token...");
    
    // Create SVGs with both original and enhanced methods
    const originalSvg = createLoogieSVG(
      colorHex,
      Number(chubbiness),
      Number(mouthLength),
      username,
      isUP,
      tokenId
    );
    
    const enhancedSvg = createEnhancedLoogieSVG(
      colorHex,
      Number(chubbiness),
      Number(mouthLength),
      username,
      isUP,
      tokenId
    );
    
    // Save SVGs
    const realTokenOriginalSvgFile = path.join(outputDir, "real_token_original.svg");
    fs.writeFileSync(realTokenOriginalSvgFile, originalSvg);
    console.log(`Original SVG saved to: ${realTokenOriginalSvgFile}`);
    
    const realTokenEnhancedSvgFile = path.join(outputDir, "real_token_enhanced.svg");
    fs.writeFileSync(realTokenEnhancedSvgFile, enhancedSvg);
    console.log(`Enhanced SVG saved to: ${realTokenEnhancedSvgFile}`);
    
    // Create comparison HTML
    const realComparisonHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Real Token Comparison</title>
          <style>
            body { 
              background-color: #222; 
              font-family: Arial, sans-serif;
              color: white;
              margin: 20px;
            }
            h1, h2 { 
              text-align: center;
            }
            .comparison {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 20px;
              margin-top: 20px;
            }
            .version {
              text-align: center;
            }
            pre {
              background: rgba(0,0,0,0.3);
              padding: 15px;
              border-radius: 5px;
              text-align: left;
              max-width: 400px;
              margin: 0 auto;
              overflow: auto;
            }
            .token-info {
              background: rgba(0,0,0,0.3);
              padding: 15px;
              border-radius: 5px;
              margin: 20px auto;
              max-width: 500px;
            }
          </style>
        </head>
        <body>
          <h1>Real Token Comparison</h1>
          <h2>Original vs Updated Matrix Effect</h2>
          
          <div class="token-info">
            <h3>Token Properties:</h3>
            <pre>
Token ID: ${tokenId}
Owner: ${owner}
Color: #${colorHex}
Chubbiness: ${chubbiness}
Mouth Length: ${mouthLength}
Username: ${username}
Is Universal Profile: ${isUP}
            </pre>
          </div>
          
          <div class="comparison">
            <div class="version">
              <h3>Original Version</h3>
              <p>Should match what you see in Universal Explorer before the update</p>
              ${originalSvg}
            </div>
            
            <div class="version">
              <h3>Enhanced Version</h3>
              <p>Should match what you see in Universal Explorer after the update</p>
              ${enhancedSvg}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p>View your token in Universal Explorer: 
              <a href="https://universalexplorer.io/collections/${contractAddress}/${tokenId.replace(/^0x0+/, '')}?network=testnet" style="color: #0f0; text-decoration: none;">
                https://universalexplorer.io/collections/${contractAddress}/${tokenId.replace(/^0x0+/, '')}?network=testnet
              </a>
            </p>
          </div>
        </body>
      </html>
    `;
    
    const realComparisonFile = path.join(outputDir, "real_token_comparison.html");
    fs.writeFileSync(realComparisonFile, realComparisonHtml);
    console.log(`Real token comparison saved to: ${realComparisonFile}`);
    
  } catch (error) {
    console.error("Error fetching real token data:", error);
    console.log("Continuing with sample previews...");
  }
  
  // Generate multiple example SVGs with different settings
  console.log("Generating sample SVG files with full animations...");
  
  // Sample data for tokens
  const sampleTokens = [
    { id: 1, color: "ff5500", chubbiness: 40, mouthLength: 200, username: "luksonaut", isUP: false },
    { id: 2, color: "00ff55", chubbiness: 60, mouthLength: 220, username: "luksodev", isUP: true },
    { id: 3, color: "5500ff", chubbiness: 50, mouthLength: 210, username: "matrix", isUP: false }
  ];
  
  // Create a preview for each sample token
  for (const token of sampleTokens) {
    console.log(`Creating preview for token #${token.id}...`);
    
    // Generate SVG with enhanced matrix effect
    const svg = createEnhancedLoogieSVG(
      token.color,
      token.chubbiness,
      token.mouthLength,
      token.username,
      token.isUP,
      `token${token.id}`
    );
    
    // Save the SVG to a file
    const svgFile = path.join(outputDir, `loogie_enhanced_${token.id}.svg`);
    fs.writeFileSync(svgFile, svg);
    console.log(`  SVG saved to: ${svgFile}`);
    
    // Also save the full HTML for easy viewing with CSS animations
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enhanced Loogie #${token.id} Preview</title>
          <style>
            body { 
              background-color: #222; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
            }
            .container { 
              text-align: center;
            }
            h1 { 
              color: #fff; 
              font-family: Arial, sans-serif; 
            }
            p {
              color: #ccc;
              font-family: Arial, sans-serif;
            }
            a {
              color: #0f0;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Enhanced Loogie #${token.id} Preview</h1>
            <p>With full Matrix rain animation effects</p>
            ${svg}
            <p>Note: Animations will work best in a modern browser</p>
            <p><a href="loogie_comparison_${token.id}.html">View side-by-side comparison</a></p>
          </div>
        </body>
      </html>
    `;
    
    const htmlFile = path.join(outputDir, `loogie_enhanced_${token.id}.html`);
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`  HTML preview saved to: ${htmlFile}`);
    
    // Also create a comparison HTML with both original and enhanced versions
    const originalSvg = createLoogieSVG(
      token.color,
      token.chubbiness,
      token.mouthLength,
      token.username,
      token.isUP,
      `token${token.id}`
    );
    
    const comparisonHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loogie #${token.id} Comparison</title>
          <style>
            body { 
              background-color: #222; 
              font-family: Arial, sans-serif;
              color: white;
              margin: 20px;
            }
            h1, h2 { 
              text-align: center;
            }
            .comparison {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 20px;
              margin-top: 20px;
            }
            .version {
              text-align: center;
            }
            p {
              color: #ccc;
            }
            .features {
              max-width: 800px;
              margin: 30px auto;
              background: rgba(0,0,0,0.3);
              padding: 20px;
              border-radius: 8px;
            }
            .features h3 {
              color: #0f0;
            }
            ul {
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>Loogie #${token.id} Comparison</h1>
          <h2>Original vs Enhanced Matrix Effect</h2>
          
          <div class="comparison">
            <div class="version">
              <h3>Original Version</h3>
              <p>Simple static matrix effect</p>
              ${originalSvg}
            </div>
            
            <div class="version">
              <h3>Enhanced Version</h3>
              <p>With animations and improved styling</p>
              ${svg}
            </div>
          </div>
          
          <div class="features">
            <h3>Enhancements in the Updated Version:</h3>
            <ul>
              <li>200 matrix characters (vs 100 in original) for more density</li>
              <li>Added falling animation with 4 different speed groups</li>
              <li>Added fade-in/fade-out animations for a more dynamic effect</li>
              <li>Improved character distribution with section-based clustering</li>
              <li>Added A-Z characters in addition to 0-9 for more variety</li>
              <li>Variable font sizes (9-14px) for depth perception</li>
              <li>Better background blur effect for the Loogie</li>
              <li>Comic Sans font for the username text (when available)</li>
              <li>${token.isUP ? 'Purple' : 'Green'} matrix color ${token.isUP ? '(for Universal Profile owners)' : '(for regular addresses)'}</li>
            </ul>
          </div>
        </body>
      </html>
    `;
    
    const comparisonFile = path.join(outputDir, `loogie_comparison_${token.id}.html`);
    fs.writeFileSync(comparisonFile, comparisonHtml);
    console.log(`  Comparison preview saved to: ${comparisonFile}`);
  }
  
  console.log("\n✅ Preview generation complete!");
  console.log(`Open the HTML files in your browser to see the SVGs with animations:\n${outputDir}`);
}

/**
 * Create a Loogie SVG with original static Matrix rain background
 */
function createLoogieSVG(
  colorHex: string,
  chubbiness: number,
  mouthLength: number,
  username: string,
  isUP: boolean,
  seed: string
): string {
  // Generate the matrix effect
  const matrixEffect = generateSimplifiedMatrixEffect(seed);
  const matrixColor = isUP ? "#FF00FF" : "#0F0"; // Purple for UPs, green for regular addresses
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><style>
      .matrix-char { font-family: monospace; fill: ${matrixColor}; opacity: 0.8; }
      .username { font-family: sans-serif; font-size: 16px; fill: white; font-weight: bold; }
    </style></defs>
    <rect width="400" height="400" fill="#000" />
    <g class="matrix-background">
      ${matrixEffect}
    </g>
    <ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)" />
    <g>
      <ellipse fill="#${colorHex}" stroke="#000" stroke-width="3" cx="204.5" cy="211.8" rx="${chubbiness}" ry="51.8" />
      <ellipse stroke="#000" stroke-width="3" cx="181.5" cy="154.5" rx="29.5" ry="29.5" fill="#fff" />
      <ellipse stroke="#000" stroke-width="3" cx="209.5" cy="168.5" rx="29.5" ry="29.5" fill="#fff" />
      <circle cx="173.5" cy="154.5" r="3.5" fill="#000" />
      <circle cx="208" cy="169.5" r="3.5" fill="#000" />
      <path d="M 130 240 Q 165 250 ${mouthLength} 235" stroke="black" stroke-width="3" fill="transparent" transform="translate(${Math.floor((810 - 9 * chubbiness) / 11)},0)" />
      <text x="200" y="290" text-anchor="middle" class="username">${username}</text>
    </g>
  </svg>`;
  
  return svg;
}

/**
 * Create an enhanced Loogie SVG with animated Matrix rain background
 */
function createEnhancedLoogieSVG(
  colorHex: string,
  chubbiness: number,
  mouthLength: number,
  username: string,
  isUP: boolean,
  seed: string
): string {
  // Generate the matrix effect with animations
  const matrixEffect = generateEnhancedMatrixEffect(seed);
  const matrixColor = isUP ? "#FF00FF" : "#0F0"; // Purple for UPs, green for regular addresses
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <style>
        @font-face {
          font-family: "Comic Sans MS";
          src: url("https://fonts.cdnfonts.com/css/comic-sans");
        }
        .username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; }
        .matrix-char { font-family: monospace; fill: ${matrixColor}; opacity: 0.8; }
        @keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }
        @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }
      </style>
    </defs>
    <rect width="400" height="400" fill="rgba(0,0,0,0.85)" />
    <g class="matrix-background">
      ${matrixEffect}
    </g>
    <g class="loogie-container">
      <ellipse cx="200" cy="200" rx="120" ry="120" fill="rgba(0,0,0,0.5)" filter="blur(20px)" />
      <g>
        <ellipse fill="#${colorHex}" stroke="#000" stroke-width="3" cx="204.5" cy="211.8" rx="${chubbiness}" ry="51.8" />
        <ellipse stroke="#000" stroke-width="3" cx="181.5" cy="154.5" rx="29.5" ry="29.5" fill="#fff" />
        <ellipse stroke="#000" stroke-width="3" cx="209.5" cy="168.5" rx="29.5" ry="29.5" fill="#fff" />
        <circle cx="173.5" cy="154.5" r="3.5" fill="#000" />
        <circle cx="208" cy="169.5" r="3.5" fill="#000" />
        <path d="M 130 240 Q 165 250 ${mouthLength} 235" stroke="black" stroke-width="3" fill="transparent" transform="translate(${Math.floor((810 - 9 * chubbiness) / 11)},0)" />
        <text x="200" y="290" text-anchor="middle" class="username">${username}</text>
      </g>
    </g>
  </svg>`;
  
  return svg;
}

/**
 * Generate a simplified static matrix rain effect
 */
function generateSimplifiedMatrixEffect(seed: string): string {
  let matrixElements = "";
  
  // Generate 100 elements with pseudo-random positions
  for (let i = 0; i < 100; i++) {
    // Use a simple pseudo-random number generator based on seed and index
    const hash = simpleHash(seed + i);
    
    // Create some clustering by dividing the space into sections
    const section = Math.floor(i / 25); // 4 sections
    const sectionWidth = 100; // Each section is 100px wide
    
    // For x coordinate, cluster within the section with some randomness
    const x = (section * sectionWidth) + (hash % sectionWidth);
    // For y coordinate, distribute more evenly
    const y = 20 + ((hash * 13) % 360);
    
    // Select a character - mix of numbers and letters for more Matrix-like effect
    const charIndex = (hash * 17) % 36; // 0-9, A-Z
    let character;
    
    if (charIndex < 10) {
      // Numbers 0-9
      character = charIndex.toString();
    } else {
      // Letters A-Z
      character = String.fromCharCode(65 + (charIndex - 10));
    }
    
    // Font size variation for depth effect (9-12px)
    const fontSize = 9 + (i % 4);
    
    matrixElements += `<text x="${x}" y="${y}" class="matrix-char" style="font-size:${fontSize}px">${character}</text>`;
  }
  
  return matrixElements;
}

/**
 * Generate an enhanced matrix rain effect with animations
 */
function generateEnhancedMatrixEffect(seed: string): string {
  let matrixElements = "";
  
  // Generate 200 matrix "drops" with characters (increased for more density)
  for (let i = 0; i < 200; i++) {
    // Create some clustering by dividing the space into sections
    const section = Math.floor(i / 15); // 4 sections
    const sectionWidth = 100; // Each section is 100px wide
    
    // Use a hash function to create predictable randomness
    const hash = simpleHash(seed + (i * 31));
    const hash2 = simpleHash(seed + (i * 67));
    const hash3 = simpleHash(seed + (i * 97));
    
    // For x coordinate, cluster within the section with some randomness
    const x = (section * sectionWidth) + (hash % sectionWidth);
    // For y coordinate, distribute more evenly
    const y = 20 + (hash2 % 360);
    
    // Select a character from the matrix charset
    const charIndex = hash3 % 36; // 0-9, A-Z = 36 chars
    let character;
    
    if (charIndex < 10) {
      // 0-9
      character = charIndex.toString();
    } else {
      // A-Z
      character = String.fromCharCode(65 + (charIndex - 10));
    }
    
    // Add font size variation for depth effect (9px to 14px)
    const fontSize = 9 + (i % 6);
    
    // Create animation styles with different falling speeds
    const animationGroup = i % 4; // Split into 4 groups for different effects
    let animationStyle;
    
    if (animationGroup === 0) {
      // Very slow fall
      animationStyle = `font-size:${fontSize}px; animation: fade 4s infinite, fall 18s linear infinite;`;
    } else if (animationGroup === 1) {
      // Slow fall speed
      animationStyle = `font-size:${fontSize}px; animation: fade 4s infinite, fall 12s linear infinite;`;
    } else if (animationGroup === 2) {
      // Medium fall speed
      animationStyle = `font-size:${fontSize}px; animation: fade 4s infinite, fall 9s linear infinite;`;
    } else {
      // Slightly faster fall speed
      animationStyle = `font-size:${fontSize}px; animation: fade 4s infinite, fall 7s linear infinite;`;
    }
    
    matrixElements += `<text x="${x}" y="${y}" class="matrix-char" style="${animationStyle}">${character}</text>`;
  }
  
  return matrixElements;
}

/**
 * Simple hash function for generating pseudo-random numbers
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 