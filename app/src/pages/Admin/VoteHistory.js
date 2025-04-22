import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TokenService from '../../services/TokenService';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, History, Person } from '@mui/icons-material';

const VoteHistory = () => {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdminAndLoadVotes = async () => {
      if (!connected || !publicKey) {
        setIsAdmin(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if user is admin
        const tokenService = new TokenService();
        const adminCheck = await tokenService.isAdmin(publicKey.toString());
        setIsAdmin(adminCheck);
        
        if (adminCheck) {
          // Fetch vote history using TokenService
          const voteHistory = await tokenService.getTransactionHistory(publicKey.toString());
          setVotes(voteHistory);
        }
      } catch (error) {
        console.error('Error checking admin status or loading votes:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadVotes();
  }, [connected, publicKey]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Filter votes based on search term
  const filteredVotes = votes.filter((vote) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (vote.voter && vote.voter.toLowerCase().includes(searchLower)) ||
      (vote.candidate && vote.candidate.toLowerCase().includes(searchLower)) ||
      (vote.pollType && vote.pollType.toLowerCase().includes(searchLower)) ||
      (vote.pollName && vote.pollName.toLowerCase().includes(searchLower))
    );
  });

  if (!connected) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="warning">
          Please connect your wallet to access the vote history
        </Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Alert severity="error">
          You don't have admin access to view the complete vote history
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <History sx={{ mr: 1 }} color="primary" />
        <Typography variant="h5" component="h2">
          Vote Transaction History
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by voter, candidate, or poll"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table aria-label="vote history table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction</TableCell>
              <TableCell>Voter</TableCell>
              <TableCell>Candidate</TableCell>
              <TableCell>Poll</TableCell>
              <TableCell align="right">Tokens</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVotes.length > 0 ? (
              filteredVotes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vote, index) => (
                <TableRow key={vote.signature || `vote-${index}`}>
                  <TableCell>
                    <Button
                      size="small"
                      href={`https://explorer.solana.com/tx/${vote.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none' }}
                    >
                      {vote.signature ? vote.signature.substring(0, 8) + '...' : 'N/A'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Button
                        size="small"
                        href={`https://explorer.solana.com/address/${vote.voter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: 'none' }}
                      >
                        {shortenAddress(vote.voter)}
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>{vote.candidate}</TableCell>
                  <TableCell>
                    <Chip
                      label={vote.pollName || (vote.pollType === 'best' ? 'Best Poll' : 'Worst Poll')}
                      color={vote.pollType === 'best' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{vote.votingPower}</TableCell>
                  <TableCell>{formatDate(vote.timestamp)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No votes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredVotes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default VoteHistory; 