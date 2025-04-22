import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import pdf from 'html-pdf';

/**
 * Generates a PDF version of the whitepaper from the markdown file
 */
const generateWhitepaperPdf = async () => {
  try {
    console.log('Reading markdown file...');
    
    // Read the markdown file
    const mdPath = path.resolve('public', 'whitepaper-enhanced.md');
    const markdownContent = fs.readFileSync(mdPath, 'utf8');
    
    // Convert markdown to HTML
    console.log('Converting markdown to HTML...');
    const html = marked(markdownContent);
    
    // Remove the original table of contents from the HTML content
    // The markdown file already has a TOC, so we don't need to add another one
    
    // Enhance HTML with styling
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Popular Vote Coin Whitepaper</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3 {
              color: #1a73e8;
              page-break-after: avoid;
              break-after: avoid;
              margin-top: 24px;
            }
            h1 {
              text-align: center;
              font-size: 28px;
              border-bottom: 2px solid #1a73e8;
              padding-bottom: 10px;
            }
            h2 {
              font-size: 22px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-top: 30px;
            }
            h3 {
              font-size: 18px;
              margin-top: 25px;
            }
            p {
              margin: 16px 0;
            }
            ul, ol {
              margin: 16px 0;
              padding-left: 30px;
            }
            li {
              margin-bottom: 8px;
            }
            code {
              background-color: #f5f5f5;
              padding: 2px 5px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            .cover-page {
              text-align: center;
              padding: 100px 0;
            }
            .cover-page h1 {
              font-size: 36px;
              margin-bottom: 20px;
              border: none;
            }
            .cover-page p {
              font-size: 18px;
              margin-bottom: 40px;
            }
            img {
              max-width: 100%;
              display: block;
              margin: 20px auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            /* Ensure sections don't break across pages */
            section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            /* Add more spacing between sections */
            h2 + p, h3 + p {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="cover-page">
            <h1>Popular Vote Coin</h1>
            <p>Whitepaper v1.2</p>
            <p>A Decentralized Voting and Governance System</p>
          </div>
          <div class="page-break"></div>
          ${html}
        </body>
      </html>
    `;
    
    // Define PDF options
    const options = {
      format: 'A4',
      border: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      footer: {
        height: '10mm',
        contents: {
          default: '<div style="text-align: center; font-size: 10px; color: #777;">Popular Vote Coin Whitepaper - Page {{page}} of {{pages}}</div>'
        }
      },
      // Ensure better section breaks
      renderDelay: 1000
    };
    
    // Generate PDF
    console.log('Generating PDF...');
    const outputPath = path.resolve('public', 'whitepaper-enhanced.pdf');
    
    // Use a promise to handle the callback-based pdf creation
    await new Promise((resolve, reject) => {
      pdf.create(styledHtml, options).toFile(outputPath, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`PDF successfully generated at: ${outputPath}`);
        resolve(res);
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export default generateWhitepaperPdf; 