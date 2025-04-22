import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import TokenService from '../services/TokenService';
import { PublicKey } from '@solana/web3.js';

// Create context
const TokenContext = createContext();

// Hook for using the token context
export const useToken = () => {
  return useContext(TokenContext);
};

// Context provider component
export const TokenProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [votingPower, setVotingPower] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Update token balance when wallet connection changes
  useEffect(() => {
    const fetchTokenData = async () => {
      if (connected && publicKey) {
        try {
          setIsLoading(true);
          
          // Get token balance
          const balanceResult = await TokenService.getTokenBalance(publicKey);
          // Extract the actual balance value from the result object
          const actualBalance = balanceResult.success ? balanceResult.balance : 0;
          setTokenBalance(actualBalance);
          
          // In this token, 1 token = 1 voting power
          setVotingPower(actualBalance);
          
          // Get transaction history
          const history = await TokenService.getTransactionHistory(publicKey.toString());
          setTransactionHistory(history);
        } catch (error) {
          console.error('Error fetching token data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset if wallet disconnected
        setTokenBalance(0);
        setVotingPower(0);
        setTransactionHistory([]);
      }
    };

    fetchTokenData();
  }, [publicKey, connected]);

  // Cast a vote using token service
  const castVote = async (candidateName, pollType) => {
    if (!connected || !publicKey) {
      return { success: false, message: 'Wallet not connected or cannot sign transactions' };
    }

    try {
      setIsLoading(true);
      
      // Get the vote transaction from TokenService
      const voteResult = await TokenService.castVote(publicKey, candidateName, pollType);
      
      return voteResult;
    } catch (error) {
      console.error('Error casting vote:', error);
      return { success: false, message: error.message || 'An error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get current poll results
  const getPollResults = async (pollType) => {
    try {
      return await TokenService.getPollResults(pollType);
    } catch (error) {
      console.error('Error getting poll results:', error);
      return [];
    }
  };

  // Get remaining time for current poll
  const getPollTimeRemaining = async () => {
    try {
      return await TokenService.getPollTimeRemaining();
    } catch (error) {
      console.error('Error getting poll time remaining:', error);
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  };

  return (
    <TokenContext.Provider 
      value={{
        tokenBalance,
        votingPower,
        isLoading,
        transactionHistory,
        castVote,
        getPollResults,
        getPollTimeRemaining,
        tokenService: TokenService
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext; 