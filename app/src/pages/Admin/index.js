import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useWallet } from '@solana/wallet-adapter-react';
import PollService from '../../services/PollService';
import { useNavigate } from 'react-router-dom';
import TokenService from '../../services/TokenService';
import VoteHistory from './VoteHistory';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers';
import WalletButton from '../../components/WalletButton';
import verificationService, { VERIFICATION_TYPES } from '../../services/VerificationService';
import {
  CheckCircle as CheckCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Gavel as GavelIcon,
  Token as TokenIcon,
  Cancel as CancelIcon,
  SearchOutlined
} from '@mui/icons-material';

// Dashboard metric card component
const MetricCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}.light`, 
          p: 1, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Dashboard Overview component
const DashboardOverview = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [activePolls, setActivePolls] = useState(0);
  const [tokenStats, setTokenStats] = useState({ holders: 0, supply: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with actual data fetching in a production environment
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setTotalVotes(1254);
        setTotalCandidates(12);
        setActivePolls(2);
        setTokenStats({
          holders: 87,
          supply: '1,000,000',
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Votes"
            value={totalVotes.toLocaleString()}
            icon={<HowToVoteIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Polls"
            value={activePolls}
            icon={<BarChartIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Candidates"
            value={totalCandidates}
            icon={<PeopleIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Token Holders"
            value={tokenStats.holders}
            icon={<MonetizationOnIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const AdminDashboard = () => {
  const { connected, publicKey } = useWallet();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isAdmin, setIsAdmin] = useState(false);
  
  // New poll form state
  const [newPoll, setNewPoll] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  
  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    description: '',
    imageUrl: '',
    verificationStatus: VERIFICATION_TYPES.NONE,
    socialAccounts: [],
    officialUrl: ''
  });
  
  // Admin wallets - in a real app, this would come from a secure source
  const adminWallets = [
    // Add admin wallet addresses here
    "7X3csFfqA9JCBZAHZxkPJq4mMcr6tLx6HAWyEHk8xjkS"
  ];
  
  const navigate = useNavigate();
  const tokenService = new TokenService();
  const verificationService = new verificationService();
  
  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      if (!connected || !publicKey) {
        // Not connected, redirect to home
        navigate('/');
        return;
      }

      try {
        // Use the static isAdmin method correctly
        const adminStatus = TokenService.isAdmin(publicKey);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Not an admin, redirect to home
          setNotification({
            open: true,
            message: 'You do not have admin privileges. To access admin panel, use a wallet with address 7X3csFfqA9JCBZAHZxkPJq4mMcr6tLx6HAWyEHk8xjkS',
            severity: 'error'
          });
          navigate('/');
          return;
        }
        
        // If admin, fetch polls
        fetchPolls();
      } catch (error) {
        console.error('Error checking admin status:', error);
        setNotification({
          open: true,
          message: 'Error checking admin status',
          severity: 'error'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [connected, publicKey, navigate]);
  
  const fetchPolls = async () => {
    try {
      setLoading(true);
      const pollList = await PollService.getAllPolls();
      setPolls(pollList);
    } catch (error) {
      console.error('Error fetching polls:', error);
      showNotification('Failed to fetch polls', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleNewPollChange = (e) => {
    const { name, value } = e.target;
    setNewPoll(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewCandidateChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('You do not have admin permissions', 'error');
      return;
    }
    
    try {
      setLoading(true);
      // In a real implementation, this would call the PollService
      const result = await PollService.createPoll(newPoll);
      
      showNotification('Poll created successfully', 'success');
      setNewPoll({ name: '', description: '', startDate: '', endDate: '' });
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
      showNotification('Failed to create poll', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const verifyCandidate = async () => {
    if (!newCandidate.name) {
      showNotification('Please enter a candidate name', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const verificationData = {
        socialAccounts: newCandidate.socialAccounts,
        publicKey: newCandidate.publicKey,
        officialWebsite: newCandidate.officialUrl
      };
      
      const verificationResult = await verificationService.verifyCandidate(
        newCandidate.name, 
        verificationData
      );
      
      setNewCandidate(prev => ({
        ...prev,
        verificationStatus: verificationResult.type
      }));
      
      // If verified, populate candidate data
      if (verificationResult.verified && verificationResult.data) {
        const data = verificationResult.data;
        
        setNewCandidate(prev => ({
          ...prev,
          description: data.description || prev.description,
          imageUrl: data.imageUrl || prev.imageUrl
        }));
        
        showNotification('Candidate verified successfully', 'success');
      } else {
        showNotification('Candidate could not be verified automatically', 'warning');
      }
    } catch (error) {
      console.error('Error verifying candidate:', error);
      showNotification('Error during verification', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('You do not have admin permissions', 'error');
      return;
    }
    
    if (!selectedPoll) {
      showNotification('Please select a poll', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Add verification status to candidate data
      const candidateData = {
        ...newCandidate,
        verified: newCandidate.verificationStatus.verified,
        verificationType: newCandidate.verificationStatus.type
      };
      
      // In a real implementation, this would call the PollService
      const result = await PollService.addCandidate(selectedPoll, candidateData);
      
      showNotification('Candidate added successfully', 'success');
      setNewCandidate({
        name: '',
        description: '',
        imageUrl: '',
        verificationStatus: VERIFICATION_TYPES.NONE,
        socialAccounts: [],
        officialUrl: ''
      });
      fetchPolls();
    } catch (error) {
      console.error('Error adding candidate:', error);
      showNotification('Failed to add candidate', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Display content based on selected tab
  const renderTabContent = () => {
    switch (tabValue) {
      case 0:
        return (
          <Box>
            <DashboardOverview />
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create a New Poll
              </Typography>
              <form onSubmit={handleCreatePoll}>
                <TextField
                  label="Poll Title"
                  variant="outlined"
                  fullWidth
                  value={newPoll.name}
                  onChange={handleNewPollChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  value={newPoll.description}
                  onChange={handleNewPollChange}
                  required
                  sx={{ mb: 2 }}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Date"
                    value={newPoll.startDate}
                    onChange={(newValue) => setNewPoll(prev => ({ ...prev, startDate: newValue }))}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="End Date"
                    value={newPoll.endDate}
                    onChange={(newValue) => setNewPoll(prev => ({ ...prev, endDate: newValue }))}
                    renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                  />
                </LocalizationProvider>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !newPoll.name || !newPoll.description || !newPoll.startDate || !newPoll.endDate}
                >
                  {loading ? <CircularProgress size={24} /> : "Create Poll"}
                </Button>
              </form>
            </Paper>
          </Box>
        );
      case 1:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add a Candidate
            </Typography>
            <form onSubmit={handleAddCandidate}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Poll</InputLabel>
                <Select
                  value={selectedPoll}
                  onChange={(e) => setSelectedPoll(e.target.value)}
                  required
                >
                  {polls.map((poll) => (
                    <MenuItem key={poll.id} value={poll.id}>
                      {poll.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Candidate Name"
                variant="outlined"
                fullWidth
                value={newCandidate.name}
                onChange={handleNewCandidateChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={newCandidate.description}
                onChange={handleNewCandidateChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Image URL"
                variant="outlined"
                fullWidth
                value={newCandidate.imageUrl}
                onChange={handleNewCandidateChange}
                required
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !selectedPoll || !newCandidate.name || !newCandidate.description || !newCandidate.imageUrl}
              >
                {loading ? <CircularProgress size={24} /> : "Add Candidate"}
              </Button>
            </form>
          </Paper>
        );
      case 2:
        return (
          <VoteHistory />
        );
      default:
        return null;
    }
  };
  
  if (!connected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please connect your wallet to access the admin dashboard
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Admin Access Required
          </Typography>
          <Typography variant="body1">
            You do not have permission to view this page. Please connect with an admin wallet.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Dashboard" />
          <Tab label="Manage Polls" />
          <Tab label="Vote History" />
        </Tabs>
      </Box>
      
      {!publicKey ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please connect your wallet to access the admin dashboard
          </Typography>
          <WalletButton />
        </Paper>
      ) : !isAdmin ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You do not have admin permissions
          </Typography>
        </Paper>
      ) : (
        renderTabContent()
      )}

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard; 