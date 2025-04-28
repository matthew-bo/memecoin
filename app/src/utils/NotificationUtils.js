/**
 * Utilities for notifications and alerts
 */

// Local notifications state (will be replaced with a proper state management solution)
let notificationCallback = null;

/**
 * Register a notification callback for the app
 * @param {Function} callback Function to call with notification data
 */
export const registerNotificationCallback = (callback) => {
  notificationCallback = callback;
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
export const showNotification = (notification) => {
  if (notificationCallback) {
    notificationCallback(notification);
  } else {
    console.warn('No notification callback registered');
  }
};

/**
 * Show a success notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 * @param {string} txid Optional transaction ID
 */
export const showSuccessNotification = (message, description = '', duration = 5000) => {
  showNotification({
    type: 'success',
    message,
    description,
    duration
  });
};

/**
 * Show an error notification
 * @param {string} message Notification message
 * @param {string|Error} error Error description or object
 * @param {string} txid Optional transaction ID
 */
export const showErrorNotification = (message, description = '', duration = 5000) => {
  showNotification({
    type: 'error',
    message,
    description,
    duration
  });
};

/**
 * Show an info notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 */
export const showInfoNotification = (message, description = '', duration = 5000) => {
  showNotification({
    type: 'info',
    message,
    description,
    duration
  });
};

/**
 * Show a warning notification
 * @param {string} message Notification message
 * @param {string} description Detailed description
 */
export const showWarningNotification = (message, description = '', duration = 5000) => {
  showNotification({
    type: 'warning',
    message,
    description,
    duration
  });
};

/**
 * Show a transaction notification
 * @param {string} message Notification message
 * @param {string} txid Transaction ID
 * @param {string} description Detailed description
 * @param {number} duration Duration in milliseconds
 */
export const showTransactionNotification = (message, txid, description = '', duration = 5000) => {
  showNotification({
    type: 'success',
    message,
    description,
    txid,
    duration
  });
}; 