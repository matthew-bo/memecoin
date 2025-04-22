# MemeVote Frontend Implementation

This is the frontend application for the MemeVote memecoin voting system. It provides a user interface for:

1. Connecting Solana wallets
2. Viewing token balances
3. Voting in daily polls for best and worst people
4. Viewing poll results
5. Purchasing tokens

## Implementation Details

### Authentication and Voting

The authentication and voting process works as follows:

1. Users connect their Solana wallet using the Solana Wallet Adapter
2. The system reads their MVOTE token balance from their associated token account
3. Their voting power equals their token balance (1 token = 1 vote)
4. When voting, a transaction is signed by the user's wallet and submitted to the Solana blockchain
5. The smart contract verifies the user's token balance and records their vote

### Key Components

- **TokenContext**: Manages token balances, voting power, and vote transactions
- **TokenService**: Interfaces with the Solana blockchain for token operations
- **Vote.js**: UI for selecting candidates and casting votes
- **Results.js**: Displays current poll results
- **Header.js**: Contains wallet connection button and displays token balance

## Development Setup

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```
   npm start
   ```

## Deployment

The frontend expects these files in the public directory:
- `deployment-info.json`: Contains program addresses and network information
- `current-polls.json`: Contains active poll data and candidates

These files are automatically copied from the root directory when the backend scripts run.

## Configuration

The app connects to the Solana network specified in `deployment-info.json`. The default is devnet, but this can be changed to mainnet-beta for production use. 