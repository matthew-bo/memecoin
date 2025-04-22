/**
 * Utilities for notifications and alerts
 */

// Local notifications state (will be replaced with a proper state management solution)
let globalNotifyCallback = null;

/**
 * Register a notification callback for the app
 * @param {Function} callback Function to call with notification data
 */
export const registerNotificationCallback = (callback) => {
  globalNotifyCallback = callback;
};

/**
 * Show a notification
 * @param {Object} options Notification options
 * @param {string} options.message Short notification message
 * @param {string} options.description Detailed description or explanation
 * @param {string} options.type Type of notification: 'success', 'error', 'info', 'warning'
 * @param {number} options.duration Duration in milliseconds
 * @param {string} options.txid Transaction ID for blockchain operations
 */
export const notify = ({ 
  message, 
  description = '', 
  type = 'info', 
  duration = 4000,
  txid = null 
}) => {
  // Log to console
  const logMethod = type === 'error' 
    ? console.error 
    : type === 'warning' 
      ? console.warn 
      : console.log;
  
  logMethod(`[${type.toUpperCase()}] ${message}${description ? ': ' + description : ''}`);
  
  if (txid) {
    // For blockchain transactions, add link to explorer
    const explorerLink = `https://explorer.solana.com/tx/${txid}?cluster=devnet`;
    console.log(`Transaction link: ${explorerLink}`);
  }
  
  // Call the global notification callback if registered
  if (globalNotifyCallback) {
    globalNotifyCallback({
      message,
      description,
      type,
      duration,
      txid
    });
  }
};

/**
 * Show a success notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 * @param {string} txid Optional transaction ID
 */
export const notifySuccess = (message, description = '', txid = null) => {
  notify({
    message,
    description,
    type: 'success',
    txid
  });
};

/**
 * Show an error notification
 * @param {string} message Notification message
 * @param {string|Error} error Error description or object
 * @param {string} txid Optional transaction ID
 */
export const notifyError = (message, error = '', txid = null) => {
  let description = error;
  
  // If error is an object with message property
  if (error && typeof error === 'object' && error.message) {
    description = error.message;
  }
  
  notify({
    message,
    description,
    type: 'error',
    duration: 8000, // Errors stay longer
    txid
  });
};

/**
 * Show an info notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 */
export const notifyInfo = (message, description = '') => {
  notify({
    message,
    description,
    type: 'info'
  });
};

/**
 * Show a warning notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 */
export const notifyWarning = (message, description = '') => {
  notify({
    message,
    description,
    type: 'warning',
    duration: 6000 // Warnings stay a bit longer
  });
}; 