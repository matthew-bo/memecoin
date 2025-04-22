const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Your program ID (will be different after deployment)
const programId = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const program = new anchor.Program(require('../target/idl/memecoin_vote.json'), programId);

async function main() {
  try {
    console.log("Starting memecoin initialization...");
    
    // Generate a new keypair for the token mint
    const mintKeypair = anchor.web3.Keypair.generate();
    console.log(`Token mint address: ${mintKeypair.publicKey.toString()}`);
    
    // Create accounts for our metadata
    const tokenMetadata = anchor.web3.Keypair.generate();
    const pollSystem = anchor.web3.Keypair.generate();
    
    // Memecoin configuration
    const tokenName = "MemeVote";
    const tokenSymbol = "MVOTE";
    const tokenUri = "https://mymemecoin.com/metadata.json";
    const decimals = 9;
    const totalSupply = new anchor.BN("100000000000000000000"); // 100 billion with 9 decimals
    
    console.log(`Initializing token with name: ${tokenName}, symbol: ${tokenSymbol}`);
    
    // Initialize token
    const tx = await program.methods
      .initializeToken(
        tokenName,
        tokenSymbol,
        tokenUri,
        decimals,
        totalSupply
      )
      .accounts({
        tokenMetadata: tokenMetadata.publicKey,
        tokenMint: mintKeypair.publicKey,
        pollSystem: pollSystem.publicKey,
        authority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair, tokenMetadata, pollSystem])
      .rpc();
    
    console.log(`Transaction signature: ${tx}`);
    console.log("Memecoin initialized successfully!");
    
    // Save important addresses to a file
    const deploymentInfo = {
      programId: programId.toString(),
      tokenMint: mintKeypair.publicKey.toString(),
      tokenMetadata: tokenMetadata.publicKey.toString(),
      pollSystem: pollSystem.publicKey.toString(),
      authority: provider.wallet.publicKey.toString(),
      networkUrl: provider.connection.rpcEndpoint,
      deploymentDate: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      './deployment-info.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("Deployment information saved to deployment-info.json");
    
    // Copy deployment info to app/public directory for the frontend
    try {
      // Create app/public directory if it doesn't exist
      const publicDir = './app/public';
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Copy the file
      fs.writeFileSync(
        './app/public/deployment-info.json',
        JSON.stringify(deploymentInfo, null, 2)
      );
      console.log("Deployment information copied to app/public/deployment-info.json for frontend");
    } catch (error) {
      console.error("Warning: Failed to copy deployment info to app/public directory:", error);
    }
    
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

main(); 