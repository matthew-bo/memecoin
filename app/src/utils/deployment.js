/**
 * Helper function to get deployment information.
 * In a real app, this would read from a deployment file or API
 * @returns {Object} - The deployment information
 */
export const getDeploymentInfo = () => {
  // In a real app, this would be based on environment config or deployment files
  return {
    programId: "BPFLoader2111111111111111111111111111111", // Example program ID
    tokenMint: "7dVH4U6ibJb5brKmfBXKGqGU98MqAVRhh5bdTLFMyJCU", // Example token mint
    tokenMetadata: "8YLKoxxv6wMALqNPLPMYZ3mGVBQVzUA3RC9Abolton", // Example metadata address
    networkUrl: "https://api.devnet.solana.com", // Default to devnet
    deploymentDate: new Date().toISOString(),
  };
}; 