const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  development: {
    network: 'devnet',
    rpc: 'https://api.devnet.solana.com',
  },
  production: {
    network: 'mainnet-beta',
    rpc: 'https://api.mainnet-beta.solana.com',
  }
};

// Parse arguments
const args = process.argv.slice(2);
const environment = args[0] || 'development';
const envConfig = config[environment];

if (!envConfig) {
  console.error(`Error: Unknown environment "${environment}". Valid options are "development" or "production".`);
  process.exit(1);
}

console.log(`Starting deployment for ${environment} environment...`);

// Build the frontend
console.log('Building the frontend application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to build the frontend:', error);
  process.exit(1);
}

// Generate the deployment info file
console.log('Generating deployment-info.json...');
const deploymentInfo = {
  networkUrl: envConfig.rpc,
  network: envConfig.network,
  tokenMint: process.env.REACT_APP_TOKEN_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  programId: process.env.REACT_APP_PROGRAM_ID || '7dVH4U6ibJb5brKmfBXKGqGU98MqAVRhh5bdTLFMyJCU',
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, '../build/deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('Deployment preparation complete!');
console.log('You can now deploy the "build" folder to your hosting provider.');
console.log(`Application is configured for ${environment} environment.`); 