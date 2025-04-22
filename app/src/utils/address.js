/**
 * Shortens a Solana address for display purposes
 * @param {string} address - The full Solana address
 * @param {number} prefixLength - Number of characters to keep at the beginning (default: 4)
 * @param {number} suffixLength - Number of characters to keep at the end (default: 4)
 * @returns {string} The shortened address
 */
export const shortenAddress = (address, prefixLength = 4, suffixLength = 4) => {
  if (!address) return '';
  
  // Handle case where address is shorter than prefix + suffix
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  const prefix = address.slice(0, prefixLength);
  const suffix = address.slice(-suffixLength);
  
  return `${prefix}...${suffix}`;
}; 