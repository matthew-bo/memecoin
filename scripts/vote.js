const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram } = anchor.web3;
const fs = require('fs');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');

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
const tokenMintPubkey = new PublicKey(deploymentInfo.tokenMint);

async function castVote(candidateName, pollType) {
  try {
    // Load current polls
    const pollInfo = JSON.parse(fs.readFileSync('./current-polls.json', 'utf8'));
    
    // Get poll pubkey based on type
    const pollPubkey = new PublicKey(
      pollType === 'best' ? pollInfo.bestPoll : pollInfo.worstPoll
    );
    
    // Find candidate matching the name
    const candidates = pollInfo.candidates && pollInfo.candidates[pollType];
    if (!candidates || candidates.length === 0) {
      console.error(`No candidates found for ${pollType} poll`);
      return;
    }
    
    const candidate = candidates.find(c => c.name === candidateName);
    if (!candidate) {
      console.error(`Candidate "${candidateName}" not found in ${pollType} poll`);
      console.log("Available candidates:");
      candidates.forEach(c => console.log(`  - ${c.name}`));
      return;
    }
    
    const candidatePubkey = new PublicKey(candidate.pubkey);
    
    // Calculate PDA for user vote account
    const [userVotePubkey] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("user_vote"),
        pollPubkey.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      programId
    );
    
    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMintPubkey, 
      provider.wallet.publicKey
    );
    
    // Cast vote
    const tx = await program.methods
      .vote(
        new anchor.BN(0), // First poll ID
        { [pollType]: {} } // Convert string to enum variant
      )
      .accounts({
        pollAccount: pollPubkey,
        candidateAccount: candidatePubkey,
        userVoteAccount: userVotePubkey,
        tokenAccount: userTokenAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log(`Vote cast successfully for "${candidateName}" in ${pollType} poll`);
    console.log(`Transaction: ${tx}`);
    
  } catch (error) {
    console.error("Error casting vote:", error);
    console.error(error.logs || error.message);
  }
}

async function main() {
  if (process.argv.length < 4) {
    console.log("Usage: node vote.js <candidateName> <pollType>");
    console.log("  pollType: 'best' or 'worst'");
    process.exit(1);
  }
  
  const candidateName = process.argv[2];
  const pollType = process.argv[3];
  
  if (pollType !== 'best' && pollType !== 'worst') {
    console.log("Poll type must be 'best' or 'worst'");
    process.exit(1);
  }
  
  await castVote(candidateName, pollType);
}

main(); 