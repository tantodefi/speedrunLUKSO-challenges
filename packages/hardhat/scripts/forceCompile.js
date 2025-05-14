const fs = require('fs');
const { execSync } = require('child_process');

// Save original content of problematic contracts
const lsp8LoogiesFixedPath = './contracts/LSP8LoogiesFixed.sol';
const lsp8LoogiesFixedContent = fs.readFileSync(lsp8LoogiesFixedPath, 'utf8');

// Temporarily rename problematic file
fs.renameSync(lsp8LoogiesFixedPath, `${lsp8LoogiesFixedPath}.bak`);

try {
  // Run compilation
  console.log('Compiling without problematic contract...');
  execSync('npx hardhat compile --force', { stdio: 'inherit' });
  console.log('Compilation successful!');
} catch (error) {
  console.error('Compilation failed:', error);
} finally {
  // Restore original files
  fs.renameSync(`${lsp8LoogiesFixedPath}.bak`, lsp8LoogiesFixedPath);
  console.log('Restored original files');
} 