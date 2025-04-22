import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Grid, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useWallet } from '@solana/wallet-adapter-react';

// Mock data - would be replaced with actual API calls
const mockPolls = [
  { id: 1, name: 'Best Meme Coin 2023', startDate: '2023-11-01', endDate: '2023-11-30', status: 'active', candidates: 8 },
  { id: 2, name: 'Worst Performer', startDate: '2023-10-15', endDate: '2023-11-15', status: 'active', candidates: 5 },
];

const mockCandidates = [
  { id: 1, pollId: 1, name: 'Dogecoin', votes: 456, dateAdded: '2023-11-01' },
  { id: 2, pollId: 1, name: 'Shiba Inu', votes: 324, dateAdded: '2023-11-01' },
  { id: 3, pollId: 1, name: 'PEPE', votes: 278, dateAdded: '2023-11-02' },
  { id: 4, pollId: 2, name: 'SafeMoon', votes: 122, dateAdded: '2023-10-15' },
];

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [polls, setPolls] = useState(mockPolls);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddPollDialog, setShowAddPollDialog] = useState(false);
  const [showAddCandidateDialog, setShowAddCandidateDialog] = useState(false);
  const [newPoll, setNewPoll] = useState({ name: '', startDate: '', endDate: '' });
  const [newCandidate, setNewCandidate] = useState({ name: '', wikiUrl: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { connected, publicKey } = useWallet();

  // Check admin authorization
  useEffect(() => {
    // In a real app, you would verify admin privileges from the backend
    // For now, we'll assume any connected wallet can access admin features
    if (!connected) {
      setSnackbar({
        open: true,
        message: 'Please connect your wallet to access admin features',
        severity: 'warning'
      });
    }
  }, [connected]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectPoll = (poll) => {
    setSelectedPoll(poll);
    setTabValue(1);
  };

  const handleAddPoll = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newId = polls.length > 0 ? Math.max(...polls.map(p => p.id)) + 1 : 1;
      const pollToAdd = {
        id: newId,
        ...newPoll,
        status: 'active',
        candidates: 0
      };
      setPolls([...polls, pollToAdd]);
      setNewPoll({ name: '', startDate: '', endDate: '' });
      setShowAddPollDialog(false);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Poll added successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleAddCandidate = () => {
    if (!selectedPoll) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
      const candidateToAdd = {
        id: newId,
        pollId: selectedPoll.id,
        name: newCandidate.name,
        votes: 0,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setCandidates([...candidates, candidateToAdd]);
      
      // Update poll candidate count
      setPolls(polls.map(poll => 
        poll.id === selectedPoll.id 
          ? { ...poll, candidates: poll.candidates + 1 } 
          : poll
      ));
      
      setNewCandidate({ name: '', wikiUrl: '' });
      setShowAddCandidateDialog(false);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Candidate added successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  const handleDeleteCandidate = (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    
    const candidateToDelete = candidates.find(c => c.id === candidateId);
    if (!candidateToDelete) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCandidates(candidates.filter(c => c.id !== candidateId));
      
      // Update poll candidate count
      setPolls(polls.map(poll => 
        poll.id === candidateToDelete.pollId 
          ? { ...poll, candidates: poll.candidates - 1 } 
          : poll
      ));
      
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Candidate deleted successfully',
        severity: 'success'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {!connected ? (
        <Card sx={{ mb: 4, bgcolor: '#fff9c4' }}>
          <CardContent>
            <Typography color="textSecondary">
              Please connect your wallet to access admin features
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Controls
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Connected as: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setShowAddPollDialog(true)}
                  startIcon={<AddIcon />}
                  sx={{ mr: 2 }}
                >
                  Create New Poll
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  disabled={!selectedPoll}
                  onClick={() => setShowAddCandidateDialog(true)}
                  startIcon={<AddIcon />}
                >
                  Add Candidate
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Active Polls" />
                <Tab label="Manage Candidates" disabled={!selectedPoll} />
                <Tab label="Token Management" />
              </Tabs>
            </Box>
            
            {/* Polls Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Active Polls</Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Candidates</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {polls.map((poll) => (
                        <TableRow key={poll.id}>
                          <TableCell>{poll.name}</TableCell>
                          <TableCell>{poll.startDate}</TableCell>
                          <TableCell>{poll.endDate}</TableCell>
                          <TableCell>{poll.status}</TableCell>
                          <TableCell>{poll.candidates}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              onClick={() => handleSelectPoll(poll)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
            
            {/* Candidates Tab */}
            <TabPanel value={tabValue} index={1}>
              {selectedPoll && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Candidates for {selectedPoll.name}
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Date Added</TableCell>
                            <TableCell>Current Votes</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {candidates
                            .filter(c => c.pollId === selectedPoll.id)
                            .map((candidate) => (
                              <TableRow key={candidate.id}>
                                <TableCell>{candidate.name}</TableCell>
                                <TableCell>{candidate.dateAdded}</TableCell>
                                <TableCell>{candidate.votes}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </TabPanel>
            
            {/* Token Management Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Token Management</Typography>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Token Information</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ my: 2 }}>
                        <Typography variant="body2" color="textSecondary">Token Name</Typography>
                        <Typography variant="body1">MemeVote Token</Typography>
                      </Box>
                      <Box sx={{ my: 2 }}>
                        <Typography variant="body2" color="textSecondary">Token Symbol</Typography>
                        <Typography variant="body1">MVOTE</Typography>
                      </Box>
                      <Box sx={{ my: 2 }}>
                        <Typography variant="body2" color="textSecondary">Total Supply</Typography>
                        <Typography variant="body1">1,000,000,000</Typography>
                      </Box>
                      <Box sx={{ my: 2 }}>
                        <Typography variant="body2" color="textSecondary">Token Address</Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                          {/* Mock token address */}
                          7dVH4U6ibJb5brKmfBXKGqGU98MqAVRhh5bdTLFMyJCU
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">Token Operations</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ my: 2 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth 
                          sx={{ mb: 2 }}
                        >
                          Update Token Metadata
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          fullWidth 
                          sx={{ mb: 2 }}
                        >
                          Mint Additional Tokens
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          fullWidth
                        >
                          Transfer Ownership
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </>
      )}

      {/* Add Poll Dialog */}
      <Dialog open={showAddPollDialog} onClose={() => setShowAddPollDialog(false)}>
        <DialogTitle>Create New Poll</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Poll Name"
            fullWidth
            variant="outlined"
            value={newPoll.name}
            onChange={(e) => setNewPoll({ ...newPoll, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newPoll.startDate}
            onChange={(e) => setNewPoll({ ...newPoll, startDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newPoll.endDate}
            onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddPollDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddPoll} 
            variant="contained" 
            color="primary"
            disabled={!newPoll.name || !newPoll.startDate || !newPoll.endDate || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Poll'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddCandidateDialog} onClose={() => setShowAddCandidateDialog(false)}>
        <DialogTitle>Add Candidate</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Candidate Name"
            fullWidth
            variant="outlined"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Wikipedia URL (optional)"
            fullWidth
            variant="outlined"
            value={newCandidate.wikiUrl}
            onChange={(e) => setNewCandidate({ ...newCandidate, wikiUrl: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddCandidateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCandidate} 
            variant="contained" 
            color="primary"
            disabled={!newCandidate.name || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Candidate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Tab Panel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default AdminDashboard; 