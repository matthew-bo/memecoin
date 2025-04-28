import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';
import RedditIcon from '@mui/icons-material/Reddit';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Popular Vote
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A decentralized voting platform on Solana where your opinion shapes rankings.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/vote" color="text.secondary">
                Vote Now
              </Link>
              <Link component={RouterLink} to="/results" color="text.secondary">
                Results
              </Link>
              <Link component={RouterLink} to="/whitepaper" color="text.secondary">
                Whitepaper
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                Solana
              </Link>
              <Link
                href="https://phantom.app"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                Phantom Wallet
              </Link>
              <Link
                href="https://github.com/yourusername/memecoin-vote"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                GitHub
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 3 }}
        >
          © {year} Popular Vote. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 