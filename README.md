# Popular Vote Token Platform

A decentralized voting platform built on Solana that allows users to use tokens to vote for the best and worst people of the day.

## Features

- 💰 **Token-Based Voting**: Use $VOTE tokens to participate in daily polls
- 🗳️ **Daily Polls**: Vote for the best and worst people of the day
- 📊 **Results Visualization**: See real-time results and historical data
- 👛 **Wallet Integration**: Connect your Solana wallet (Phantom, Solflare)
- 💱 **Token Purchase**: Buy $VOTE tokens directly with SOL
- 👑 **Admin Dashboard**: Create and manage polls (admin access only)
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- 🌐 **Frontend**: React.js with Material UI
- ⛓️ **Blockchain**: Solana blockchain
- 🔌 **Wallet**: Solana Wallet Adapter for wallet connections
- 📦 **State Management**: React Context API
- 📊 **Charts**: Chart.js for data visualization
- 🔄 **Data Fetching**: Custom service for blockchain interactions

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Solana CLI (for development with local validator)
- A Solana wallet (Phantom, Solflare)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/popular-vote-platform.git
   cd popular-vote-platform
   ```

2. Install dependencies
   ```
   cd app
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open your browser to `http://localhost:3000`

### Setting Up a Wallet

1. Install the [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/) wallet extension
2. Create a new wallet or import an existing one
3. Add some SOL for development (use the Solana faucet for devnet SOL)
4. Connect your wallet to the application using the "Connect Wallet" button

## Project Structure

```
popular-vote-platform/
├── app/                   # Frontend React application
│   ├── public/            # Static files
│   └── src/               # Source code
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts for state management
│       ├── pages/         # Page components
│       └── services/      # Service classes for API/blockchain calls
└── src/                   # Solana program (smart contract)
    └── program/           # Anchor program files
```

## Usage Guide

### Voting

1. Connect your wallet
2. Navigate to the "Vote" page
3. Choose either "Best Person" or "Worst Person" category
4. Select a candidate and click "Cast Vote"
5. Confirm the transaction in your wallet

### Buying Tokens

1. Navigate to the "Buy Token" page
2. Connect your wallet if not already connected
3. Enter the amount of tokens you want to purchase
4. Click "Buy Tokens" and approve the transaction in your wallet

### Admin Functions

1. Connect with an admin wallet
2. Navigate to "Admin" in the menu
3. Create new polls, add candidates, or manage existing polls

## Deployment

### Frontend

The frontend can be deployed to any static hosting service:

```
cd app
npm run build
```

This creates a `build` folder that can be deployed to Netlify, Vercel, or any other hosting service.

### Solana Program

The Solana program should be deployed to devnet for testing and mainnet for production:

```
cd src/program
anchor build
anchor deploy --provider.cluster devnet
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@popularvote.com or join our Discord server.