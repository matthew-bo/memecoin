# Deployment Guide for Popular Vote Platform

This document provides step-by-step instructions for deploying the Popular Vote Platform to both development and production environments.

## Prerequisites

Before deploying, ensure you have:

1. Node.js (v16+) and npm installed
2. Solana CLI tools installed
3. Access to Solana keypairs for deployment
4. A hosting service for the frontend (Vercel, Netlify, AWS, etc.)

## Deployment Steps

### 1. Setup Environment Variables

Create or update the following files with appropriate values:

- `.env.development` - For devnet deployment
- `.env.production` - For mainnet deployment

These files should include:

```
REACT_APP_NETWORK=<network>
REACT_APP_RPC_URL=<rpc_url>
REACT_APP_TOKEN_MINT=<token_mint_address>
REACT_APP_PROGRAM_ID=<program_id>
REACT_APP_ADMIN_WALLET=<admin_wallet_address>
```

### 2. Deploy the Solana Program

#### For Devnet:

```bash
# Build the program
cd src/program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

#### For Mainnet:

```bash
# Build the program
cd src/program
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

Take note of the deployed program ID and update it in your `.env` files.

### 3. Create Token on Solana

If you haven't already created your token:

```bash
# Create a new SPL token
spl-token create-token --decimals 6

# Create a token account
spl-token create-account <token_mint_address>

# Mint initial supply
spl-token mint <token_mint_address> <amount> <token_account>
```

Update your `.env` files with the token mint address.

### 4. Deploy the Frontend

#### For Development (Devnet):

```bash
# From the app directory
npm run deploy:dev
```

#### For Production (Mainnet):

```bash
# From the app directory
npm run deploy:prod
```

This will:
1. Build the React application
2. Generate a deployment-info.json file with network configuration
3. Prepare the build folder for deployment

### 5. Upload to Hosting Service

Upload the contents of the `app/build` folder to your hosting service.

#### Example for Netlify:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Deploy to Netlify
cd app
netlify deploy --prod --dir=build
```

#### Example for Vercel:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Deploy to Vercel
cd app
vercel --prod
```

### 6. Verify Deployment

After deployment, check that:

1. The application loads correctly
2. You can connect your wallet
3. The application connects to the correct network (devnet or mainnet)
4. The correct token and program are being used

## Troubleshooting

### Common Issues:

1. **"Invalid program ID"**: Verify that the program ID in your `.env` files matches the deployed program.

2. **"Token not found"**: Ensure the token mint address in your `.env` files is correct.

3. **"Network connection error"**: Check the RPC URL in your `.env` files. Solana public RPCs can be rate-limited, consider using a dedicated RPC provider.

4. **"Wallet connection issues"**: Ensure that wallet adapters are properly configured for the target network.

5. **"Admin features not working"**: Verify the admin wallet address in your `.env` files.

## Post-Deployment Steps

After successful deployment:

1. **Provide Liquidity**: Set up liquidity pools on DEXs (Raydium, Orca, Jupiter)
2. **Set Up Monitoring**: Implement monitoring for your application and program
3. **Backup Keys**: Ensure all deployment keys are properly backed up
4. **Document IDs**: Keep a secure record of all program IDs, token addresses, and admin wallets

## Security Considerations

1. Keep your deployment keys secure
2. Never commit `.env` files to version control
3. Consider a security audit for the Solana program before mainnet deployment
4. Implement rate limiting for your application APIs
5. Monitor for suspicious transactions or activities 