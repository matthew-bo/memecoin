/**
 * Utilities for handling Solana transactions
 */
import { Connection } from '@solana/web3.js';
import { showNotification as notify } from './NotificationUtils';

/**
 * Send and confirm a transaction with proper error handling
 * @param {Transaction} transaction - The transaction to send
 * @param {Connection} connection - Solana connection
 * @param {Function} signTransaction - Function to sign the transaction
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Transaction result
 */
export const sendAndConfirmTransaction = async (
  transaction,
  connection,
  signTransaction,
  options = {}
) => {
  try {
    // 1. Sign the transaction
    if (!signTransaction) {
      throw new Error('No signTransaction function provided');
    }

    const signed = await signTransaction(transaction);
    if (!signed) {
      throw new Error('Transaction was not signed');
    }

    // 2. Send the transaction
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: options.skipPreflight || false,
      preflightCommitment: options.preflightCommitment || 'confirmed',
    });

    if (!signature) {
      throw new Error('Failed to send transaction');
    }

    console.log(`Transaction sent with signature: ${signature}`);

    // 3. Confirm the transaction
    const confirmation = await connection.confirmTransaction(signature, options.commitment || 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction confirmed with error: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    // 4. Get transaction details if requested
    let txDetails = null;
    if (options.fetchDetails) {
      txDetails = await connection.getTransaction(signature, {
        commitment: options.commitment || 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
    }

    return {
      success: true,
      signature,
      confirmation,
      details: txDetails,
    };
  } catch (error) {
    console.error('Transaction error:', error);
    
    // Handle different error types
    let errorMessage = error.message || 'Unknown error occurred';
    
    // Extract relevant error information from Solana error
    if (error.logs && error.logs.length > 0) {
      errorMessage = `Transaction error: ${error.logs.filter(log => log.includes('Error')).join(', ')}`;
    }
    
    if (options.showNotification !== false) {
      notify({
        message: 'Transaction Failed',
        description: errorMessage,
        type: 'error',
      });
    }
    
    return {
      success: false,
      error: errorMessage,
      originalError: error,
    };
  }
};

/**
 * Format transaction error for display
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatTransactionError = (error) => {
  if (!error) return 'Unknown error occurred';
  
  // If it's a regular error with a message
  if (error.message) {
    // Common transaction errors
    if (error.message.includes('User rejected')) {
      return 'Transaction was rejected by the user';
    }
    
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    
    if (error.message.includes('failed prefligh')) {
      return 'Transaction failed preflight checks - it may not be valid';
    }
    
    if (error.message.includes('blockhash')) {
      return 'Transaction expired - please try again';
    }
    
    return error.message;
  }
  
  // If it's a JSON parsed error
  if (typeof error === 'object') {
    return JSON.stringify(error);
  }
  
  return String(error);
};

/**
 * Get transaction status
 * @param {string} signature - Transaction signature
 * @param {Connection} connection - Solana connection
 * @returns {Promise<Object>} Transaction status
 */
export const getTransactionStatus = async (signature, connection) => {
  try {
    const status = await connection.getSignatureStatus(signature);
    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return {
      success: false,
      error: error.message || 'Failed to get transaction status',
    };
  }
}; 