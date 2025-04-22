import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useToken } from '../contexts/TokenContext';
import { 
  AccountBalanceWallet,
  Receipt,
  HowToVote
} from '@mui/icons-material';

const TransactionHistory = () => {
  const { publicKey, connected } = useWallet();
  const { tokenService } = useToken();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactionHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  const fetchTransactionHistory = async () => {
    if (!connected || !publicKey) return;
    
    setLoading(true);
    try {
      const history = await tokenService.getTransactionHistory(publicKey);
      setTransactions(history);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const shortenSignature = (signature) => {
    return signature.substring(0, 8) + '...' + signature.substring(signature.length - 8);
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <Receipt color="primary" />;
      case 'vote':
        return <HowToVote color="secondary" />;
      default:
        return <Receipt />;
    }
  };
  
  const getTransactionDescription = (tx) => {
    switch (tx.type) {
      case 'purchase':
        return `Purchased ${tx.details.amount} VOTE tokens for ${tx.details.total} SOL`;
      case 'vote':
        return `Voted for ${tx.details.candidate} in ${tx.details.poll} poll`;
      default:
        return 'Unknown transaction';
    }
  };
  
  const getTransactionStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <Chip size="small" color="success" label="Confirmed" />;
      case 'processing':
        return <Chip size="small" color="warning" label="Processing" />;
      case 'failed':
        return <Chip size="small" color="error" label="Failed" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  if (!connected) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <AccountBalanceWallet sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Please connect your wallet to view your transaction history.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Your Transaction History
          </Typography>
          <Button 
            variant="outlined" 
            onClick={fetchTransactionHistory}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Alert severity="info">
            No transactions found for this wallet. Purchase tokens or participate in voting to see your transactions here.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Signature</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTransactionIcon(tx.type)}
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {tx.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getTransactionDescription(tx)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {shortenSignature(tx.signature)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(tx.blockTime)}</TableCell>
                    <TableCell>{getTransactionStatusChip(tx.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default TransactionHistory; 