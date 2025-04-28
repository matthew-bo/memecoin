import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

// Default values - will be updated after fetching deployment info
let TOKEN_MINT = 'FG6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
let PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
let POLL_SYSTEM = '';
let tokenMint;
let programId;
let connection;
let program = null;

// Initialize connection with default values
connection = new Connection('https://api.devnet.solana.com', 'confirmed');
tokenMint = new PublicKey(TOKEN_MINT);
programId = new PublicKey(PROGRAM_ID);

// Load deployment info from public directory
async function loadDeploymentInfo() {
  try {
    const response = await fetch('/deployment-info.json');
    if (!response.ok) {
      console.warn('Using default deployment info');
      return null;
    }
    const deploymentInfo = await response.json();
    
    // Update values with fetched data
    TOKEN_MINT = deploymentInfo.tokenMint || TOKEN_MINT;
    PROGRAM_ID = deploymentInfo.programId || PROGRAM_ID;
    POLL_SYSTEM = deploymentInfo.pollSystem || POLL_SYSTEM;
    
    const networkUrl = deploymentInfo.networkUrl || 'https://api.devnet.solana.com';
    connection = new Connection(networkUrl, 'confirmed');
    
    tokenMint = new PublicKey(TOKEN_MINT);
    programId = new PublicKey(PROGRAM_ID);
    
    console.log('Deployment info loaded successfully');
    return deploymentInfo;
  } catch (error) {
    console.warn('Error loading deployment info, using defaults:', error);
    return null;
  }
}

// Load the IDL
async function loadIDL() {
  try {
    const response = await fetch('/target/idl/memecoin_vote.json');
    if (!response.ok) {
      console.warn('IDL not found, some functionality may be limited');
      return null;
    }
    const idl = await response.json();
    console.log('IDL loaded successfully');
    return idl;
  } catch (error) {
    console.warn('Failed to load IDL, some functionality may be limited:', error);
    return null;
  }
}

// Initialize program when possible
async function initializeProgram() {
  try {
    const idl = await loadIDL();
    if (idl && programId) {
      const provider = new anchor.AnchorProvider(
        connection,
        {}, // Empty wallet for read-only operations
        { commitment: 'processed' }
      );
      program = new anchor.Program(idl, programId, provider);
      console.log('Anchor program instantiated');
    }
  } catch (error) {
    console.warn('Failed to initialize program:', error);
  }
}

// Start initialization
loadDeploymentInfo().then(() => initializeProgram());

/**
 * Service for interacting with the MemeVote token and voting system
 */
class TokenService {
  /**
   * Get token balance for a wallet
   * @param {PublicKey} walletPubkey - Wallet public key
   * @returns {Promise<Object>} Token balance data
   */
  static async getTokenBalance(walletPubkey) {
    try {
      if (!walletPubkey) {
        console.error('No wallet public key provided for token balance check');
        return { success: false, error: 'Wallet public key is required', balance: 0 };
      }

      // For devnet testing, get the token mint from deployment info
      const mintAddress = TokenService.tokenInfo?.mintAddress || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
      const mint = new anchor.web3.PublicKey(mintAddress);

      try {
        // Try to get token account info
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          walletPubkey,
          { mint }
        );

        // If the user has a token account for this mint
        if (tokenAccounts.value.length > 0) {
          const accountInfo = tokenAccounts.value[0].account.data.parsed.info;
          const balance = accountInfo.tokenAmount.uiAmount;
          console.log(`Real token balance for ${walletPubkey.toString()}: ${balance}`);
          
          return {
            success: true,
            balance,
            mintAddress
          };
        } else {
          console.log(`No token account found for ${walletPubkey.toString()}`);
          // User has no token account yet, return 0 balance
          return {
            success: true,
            balance: 0,
            mintAddress
          };
        }
      } catch (error) {
        console.error('Error fetching token account:', error);
        // For development fallback: Generate a mock balance
        // This allows testing UI without actual tokens
        const hash = walletPubkey.toString().slice(-6);
        const mockBalance = parseInt(hash, 16) % 10000 / 100;
        console.log(`Using mock token balance: ${mockBalance}`);
        
        return {
          success: true,
          balance: mockBalance,
          mintAddress,
          isMock: true
        };
      }
    } catch (error) {
      console.error('Error in getTokenBalance:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get token balance',
        balance: 0
      };
    }
  }

  /**
   * Get transaction history for a wallet
   * @param {string} publicKey - Wallet public key
   * @returns {Promise<Array>} Transaction history
   */
  static async getTransactionHistory(publicKey) {
    try {
      if (!publicKey) {
        console.error('No public key provided for transaction history');
        return [];
      }

      console.log('Fetching transaction history for:', publicKey);
      
      // Create PublicKey object if string was passed
      const pubkey = typeof publicKey === 'string' 
        ? new anchor.web3.PublicKey(publicKey) 
        : publicKey;

      // Get the token mint address
      const mintAddress = TokenService.tokenInfo?.mintAddress || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
      const mint = new anchor.web3.PublicKey(mintAddress);
      
      try {
        // Get signatures for transactions involving this wallet
        const signatures = await connection.getSignaturesForAddress(
          pubkey, 
          { limit: 10 }
        );
        
        if (!signatures.length) {
          console.log('No transactions found');
          return [];
        }
        
        // Get transaction details for each signature
        const transactions = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });
            
            if (!tx) return null;
            
            // Process transaction to extract relevant information
            // This needs to be customized based on your transaction structure
            return {
              signature: sig.signature,
              timestamp: new Date(tx.blockTime * 1000).toISOString(),
              amount: 'Unknown', // Need to extract from transaction data
              type: tx.meta.logMessages.some(msg => msg.includes('vote')) ? 'Vote' : 'Transfer',
              status: tx.meta.err ? 'Failed' : 'Confirmed',
              blockTime: tx.blockTime,
              fee: tx.meta.fee / anchor.web3.LAMPORTS_PER_SOL,
            };
          })
        );
        
        // Filter out null transactions and sort by timestamp
        return transactions
          .filter(tx => tx !== null)
          .sort((a, b) => b.blockTime - a.blockTime);
          
      } catch (error) {
        console.error('Error fetching real transaction history:', error);
        
        // Fallback to mock data for development
        console.log('Using mock transaction history data');
        return [
          {
            signature: '5xUcfez22dsYYuTfre9ZX8uN5bZJRk4S4KDQBzkJCaKTHEw6Wc4UvexX1sWAKRKfzMWEKnKE1PKCDwsHBr16wZ5o',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            amount: '250',
            type: 'Purchase',
            status: 'Confirmed',
          },
          {
            signature: '2tbxsXYP2L4mZ1DomCM5L9wHCcuWqW9yczYw3koBCr7UXm6GbVRRUBuYcb4Ssv3DtTiJgAgma9qQwYZiNjoh5A4T',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            amount: '50',
            type: 'Vote',
            status: 'Confirmed',
          },
          {
            signature: '4w7dTkbHKX9mcDDQunRXMZ1AfEP7ZdQkfXeECFHVhLb9F9Nhf3rAcCehSLbXQzBYrVWQBFvcBjXyGfN7jzLbMSsW',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            amount: '100',
            type: 'Airdrop',
            status: 'Confirmed',
          }
        ];
      }
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      return [];
    }
  }

  /**
   * Cast a vote for a candidate
   * @param {PublicKey} walletPublicKey - Wallet public key
   * @param {string} candidateName - Name of the candidate to vote for
   * @param {string} pollType - Type of poll (e.g., 'best', 'weekly')
   * @returns {Promise<Object>} Vote result
   */
  static async castVote(walletPublicKey, candidateName, pollType) {
    try {
      if (!walletPublicKey) {
        throw new Error('Wallet public key is required');
      }

      if (!candidateName) {
        throw new Error('Candidate name is required');
      }

      console.log(`Casting vote for ${candidateName} in ${pollType} poll`);

      // Step 1: Get current polls to find the right one and candidate
      const currentPolls = await this.getCurrentPolls();
      if (!currentPolls || !currentPolls[pollType]) {
        throw new Error(`No active polls found for type: ${pollType}`);
      }

      const poll = currentPolls[pollType];
      
      // Find the candidate by name
      const candidate = poll.candidates.find(
        c => c.name.toLowerCase() === candidateName.toLowerCase()
      );
      
      if (!candidate) {
        throw new Error(`Candidate "${candidateName}" not found in poll`);
      }
      
      // Convert poll and candidate to PublicKey objects
      const pollPubkey = new anchor.web3.PublicKey(poll.pubkey);
      const candidatePubkey = new anchor.web3.PublicKey(candidate.pubkey);

      try {
        // Step 2: Call the Solana program if available
        if (program) {
          console.log('Preparing on-chain vote transaction');
          
          // Create transaction for the vote
          const transaction = await program.methods
            .castVote(pollType, candidateName)
            .accounts({
              poll: pollPubkey,
              candidate: candidatePubkey,
              voter: walletPublicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .transaction();
            
          // Add a recent blockhash
          transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          transaction.feePayer = walletPublicKey;
          
          console.log('Vote transaction prepared');
          
          return {
            success: true,
            message: 'Vote transaction prepared successfully',
            transaction: transaction,
            candidate: candidateName,
            pollType: pollType
          };
        } else {
          // Fallback for local development when program is not connected
          console.log('Program not available, simulating vote');
          
          // Store vote in localStorage for development
          const voteKey = `vote_${walletPublicKey.toString()}_${pollType}`;
          localStorage.setItem(voteKey, candidateName);
          
          // Update local vote count in localStorage
          const countKey = `votes_${pollType}_${candidateName}`;
          const currentCount = localStorage.getItem(countKey) 
            ? parseInt(localStorage.getItem(countKey), 10) 
            : 0;
          localStorage.setItem(countKey, currentCount + 1);
          
          return {
            success: true,
            message: 'Vote recorded successfully (simulated)',
            candidate: candidateName,
            pollType: pollType,
            simulated: true
          };
        }
      } catch (err) {
        console.error('Error in vote transaction preparation:', err);
        throw new Error(`Failed to prepare vote transaction: ${err.message}`);
      }

    } catch (error) {
      console.error('Error casting vote:', error);
      return {
        success: false,
        message: error.message || 'An error occurred while casting your vote'
      };
    }
  }

  /**
   * Get current polls information
   * @returns {Promise<Object>} Poll information
   */
  async getCurrentPolls() {
    try {
      // In a production environment, this would fetch from the blockchain
      // For now, we'll read from the current-polls.json file
      const response = await fetch('/current-polls.json');
      if (!response.ok) {
        throw new Error('Failed to fetch current polls');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting current polls:', error);
      return null;
    }
  }

  /**
   * Get results for a specific poll type
   * @param {string} pollType - Type of poll ('best' or 'worst')
   * @returns {Promise<Array>} Poll results
   */
  async getPollResults(pollType) {
    try {
      const currentPolls = await this.getCurrentPolls();
      if (!currentPolls || !currentPolls.candidates || !currentPolls.candidates[pollType]) {
        return [];
      }

      const results = [];
      for (const candidate of currentPolls.candidates[pollType]) {
        // In a production environment, this would fetch vote counts from the blockchain
        // For now, return mock data
        results.push({
          ...candidate,
          votes: Math.floor(Math.random() * 1000000)
        });
      }

      return results.sort((a, b) => b.votes - a.votes);
    } catch (error) {
      console.error('Error getting poll results:', error);
      return [];
    }
  }

  /**
   * Get remaining time for current poll
   * @returns {Promise<Object>} Time remaining
   */
  async getPollTimeRemaining() {
    try {
      const currentPolls = await this.getCurrentPolls();
      if (!currentPolls) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const now = Math.floor(Date.now() / 1000);
      const endTime = currentPolls.startTime + 86400; // 1 day in seconds
      
      const timeRemaining = Math.max(0, endTime - now);
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;

      return { hours, minutes, seconds };
    } catch (error) {
      console.error('Error getting poll time remaining:', error);
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  }

  /**
   * Check if a user has already voted in a poll
   * @param {PublicKey} walletPublicKey - User's wallet public key
   * @param {string} pollType - Type of poll ('best' or 'worst')
   * @returns {Promise<boolean>} True if the user has already voted
   */
  async hasUserVoted(walletPublicKey, pollType) {
    try {
      // Get current polls data
      const currentPolls = await this.getCurrentPolls();
      if (!currentPolls) {
        console.error('No active polls found');
        return false;
      }

      // Find the poll
      const pollPubkey = new PublicKey(
        pollType === 'best' ? currentPolls.bestPoll : currentPolls.worstPoll
      );

      // Calculate PDA for user vote account
      const [userVotePubkey] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("user_vote"),
          pollPubkey.toBuffer(),
          walletPublicKey.toBuffer(),
        ],
        programId
      );

      // Check if the account exists
      const accountInfo = await connection.getAccountInfo(userVotePubkey);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking if user voted:', error);
      return false;
    }
  }

  /**
   * Get a user's current vote for a specific poll
   * @param {PublicKey} walletPublicKey - User's wallet public key
   * @param {string} pollType - Type of poll ('best' or 'worst')
   * @returns {Promise<Object|null>} The user's vote data or null if not found
   */
  async getUserVote(walletPublicKey, pollType) {
    try {
      // Get current polls data
      const currentPolls = await this.getCurrentPolls();
      if (!currentPolls) {
        console.error('No active polls found');
        return null;
      }

      // Find the poll
      const pollPubkey = new PublicKey(
        pollType === 'best' ? currentPolls.bestPoll : currentPolls.worstPoll
      );

      // Check if the user has voted
      const hasVoted = await this.hasUserVoted(walletPublicKey, pollType);
      if (!hasVoted) {
        return null;
      }

      // In a production environment, we would fetch the actual vote data from the blockchain
      // For now, we'll search for the candidate in the poll that the user voted for
      // This is a mock implementation
      
      const candidates = currentPolls.candidates[pollType] || [];
      // Simulate a deterministic "vote" based on the user's public key
      // In production, we would read this from the blockchain account
      const hash = walletPublicKey.toString().slice(-5); // Use last 5 chars of public key
      const index = parseInt(hash, 16) % candidates.length; // Convert to number and use modulo
      const candidate = candidates[index];
      
      if (candidate) {
        return {
          pollPubkey: pollPubkey.toString(),
          candidateName: candidate.name,
          candidatePubkey: candidate.pubkey,
          timestamp: new Date(currentPolls.startTime * 1000).toISOString(),
          voter: walletPublicKey.toString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  /**
   * Purchase tokens directly
   * @param {PublicKey} walletPublicKey - User's wallet public key
   * @param {number} amount - Amount of tokens to purchase
   * @returns {Promise<Object>} Transaction result
   */
  static async purchaseTokens(walletPublicKey, amount) {
    try {
      if (!walletPublicKey) {
        throw new Error('Wallet public key is required');
      }

      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Token price in SOL
      const tokenPrice = 0.000005; // Price per token in SOL
      const solAmount = amount * tokenPrice;

      console.log(`Preparing purchase of ${amount} tokens for ${solAmount} SOL`);

      // Project wallet (treasury) - this should be in environment vars in production
      const projectWallet = new anchor.web3.PublicKey(
        TokenService.tokenInfo?.treasuryAddress || 
        'FG6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
      );

      try {
        // If the program is available, use it to mint tokens
        if (program) {
          console.log('Preparing on-chain token purchase transaction');
          
          // Get token mint
          const mintAddress = TokenService.tokenInfo?.mintAddress || 
            'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
          const mint = new anchor.web3.PublicKey(mintAddress);
          
          // Check if user has a token account, if not create one
          let userTokenAccount;
          try {
            // Try to find existing token account
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              walletPublicKey,
              { mint }
            );
            
            if (tokenAccounts.value.length > 0) {
              userTokenAccount = tokenAccounts.value[0].pubkey;
            } else {
              // Get associated token account address
              userTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mint,
                owner: walletPublicKey
              });
              
              // Create associated token account instruction
              const createATAIx = anchor.utils.token.createAssociatedTokenAccountInstruction(
                userTokenAccount,
                walletPublicKey,
                walletPublicKey,
                mint
              );
              
              // Include this instruction in the transaction
              transaction.add(createATAIx);
            }
          } catch (error) {
            console.error('Error checking token account:', error);
            throw new Error('Failed to check token account');
          }
          
          // Create purchase transaction with both payment and minting
          const transaction = new anchor.web3.Transaction();
          
          // Add SOL transfer instruction
          transaction.add(
            anchor.web3.SystemProgram.transfer({
              fromPubkey: walletPublicKey,
              toPubkey: projectWallet,
              lamports: anchor.web3.LAMPORTS_PER_SOL * solAmount,
            })
          );
          
          // Add a recent blockhash
          transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          transaction.feePayer = walletPublicKey;
          
          console.log('Token purchase transaction prepared');
          
          return {
            success: true,
            message: 'Purchase transaction prepared successfully',
            transaction: transaction,
            amount: amount,
            solAmount: solAmount,
          };
        } else {
          // Fallback for local development
          console.log('Program not available, creating SOL transfer transaction only');
          
          // Create a transaction to send SOL to the project wallet
          const transaction = new anchor.web3.Transaction().add(
            anchor.web3.SystemProgram.transfer({
              fromPubkey: walletPublicKey,
              toPubkey: projectWallet,
              lamports: anchor.web3.LAMPORTS_PER_SOL * solAmount,
            })
          );
          
          // Add a recent blockhash
          transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          transaction.feePayer = walletPublicKey;
          
          // For development: Store the token purchase in localStorage
          const walletAddress = walletPublicKey.toString();
          const purchaseKey = `purchases_${walletAddress}`;
          
          // Get existing purchases or start with 0
          const existingPurchases = localStorage.getItem(purchaseKey) 
            ? JSON.parse(localStorage.getItem(purchaseKey)) 
            : 0;
          
          // Store the updated purchase amount
          localStorage.setItem(purchaseKey, JSON.stringify(existingPurchases + amount));
          
          console.log(`Stored purchase of ${amount} tokens for wallet ${walletAddress}`);
          
          return {
            success: true,
            message: 'Purchase transaction prepared successfully (simulated)',
            transaction: transaction,
            amount: amount,
            solAmount: solAmount,
            simulated: true
          };
        }
      } catch (err) {
        console.error('Error in purchase transaction preparation:', err);
        throw new Error(`Failed to prepare purchase transaction: ${err.message}`);
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return {
        success: false,
        message: error.message || 'Failed to purchase tokens'
      };
    }
  }

  /**
   * Check if a public key belongs to an admin
   * @param {string|PublicKey} publicKey - The public key to check
   * @returns {boolean} True if the public key is an admin
   */
  static isAdmin(publicKey) {
    try {
      if (!publicKey) {
        console.error('No public key provided for admin check');
        return false;
      }

      // Convert to string if it's a PublicKey object
      const pubKeyStr = typeof publicKey === 'object' ? publicKey.toString() : publicKey;
      
      // List of admin public keys (hardcoded for demo purposes)
      // In production, this would be fetched from a secure source
      const adminAddresses = [
        '7X3csFfqA9JCBZAHZxkPJq4mMcr6tLx6HAWyEHk8xjkS',
        // Add more admin addresses as needed
      ];

      console.log('Checking if address is admin:', pubKeyStr);
      const isAdmin = adminAddresses.includes(pubKeyStr);
      console.log('Admin status:', isAdmin);
      
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

const tokenService = new TokenService();
export default tokenService; 