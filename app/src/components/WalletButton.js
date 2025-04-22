import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Divider,
  Box,
  Typography,
  styled
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Style to hide the actual WalletMultiButton but keep it functional
const HiddenWalletButton = styled(Box)({
  position: 'absolute',
  opacity: 0,
  height: 0,
  width: 0,
  pointerEvents: 'none',
  '.wallet-adapter-button': {
    height: 0,
    opacity: 0,
  }
});

const WalletButton = () => {
  const { 
    connected, 
    connecting, 
    publicKey, 
    disconnect,
    wallet
  } = useWallet();
  
  // Use the wallet modal directly
  const { setVisible } = useWalletModal();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const open = Boolean(anchorEl);
  const walletButtonRef = useRef(null);
  
  // Load token balance
  useEffect(() => {
    if (connected && publicKey) {
      // For demo purposes - would fetch actual balance in production
      const mockTokenBalance = Math.floor(Math.random() * 10000);
      const mockSolBalance = Number((Math.random() * 10).toFixed(2));
      
      setTokenBalance(mockTokenBalance);
      setSolBalance(mockSolBalance);
    } else {
      setTokenBalance(0);
      setSolBalance(0);
    }
  }, [connected, publicKey]);
  
  const handleClick = (event) => {
    if (connected) {
      setAnchorEl(event.currentTarget);
    } else {
      // Trigger the wallet adapter modal directly
      if (walletButtonRef.current) {
        walletButtonRef.current.querySelector('.wallet-adapter-button')?.click();
      } else {
        setVisible(true); // Fallback
      }
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDisconnect = () => {
    if (disconnect) {
      disconnect();
    }
    handleClose();
  };
  
  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    handleClose();
  };
  
  const formatAddress = (address) => {
    if (!address) return '';
    address = address.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  return (
    <>
      {/* Hidden but functional WalletMultiButton */}
      <HiddenWalletButton ref={walletButtonRef}>
        <WalletMultiButton />
      </HiddenWalletButton>

      {/* Custom styled button */}
      <Button
        variant="contained"
        color={connected ? "primary" : "secondary"}
        onClick={handleClick}
        endIcon={connected ? <KeyboardArrowDownIcon /> : null}
        startIcon={<AccountBalanceWalletIcon />}
        disabled={connecting}
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          minWidth: connected ? 150 : 'auto',
        }}
      >
        {connecting ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            Connecting...
          </Box>
        ) : connected ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="caption" sx={{ lineHeight: 1 }}>
              {formatAddress(publicKey)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {tokenBalance > 0 ? `${tokenBalance} VOTE` : `${solBalance.toFixed(2)} SOL`}
            </Typography>
          </Box>
        ) : (
          'Connect Wallet'
        )}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'wallet-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCopyAddress}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {copied ? 'Copied!' : 'Copy Address'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem disabled>
          <ListItemIcon>
            <NetworkCheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Network: {wallet?.adapter?.name || 'Not connected'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Disconnect
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default WalletButton; 