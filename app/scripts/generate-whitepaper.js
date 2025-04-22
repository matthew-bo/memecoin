// Script to generate whitepaper PDF
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const pdf = require('html-pdf');

console.log('Starting whitepaper PDF generation...');

try {
  // Read the markdown file
  const markdownPath = path.resolve(__dirname, '..', 'public', 'whitepaper-enhanced.md');
  console.log(`Reading markdown from: ${markdownPath}`);
  
  if (!fs.existsSync(markdownPath)) {
    console.error(`Error: Markdown file not found at ${markdownPath}`);
    process.exit(1);
  }
  
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  
  // Custom renderer to enhance the markdown output
  const renderer = new marked.Renderer();
  
  // Enhanced heading rendering
  renderer.heading = function (text, level) {
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    let headingClass = '';
    let additionalStyle = '';
    
    if (level === 1) {
      headingClass = 'section-title';
      additionalStyle = 'border-bottom: 1px solid #ddd; padding-bottom: 10px;';
    } else if (level === 2) {
      headingClass = 'section-subtitle';
      additionalStyle = 'color: #1565c0;';
    } else if (level === 3) {
      headingClass = 'section-subheading';
    }
    
    return `<h${level} id="${id}" class="${headingClass}" style="${additionalStyle}">${text}</h${level}>`;
  };
  
  // Enhanced image rendering
  renderer.image = function (href, title, text) {
    return `
      <div class="image-container" style="text-align: center; margin: 30px 0;">
        <img src="${href}" alt="${text}" style="max-width: 100%; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
        ${text ? `<div class="image-caption" style="margin-top: 10px; font-style: italic; color: #666;">${text}</div>` : ''}
      </div>
    `;
  };
  
  // Enhanced list item rendering
  renderer.listitem = function (text) {
    return `<li style="margin-bottom: 12px; line-height: 1.6;">${text}</li>`;
  };
  
  // Enhanced paragraph rendering
  renderer.paragraph = function (text) {
    return `<p style="margin-bottom: 20px; line-height: 1.7; font-size: 16px;">${text}</p>`;
  };
  
  // Enhanced table rendering
  renderer.table = function (header, body) {
    return `
      <table style="width: 100%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    `;
  };
  
  renderer.tablerow = function (content) {
    return `<tr>${content}</tr>`;
  };
  
  renderer.tablecell = function (content, flags) {
    const type = flags.header ? 'th' : 'td';
    const style = flags.header 
      ? 'padding: 12px; background-color: #f5f5f5; font-weight: bold; border: 1px solid #ddd; text-align: left;' 
      : 'padding: 12px; border: 1px solid #ddd; text-align: left;';
    return `<${type} style="${style}">${content}</${type}>`;
  };
  
  // Set renderer options
  const markedOptions = {
    renderer,
    headerIds: true,
    gfm: true,
    breaks: true
  };
  
  // Convert markdown to HTML using custom renderer
  console.log('Converting markdown to HTML with enhanced styling...');
  const html = marked(markdown, markedOptions);
  
  // Apply styling to the HTML
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Popular Vote Coin Whitepaper</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.7;
            margin: 40px;
            color: #333;
            font-size: 16px;
          }
          
          h1 {
            color: #1976d2;
            font-size: 28px;
            margin-top: 40px;
            margin-bottom: 20px;
            font-weight: 700;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          
          h2 {
            color: #1565c0;
            font-size: 24px;
            margin-top: 36px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          
          h3 {
            color: #1976d2;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 14px;
            font-weight: 600;
          }
          
          h4 {
            color: #1976d2;
            font-size: 18px;
            margin-top: 24px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          
          p {
            margin-bottom: 20px;
            line-height: 1.7;
          }
          
          img {
            max-width: 100%;
            border-radius: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          a {
            color: #1976d2;
            text-decoration: none;
          }
          
          ul, ol {
            padding-left: 30px;
            margin-bottom: 25px;
          }
          
          li {
            margin-bottom: 12px;
            line-height: 1.6;
          }
          
          pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 25px 0;
            line-height: 1.5;
          }
          
          .title-page {
            text-align: center;
            margin-top: 150px;
            margin-bottom: 200px;
            page-break-after: always;
          }
          
          .title-page h1 {
            font-size: 36px;
            margin-bottom: 20px;
            border: none;
            padding: 0;
          }
          
          .title-page p {
            font-size: 18px;
            margin: 10px 0;
          }
          
          .table-of-contents {
            background-color: #f9f9f9;
            padding: 25px 30px;
            margin: 30px 0 40px 0;
            border-radius: 4px;
            page-break-after: always;
          }
          
          .table-of-contents h2 {
            margin-top: 0;
            border: none;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
          }
          
          .image-container {
            text-align: center;
            margin: 30px 0;
          }
          
          .image-caption {
            margin-top: 10px;
            font-style: italic;
            color: #666;
          }
          
          @page {
            margin: 25mm;
          }
        </style>
      </head>
      <body>
        <div class="title-page">
          <h1>Popular Vote Coin</h1>
          <p>Whitepaper</p>
          <p>Version 1.2 | Conceptual Demonstration</p>
        </div>
        
        <div class="table-of-contents">
          <h2>Table of Contents</h2>
          <div id="toc-placeholder"></div>
        </div>
        
        <div class="content">
          ${html}
        </div>
        
        <script>
          // This script would generate the TOC but will not run in PDF generation
          // Instead, we'll construct a static TOC
        </script>
      </body>
    </html>
  `;
  
  // Generate table of contents manually
  // Extract headings and construct TOC
  const generateTOC = () => {
    const headingRegex = /(<h([1-3])[^>]*id="([^"]+)"[^>]*>)([^<]+)(<\/h\2>)/g;
    let match;
    let toc = '<ul style="list-style-type: none; padding-left: 0;">';
    let lastLevel = 0;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[2]);
      const id = match[3];
      const text = match[4];
      
      // Adjust indentation based on heading level
      const indent = (level - 1) * 20;
      const style = `margin: 12px 0; padding-left: ${indent}px;`;
      
      toc += `<li style="${style}">
                <a href="#${id}" style="text-decoration: none; color: #1976d2; font-weight: ${level === 1 ? 'bold' : 'normal'};">
                  ${text}
                </a>
              </li>`;
    }
    
    toc += '</ul>';
    return toc;
  };
  
  const tocHtml = generateTOC();
  const finalHtml = styledHtml.replace('<div id="toc-placeholder"></div>', tocHtml);
  
  // Configure PDF options
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
        default: '<div style="color: #444; font-size: 10px; text-align: center; width: 100%;">Popular Vote Coin | Page {{page}} of {{pages}}</div>'
      }
    },
    renderDelay: 1000,
    timeout: 60000
  };
  
  // Generate PDF
  const outputPath = path.resolve(__dirname, '..', 'public', 'whitepaper-enhanced.pdf');
  console.log(`Generating PDF to: ${outputPath}`);
  
  pdf.create(finalHtml, options).toFile(outputPath, (err, res) => {
    if (err) {
      console.error('Error generating PDF:', err);
      process.exit(1);
    } else {
      console.log('PDF successfully generated:', res.filename);
      process.exit(0);
    }
  });
  
} catch (error) {
  console.error('Error in PDF generation process:', error);
  process.exit(1);
} 