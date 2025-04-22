# Popular Vote Platform

A decentralized voting platform built on Solana blockchain that allows users to vote for their favorite candidates using the platform's token.

## Features

- Connect with Solana wallets (Phantom, Solflare)
- Vote for candidates using tokens
- View real-time voting results
- Admin dashboard for poll management
- Token purchase functionality
- Transaction history tracking
- Candidate verification system

## Tech Stack

- React.js
- Material-UI
- Solana Web3.js
- @coral-xyz/anchor
- @solana/spl-token

## Prerequisites

- Node.js v16 or later
- npm v7 or later
- Solana CLI tools (for program deployment)
- Anchor framework (for Solana program development)

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/popular-vote.git
   cd popular-vote/app
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open http://localhost:3000 to view it in the browser.

## Solana Program Deployment

The Solana program must be deployed before the frontend can interact with it:

1. Install Solana CLI tools and Anchor framework:
   ```
   sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
   npm install -g @coral-xyz/anchor
   ```

2. Create a new Solana wallet (if you don't have one):
   ```
   solana-keygen new -o id.json
   ```

3. Build and deploy the program:
   ```
   npm run build:program
   npm run deploy:program:devnet
   ```

4. Generate the IDL for the frontend:
   ```
   npm run generate:idl
   ```

5. Update the `app/public/deployment-info.json` file with the program ID and other addresses from the deployment.

## Frontend Deployment

### Netlify Deployment

The project is configured for easy deployment on Netlify:

1. Push your changes to the main branch on GitHub
2. The GitHub Actions workflow will automatically build and deploy to Netlify

### Manual Deployment

1. Build the production version:
   ```
   npm run build
   ```

2. Deploy the contents of the `build` folder to your hosting provider.

### Environment Variables

For production deployment, set the following environment variables:

- `REACT_APP_SOLANA_NETWORK` - Solana network to connect to (mainnet-beta, devnet, testnet)
- `REACT_APP_SOLANA_RPC_ENDPOINT` - Custom RPC endpoint URL (optional)

## Verification System

The platform includes a verification system to ensure the authenticity of candidates:

- **Social Verification**: Candidates verified through their official social media accounts
- **Blockchain Verification**: Candidates with established blockchain identities
- **Official Verification**: Government officials and other officially recognized entities
- **Platform Verification**: Manually verified by platform administrators

## Going Live Checklist

Before launching to production, ensure the following steps are completed:

1. **Solana Program**:
   - Complete and thoroughly test the Solana program
   - Conduct a security audit on the program code
   - Deploy to Solana mainnet

2. **Token**:
   - Initialize the token with proper metadata (name, symbol, decimals)
   - Set up treasury and distribution wallets
   - Allocate tokens according to the tokenomics plan

3. **Liquidity**:
   - Create liquidity pools on major Solana DEXs (Raydium, Orca, Jupiter)
   - Ensure sufficient initial liquidity

4. **Frontend**:
   - Replace all mock data with real blockchain interactions
   - Ensure proper error handling for all blockchain operations
   - Optimize for mobile devices

5. **Legal & Compliance**:
   - Review and finalize all legal documents (Terms of Service, Privacy Policy)
   - Ensure compliance with relevant regulations
   - Implement necessary user protections

## Security Considerations

- Always audit smart contracts before mainnet deployment
- Use hardware wallets for admin operations
- Never store private keys in code or environment variables

## License

[MIT](LICENSE)

## Future Features

- **Governance System**: Allow token holders to propose and vote on platform changes
- **NFT Integration**: Exclusive voting polls for NFT holders
- **Mobile App**: Native mobile applications for iOS and Android
- **Multi-chain Bridge**: Expand to other blockchains through cross-chain bridges
- **Advanced Analytics**: Detailed voting statistics and trends

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or support, please reach out to team@popularvote.io 