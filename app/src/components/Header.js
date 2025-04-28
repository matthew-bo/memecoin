import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TokenService from '../services/TokenService';
import WalletButton from './WalletButton';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { publicKey, connected } = useWallet();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (connected && publicKey) {
        try {
          const balanceResult = await TokenService.getTokenBalance(publicKey);
          setTokenBalance(balanceResult.success ? balanceResult.balance : 0);
          
          // Check if user is admin
          const adminStatus = await TokenService.isAdmin(publicKey.toString());
          setIsAdmin(adminStatus);
          setError(null);
        } catch (error) {
          console.error('Error fetching token balance or admin status:', error);
          setError(error.message);
          // Don't update other state on error
        }
      } else {
        setIsAdmin(false);
        setTokenBalance(0);
        setError(null);
      }
    };

    fetchTokenBalance().catch(console.error);
    
    // Set up polling to update balance
    const intervalId = setInterval(() => {
      fetchTokenBalance().catch(console.error);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [connected, publicKey]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Vote', path: '/vote' },
    { name: 'Results', path: '/results' },
    { name: 'History', path: '/history' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Buy Token', path: '/buy-token' },
    { name: 'Whitepaper', path: '/whitepaper' },
    { name: 'Admin', path: '/admin', adminOnly: true },
  ];
  
  if (isAdmin) {
    pages.push({ name: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Popular Vote
      </Typography>
      <List>
        {pages.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                textAlign: 'center',
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleMenu}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {pages.map((item) => (
                    <MenuItem 
                      key={item.name} 
                      component={RouterLink} 
                      to={item.path}
                      onClick={handleClose}
                      sx={{ 
                        backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Popular Vote
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {pages.map((item) => (
                <Button
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: 'white',
                    display: 'block',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  }}
                >
                  {item.icon && <Box sx={{ mr: 0.5 }}>{item.icon}</Box>}
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          {/* Wallet and Balance */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {connected && (
              <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Balance: {tokenBalance} VOTE
              </Typography>
            )}
            <WalletButton />
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 