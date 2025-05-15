const fs = require("fs");
const path = require("path");

/**
 * This script generates test SVGs that simulate the actual output of the updated LSP8LoogiesEnhanced contract
 * with improved visual features.
 */
async function main() {
  console.log("Generating improved test SVGs for LSP8LoogiesEnhanced...");
  
  // Create output directory
  const outputDir = path.join(__dirname, "..", "..", "svg-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate multiple SVG variations
  generateSVG({
    tokenId: "1",
    color: "ff8888", // Reddish color
    chubbiness: 50,
    mouthLength: 200,
    loogieType: "red",
    hasMatrixRain: true,
    isUP: true,
    upName: "Test Universal Profile",
    filename: "loogie-enhanced-with-matrix-up.svg"
  });
  
  generateSVG({
    tokenId: "2",
    color: "88ff88", // Greenish color
    chubbiness: 70,
    mouthLength: 230,
    loogieType: "green",
    hasMatrixRain: true,
    isUP: false,
    upName: "",
    filename: "loogie-enhanced-with-matrix.svg"
  });
  
  generateSVG({
    tokenId: "3",
    color: "8888ff", // Blueish color
    chubbiness: 40,
    mouthLength: 190,
    loogieType: "blue",
    hasMatrixRain: false,
    isUP: true,
    upName: "LUKSO User",
    filename: "loogie-enhanced-with-up.svg"
  });
  
  generateSVG({
    tokenId: "4",
    color: "ffff88", // Yellowish color
    chubbiness: 60,
    mouthLength: 210,
    loogieType: "yellow",
    hasMatrixRain: false,
    isUP: false,
    upName: "luksonaut",
    filename: "loogie-enhanced-basic.svg"
  });
  
  console.log(`SVG generation test complete! Files saved to: ${outputDir}`);
}

function generateSVG(params) {
  // Determine body color based on loogie type and UP status
  let bodyColor;
  
  if (params.isUP) {
    // Vibrant colors for UP holders
    if (params.loogieType === "green") {
      bodyColor = "#00ff00"; // Bright green
    } else if (params.loogieType === "blue") {
      bodyColor = "#00ccff"; // Bright blue
    } else if (params.loogieType === "red") {
      bodyColor = "#ff0066"; // Bright pink/red
    } else if (params.loogieType === "purple") {
      bodyColor = "#cc00ff"; // Bright purple
    } else if (params.loogieType === "yellow") {
      bodyColor = "#ffcc00"; // Bright yellow
    } else {
      bodyColor = `#${params.color}`;
    }
  } else {
    // Regular colors for non-UP holders
    if (params.loogieType === "green") {
      bodyColor = "#a3e635";
    } else if (params.loogieType === "blue") {
      bodyColor = "#3b82f6";
    } else if (params.loogieType === "red") {
      bodyColor = "#ef4444";
    } else if (params.loogieType === "purple") {
      bodyColor = "#a855f7";
    } else if (params.loogieType === "yellow") {
      bodyColor = "#facc15";
    } else {
      bodyColor = `#${params.color}`;
    }
  }
  
  // Set matrix color based on UP status
  const matrixColor = params.isUP ? "#ff00ff" : "#00ff00"; // Pink for UP, Green for regular
  
  // Calculate mouth position based on chubbiness
  const mouthTranslate = Math.floor((810 - 9 * params.chubbiness) / 11);
  
  // Generate Matrix rain characters
  function generateMatrixChars() {
    let chars = '';
    const charCount = 120; // Number of matrix characters
    const viewportWidth = 400;
    const viewportHeight = 400;
    
    for (let i = 0; i < charCount; i++) {
      const x = Math.floor(Math.random() * viewportWidth);
      const y = Math.floor(Math.random() * viewportHeight);
      const char = Math.floor(Math.random() * 10); // 0-9
      const delay = Math.floor(Math.random() * 5);
      const duration = 3 + Math.floor(Math.random() * 5);
      
      chars += `<text x="${x}" y="${y}" class="matrix-char" style="animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</text>`;
    }
    
    return chars;
  }
  
  // Build the SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Comic+Sans+MS&amp;display=swap");
      .username { font-family: "Comic Sans MS", cursive; font-size: 16px; fill: white; text-anchor: middle; }
      .matrix-char { font-family: monospace; fill: ${matrixColor}; opacity: 0.3; animation: fade 3s infinite, fall 8s linear infinite; }
      @keyframes fade { 0% { opacity: 0.2; } 30% { opacity: 0.9; } 70% { opacity: 0.9; } 100% { opacity: 0.2; } }
      @keyframes fall { from { transform: translateY(-20px); } to { transform: translateY(420px); } }
    </style>
    ${params.hasMatrixRain ? `
    <filter id="matrix-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="matrix-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000800"/>
      <stop offset="100%" stop-color="#001000"/>
    </linearGradient>` : ''}
  </defs>
  <rect width="400" height="400" fill="black"/>
  ${params.hasMatrixRain ? `<g class="matrix-chars">${generateMatrixChars()}</g>` : ''}
  <g class="loogie-container">
    <!-- First eye -->
    <g id="eye1">
      <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
      <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
    </g>
    <!-- Head -->
    <g id="head">
      <ellipse fill="${bodyColor}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${params.chubbiness}" ry="51.80065" stroke="#000"/>
    </g>
    <!-- Second eye -->
    <g id="eye2">
      <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
      <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
    </g>
    <!-- Mouth with translation based on chubbiness -->
    <g class="mouth" transform="translate(${mouthTranslate},0)">
      <path d="M 130 240 Q 165 250 ${params.mouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
    </g>
    ${params.upName ? (params.isUP ? 
      `<text x="200" y="300" class="username" style="font-family: 'Comic Sans MS', cursive;">${params.upName}</text>` : 
      `<text x="200" y="300" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">${params.upName}</text>`) : ''}
  </g>
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