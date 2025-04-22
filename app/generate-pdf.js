#!/usr/bin/env node

// This script generates a PDF version of the whitepaper
// Run with: npm run generate-pdf

// Generate print-friendly version of whitepaper.html
const fs = require('fs');
const path = require('path');

function addPrintButton() {
  try {
    console.log('Adding print functionality to whitepaper.html...');
    
    // Get the HTML file path
    const htmlPath = path.join(__dirname, 'public', 'whitepaper.html');
    
    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML file not found at ${htmlPath}`);
    }
    
    // Read the HTML content
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check if print button already exists
    if (htmlContent.includes('id="print-button"')) {
      console.log('Print button already exists, skipping...');
      return true;
    }
    
    // Add print button and print.js script
    const printButtonStyle = `
    <style>
      #print-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      #print-button:hover {
        background-color: #0d47a1;
        transform: scale(1.05);
      }
      @media print {
        #print-button {
          display: none;
        }
      }
    </style>`;
    
    const printButtonHtml = `
    <button id="print-button" onclick="window.print()" title="Print Whitepaper">
      <span>🖨️</span>
    </button>`;
    
    // Insert styles before closing head tag
    htmlContent = htmlContent.replace('</head>', `${printButtonStyle}\n</head>`);
    
    // Insert button before closing body tag
    htmlContent = htmlContent.replace('</body>', `${printButtonHtml}\n</body>`);
    
    // Add anchor ID tags for better PDF linkage
    htmlContent = htmlContent.replace('<h1>Popular Vote Token Whitepaper</h1>', '<h1 id="popular-vote-token-whitepaper">Popular Vote Token Whitepaper</h1>');
    
    // Write the updated HTML content back to file
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log(`Print functionality added to whitepaper.html at: ${htmlPath}`);
    console.log('To generate PDF:');
    console.log('1. Open the whitepaper.html in a browser');
    console.log('2. Click the print button');
    console.log('3. Choose "Save as PDF" in the print dialog');
    return true;
  } catch (error) {
    console.error('Error adding print functionality:', error);
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  const success = addPrintButton();
  if (success) {
    console.log('Print button addition completed');
    process.exit(0);
  } else {
    console.error('Print button addition failed');
    process.exit(1);
  }
}

module.exports = { addPrintButton }; 