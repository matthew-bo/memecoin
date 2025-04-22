import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Paper, Button, TextField, Box, Tabs, Tab, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Divider, CircularProgress, Snackbar, Alert, ListItemSecondaryAction } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TokenIcon from '@mui/icons-material/Token';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  Bar, 
  Pie, 
  Line 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import BallotIcon from '@mui/icons-material/Ballot';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Chip from '@mui/material/Chip';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import ButtonGroup from '@mui/material/ButtonGroup';
import CardHeader from '@mui/material/CardHeader';
import InfoIcon from '@mui/icons-material/Info';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import tokenService from '../services/TokenService';
import wikipediaService from '../services/WikipediaService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const AdminContainer = styled(Box)`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 16px;
  font-weight: 600;
`;

const StatsCard = styled(Card)`
  height: 100%;
  background: linear-gradient(45deg, #7928CA, #FF0080);
  color: white;
`;

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Admin = () => {
  const { publicKey, connected } = useWallet();
  const [tab, setTab] = useState(0);
  const [metrics, setMetrics] = useState({
    totalSupply: '1,000,000,000',
    holders: '0',
    price: '$0.000001',
    marketCap: '$1,000',
    volume24h: '$0',
  });
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPollOpen, setNewPollOpen] = useState(false);
  const [newPollData, setNewPollData] = useState({
    title: '',
    description: '',
    duration: 7, // days
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStats, setTokenStats] = useState({
    totalSupply: '100,000,000',
    holders: '0',
    transactions: '0',
    price: '$0.001'
  });
  const [candidates, setCandidates] = useState([]);
  const [openNewPollDialog, setOpenNewPollDialog] = useState(false);
  const [openCandidateDialog, setOpenCandidateDialog] = useState(false);
  const [newPoll, setNewPoll] = useState({
    name: '',
    description: '',
    endDate: ''
  });
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    imageUrl: '',
    description: '',
    pubkey: ''
  });
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  
  const [dashboardTab, setDashboardTab] = useState(0);
  
  const navigate = useNavigate();
  
  // Admin wallet addresses - should be moved to a secure config
  const adminWallets = [
    // Add admin wallet addresses here
  ];
  
  useEffect(() => {
    if (!publicKey || !adminWallets.includes(publicKey.toString())) {
      navigate('/');
      return;
    }

    loadPollData();
  }, [publicKey, navigate]);
  
  const loadPollData = async () => {
    setIsLoading(true);
    try {
      const currentPolls = await tokenService.getCurrentPolls();
      setPolls(currentPolls);
      
      if (currentPolls.length > 0 && !selectedPoll) {
        setSelectedPoll(currentPolls[0]);
        loadCandidatesForPoll(currentPolls[0]);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadCandidatesForPoll = async (poll) => {
    setIsLoading(true);
    try {
      // This would typically fetch candidates from the blockchain
      // For now, we'll use mock data from the poll
      setCandidates(poll.candidates || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  
  const handleNewPollOpen = () => {
    setNewPollData({
      title: '',
      description: '',
      duration: 7,
    });
    setSelectedCandidates([]);
    setNewPollOpen(true);
  };
  
  const handleNewPollClose = () => {
    setNewPollOpen(false);
  };
  
  const handlePollInputChange = (e) => {
    const { name, value } = e.target;
    setNewPollData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await wikipediaService.searchPeople(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      showSnackbar('Failed to search Wikipedia', 'error');
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const addCandidate = (candidate) => {
    // Check if candidate is already selected
    if (!selectedCandidates.some(c => c.id === candidate.id)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
    }
  };
  
  const removeCandidate = (candidateId) => {
    setSelectedCandidates(selectedCandidates.filter(c => c.id !== candidateId));
  };
  
  const createNewPoll = async () => {
    if (!connected) {
      showSnackbar('Please connect your wallet', 'error');
      return;
    }
    
    if (!newPollData.title || !newPollData.description || selectedCandidates.length < 2) {
      showSnackbar('Please fill all fields and add at least 2 candidates', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // In a real implementation, this would submit to the blockchain
      // For now, we'll just show a success message
      console.log('Creating new poll:', { ...newPollData, candidates: selectedCandidates });
      
      // Mock implementation - would be replaced with actual blockchain interaction
      const newPoll = {
        id: `poll-${Date.now()}`,
        title: newPollData.title,
        description: newPollData.description,
        endTime: new Date(Date.now() + newPollData.duration * 24 * 60 * 60 * 1000).toISOString(),
        candidates: selectedCandidates.map(c => ({
          id: c.id,
          name: c.title,
          wikipediaUrl: c.url,
          pubkey: `candidate-${c.id}`, // This would be generated on-chain
          voteCount: 0
        }))
      };
      
      setPolls([...polls, newPoll]);
      showSnackbar('Poll created successfully', 'success');
      handleNewPollClose();
    } catch (error) {
      console.error('Error creating poll:', error);
      showSnackbar('Failed to create poll', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  const handleOpenNewPollDialog = () => {
    setOpenNewPollDialog(true);
  };
  
  const handleCloseNewPollDialog = () => {
    setOpenNewPollDialog(false);
    setNewPoll({ name: '', description: '', endDate: '' });
  };
  
  const handleOpenCandidateDialog = () => {
    if (!selectedPoll) return;
    setOpenCandidateDialog(true);
  };
  
  const handleCloseCandidateDialog = () => {
    setOpenCandidateDialog(false);
    setNewCandidate({ name: '', imageUrl: '', description: '', pubkey: '' });
  };
  
  const handlePollChange = (e) => {
    setNewPoll({ ...newPoll, [e.target.name]: e.target.value });
  };
  
  const handleCandidateChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };
  
  const handleCreatePoll = async () => {
    setIsLoading(true);
    try {
      // Here we would call the blockchain to create a new poll
      console.log('Creating new poll:', newPoll);
      // Mock implementation - would be replaced with actual blockchain call
      const mockNewPoll = {
        ...newPoll,
        id: `poll-${Date.now()}`,
        candidates: [],
        createdAt: new Date().toISOString()
      };
      setPolls([...polls, mockNewPoll]);
      handleCloseNewPollDialog();
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCandidate = async () => {
    if (!selectedPoll) return;
    
    setIsLoading(true);
    try {
      // Here we would call the blockchain to add a candidate
      console.log('Adding candidate to poll:', selectedPoll.id, newCandidate);
      // Mock implementation - would be replaced with actual blockchain call
      const mockNewCandidate = {
        ...newCandidate,
        id: `candidate-${Date.now()}`,
        votes: 0
      };
      
      const updatedCandidates = [...candidates, mockNewCandidate];
      setCandidates(updatedCandidates);
      
      // Update the selected poll with new candidates
      const updatedPolls = polls.map(poll => 
        poll.id === selectedPoll.id 
          ? { ...poll, candidates: updatedCandidates } 
          : poll
      );
      setPolls(updatedPolls);
      
      handleCloseCandidateDialog();
    } catch (error) {
      console.error('Error adding candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectPoll = (poll) => {
    setSelectedPoll(poll);
    loadCandidatesForPoll(poll);
  };
  
  const handleRemoveCandidate = (candidateId) => {
    if (!selectedPoll) return;
    
    // Here we would call the blockchain to remove a candidate
    const updatedCandidates = candidates.filter(c => c.id !== candidateId);
    setCandidates(updatedCandidates);
    
    // Update the selected poll with updated candidates
    const updatedPolls = polls.map(poll => 
      poll.id === selectedPoll.id 
        ? { ...poll, candidates: updatedCandidates } 
        : poll
    );
    setPolls(updatedPolls);
  };
  
  // Format date for UI
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  useEffect(() => {
    // Fetch analytics data
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would fetch from the blockchain
        // For now, we'll use mock data
        
        // Generate dates for the selected time range
        const dates = [];
        const now = new Date();
        const dataPoints = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
        
        for (let i = dataPoints - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        // Generate random data for votes
        const voteData = Array(dataPoints).fill().map(() => Math.floor(Math.random() * 50) + 10);
        const cumulativeVotes = voteData.reduce((acc, curr, i) => {
          const prev = i > 0 ? acc[i-1] : 0;
          acc.push(prev + curr);
          return acc;
        }, []);
        
        // Generate random data for token purchases
        const purchaseData = Array(dataPoints).fill().map(() => Math.floor(Math.random() * 1000) + 100);
        const cumulativePurchases = purchaseData.reduce((acc, curr, i) => {
          const prev = i > 0 ? acc[i-1] : 0;
          acc.push(prev + curr);
          return acc;
        }, []);
        
        // Generate random data for active users
        const userData = Array(dataPoints).fill().map(() => Math.floor(Math.random() * 30) + 5);
        
        // Generate pie chart data for vote distribution
        const pollTypes = ['Meme', 'Celebrity', 'Project', 'Trend'];
        const voteDistribution = pollTypes.map(() => Math.floor(Math.random() * 1000) + 100);
        const totalVotes = voteDistribution.reduce((a, b) => a + b, 0);
        
        setAnalyticsData({
          dates,
          votes: {
            daily: voteData,
            cumulative: cumulativeVotes
          },
          purchases: {
            daily: purchaseData,
            cumulative: cumulativePurchases,
            total: cumulativePurchases[cumulativePurchases.length - 1]
          },
          users: {
            daily: userData,
            total: userData.reduce((a, b) => a + b, 0) / dataPoints // average daily users
          },
          distribution: {
            labels: pollTypes,
            data: voteDistribution,
            total: totalVotes
          }
        });
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load analytics data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);
  
  const renderAnalytics = () => {
    if (!analyticsData) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    const voteLineOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Vote Activity',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
    
    const voteLineData = {
      labels: analyticsData.dates,
      datasets: [
        {
          label: 'Daily Votes',
          data: analyticsData.votes.daily,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Cumulative Votes',
          data: analyticsData.votes.cumulative,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
    
    const purchaseBarData = {
      labels: analyticsData.dates,
      datasets: [
        {
          label: 'Token Purchases',
          data: analyticsData.purchases.daily,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
    
    const purchaseBarOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Token Purchases',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
    
    const pieOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Vote Distribution by Poll Type',
        },
      },
    };
    
    const pieData = {
      labels: analyticsData.distribution.labels,
      datasets: [
        {
          label: 'Votes',
          data: analyticsData.distribution.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Total Votes"
              value={analyticsData.distribution.total.toLocaleString()}
              icon={<HowToVoteIcon sx={{ fontSize: 40 }} color="primary" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Token Holders"
              value={tokenStats.holders.toLocaleString()}
              icon={<PeopleIcon sx={{ fontSize: 40 }} color="success" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Total Transactions"
              value={tokenStats.transactions.toLocaleString()}
              icon={<CompareArrowsIcon sx={{ fontSize: 40 }} color="info" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Active Users Today"
              value={analyticsData.users.daily[analyticsData.users.daily.length - 1].toLocaleString()}
              icon={<GroupAddIcon sx={{ fontSize: 40 }} color="warning" />}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setTimeRange('week')}
              variant={timeRange === 'week' ? 'contained' : 'outlined'}
            >
              Week
            </Button>
            <Button 
              onClick={() => setTimeRange('month')}
              variant={timeRange === 'month' ? 'contained' : 'outlined'}
            >
              Month
            </Button>
            <Button 
              onClick={() => setTimeRange('year')}
              variant={timeRange === 'year' ? 'contained' : 'outlined'}
            >
              Year
            </Button>
          </ButtonGroup>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Line options={voteLineOptions} data={voteLineData} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Bar options={purchaseBarOptions} data={purchaseBarData} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Pie options={pieOptions} data={pieData} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Platform Statistics
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemText primary="Total Token Supply" secondary={tokenStats.totalSupply.toLocaleString()} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Circulating Supply" secondary={tokenStats.circulating.toLocaleString()} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Average Daily Votes" secondary={(analyticsData.votes.daily.reduce((a, b) => a + b, 0) / analyticsData.votes.daily.length).toFixed(2)} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Average Daily Token Purchases" secondary={(analyticsData.purchases.daily.reduce((a, b) => a + b, 0) / analyticsData.purchases.daily.length).toFixed(2)} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Average Daily Active Users" secondary={analyticsData.users.total.toFixed(2)} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderDashboardOverview = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the admin dashboard. Here you can manage polls, analyze platform statistics, and monitor user activity.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Active Polls"
              value={polls.length}
              icon={<BallotIcon sx={{ fontSize: 40 }} color="primary" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Total Candidates"
              value={polls.reduce((acc, poll) => acc + (poll.candidates ? poll.candidates.length : 0), 0)}
              icon={<EmojiPeopleIcon sx={{ fontSize: 40 }} color="success" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="Pending Verifications"
              value="5"
              icon={<VerifiedUserIcon sx={{ fontSize: 40 }} color="warning" />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MetricCard
              title="System Status"
              value="Online"
              icon={<CheckIcon sx={{ fontSize: 40 }} color="success" />}
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemText primary="New poll created" secondary="5 minutes ago" />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Candidate verification completed" secondary="2 hours ago" />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Weekly poll ended" secondary="1 day ago" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="New token purchase spike detected" secondary="2 days ago" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2} direction="column">
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => setNewPollOpen(true)}
                >
                  Create New Poll
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<VerifiedUserIcon />}
                  onClick={() => setDashboardTab(2)}
                >
                  Verify Candidates
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AssessmentIcon />}
                  onClick={() => setDashboardTab(1)}
                >
                  View Analytics
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderPollManagement = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">
            Active Polls
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setNewPollOpen(true)}
          >
            Create New Poll
          </Button>
        </Box>
        
        {polls.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No active polls found. Create a new poll to get started.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {polls.map((poll, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardHeader
                    title={poll.title || `${poll.type.charAt(0).toUpperCase() + poll.type.slice(1)} Poll`}
                    subheader={`Created: ${new Date(poll.startTime * 1000).toLocaleDateString()}`}
                    action={
                      <IconButton aria-label="settings">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {poll.description || `Poll for the ${poll.type} category. Vote for your favorite candidate.`}
                    </Typography>
                    <List dense>
                      {poll.candidates && poll.candidates.slice(0, 3).map((candidate, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={candidate.name} 
                            secondary={`ID: ${candidate.pubkey.slice(0, 8)}...`} 
                          />
                          {candidate.verified && (
                            <Chip 
                              size="small" 
                              icon={<VerifiedUserIcon />} 
                              label="Verified" 
                              color="success" 
                              variant="outlined" 
                            />
                          )}
                        </ListItem>
                      ))}
                      {poll.candidates && poll.candidates.length > 3 && (
                        <ListItem>
                          <ListItemText 
                            secondary={`+${poll.candidates.length - 3} more candidates`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<DeleteIcon />}>
                      End Poll
                    </Button>
                    <Button size="small" startIcon={<InfoIcon />}>
                      Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };
  
  const handleDashboardTabChange = (event, newValue) => {
    setDashboardTab(newValue);
  };
  
  if (!connected) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <StyledPaper>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Please connect your wallet to access the admin dashboard.
          </Typography>
        </StyledPaper>
      </Container>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Dashboard" icon={<DashboardIcon />} />
          <Tab label="Polls" icon={<BallotIcon />} />
          <Tab label="Candidates" icon={<PeopleIcon />} />
          <Tab label="Verification" icon={<VerifiedUserIcon />} />
        </Tabs>
      </AppBar>
      
      {tab === 0 && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={dashboardTab} onChange={handleDashboardTabChange}>
                    <Tab label="Overview" />
                    <Tab label="Analytics" />
                    <Tab label="Manage Polls" />
                  </Tabs>
                </Box>
                
                {dashboardTab === 0 && renderDashboardOverview()}
                {dashboardTab === 1 && renderAnalytics()}
                {dashboardTab === 2 && renderPollManagement()}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}
      
      {tab === 1 && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label="Token Metrics" />
                    <Tab label="Poll Management" />
                    <Tab label="System Controls" />
                  </Tabs>
                </Box>
                
                {tab === 0 && (
                  <SectionTitle variant="h5">Token Statistics</SectionTitle>
                )}
                {tab === 1 && (
                  <SectionTitle variant="h5">Poll Management</SectionTitle>
                )}
                {tab === 2 && (
                  <SectionTitle variant="h5">System Controls</SectionTitle>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}
      
      {tab === 2 && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label="Token Metrics" />
                    <Tab label="Poll Management" />
                    <Tab label="System Controls" />
                  </Tabs>
                </Box>
                
                {tab === 0 && (
                  <SectionTitle variant="h5">Token Statistics</SectionTitle>
                )}
                {tab === 1 && (
                  <SectionTitle variant="h5">Poll Management</SectionTitle>
                )}
                {tab === 2 && (
                  <SectionTitle variant="h5">System Controls</SectionTitle>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}
      
      {tab === 3 && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tab} onChange={handleTabChange}>
                    <Tab label="Token Metrics" />
                    <Tab label="Poll Management" />
                    <Tab label="System Controls" />
                  </Tabs>
                </Box>
                
                {tab === 0 && (
                  <SectionTitle variant="h5">Token Statistics</SectionTitle>
                )}
                {tab === 1 && (
                  <SectionTitle variant="h5">Poll Management</SectionTitle>
                )}
                {tab === 2 && (
                  <SectionTitle variant="h5">System Controls</SectionTitle>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Admin; 