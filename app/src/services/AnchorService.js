import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Default values
const DEFAULT_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

// Function to load IDL from public directory
async function loadIdl() {
  try {
    const response = await fetch('/target/idl/memecoin_vote.json');
    if (!response.ok) {
      throw new Error('Failed to fetch IDL');
    }
    const idlData = await response.json();
    console.log('IDL loaded successfully');
    return idlData;
  } catch (error) {
    console.error('Error loading IDL:', error);
    return null;
  }
}

class AnchorService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = new PublicKey(DEFAULT_PROGRAM_ID);
    this.provider = null;
    this.program = null;
    this.idl = null;
    this.idlLoaded = false;
    this.initialize();
  }

  async initialize() {
    if (!this.wallet) return;
    
    this.provider = new AnchorProvider(
      this.connection,
      this.wallet,
      { commitment: 'processed' }
    );
    
    // Load the IDL
    try {
      this.idl = await loadIdl();
      if (this.idl && this.idl.metadata?.address) {
        this.programId = new PublicKey(this.idl.metadata.address);
      }
      
      if (this.idl) {
        this.program = new Program(this.idl, this.programId, this.provider);
        this.idlLoaded = true;
        console.log('AnchorService initialized successfully');
      } else {
        console.error('Failed to initialize Program: IDL not loaded');
      }
    } catch (error) {
      console.error('Error initializing AnchorService:', error);
    }
  }

  async getProgram() {
    if (!this.idlLoaded) {
      await this.initialize();
    }
    return this.program;
  }

  async fetchPoll(pollId, pollType) {
    try {
      const program = await this.getProgram();
      if (!program) {
        throw new Error('Program not initialized');
      }
      
      const pollTypeValue = pollType === 'best' ? { best: {} } : { worst: {} };
      const [pollPda] = await this.getPollPda(pollId, pollTypeValue);
      
      const pollAccount = await program.account.poll.fetch(pollPda);
      return pollAccount;
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw error;
    }
  }

  async fetchCandidates(pollId, pollType) {
    try {
      const program = await this.getProgram();
      if (!program) {
        throw new Error('Program not initialized');
      }
      
      const pollTypeValue = pollType === 'best' ? { best: {} } : { worst: {} };
      const candidates = await program.account.candidate.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: pollId.toString(),
          },
        },
        {
          memcmp: {
            offset: 8 + 8, // After discriminator and pollId
            bytes: pollTypeValue,
          },
        },
      ]);
      
      return candidates;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  async vote(pollId, pollType, candidatePublicKey) {
    try {
      const program = await this.getProgram();
      if (!program) {
        throw new Error('Program not initialized');
      }
      
      const pollTypeValue = pollType === 'best' ? { best: {} } : { worst: {} };
      const [pollPda] = await this.getPollPda(pollId, pollTypeValue);
      const [userVotePda] = await this.getUserVotePda(pollId, pollTypeValue);
      
      // Get the user's token account
      const tokenAccount = await this.program.provider.connection.getTokenAccountsByOwner(
        this.wallet.publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );
      
      const tx = await program.methods
        .vote(pollId, pollTypeValue)
        .accounts({
          pollAccount: pollPda,
          candidateAccount: candidatePublicKey,
          userVoteAccount: userVotePda,
          tokenAccount: tokenAccount.value[0].pubkey,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  }

  async getPollSystemPda() {
    const [pollSystemPda] = await PublicKey.findProgramAddressSync(
      [Buffer.from('poll_system')],
      this.programId
    );
    return [pollSystemPda];
  }

  async getPollPda(pollId, pollType) {
    const pollTypeStr = Object.keys(pollType)[0];
    const [pollPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('poll'),
        Buffer.from(pollId.toString()),
        Buffer.from(pollTypeStr),
      ],
      this.programId
    );
    return [pollPda];
  }

  async getUserVotePda(pollId, pollType) {
    const pollTypeStr = Object.keys(pollType)[0];
    const [userVotePda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_vote'),
        Buffer.from(pollId.toString()),
        Buffer.from(pollTypeStr),
        this.wallet.publicKey.toBuffer(),
      ],
      this.programId
    );
    return [userVotePda];
  }
}

// Hook to use AnchorService with React
export function useAnchorService() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  
  // Only create a new service if wallet is connected
  if (!publicKey) {
    return {
      service: null,
      isReady: false,
    };
  }
  
  // Create the anchor wallet adapter from wallet
  const anchorWallet = {
    publicKey: publicKey,
    signTransaction,
    signAllTransactions
  };
  
  const service = new AnchorService(connection, anchorWallet);
  return {
    service,
    isReady: service.idlLoaded,
  };
}

export default AnchorService; 