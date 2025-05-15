import fs from "fs";
import path from "path";

function main() {
  console.log("Generating sample SVG for a Loogie...");
  
  // Mock token data with fixed values for rendering
  const testColor = "00FF88"; // Bright greenish color
  const testChubbiness = 60; // Medium chubbiness
  const testMouthLength = 200; // Standard mouth length
  
  // Calculate mouth position using the formula from the contract
  const mouthPosition = Math.floor((810 - 9 * testChubbiness) / 11);
  
  // Generate SVG directly based on the contract's renderTokenById function
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <g id="eye1">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
  </g>
  <g id="head">
    <ellipse fill="#${testColor}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${testChubbiness}" ry="51.80065" stroke="#000"/>
  </g>
  <g id="eye2">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
  </g>
  <g class="mouth" transform="translate(${mouthPosition},0)">
    <path d="M 130 240 Q 165 250 ${testMouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
  </g>
</svg>`;

  console.log("Generated SVG:");
  console.log(svg);
  
  // Save SVG to a file
  const outputDir = path.join(__dirname, "../../..", "output");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, "sample-loogie.svg");
  fs.writeFileSync(outputFile, svg);
  
  console.log(`SVG saved to: ${outputFile}`);
  console.log("SVG generation complete");
}

main(); 
import path from "path";

function main() {
  console.log("Generating sample SVG for a Loogie...");
  
  // Mock token data with fixed values for rendering
  const testColor = "00FF88"; // Bright greenish color
  const testChubbiness = 60; // Medium chubbiness
  const testMouthLength = 200; // Standard mouth length
  
  // Calculate mouth position using the formula from the contract
  const mouthPosition = Math.floor((810 - 9 * testChubbiness) / 11);
  
  // Generate SVG directly based on the contract's renderTokenById function
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <g id="eye1">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_1" cy="154.5" cx="181.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="2.5" id="svg_3" cy="154.5" cx="173.5" stroke-width="3" stroke="#000" fill="#000000"/>
  </g>
  <g id="head">
    <ellipse fill="#${testColor}" stroke-width="3" cx="204.5" cy="211.80065" id="svg_5" rx="${testChubbiness}" ry="51.80065" stroke="#000"/>
  </g>
  <g id="eye2">
    <ellipse stroke-width="3" ry="29.5" rx="29.5" id="svg_2" cy="168.5" cx="209.5" stroke="#000" fill="#fff"/>
    <ellipse ry="3.5" rx="3" id="svg_4" cy="169.5" cx="208" stroke-width="3" fill="#000000" stroke="#000"/>
  </g>
  <g class="mouth" transform="translate(${mouthPosition},0)">
    <path d="M 130 240 Q 165 250 ${testMouthLength} 235" stroke="black" stroke-width="3" fill="transparent"/>
  </g>
</svg>`;

  console.log("Generated SVG:");
  console.log(svg);
  
  // Save SVG to a file
  const outputDir = path.join(__dirname, "../../..", "output");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, "sample-loogie.svg");
  fs.writeFileSync(outputFile, svg);
  
  console.log(`SVG saved to: ${outputFile}`);
  console.log("SVG generation complete");
}

main(); 
 