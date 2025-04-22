const anchor = require('@coral-xyz/anchor');
const { PublicKey } = anchor.web3;
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } = require('@solana/spl-token');
const fs = require('fs');
const readline = require('readline');

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load deployment info
let deploymentInfo;
try {
  deploymentInfo = JSON.parse(fs.readFileSync('./deployment-info.json', 'utf8'));
} catch (error) {
  console.error("Error loading deployment info. Make sure to run init-token.js first:", error);
  process.exit(1);
}

const programId = new PublicKey(deploymentInfo.programId);
const program = new anchor.Program(require('../target/idl/memecoin_vote.json'), programId);
const tokenMintPubkey = new PublicKey(deploymentInfo.tokenMint);
const authority = new PublicKey(deploymentInfo.authority);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Airdrop to a single wallet
async function airdropToWallet(recipientAddress, amount) {
  try {
    const recipient = new PublicKey(recipientAddress);
    
    // Get authority token account
    const authorityTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      authority
    );
    
    // Get or create recipient's associated token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      recipient
    );
    
    // Check if recipient token account exists
    const accountInfo = await provider.connection.getAccountInfo(recipientTokenAccount);
    
    let tx = new anchor.web3.Transaction();
    
    // If recipient token account doesn't exist, create it
    if (!accountInfo) {
      console.log(`Creating token account for recipient ${recipientAddress}`);
      tx.add(
        createAssociatedTokenAccountInstruction(
          provider.wallet.publicKey,
          recipientTokenAccount,
          recipient,
          tokenMintPubkey
        )
      );
    }
    
    // Add transfer instruction
    tx.add(
      createTransferInstruction(
        authorityTokenAccount,
        recipientTokenAccount,
        provider.wallet.publicKey,
        amount * Math.pow(10, 9) // Convert to raw units with 9 decimals
      )
    );
    
    // Send transaction
    const signature = await provider.sendAndConfirm(tx);
    console.log(`✅ Airdropped ${amount} tokens to ${recipientAddress}`);
    console.log(`Transaction signature: ${signature}`);
    return signature;
  } catch (error) {
    console.error(`Error airdropping to ${recipientAddress}:`, error);
    return null;
  }
}

// Batch airdrop from CSV file
async function batchAirdrop(csvFilePath) {
  try {
    if (!fs.existsSync(csvFilePath)) {
      console.error(`File not found: ${csvFilePath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    console.log(`Processing ${lines.length} recipients from ${csvFilePath}`);
    
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const [address, amountStr] = line.split(',').map(item => item.trim());
      const amount = parseFloat(amountStr);
      
      if (!address || isNaN(amount)) {
        console.log(`Skipping invalid line: ${line}`);
        failCount++;
        results.push({
          address: address || 'Invalid',
          amount: amountStr || 'Invalid',
          success: false,
          error: 'Invalid format'
        });
        continue;
      }
      
      console.log(`[${i+1}/${lines.length}] Airdropping ${amount} tokens to ${address}...`);
      
      try {
        const signature = await airdropToWallet(address, amount);
        if (signature) {
          successCount++;
          results.push({
            address,
            amount,
            success: true,
            signature
          });
        } else {
          failCount++;
          results.push({
            address,
            amount,
            success: false,
            error: 'Transaction failed'
          });
        }
      } catch (error) {
        failCount++;
        results.push({
          address,
          amount,
          success: false,
          error: error.message
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save results to log file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logFilePath = `./airdrop-log-${timestamp}.json`;
    fs.writeFileSync(
      logFilePath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalProcessed: lines.length,
        successCount,
        failCount,
        results
      }, null, 2)
    );
    
    console.log('\nAirdrop Summary:');
    console.log(`Total processed: ${lines.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Results saved to: ${logFilePath}`);
    
  } catch (error) {
    console.error('Error in batch airdrop:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 MemeVote Token Airdrop Tool 🚀');
    console.log(`Connected to ${provider.connection.rpcEndpoint}`);
    console.log(`Token mint: ${tokenMintPubkey.toString()}`);
    console.log(`Authority: ${authority.toString()}`);
    
    // Get authority token balance
    const authorityTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey,
      authority
    );
    
    const tokenAccountInfo = await provider.connection.getAccountInfo(authorityTokenAccount);
    if (!tokenAccountInfo) {
      console.error(`Authority token account not found. Please make sure you have tokens to airdrop.`);
      process.exit(1);
    }
    
    let mode = '';
    while (mode !== '1' && mode !== '2' && mode !== '3') {
      console.log('\nAvailable options:');
      console.log('1. Airdrop to a single wallet');
      console.log('2. Batch airdrop from CSV file (format: address,amount on each line)');
      console.log('3. Exit');
      
      mode = await askQuestion('Select an option (1-3): ');
      
      if (mode !== '1' && mode !== '2' && mode !== '3') {
        console.log('Invalid option. Please select 1, 2, or 3.');
      }
    }
    
    if (mode === '1') {
      // Single wallet airdrop
      const recipientAddress = await askQuestion('Enter recipient wallet address: ');
      const amount = parseFloat(await askQuestion('Enter amount to airdrop: '));
      
      if (isNaN(amount) || amount <= 0) {
        console.error('Invalid amount. Please enter a positive number.');
        process.exit(1);
      }
      
      await airdropToWallet(recipientAddress, amount);
    } else if (mode === '2') {
      // Batch airdrop
      const csvFilePath = await askQuestion('Enter path to CSV file: ');
      await batchAirdrop(csvFilePath);
    }
    
    console.log('Airdrop process completed.');
  } catch (error) {
    console.error('Error in airdrop process:', error);
  } finally {
    rl.close();
  }
}

main(); 