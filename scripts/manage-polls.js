const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram } = anchor.web3;
const fs = require('fs');

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load deployment info
let deploymentInfo;
try {
  deploymentInfo = JSON.parse(fs.readFileSync('./deployment-info.json', 'utf8'));
} catch (error) {
  console.error("Error loading deployment info:", error);
  process.exit(1);
}

const programId = new PublicKey(deploymentInfo.programId);
const program = new anchor.Program(require('../target/idl/memecoin_vote.json'), programId);
const pollSystemPubkey = new PublicKey(deploymentInfo.pollSystem);

// Available commands
const commands = {
  'create-polls': createDailyPolls,
  'add-candidate': addCandidate,
  'close-polls': closePolls,
  'view-results': viewPollResults,
};

async function createDailyPolls() {
  try {
    const now = Math.floor(Date.now() / 1000);
    console.log(`Creating new daily polls starting at timestamp: ${now}`);
    
    // Calculate PDA for best poll
    const [bestPollPubkey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("poll"),
        pollSystemPubkey.toBuffer(),
        Buffer.from([0]), // Use 0 for the first poll
      ],
      programId
    );
    
    // Create "best person" poll
    const bestTx = await program.methods
      .createBestPoll(new anchor.BN(now))
      .accounts({
        pollSystem: pollSystemPubkey,
        pollAccount: bestPollPubkey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log(`"Best person" poll created. Transaction: ${bestTx}`);
    
    // Calculate PDA for worst poll
    const [worstPollPubkey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("poll"),
        pollSystemPubkey.toBuffer(),
        Buffer.from([0]), // Use 0 for the first poll
      ],
      programId
    );
    
    // Create "worst person" poll
    const worstTx = await program.methods
      .createWorstPoll(new anchor.BN(now))
      .accounts({
        pollSystem: pollSystemPubkey,
        pollAccount: worstPollPubkey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log(`"Worst person" poll created. Transaction: ${worstTx}`);
    
    // Save poll info
    const pollInfo = {
      bestPoll: bestPollPubkey.toString(),
      worstPoll: worstPollPubkey.toString(),
      startTime: now,
      createdAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      './current-polls.json',
      JSON.stringify(pollInfo, null, 2)
    );
    
    console.log("Poll information saved to current-polls.json");
    
    // Copy poll info to app/public directory for the frontend
    try {
      // Create app/public directory if it doesn't exist
      const publicDir = './app/public';
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Copy the file
      fs.writeFileSync(
        './app/public/current-polls.json',
        JSON.stringify(pollInfo, null, 2)
      );
      console.log("Poll information copied to app/public/current-polls.json for frontend");
    } catch (error) {
      console.error("Warning: Failed to copy poll info to app/public directory:", error);
    }
    
  } catch (error) {
    console.error("Error creating polls:", error);
  }
}

async function addCandidate(name, wikipediaUrl, pollType) {
  try {
    // Load current polls
    const pollInfo = JSON.parse(fs.readFileSync('./current-polls.json', 'utf8'));
    
    const pollPubkey = new PublicKey(
      pollType === 'best' ? pollInfo.bestPoll : pollInfo.worstPoll
    );
    
    // Calculate PDA for the candidate
    const [candidatePubkey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("candidate"),
        pollPubkey.toBuffer(),
        Buffer.from(name),
      ],
      programId
    );
    
    const tx = await program.methods
      .addCandidate(
        new anchor.BN(0), // First poll ID
        { [pollType]: {} }, // Convert string to enum variant
        name,
        wikipediaUrl
      )
      .accounts({
        pollSystem: pollSystemPubkey,
        pollAccount: pollPubkey,
        candidateAccount: candidatePubkey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log(`Candidate "${name}" added to ${pollType} poll. Transaction: ${tx}`);
    
    // Update candidates in poll info
    if (!pollInfo.candidates) {
      pollInfo.candidates = {};
    }
    
    if (!pollInfo.candidates[pollType]) {
      pollInfo.candidates[pollType] = [];
    }
    
    pollInfo.candidates[pollType].push({
      name,
      wikipediaUrl,
      pubkey: candidatePubkey.toString(),
      addedAt: new Date().toISOString(),
    });
    
    fs.writeFileSync(
      './current-polls.json',
      JSON.stringify(pollInfo, null, 2)
    );
    
    // Copy updated poll info to app/public directory for the frontend
    try {
      const publicDir = './app/public';
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      fs.writeFileSync(
        './app/public/current-polls.json',
        JSON.stringify(pollInfo, null, 2)
      );
      console.log("Updated poll information copied to frontend directory");
    } catch (error) {
      console.error("Warning: Failed to copy poll info to app/public directory:", error);
    }
    
  } catch (error) {
    console.error("Error adding candidate:", error);
  }
}

async function closePolls() {
  try {
    // Load current polls
    const pollInfo = JSON.parse(fs.readFileSync('./current-polls.json', 'utf8'));
    
    const bestPollPubkey = new PublicKey(pollInfo.bestPoll);
    const worstPollPubkey = new PublicKey(pollInfo.worstPoll);
    
    // Close "best person" poll
    const bestTx = await program.methods
      .closePoll(
        new anchor.BN(0), // First poll ID
        { best: {} } // Convert string to enum variant
      )
      .accounts({
        pollSystem: pollSystemPubkey,
        pollAccount: bestPollPubkey,
        authority: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log(`"Best person" poll closed. Transaction: ${bestTx}`);
    
    // Close "worst person" poll
    const worstTx = await program.methods
      .closePoll(
        new anchor.BN(0), // First poll ID
        { worst: {} } // Convert string to enum variant
      )
      .accounts({
        pollSystem: pollSystemPubkey,
        pollAccount: worstPollPubkey,
        authority: provider.wallet.publicKey,
      })
      .rpc();
    
    console.log(`"Worst person" poll closed. Transaction: ${worstTx}`);
    
    // Update poll info
    pollInfo.closedAt = new Date().toISOString();
    
    // Move to historical polls
    let historicalPolls = [];
    try {
      historicalPolls = JSON.parse(fs.readFileSync('./historical-polls.json', 'utf8'));
    } catch (error) {
      // File doesn't exist yet, that's okay
    }
    
    historicalPolls.push(pollInfo);
    
    fs.writeFileSync(
      './historical-polls.json',
      JSON.stringify(historicalPolls, null, 2)
    );
    
    console.log("Poll closed and moved to historical polls");
    
  } catch (error) {
    console.error("Error closing polls:", error);
  }
}

async function viewPollResults() {
  try {
    // Load current polls
    const pollInfo = JSON.parse(fs.readFileSync('./current-polls.json', 'utf8'));
    
    if (!pollInfo.candidates || (!pollInfo.candidates.best && !pollInfo.candidates.worst)) {
      console.log("No candidates found in current polls");
      return;
    }
    
    console.log("CURRENT POLL RESULTS:");
    
    // Display best poll results
    if (pollInfo.candidates.best && pollInfo.candidates.best.length > 0) {
      console.log("\n=== BEST PERSON POLL ===");
      
      for (const candidate of pollInfo.candidates.best) {
        const candidatePubkey = new PublicKey(candidate.pubkey);
        const candidateAccount = await program.account.candidate.fetch(candidatePubkey);
        
        console.log(`${candidate.name}: ${candidateAccount.votes.toString()} votes`);
      }
    }
    
    // Display worst poll results
    if (pollInfo.candidates.worst && pollInfo.candidates.worst.length > 0) {
      console.log("\n=== WORST PERSON POLL ===");
      
      for (const candidate of pollInfo.candidates.worst) {
        const candidatePubkey = new PublicKey(candidate.pubkey);
        const candidateAccount = await program.account.candidate.fetch(candidatePubkey);
        
        console.log(`${candidate.name}: ${candidateAccount.votes.toString()} votes`);
      }
    }
    
  } catch (error) {
    console.error("Error viewing poll results:", error);
  }
}

async function main() {
  const command = process.argv[2];
  
  if (!command || !commands[command]) {
    console.log("Available commands:");
    Object.keys(commands).forEach(cmd => console.log(`  - ${cmd}`));
    process.exit(1);
  }
  
  if (command === 'add-candidate') {
    if (process.argv.length < 6) {
      console.log("Usage: node manage-polls.js add-candidate <name> <wikipediaUrl> <pollType>");
      console.log("  pollType: 'best' or 'worst'");
      process.exit(1);
    }
    
    const name = process.argv[3];
    const wikipediaUrl = process.argv[4];
    const pollType = process.argv[5];
    
    if (pollType !== 'best' && pollType !== 'worst') {
      console.log("Poll type must be 'best' or 'worst'");
      process.exit(1);
    }
    
    await addCandidate(name, wikipediaUrl, pollType);
  } else {
    await commands[command]();
  }
}

main(); 