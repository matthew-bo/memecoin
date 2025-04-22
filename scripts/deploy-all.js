#!/usr/bin/env node
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  programDir: path.join(__dirname, '../src/program'),
  deployedInfoPath: path.join(__dirname, '../deployment-info.json'),
  network: 'devnet', // or 'mainnet-beta', 'testnet'
};

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute a command and return output as promise
 */
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${command}\n`);
    
    const childProcess = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      
      resolve(stdout);
    });
    
    // Stream output to console
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  });
}

/**
 * Ask a question and get user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Wait for a specified time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main deployment function
 */
async function deploy() {
  try {
    console.log('=========================================');
    console.log('MemeVote Deployment Script');
    console.log('=========================================');
    
    // Check if deployment info already exists
    if (fs.existsSync(CONFIG.deployedInfoPath)) {
      const answer = await askQuestion('deployment-info.json already exists. Continue anyway? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Deployment aborted.');
        process.exit(0);
      }
    }
    
    // Check Solana CLI and network
    try {
      const solanaVersion = await execCommand('solana --version');
      console.log(`\nSolana CLI detected: ${solanaVersion.trim()}`);
      
      const networkConfig = await execCommand('solana config get');
      console.log(`\nCurrent network configuration:\n${networkConfig.trim()}`);
      
      const answer = await askQuestion(`\nDeploy to ${CONFIG.network}? (y/n): `);
      if (answer.toLowerCase() !== 'y') {
        console.log('Deployment aborted.');
        process.exit(0);
      }
      
      await execCommand(`solana config set --url ${CONFIG.network}`);
      console.log(`\nSwitched to ${CONFIG.network}`);
    } catch (error) {
      console.error('Error checking Solana CLI. Make sure it is installed and configured correctly.');
      process.exit(1);
    }
    
    // Check Anchor CLI
    try {
      const anchorVersion = await execCommand('anchor --version');
      console.log(`\nAnchor CLI detected: ${anchorVersion.trim()}`);
    } catch (error) {
      console.error('Error checking Anchor CLI. Make sure it is installed.');
      process.exit(1);
    }
    
    // Build the Solana program
    console.log('\n1. Building Solana program...');
    await execCommand('npm run build:program');
    console.log('\nBuild successful ✅');
    
    // Deploy the program to Solana
    console.log('\n2. Deploying program to Solana...');
    await execCommand('npm run deploy:program');
    console.log('\nDeployment successful ✅');
    
    // Initialize the token
    console.log('\n3. Initializing MemeVote token...');
    await execCommand('npm run init');
    
    // Verify deployment-info.json exists
    if (!fs.existsSync(CONFIG.deployedInfoPath)) {
      console.error('Error: deployment-info.json was not created. Token initialization may have failed.');
      process.exit(1);
    }
    console.log('\nToken initialization successful ✅');
    
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync(CONFIG.deployedInfoPath, 'utf8'));
    console.log('\nDeployment Information:');
    console.log('Program ID:', deploymentInfo.programId);
    console.log('Token Mint:', deploymentInfo.tokenMint);
    console.log('Authority:', deploymentInfo.authority);
    
    // Create initial polls
    console.log('\n4. Creating initial polls...');
    await execCommand('npm run create-polls');
    console.log('\nPolls created successfully ✅');
    
    // Verify current-polls.json exists
    if (!fs.existsSync(path.join(__dirname, '../current-polls.json'))) {
      console.error('Warning: current-polls.json was not created. Poll creation may have failed.');
    } else {
      console.log('\nCurrent polls information created successfully ✅');
    }
    
    // Add sample candidates
    console.log('\n5. Adding sample candidates...');
    
    // Best category candidates
    console.log('\nAdding "best" category candidates:');
    await execCommand('npm run add-candidate "Elon Musk" "https://en.wikipedia.org/wiki/Elon_Musk" best');
    await execCommand('npm run add-candidate "Vitalik Buterin" "https://en.wikipedia.org/wiki/Vitalik_Buterin" best');
    await execCommand('npm run add-candidate "Keanu Reeves" "https://en.wikipedia.org/wiki/Keanu_Reeves" best');
    
    // Worst category candidates
    console.log('\nAdding "worst" category candidates:');
    await execCommand('npm run add-candidate "Vladimir Putin" "https://en.wikipedia.org/wiki/Vladimir_Putin" worst');
    await execCommand('npm run add-candidate "Kim Jong-un" "https://en.wikipedia.org/wiki/Kim_Jong-un" worst');
    await execCommand('npm run add-candidate "Harvey Weinstein" "https://en.wikipedia.org/wiki/Harvey_Weinstein" worst');
    
    console.log('\nCandidates added successfully ✅');
    
    // Deployment complete
    console.log('\n=========================================');
    console.log('Deployment completed successfully! 🚀');
    console.log('=========================================');
    
    console.log(`\nNext steps:
1. Use the frontend to interact with the deployed contracts
2. Run 'npm start' to start the React app
3. Connect your wallet and buy tokens
4. Cast votes in the current polls`);
    
    rl.close();
  } catch (error) {
    console.error('Error during deployment:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the deployment
deploy(); 