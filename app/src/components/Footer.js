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
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* About section */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Popular Vote
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The first memecoin with daily voting for the best and worst people on Earth.
              Your vote matters, and so does your meme.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="Twitter" component={Link} href="https://twitter.com" target="_blank" rel="noopener">
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="Telegram" component={Link} href="https://telegram.org" target="_blank" rel="noopener">
                <TelegramIcon />
              </IconButton>
              <IconButton aria-label="GitHub" component={Link} href="https://github.com" target="_blank" rel="noopener">
                <GitHubIcon />
              </IconButton>
              <IconButton aria-label="Reddit" component={Link} href="https://reddit.com" target="_blank" rel="noopener">
                <RedditIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Links section */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/vote" color="inherit" display="block" sx={{ mb: 1 }}>
              Vote
            </Link>
            <Link component={RouterLink} to="/results" color="inherit" display="block" sx={{ mb: 1 }}>
              Results
            </Link>
            <Link component={RouterLink} to="/history" color="inherit" display="block" sx={{ mb: 1 }}>
              History
            </Link>
            <Link component={RouterLink} to="/buy" color="inherit" display="block">
              Buy Token
            </Link>
          </Grid>

          {/* Resources section - Updating to link to the same page with anchors instead of "#" */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We're working on additional resources that will be available soon:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Whitepaper
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Tokenomics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • FAQ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Contact Page
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {year} Popular Vote. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Powered by Solana blockchain
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 