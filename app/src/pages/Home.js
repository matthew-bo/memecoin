import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  CardMedia,
  Avatar,
  Chip,
  Divider,
  keyframes,
  Stack,
  Paper
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TokenIcon from '@mui/icons-material/Token';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Home = () => {
  const theme = useTheme();

  // Quotes for the app
  const quotes = [
    "Make your voice heard, one vote at a time!",
    "Your opinion matters - cast your vote today",
    "Join the community and influence the rankings",
    "Democracy in action - who will you vote for?"
  ];
  
  // Select a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Popular Vote
            </Typography>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                mb: 3,
                fontStyle: 'italic'
              }}
            >
              Vote-to-Earn on Solana: Where Your Opinion Shapes Rankings
            </Typography>
            <Typography variant="body1" paragraph>
              Use your $VOTE tokens to participate in daily polls about popular figures and earn rewards. The more you participate, the more you earn!
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/vote"
                startIcon={<HowToVoteIcon />}
              >
                Vote Now
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={RouterLink}
                to="/buy"
                startIcon={<TokenIcon />}
              >
                Get $VOTE Tokens
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 0, overflow: 'hidden', height: '100%' }}>
            <img
              src="/images/vote-illustration.png"
              alt="Popular Vote illustration"
              style={{ width: '100%', height: 'auto' }}
            />
          </Paper>
        </Grid>
        
        {/* Features section */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Why Choose Popular Vote?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    <HowToVoteIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>Vote Daily</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participate in daily polls about popular figures, celebrities, and public personalities.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    <TokenIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>Earn $VOTE</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get rewarded with $VOTE tokens for participating in the voting process.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>Secure Wallet</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect your Solana wallet to vote and store your $VOTE tokens securely.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    <TrendingUpIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" gutterBottom>Track Results</Typography>
                  <Typography variant="body2" color="text.secondary">
                    See real-time results and historical data on how the community ranks public figures.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 