/**
 * Script to copy the IDL file from the Anchor build directory to the public folder
 * This makes it accessible to the frontend
 */

const fs = require('fs');
const path = require('path');

// Paths
const IDL_PATH = path.join(__dirname, '../../src/program/target/idl/memecoin_vote.json');
const PUBLIC_IDL_DIR = path.join(__dirname, '../public/target/idl');

// Ensure directory exists
if (!fs.existsSync(PUBLIC_IDL_DIR)) {
  fs.mkdirSync(PUBLIC_IDL_DIR, { recursive: true });
}

// Copy IDL file to public directory
try {
  // Check if source IDL exists
  if (!fs.existsSync(IDL_PATH)) {
    console.error('Error: IDL file not found at', IDL_PATH);
    console.error('Have you built the Solana program with "anchor build"?');
    process.exit(1);
  }

  // Read IDL file
  const idl = fs.readFileSync(IDL_PATH, 'utf8');
  
  // Parse to validate JSON format
  const idlJson = JSON.parse(idl);
  
  // Write to public directory
  fs.writeFileSync(
    path.join(PUBLIC_IDL_DIR, 'memecoin_vote.json'),
    JSON.stringify(idlJson, null, 2)
  );
  
  console.log('Successfully generated IDL file in public directory');
} catch (error) {
  console.error('Error generating IDL file:', error);
  process.exit(1);
} 