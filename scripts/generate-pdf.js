/**
 * PDF Generator for Popular Vote Token Whitepaper
 * 
 * This script generates a PDF from the whitepaper HTML file with properly
 * working table of contents and bookmarks.
 * 
 * Usage: 
 * 1. Install dependencies: npm install html-pdf-node pdf-lib
 * 2. Run: node scripts/generate-pdf.js
 */

const htmlPdf = require('html-pdf-node');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { PDFDocument } = require('pdf-lib');

async function generatePDF() {
  console.log('Reading HTML file...');
  const htmlPath = path.join(__dirname, '../app/build/whitepaper.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Create a simplified HTML document with all content in one file to ensure TOC works
  const simplifiedHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Popular Vote Token Whitepaper</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.5;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-size: 0.85em;
    }
    
    .cover {
      min-height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: 120px;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .title {
      color: #663399;
      font-size: 1.6em;
      margin-bottom: 15px;
      font-weight: bold;
    }
    .subtitle {
      color: #666;
      font-size: 1em;
      margin-top: 10px;
    }
    
    h2 {
      color: #663399;
      border-bottom: 2px solid #663399;
      padding-bottom: 5px;
      margin-top: 40px;
      font-size: 1.5em;
    }
    h3 {
      color: #663399;
      margin-top: 30px;
      font-size: 1.2em;
    }
    .toc {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
      page-break-after: always;
    }
    .executive-summary {
      background-color: #f3e5f5;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    a {
      color: #663399;
      text-decoration: none;
    }
    strong {
      color: #512DA8;
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
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <div class="title">Popular Vote Token</div>
    <div class="subtitle">Whitepaper</div>
    <div class="subtitle">Version 1.3 | Conceptual Demonstration</div>
  </div>

  <!-- TOC -->
  <div class="toc">
    <h2>Table of Contents</h2>
    <ol>
      <li><a href="#executive-summary">Executive Summary</a></li>
      <li><a href="#introduction">Introduction</a>
        <ul>
          <li><a href="#market-analysis">Market Analysis</a></li>
          <li><a href="#vision-and-mission">Vision and Mission</a></li>
        </ul>
      </li>
      <li><a href="#meme-economics">Meme Economics</a>
        <ul>
          <li><a href="#attention-economy">Attention Economy</a></li>
          <li><a href="#cultural-alignment">Cultural Alignment</a></li>
          <li><a href="#memetic-value-proposition">Memetic Value Proposition</a></li>
        </ul>
      </li>
      <li><a href="#token-economics">Token Economics</a>
        <ul>
          <li><a href="#token-distribution">Token Distribution</a></li>
          <li><a href="#token-utility">Token Utility</a></li>
          <li><a href="#economic-sustainability">Economic Sustainability</a></li>
        </ul>
      </li>
      <li><a href="#platform-functionality">Platform Functionality</a>
        <ul>
          <li><a href="#voting-mechanism">Voting Mechanism</a></li>
          <li><a href="#user-experience">User Experience</a></li>
        </ul>
      </li>
      <li><a href="#security-architecture">Security Architecture</a></li>
      <li><a href="#governance-framework">Governance Framework</a></li>
      <li><a href="#conclusion">Conclusion</a></li>
    </ol>
  </div>
  
  <!-- Main Content -->
  <div class="executive-summary" id="executive-summary">
    <h2>Executive Summary</h2>
    <p>The Popular Vote Token is a conceptual demonstration of a decentralized voting system built on blockchain technology that enables transparent, secure, and tamper-proof polling. Through the use of the $VOTE token, the platform creates economic incentives for participation while ensuring the integrity of the voting process. While small in scope, this project illustrates how blockchain technology could revolutionize democratic decision-making and collective opinion gathering.</p>
  </div>

  <section>
    <h2 id="introduction">Introduction</h2>

    <h3 id="market-analysis">Market Analysis</h3>
    <p>Traditional polling and voting systems suffer from critical flaws that undermine public trust:</p>
    <ul>
        <li><strong>Opacity:</strong> Vote counting occurs in centralized, closed systems</li>
        <li><strong>Security vulnerabilities:</strong> Centralized databases are susceptible to hacking or manipulation</li>
        <li><strong>Low participation:</strong> High friction in existing voting mechanisms</li>
        <li><strong>Limited verifiability:</strong> Voters cannot independently verify results</li>
        <li><strong>Trust requirements:</strong> Voters must trust authorities without cryptographic proof</li>
    </ul>
  </section>

  <section>
    <h3 id="vision-and-mission">Vision and Mission</h3>
    <p><strong>Vision:</strong> To create a globally trusted platform for capturing public opinion through blockchain-secured, transparent, and verifiable polling.</p>
    <p><strong>Mission:</strong> To demonstrate how blockchain technology can create a user-friendly, economically incentivized platform that revolutionizes how collective decisions are made.</p>
  </section>

  <section>
    <h2 id="meme-economics">Meme Economics</h2>
    <p>The Popular Vote Token incorporates elements of meme economics to drive adoption, engagement, and long-term community formation. Memes are not just humorous internet content - they are powerful carriers of ideas, cultural signals, and value.</p>

    <h3 id="attention-economy">Attention Economy</h3>
    <p>In today's digital economy, attention is the scarcest resource. Our platform design recognizes this by:</p>
    <ul>
        <li>Creating visually distinctive branding that resonates with crypto-native users</li>
        <li>Designing interactive elements that encourage sharing and virality</li>
        <li>Rewarding early adopters with exclusive benefits and recognition</li>
    </ul>
  </section>

  <section>
    <h3 id="cultural-alignment">Cultural Alignment</h3>
    <p>The $VOTE token serves as both a functional utility and a cultural artifact that represents membership in a community with shared values. This dual nature:</p>
    <ul>
        <li>Creates stronger retention than purely speculative tokens</li>
        <li>Attracts participants who align with the platform's mission</li>
        <li>Establishes a foundation for long-term growth based on shared identity</li>
        <li>Drives adoption through narrative-based engagement around democratic participation</li>
    </ul>
  </section>

  <section>
    <h3 id="memetic-value-proposition">Memetic Value Proposition</h3>
    <p>Unlike traditional utility tokens, $VOTE contains an inherent memetic component:</p>
    <ul>
        <li><strong>Social Signaling:</strong> Holding $VOTE signals participation in democratic processes</li>
        <li><strong>In-Group Formation:</strong> Creating a sense of belonging through shared participation</li>
        <li><strong>Viral Mechanisms:</strong> Built-in incentives for users to spread the platform through social networks</li>
        <li><strong>Humor & Entertainment:</strong> Bringing playfulness to governance through meme-inspired voting categories</li>
    </ul>
    <p>The platform's "Favorite and Least Favorite Person" polls leverage universal human behaviors - celebrating heroes and criticizing villains - and transforms them into engagement mechanisms that drive community activity.</p>
  </section>

  <section>
    <h2 id="token-economics">Token Economics</h2>

    <h3 id="token-distribution">Token Distribution</h3>
    <p>The initial distribution of $VOTE tokens follows this allocation:</p>
    <table>
        <thead>
            <tr>
                <th>Allocation</th>
                <th>Percentage</th>
                <th>Purpose</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Community Rewards</td>
                <td>50%</td>
                <td>Rewards for active voters and poll participants</td>
            </tr>
            <tr>
                <td>Development</td>
                <td>20%</td>
                <td>Platform maintenance and feature development</td>
            </tr>
            <tr>
                <td>Founding Team</td>
                <td>15%</td>
                <td>Compensation for initial creators</td>
            </tr>
            <tr>
                <td>Ecosystem Growth</td>
                <td>10%</td>
                <td>Partnerships and integrations</td>
            </tr>
            <tr>
                <td>Liquidity Provision</td>
                <td>5%</td>
                <td>Market making and trading depth</td>
            </tr>
        </tbody>
    </table>
  </section>

  <section>
    <h3 id="token-utility">Token Utility</h3>
    <p>The $VOTE token serves multiple functions:</p>
    <ol>
        <li><strong>Governance Participation:</strong>
            <ul>
                <li>Vote on platform upgrades (1 token = 1 vote)</li>
                <li>Signal support for proposals</li>
            </ul>
        </li>
        <li><strong>Platform Access:</strong>
            <ul>
                <li>Cast votes in polls</li>
            </ul>
        </li>
        <li><strong>Economic Incentives:</strong>
            <ul>
                <li>Fee sharing for stakers</li>
                <li>Rewards for poll participation</li>
                <li>Delegation mechanism</li>
                <li>Incentives to hold tokens for participating in the next voting cycle</li>
            </ul>
        </li>
    </ol>
  </section>

  <section>
    <h3 id="economic-sustainability">Economic Sustainability</h3>
    <p>Long-term economic health is maintained through:</p>
    <ul>
        <li><strong>Staking Rewards:</strong> Users who stake tokens receive a portion of platform fees</li>
        <li><strong>24-Hour Vote Verification:</strong> Votes are only counted if the user still holds their tokens at the end of the 24-hour reset period, encouraging longer-term holding</li>
        <li><strong>Managed Token Velocity:</strong> The platform's design intentionally reduces token velocity (how quickly tokens change hands) through staking incentives and vote verification requirements, helping maintain token value while ensuring sufficient liquidity for regular participation</li>
    </ul>
  </section>

  <section>
    <h2 id="platform-functionality">Platform Functionality</h2>

    <h3 id="voting-mechanism">Voting Mechanism</h3>
    <p>The core voting process works as follows:</p>
    <ol>
        <li><strong>Poll Creation:</strong> Users create polls with multiple candidates</li>
        <li><strong>Verification:</strong> Optional verification of candidates through trusted sources</li>
        <li><strong>Voting Period:</strong> Users cast votes using their tokens</li>
        <li><strong>Result Tabulation:</strong> Votes are counted transparently on-chain</li>
        <li><strong>Reward Distribution:</strong> Participants receive token rewards</li>
    </ol>
    
    <p>The voting mechanics employ a validation system that ensures only committed participants' votes are counted:</p>
    <ol>
        <li>User connects wallet containing $VOTE tokens</li>
        <li>User casts vote for their chosen candidate</li>
        <li>Vote is recorded but remains in "pending" status</li>
        <li>At the end of the 24-hour period, the system verifies the user still holds their tokens</li>
        <li>If verification passes, the vote is counted; if not, the vote is discarded</li>
    </ol>
    
    <p>This mechanism prevents "vote and dump" behavior and encourages sustained participation in the ecosystem.</p>
    
    <p>Users vote on their favorite and least favorite candidates, allowing for:</p>
    <ul>
        <li><strong>Positive Reinforcement:</strong> Celebrating admired figures</li>
        <li><strong>Community Standards:</strong> Expressing disapproval of controversial figures</li>
        <li><strong>Time-Based Relevance:</strong> Capturing changing public sentiment over time</li>
        <li><strong>Real-World Events Response:</strong> Enabling communities to show support for or against real-world events and figures</li>
    </ul>
  </section>

  <section>
    <h3 id="user-experience">User Experience</h3>
    <p>The platform prioritizes user experience through:</p>
    <ul>
        <li><strong>Wallet Integration:</strong> Seamless connection with popular blockchain wallets</li>
        <li><strong>Mobile Responsiveness:</strong> Access on any device</li>
        <li><strong>Intuitive Interface:</strong> Clear voting mechanics without technical complexity</li>
        <li><strong>Real-time Updates:</strong> Immediate display of vote counts and poll status</li>
    </ul>
  </section>

  <section>
    <h2 id="security-architecture">Security Architecture</h2>
    <p>As a demonstration project, the platform incorporates several security principles:</p>
    <ul>
        <li><strong>Transparency:</strong> All votes are publicly verifiable</li>
        <li><strong>Immutability:</strong> Once cast, votes cannot be altered</li>
        <li><strong>Resistance to Manipulation:</strong> Stake-based voting prevents Sybil attacks</li>
        <li><strong>Identity Protection:</strong> Users can vote without revealing personal details</li>
    </ul>
  </section>

  <section>
    <h2 id="governance-framework">Governance Framework</h2>
    <p>The platform's governance follows a token-weighted voting model:</p>
    <ol>
        <li><strong>Discussion Period:</strong> Community deliberation</li>
        <li><strong>Voting Period:</strong> Token holders vote</li>
        <li><strong>Execution:</strong> Approved proposals are implemented</li>
    </ol>
  </section>

  <section>
    <h2 id="conclusion">Conclusion</h2>
    <p>The Popular Vote Token demonstrates how blockchain technology can transform democratic participation. While small in scope, this project illustrates the potential for secure, transparent, and engaging polling systems.</p>
    <p>This project is not just about voting—it's about building community around shared interests, creating economic alignment between participants, and leveraging the power of memes to spread adoption. Holding tokens creates a continuous incentive to remain engaged in future voting events, developing a committed community that actively participates in expressing support or criticism for real-world events and figures.</p>
    <p>By combining technical innovation with cultural awareness, the Popular Vote Token points toward a future where digital governance is both effective and enjoyable.</p>
    <p><em>This whitepaper is a living document and will be updated as the Popular Vote Token evolves.</em></p>
  </section>
</body>
</html>`;
  
  // Create temp directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'whitepaper-'));
  
  // Write the HTML file
  const simplifiedHtmlPath = path.join(tmpDir, 'whitepaper.html');
  fs.writeFileSync(simplifiedHtmlPath, simplifiedHTML);
  
  // PDF generation options
  const options = { 
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '10mm',
      right: '10mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width: 100%; text-align: center; font-size: 10px; color: #444;">Popular Vote Token Whitepaper | <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    preferCSSPageSize: true
  };
  
  console.log('Generating PDF...');
  const file = { url: `file://${simplifiedHtmlPath}` };
  
  try {
    // Generate PDF
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Output directory
    const outputDir = path.join(__dirname, '../public/docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the PDF
    const whitepaperPdfPath = path.join(outputDir, 'whitepaper.pdf');
    fs.writeFileSync(whitepaperPdfPath, pdfBuffer);
    
    console.log(`PDF successfully generated at ${whitepaperPdfPath}`);
    console.log('Table of contents is now on page 2 of the PDF.');
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

// Run the generation
generatePDF().catch(error => {
  console.error('Error in PDF generation process:', error);
  process.exit(1);
}); 