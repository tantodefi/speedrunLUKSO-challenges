const fs = require("fs");
const path = require("path");

/**
 * This script generates test SVGs that simulate the output of the LSP8LoogiesEnhanced contract
 * without needing to deploy the contract or connect to a network.
 */
async function main() {
  console.log("Generating test SVGs for LSP8LoogiesEnhanced...");
  
  // Create output directory
  const outputDir = path.join(__dirname, "..", "..", "svg-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate multiple SVG variations
  generateSVG({
    color: "ff8888", // Reddish color
    chubbiness: 50,
    mouthLength: 200,
    hasMatrixRain: true,
    isUP: true,
    upName: "Test Universal Profile",
    filename: "loogie-enhanced-with-matrix-up.svg"
  });
  
  generateSVG({
    color: "88ff88", // Greenish color
    chubbiness: 70,
    mouthLength: 230,
    hasMatrixRain: true,
    isUP: false,
    upName: "",
    filename: "loogie-enhanced-with-matrix.svg"
  });
  
  generateSVG({
    color: "8888ff", // Blueish color
    chubbiness: 40,
    mouthLength: 190,
    hasMatrixRain: false,
    isUP: true,
    upName: "LUKSO User",
    filename: "loogie-enhanced-with-up.svg"
  });
  
  generateSVG({
    color: "ffff88", // Yellowish color
    chubbiness: 60,
    mouthLength: 210,
    hasMatrixRain: false,
    isUP: false,
    upName: "",
    filename: "loogie-enhanced-basic.svg"
  });
  
  console.log(`SVG generation test complete! Files saved to: ${outputDir}`);
}

function generateSVG(params) {
  // Generate matrix rain effect if enabled
  const matrixEffect = params.hasMatrixRain ? 
    `<defs>
      <filter id="matrix" x="0" y="0" width="100%" height="100%">
        <feTurbulence baseFrequency="0.05" numOctaves="2" result="noise" seed="1" type="fractalNoise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <linearGradient id="matrixBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,50,0,0.1)"/>
        <stop offset="100%" stop-color="rgba(0,30,0,0.3)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#matrixBg)" opacity="0.7"/>
    <g filter="url(#matrix)">
      <text x="200" y="30" font-family="monospace" font-size="20" text-anchor="middle" fill="#00ff00" opacity="0.5">MATRIX LOOGIE</text>
    </g>` : "";
  
  // Calculate mouth position based on chubbiness
  const mouthTranslate = Math.floor((810 - 9 * params.chubbiness) / 11);
  
  // Generate basic loogie using ellipses
  const basicLoogie = `<g id="eye1">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
  </g>
  <g id="head">
    <ellipse fill="#${params.color}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${params.chubbiness}" ry="51.80065" stroke="#000"/>
  </g>
  <g id="eye2">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
  </g>
  <g class="mouth" transform="translate(${mouthTranslate},0)">
    <path d="M 130 240 Q 165 250 ${params.mouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
  </g>`;
  
  // Add UP name display if it's a Universal Profile
  let upNameDisplay = "";
  if (params.isUP) {
    if (params.upName) {
      upNameDisplay = `<g id="upName">
        <rect x="50" y="40" width="300" height="30" rx="5" fill="rgba(0,0,0,0.3)" stroke="#${params.color}" stroke-width="1"/>
        <text x="200" y="62" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#ffffff">${params.upName}</text>
      </g>`;
    } else {
      upNameDisplay = `<g id="upIndicator">
        <rect x="150" y="40" width="100" height="20" rx="5" fill="rgba(0,0,0,0.3)" stroke="#${params.color}" stroke-width="1"/>
        <text x="200" y="55" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#ffffff">UP Owner</text>
      </g>`;
    }
  }
  
  // Put it all together
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  ${matrixEffect}
  ${basicLoogie}
  ${upNameDisplay}
</svg>`;
  
  // Save the SVG to a file
  const outputDir = path.join(__dirname, "..", "..", "svg-output");
  const filePath = path.join(outputDir, params.filename);
  fs.writeFileSync(filePath, svg);
  
  console.log(`Generated SVG: ${params.filename}`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 
const path = require("path");

/**
 * This script generates test SVGs that simulate the output of the LSP8LoogiesEnhanced contract
 * without needing to deploy the contract or connect to a network.
 */
async function main() {
  console.log("Generating test SVGs for LSP8LoogiesEnhanced...");
  
  // Create output directory
  const outputDir = path.join(__dirname, "..", "..", "svg-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate multiple SVG variations
  generateSVG({
    color: "ff8888", // Reddish color
    chubbiness: 50,
    mouthLength: 200,
    hasMatrixRain: true,
    isUP: true,
    upName: "Test Universal Profile",
    filename: "loogie-enhanced-with-matrix-up.svg"
  });
  
  generateSVG({
    color: "88ff88", // Greenish color
    chubbiness: 70,
    mouthLength: 230,
    hasMatrixRain: true,
    isUP: false,
    upName: "",
    filename: "loogie-enhanced-with-matrix.svg"
  });
  
  generateSVG({
    color: "8888ff", // Blueish color
    chubbiness: 40,
    mouthLength: 190,
    hasMatrixRain: false,
    isUP: true,
    upName: "LUKSO User",
    filename: "loogie-enhanced-with-up.svg"
  });
  
  generateSVG({
    color: "ffff88", // Yellowish color
    chubbiness: 60,
    mouthLength: 210,
    hasMatrixRain: false,
    isUP: false,
    upName: "",
    filename: "loogie-enhanced-basic.svg"
  });
  
  console.log(`SVG generation test complete! Files saved to: ${outputDir}`);
}

function generateSVG(params) {
  // Generate matrix rain effect if enabled
  const matrixEffect = params.hasMatrixRain ? 
    `<defs>
      <filter id="matrix" x="0" y="0" width="100%" height="100%">
        <feTurbulence baseFrequency="0.05" numOctaves="2" result="noise" seed="1" type="fractalNoise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <linearGradient id="matrixBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(0,50,0,0.1)"/>
        <stop offset="100%" stop-color="rgba(0,30,0,0.3)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#matrixBg)" opacity="0.7"/>
    <g filter="url(#matrix)">
      <text x="200" y="30" font-family="monospace" font-size="20" text-anchor="middle" fill="#00ff00" opacity="0.5">MATRIX LOOGIE</text>
    </g>` : "";
  
  // Calculate mouth position based on chubbiness
  const mouthTranslate = Math.floor((810 - 9 * params.chubbiness) / 11);
  
  // Generate basic loogie using ellipses
  const basicLoogie = `<g id="eye1">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
  </g>
  <g id="head">
    <ellipse fill="#${params.color}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${params.chubbiness}" ry="51.80065" stroke="#000"/>
  </g>
  <g id="eye2">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
  </g>
  <g class="mouth" transform="translate(${mouthTranslate},0)">
    <path d="M 130 240 Q 165 250 ${params.mouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
  </g>`;
  
  // Add UP name display if it's a Universal Profile
  let upNameDisplay = "";
  if (params.isUP) {
    if (params.upName) {
      upNameDisplay = `<g id="upName">
        <rect x="50" y="40" width="300" height="30" rx="5" fill="rgba(0,0,0,0.3)" stroke="#${params.color}" stroke-width="1"/>
        <text x="200" y="62" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#ffffff">${params.upName}</text>
      </g>`;
    } else {
      upNameDisplay = `<g id="upIndicator">
        <rect x="150" y="40" width="100" height="20" rx="5" fill="rgba(0,0,0,0.3)" stroke="#${params.color}" stroke-width="1"/>
        <text x="200" y="55" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#ffffff">UP Owner</text>
      </g>`;
    }
  }
  
  // Put it all together
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  ${matrixEffect}
  ${basicLoogie}
  ${upNameDisplay}
</svg>`;
  
  // Save the SVG to a file
  const outputDir = path.join(__dirname, "..", "..", "svg-output");
  const filePath = path.join(outputDir, params.filename);
  fs.writeFileSync(filePath, svg);
  
  console.log(`Generated SVG: ${params.filename}`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 
 