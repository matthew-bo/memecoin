import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  Launch,
  ContentCopy,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import TokenService from '../services/TokenService';
import { useToken } from '../contexts/TokenContext';
import Confetti from 'react-confetti';
import { sendAndConfirmTransaction, formatTransactionError } from '../utils/TransactionUtils';
import { showSuccessNotification as notifySuccess, showErrorNotification as notifyError } from '../utils/NotificationUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BuyToken = () => {
  const { tokenService } = useToken();
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();

  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [priceData, setPriceData] = useState(null);
  const [solPrice, setSolPrice] = useState(0);
  const [tokenPrice] = useState(0.000005); // SOL per token
  const [amount, setAmount] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [tokenBalance, setTokenBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Token info (mockup data)
  const minPurchase = 100; // Minimum tokens to purchase
  const projectWallet = 'FG6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
  const tokenContract = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

  // Function to fetch token balance
  const fetchTokenBalance = async () => {
    if (!connected || !publicKey) {
      setTokenBalance(0);
      return;
    }

    setBalanceLoading(true);
    try {
      const result = await tokenService.getTokenBalance(publicKey);
      if (result.success) {
        setTokenBalance(result.balance);
        setTokenMint(result.mintAddress);
      } else {
        console.error('Failed to fetch token balance:', result.error);
        setTokenBalance(0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setTokenBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch SOL price and mock token price history
  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      try {
        // Fetch SOL price from CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
        
        // Create mock price history data
        const today = new Date();
        const labels = Array(30).fill().map((_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (29 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        // Generate some price fluctuations for the chart
        // Starting from current price, go back 30 days with some randomness
        const basePrice = tokenPrice;
        const prices = [];
        let currentPrice = basePrice;
        
        for (let i = 0; i < 30; i++) {
          // Generate price with some randomness and upward trend
          if (i === 29) {
            prices.push(basePrice); // Today's price
          } else {
            // Small random change with slight upward trend
            const change = ((Math.random() - 0.45) * 0.00001);
            currentPrice = Math.max(0.000001, currentPrice - change);
            prices.push(currentPrice);
          }
        }
        
        // Calculate USD values
        const usdPrices = prices.map(price => price * solPrice);
        
        setPriceData({
          labels,
          datasets: [
            {
              label: 'Price in SOL',
              data: prices,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y',
            },
            {
              label: 'Price in USD',
              data: usdPrices,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchPriceData, 300000);
    return () => clearInterval(interval);
  }, [tokenPrice, solPrice]);

  // Fetch token balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenBalance();
    } else {
      setTokenBalance(null);
    }
  }, [connected, publicKey]);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '$VOTE Token Price (30-Day History)'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y.toFixed(8) + ' SOL';
              } else {
                label += '$' + context.parsed.y.toFixed(8);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Price (SOL)'
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(8);
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Price (USD)'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(8);
          }
        }
      },
    },
  };

  const handleAmountChange = (e) => {
    // Allow only numbers and decimals
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDirectPurchase = async () => {
    if (!connected || !publicKey) {
      setSnackbar({
        open: true,
        message: 'Please connect your wallet to purchase tokens',
        severity: 'error'
      });
      return;
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    // Check minimum purchase
    if (numAmount < minPurchase) {
      setSnackbar({
        open: true,
        message: `Minimum purchase is ${minPurchase} tokens`,
        severity: 'error'
      });
      return;
    }

    setPurchaseLoading(true);
    setActiveStep(0);

    try {
      // Call the token service to prepare the purchase transaction
      const purchaseResult = await tokenService.purchaseTokens(publicKey, numAmount);

      if (!purchaseResult.success) {
        throw new Error(purchaseResult.message || 'Failed to create purchase transaction');
      }

      // Step 1: Prepare transaction
      setActiveStep(1);
      
      // Step 2: Send transaction to wallet for signing and submit to network
      const txResult = await sendAndConfirmTransaction(
        purchaseResult.transaction,
        connection,
        wallet.signTransaction,
        {
          commitment: 'confirmed',
          fetchDetails: true
        }
      );

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to confirm transaction');
      }

      // Step 3: Transaction confirmed
      setActiveStep(3);
      notifySuccess(
        'Purchase Successful',
        `You've successfully purchased ${numAmount} tokens!`,
        txResult.signature
      );
      setShowConfetti(true);
      
      // Update token balance
      setTimeout(() => {
        fetchTokenBalance();
      }, 2000);

      // Reset form
      setAmount('');
      
    } catch (error) {
      console.error('Error in token purchase:', error);
      
      // Format the error message
      const errorMessage = formatTransactionError(error);
      
      notifyError('Purchase Failed', errorMessage);
      
      setSnackbar({
        open: true,
        message: 'Purchase failed: ' + errorMessage,
        severity: 'error'
      });
      
      setActiveStep(0);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const calculateSolAmount = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      return 0;
    }
    return parseFloat(amount) * tokenPrice;
  };

  const renderConnectWallet = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <AccountBalanceWallet sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Please connect your wallet to view your $VOTE token balance.
        </Typography>
      </Box>
    );
  };

  const renderDEXOptions = () => {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Buy $VOTE Tokens
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            $VOTE tokens are available on these decentralized exchanges. Click a link below to buy tokens.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Raydium</Typography>
                  <Typography variant="body2" paragraph>
                    One of the most popular DEXs on Solana with high liquidity and low fees.
                  </Typography>
                  <Button 
                    variant="contained" 
                    endIcon={<Launch />}
                    component="a"
                    href="https://raydium.io/swap/"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Buy on Raydium
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Jupiter Aggregator</Typography>
                  <Typography variant="body2" paragraph>
                    Find the best prices across all Solana DEXs in one place.
                  </Typography>
                  <Button 
                    variant="contained" 
                    endIcon={<Launch />}
                    component="a"
                    href="https://jup.ag/"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Buy on Jupiter
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Orca</Typography>
                  <Typography variant="body2" paragraph>
                    User-friendly DEX with concentrated liquidity and fair token launch platform.
                  </Typography>
                  <Button 
                    variant="contained" 
                    endIcon={<Launch />}
                    component="a"
                    href="https://orca.so/"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Buy on Orca
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderPriceStats = () => {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              $VOTE Token Price
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" color="success.main">
                +2.4%
              </Typography>
            </Box>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Current Price (SOL)</Typography>
              <Typography variant="h6">{tokenPrice.toFixed(8)} SOL</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Current Price (USD)</Typography>
              <Typography variant="h6">${(tokenPrice * solPrice).toFixed(8)}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">Market Cap</Typography>
              <Typography variant="h6">$1.2M</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">24h Volume</Typography>
              <Typography variant="h6">$123.4K</Typography>
            </Grid>
          </Grid>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : priceData ? (
            <Box sx={{ height: 300 }}>
              <Line options={chartOptions} data={priceData} />
            </Box>
          ) : (
            <Alert severity="error">Failed to load price data</Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTokenBalance = () => {
    if (!connected) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connect your wallet to view your token balance
        </Alert>
      );
    }

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            Your Token Balance
          </Typography>
          {balanceLoading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography variant="h4" color="primary" gutterBottom>
              {tokenBalance !== null && !isNaN(tokenBalance) 
                ? Number(tokenBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                : '0'} VOTE
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={fetchTokenBalance}
            disabled={balanceLoading || !connected}
          >
            Refresh Balance
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderDirectPurchase = () => {
    const solAmount = calculateSolAmount();
    
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Direct Purchase
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Purchase $VOTE tokens directly by sending SOL from your wallet.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount of $VOTE tokens"
                fullWidth
                variant="outlined"
                value={amount}
                onChange={handleAmountChange}
                disabled={purchaseLoading}
                helperText={`Total cost: ${solAmount.toFixed(8)} SOL (≈ $${(solAmount * solPrice).toFixed(2)})`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleDirectPurchase}
                disabled={purchaseLoading || !connected || !amount || parseFloat(amount) < minPurchase}
              >
                {purchaseLoading ? <CircularProgress size={24} color="inherit" /> : 'Buy Tokens'}
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                • Minimum purchase: {minPurchase} $VOTE tokens
              </Typography>
              <Typography variant="body2">
                • Current price: {tokenPrice.toFixed(8)} SOL per token
              </Typography>
              <Typography variant="body2">
                • Tokens will be sent to your connected wallet
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Function to render a success message after purchase
  const renderSuccessMessage = () => {
    if (activeStep === 0) return null;
    
    return (
      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          🎉 Congratulations on your purchase!
        </Typography>
        <Typography variant="body2">
          Your tokens have been added to your wallet. You can now use them to participate in voting!
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              setActiveStep(0);
              setAmount('');
            }}
          >
            Make Another Purchase
          </Button>
        </Box>
      </Alert>
    );
  };

  // Function to render success confetti
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    // Auto-hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return (
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {renderConfetti()}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {!connected ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Buy $VOTE Tokens
          </Typography>
          {renderConnectWallet()}
          {renderPriceStats()}
          {renderDEXOptions()}
        </Paper>
      ) : (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Buy $VOTE Tokens
          </Typography>
          {renderTokenBalance()}
          {renderSuccessMessage()}
          {renderPriceStats()}
          {renderDirectPurchase()}
          {renderDEXOptions()}
          <Box sx={{ mt: 4 }}>
            <Alert severity="info">
              Once you've purchased tokens, they will appear in your wallet. You can then use them to participate in voting!
            </Alert>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default BuyToken; 