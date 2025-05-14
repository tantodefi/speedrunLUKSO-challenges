const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Path patterns for Loogies SVG (same as in contract)
const headPaths = [
  "M 200 200 m -70 0 a 70 50 0 1 0 140 0 a 70 50 0 1 0 -140 0",
  "M 200 200 m -65 0 a 65 55 0 1 0 130 0 a 65 55 0 1 0 -130 0",
  "M 200 200 m -75 0 a 75 45 0 1 0 150 0 a 75 45 0 1 0 -150 0"
];

const eyePaths = [
  "M 170 180 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0 M 230 180 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0",
  "M 170 170 m -12 0 a 12 18 0 1 0 24 0 a 12 18 0 1 0 -24 0 M 230 170 m -12 0 a 12 18 0 1 0 24 0 a 12 18 0 1 0 -24 0",
  "M 170 180 m -17 0 a 17 13 0 1 0 34 0 a 17 13 0 1 0 -34 0 M 230 180 m -17 0 a 17 13 0 1 0 34 0 a 17 13 0 1 0 -34 0"
];

const mouthPaths = [
  "M 160 220 Q 200 240 240 220",
  "M 160 220 Q 200 250 240 220",
  "M 160 225 Q 200 235 240 225"
];

const pupilPaths = [
  "M 170 180 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 230 180 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0",
  "M 170 170 m -4 0 a 4 6 0 1 0 8 0 a 4 6 0 1 0 -8 0 M 230 170 m -4 0 a 4 6 0 1 0 8 0 a 4 6 0 1 0 -8 0",
  "M 170 180 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 M 230 180 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"
];

// Helper functions
function getRandomPathIndex(tokenId, offset, max) {
  return parseInt(ethers.keccak256(ethers.concat([tokenId, ethers.toUtf8Bytes(offset.toString())]))) % max;
}

function toColorHexString(colorBytes) {
  return colorBytes.substring(2); // Remove "0x" prefix
}

function uint2str(value) {
  return value.toString();
}

function generateMatrixRainEffect(seedHex) {
  return `<filter id="matrix-glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>`;
}

function generateRandomMatrixChars(seedHex) {
  let chars = "";
  const seed = ethers.getBytes(seedHex);
  const xPositions = [];
  
  // Generate random x positions for matrix columns
  for (let i = 0; i < 10; i++) {
    const xPosSeed = ethers.keccak256(ethers.concat([seed, ethers.toUtf8Bytes(`xpos-${i}`)]));
    xPositions.push(parseInt(xPosSeed) % 380 + 10);
  }
  
  // Generate matrix characters
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 5; j++) {
      const ySeed = ethers.keccak256(ethers.concat([seed, ethers.toUtf8Bytes(`ypos-${i}-${j}`)]));
      const yPos = parseInt(ySeed) % 380 + 10;
      
      const charSeed = ethers.keccak256(ethers.concat([seed, ethers.toUtf8Bytes(`char-${i}-${j}`)]));
      const charCode = parseInt(charSeed) % 10 + 48; // 0-9
      
      // Animation delay
      const delaySeed = ethers.keccak256(ethers.concat([seed, ethers.toUtf8Bytes(`delay-${i}-${j}`)]));
      const delay = parseInt(delaySeed) % 5;
      
      chars += `<text x="${xPositions[i]}" y="${yPos}" class="matrix-char" style="animation: fade 3s infinite, fall 8s linear infinite ${delay}s;">
        ${String.fromCharCode(charCode)}
      </text>`;
    }
  }
  
  return chars;
}

// Original Loogies SVG using circles/ellipses
function generateOriginalLoogieSVG(tokenId, loogieType, colorValue, chubbinessValue, mouthLengthValue, username) {
  // Determine body color based on loogie type
  let bodyColor;
  if (loogieType === "green") {
    bodyColor = "#a3e635";
  } else if (loogieType === "blue") {
    bodyColor = "#3b82f6";
  } else if (loogieType === "red") {
    bodyColor = "#ef4444";
  } else if (loogieType === "purple") {
    bodyColor = "#a855f7";
  } else if (loogieType === "yellow") {
    bodyColor = "#facc15";
  } else {
    bodyColor = `#${toColorHexString(colorValue)}`;
  }
  
  // Generate Original Loogie SVG with basic shapes
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="400" height="400" fill="#000000"/>
    <ellipse cx="200" cy="200" rx="70" ry="${chubbinessValue}" fill="${bodyColor}" stroke="#000000" stroke-width="3"/>
    <circle cx="170" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <circle cx="230" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <circle cx="170" cy="180" r="5" fill="#000000"/>
    <circle cx="230" cy="180" r="5" fill="#000000"/>
    <path d="M ${200 - mouthLengthValue/2} 220 Q 200 240 ${200 + mouthLengthValue/2} 220" fill="none" stroke="#000000" stroke-width="3"/>
    <text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">${username}</text>
  </svg>`;
  
  return svg;
}

// Path-based Loogies SVG with Matrix theme
function generateMatrixLoogieSVG(tokenId, loogieType, colorValue, chubbinessValue, mouthLengthValue, username) {
  // Get path indices for variation
  const headIdx = getRandomPathIndex(tokenId, 0, 3);
  const eyeIdx = getRandomPathIndex(tokenId, 1, 3);
  const mouthIdx = getRandomPathIndex(tokenId, 2, 3);
  const pupilIdx = getRandomPathIndex(tokenId, 3, 3);
  
  // Determine body color based on loogie type
  let bodyColor;
  if (loogieType === "green") {
    bodyColor = "#a3e635";
  } else if (loogieType === "blue") {
    bodyColor = "#3b82f6";
  } else if (loogieType === "red") {
    bodyColor = "#ef4444";
  } else if (loogieType === "purple") {
    bodyColor = "#a855f7";
  } else if (loogieType === "yellow") {
    bodyColor = "#facc15";
  } else {
    bodyColor = `#${toColorHexString(colorValue)}`;
  }
  
  // Generate Matrix Theme SVG with enhanced animation and style
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <style>
        @font-face {font-family: "Comic Sans MS"; src: url("https://fonts.cdnfonts.com/css/comic-sans");}
        .username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; }
        .matrix-char { font-family: monospace; fill: #0F0; opacity: 0.3; }
        @keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }
        @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }
        .head{fill:${bodyColor};stroke:#000000;stroke-width:3px;}
        .eyes{fill:#ffffff;stroke:#000000;stroke-width:2px;}
        .pupils{fill:#000000;stroke:none;}
        .mouth{fill:none;stroke:#000000;stroke-width:3px;}
      </style>
      ${generateMatrixRainEffect(tokenId)}
    </defs>
    <rect width="400" height="400" fill="#000000"/>
    <g class="matrix-background">
      ${generateRandomMatrixChars(tokenId)}
    </g>
    <g class="loogie-container">
      <path d="${headPaths[headIdx]}" class="head"/>
      <path d="${eyePaths[eyeIdx]}" class="eyes"/>
      <path d="${pupilPaths[pupilIdx]}" class="pupils"/>
      <path d="${mouthPaths[mouthIdx]}" class="mouth"/>
      <text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">
        ${username}
      </text>
    </g>
  </svg>`;
  
  return svg;
}

// Combined version with both Matrix effects and original Loogies shapes
function generateCombinedLoogieSVG(tokenId, loogieType, colorValue, chubbinessValue, mouthLengthValue, username) {
  // Determine body color based on loogie type
  let bodyColor;
  if (loogieType === "green") {
    bodyColor = "#a3e635";
  } else if (loogieType === "blue") {
    bodyColor = "#3b82f6";
  } else if (loogieType === "red") {
    bodyColor = "#ef4444";
  } else if (loogieType === "purple") {
    bodyColor = "#a855f7";
  } else if (loogieType === "yellow") {
    bodyColor = "#facc15";
  } else {
    bodyColor = `#${toColorHexString(colorValue)}`;
  }
  
  // Generate combined SVG with Matrix background and original Loogies shapes
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <style>
        @font-face {font-family: "Comic Sans MS"; src: url("https://fonts.cdnfonts.com/css/comic-sans");}
        .username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; }
        .matrix-char { font-family: monospace; fill: #0F0; opacity: 0.3; }
        @keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }
        @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }
      </style>
      ${generateMatrixRainEffect(tokenId)}
    </defs>
    <rect width="400" height="400" fill="#000000"/>
    <g class="matrix-background">
      ${generateRandomMatrixChars(tokenId)}
    </g>
    <g class="loogie-container">
      <ellipse cx="200" cy="200" rx="70" ry="${chubbinessValue}" fill="${bodyColor}" stroke="#000000" stroke-width="3"/>
      <circle cx="170" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      <circle cx="230" cy="180" r="15" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      <circle cx="170" cy="180" r="5" fill="#000000"/>
      <circle cx="230" cy="180" r="5" fill="#000000"/>
      <path d="M ${200 - mouthLengthValue/2} 220 Q 200 240 ${200 + mouthLengthValue/2} 220" fill="none" stroke="#000000" stroke-width="3"/>
      <text x="200" y="280" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">${username}</text>
    </g>
  </svg>`;
  
  return svg;
}

function generateCollectionSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#000"/>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <text x="200" y="180" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle" filter="url(#glow)">LuksoLoogies</text>
    <text x="200" y="230" font-family="Arial" font-size="20" fill="#0f0" text-anchor="middle" filter="url(#glow)">Matrix Edition</text>
  </svg>`;
}

// Generate HTML viewer with embedded SVGs
function generateHtmlViewer(svgList) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>LSP8 Loogies Preview</title>
      <style>
        body {
          background-color: #222;
          color: white;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        h1, h2, h3 {
          text-align: center;
        }
        .container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }
        .loogie-card {
          background: rgba(0,0,0,0.5);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 0 10px rgba(0,255,0,0.3);
        }
        .loogie-info {
          margin-top: 10px;
          text-align: left;
          font-size: 12px;
        }
        .collection {
          margin: 20px auto;
          text-align: center;
          max-width: 400px;
        }
        .style-section {
          margin-bottom: 40px;
        }
      </style>
    </head>
    <body>
      <h1>LSP8 Loogies Matrix Edition</h1>
      <p style="text-align: center">Preview of SVG generation for the enhanced Matrix Loogies</p>
      
      <div class="collection">
        <h2>Collection Image</h2>
        ${generateCollectionSVG()}
      </div>
      
      <div class="style-section">
        <h2>Original Style Loogies</h2>
        <div class="container">
          ${svgList.map(item => `
            <div class="loogie-card">
              ${generateOriginalLoogieSVG(
                ethers.id(item.id),
                item.type, 
                item.color, 
                item.chubbiness, 
                item.mouthLength, 
                item.username
              )}
              <div class="loogie-info">
                <p><strong>ID:</strong> ${item.id}</p>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Style:</strong> Original</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="style-section">
        <h2>Matrix Style Loogies (Path-based)</h2>
        <div class="container">
          ${svgList.map(item => `
            <div class="loogie-card">
              ${generateMatrixLoogieSVG(
                ethers.id(item.id),
                item.type, 
                item.color, 
                item.chubbiness, 
                item.mouthLength, 
                item.username
              )}
              <div class="loogie-info">
                <p><strong>ID:</strong> ${item.id}</p>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Style:</strong> Matrix Path</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="style-section">
        <h2>Combined Style Loogies</h2>
        <div class="container">
          ${svgList.map(item => `
            <div class="loogie-card">
              ${generateCombinedLoogieSVG(
                ethers.id(item.id),
                item.type, 
                item.color, 
                item.chubbiness, 
                item.mouthLength, 
                item.username
              )}
              <div class="loogie-info">
                <p><strong>ID:</strong> ${item.id}</p>
                <p><strong>Type:</strong> ${item.type}</p>
                <p><strong>Style:</strong> Matrix + Original</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <p style="text-align: center; margin-top: 30px; font-size: 12px;">
        Generated for testing the LSP8LoogiesEnhanced contract SVG rendering
      </p>
    </body>
  </html>`;
}

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, 'svg_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate and save collection SVG
const collectionSVG = generateCollectionSVG();
fs.writeFileSync(path.join(outputDir, 'collection.svg'), collectionSVG);
console.log(`Collection SVG saved to ${path.join(outputDir, 'collection.svg')}`);

// Generate and save sample Loogies with different attributes
const testCases = [
  { id: '1', type: 'green', color: '0x00ff00', chubbiness: 50, mouthLength: 80, username: 'luksonaut' },
  { id: '2', type: 'blue', color: '0x0000ff', chubbiness: 60, mouthLength: 100, username: 'lukso_fan' },
  { id: '3', type: 'red', color: '0xff0000', chubbiness: 40, mouthLength: 120, username: 'web3_dev' },
  { id: '4', type: 'purple', color: '0x800080', chubbiness: 55, mouthLength: 90, username: 'crypto_lover' },
  { id: '5', type: 'yellow', color: '0xffff00', chubbiness: 45, mouthLength: 110, username: 'nft_collector' },
  { id: '6', type: 'custom', color: '0xfc03b1', chubbiness: 65, mouthLength: 130, username: 'unique_user' },
];

// Store test cases for HTML generation
const svgList = testCases.map(test => ({
  id: test.id,
  type: test.type,
  color: test.color,
  chubbiness: test.chubbiness,
  mouthLength: test.mouthLength,
  username: test.username
}));

// Save individual SVG files for each style
testCases.forEach(test => {
  const tokenId = ethers.id(test.id);
  
  // Original style
  const originalSvg = generateOriginalLoogieSVG(
    tokenId, 
    test.type, 
    test.color, 
    test.chubbiness, 
    test.mouthLength, 
    test.username
  );
  fs.writeFileSync(path.join(outputDir, `loogie_${test.id}_${test.type}_original.svg`), originalSvg);
  
  // Matrix style
  const matrixSvg = generateMatrixLoogieSVG(
    tokenId, 
    test.type, 
    test.color, 
    test.chubbiness, 
    test.mouthLength, 
    test.username
  );
  fs.writeFileSync(path.join(outputDir, `loogie_${test.id}_${test.type}_matrix.svg`), matrixSvg);
  
  // Combined style
  const combinedSvg = generateCombinedLoogieSVG(
    tokenId, 
    test.type, 
    test.color, 
    test.chubbiness, 
    test.mouthLength, 
    test.username
  );
  fs.writeFileSync(path.join(outputDir, `loogie_${test.id}_${test.type}_combined.svg`), combinedSvg);
  
  console.log(`SVG files for Loogie #${test.id} (${test.type}) saved to ${outputDir}`);
});

// Generate and save HTML viewer with all styles
const htmlViewer = generateHtmlViewer(svgList);
fs.writeFileSync(path.join(outputDir, 'preview.html'), htmlViewer);
console.log(`HTML viewer saved to ${path.join(outputDir, 'preview.html')}`);

console.log('\nTo view the SVGs:');
console.log('1. Find them in the packages/hardhat/scripts/svg_output directory');
console.log('2. Open preview.html in a web browser to see all generated SVGs');
console.log('3. You can also view individual SVG files in any SVG viewer'); 