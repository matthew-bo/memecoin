import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Results from './pages/Results';
import History from './pages/History';
import AdminDashboard from './pages/Admin';
import BuyToken from './pages/BuyToken';
import TransactionHistory from './pages/TransactionHistory';
import Whitepaper from './pages/Whitepaper';
import { TokenProvider } from './contexts/TokenContext';
import { registerNotificationCallback } from './utils/NotificationUtils';
import { Snackbar, Alert, Box, Typography, CircularProgress } from '@mui/material';

function App() {
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App component mounted');
    try {
      registerNotificationCallback((notificationData) => {
        setNotification({
          open: true,
          message: notificationData.message,
          description: notificationData.description,
          severity: notificationData.type,
          duration: notificationData.duration,
          txid: notificationData.txid
        });
      });
      setLoading(false);
    } catch (err) {
      console.error('Error in App initialization:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(null);
  };

  const renderNotification = () => {
    if (!notification) return null;

    return (
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration || 6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          <strong>{notification.message}</strong>
          {notification.description && (
            <div style={{ marginTop: 4, fontSize: '0.85em' }}>
              {notification.description}
            </div>
          )}
          {notification.txid && (
            <div style={{ marginTop: 4 }}>
              <a 
                href={`https://explorer.solana.com/tx/${notification.txid}?cluster=devnet`} 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                View Transaction
              </a>
            </div>
          )}
        </Alert>
      </Snackbar>
    );
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Loading application...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" color="error">Error Loading Application</Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TokenProvider>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/buy" element={<BuyToken />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/buytoken" element={<Navigate to="/buy" replace />} />
            <Route path="/buytokens" element={<Navigate to="/buy" replace />} />
            <Route path="/buy-token" element={<Navigate to="/buy" replace />} />
            <Route path="/buy-tokens" element={<Navigate to="/buy" replace />} />
            <Route path="/token" element={<Navigate to="/buy" replace />} />
            <Route path="/tokens" element={<Navigate to="/buy" replace />} />
          </Routes>
        </main>
        <Footer />
        {renderNotification()}
      </TokenProvider>
    </ThemeProvider>
  );
}

export default App; 