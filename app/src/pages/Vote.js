import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useToken } from '../contexts/TokenContext';
import TokenService from '../services/TokenService';
import verificationService, { VERIFICATION_TYPES } from '../services/VerificationService';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Paper,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import { 
  ThumbUpAlt, 
  ThumbDownAlt, 
  CheckCircle as CheckCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Gavel as GavelIcon,
  Token as TokenIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import WalletButton from '../components/WalletButton';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { sendAndConfirmTransaction, formatTransactionError } from '../utils/TransactionUtils';
import { notifySuccess, notifyError } from '../utils/NotificationUtils';

const Vote = () => {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const { votingPower, castVote, tokenBalance, isLoading } = useToken();
  const [pollType, setPollType] = useState('best');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState({ best: [], worst: [] });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [remainingTime, setRemainingTime] = useState({ hours: 24, minutes: 0, seconds: 0 });
  const [hasVoted, setHasVoted] = useState({ best: false, worst: false });
  const [userVote, setUserVote] = useState({ best: null, worst: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [verificationData, setVerificationData] = useState({});
  const [isVoteLoading, setVoteLoading] = useState(false);
  const [currentPolls, setCurrentPolls] = useState(null);

  // Fetch candidates and poll data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch current polls from the public folder
        const response = await fetch('/current-polls.json');
        if (!response.ok) {
          throw new Error('Failed to fetch poll data');
        }
        
        const pollData = await response.json();
        
        // Extract candidates
        const bestCandidates = pollData.candidates?.best || [];
        const worstCandidates = pollData.candidates?.worst || [];
        
        setCandidates({
          best: bestCandidates,
          worst: worstCandidates
        });
        
        // Fetch verification data for all candidates
        const verificationResults = {};
        
        // Process best candidates
        for (const candidate of bestCandidates) {
          try {
            const verification = await verificationService.verifyCandidate(candidate.name);
            verificationResults[candidate.name] = verification;
          } catch (error) {
            console.error(`Error verifying candidate ${candidate.name}:`, error);
          }
        }
        
        // Process worst candidates
        for (const candidate of worstCandidates) {
          try {
            const verification = await verificationService.verifyCandidate(candidate.name);
            verificationResults[candidate.name] = verification;
          } catch (error) {
            console.error(`Error verifying candidate ${candidate.name}:`, error);
          }
        }
        
        setVerificationData(verificationResults);
        
        // Calculate remaining time
        const now = Math.floor(Date.now() / 1000);
        const endTime = pollData.startTime + 86400; // 1 day in seconds
        const timeRemaining = Math.max(0, endTime - now);
        
        setRemainingTime({
          hours: Math.floor(timeRemaining / 3600),
          minutes: Math.floor((timeRemaining % 3600) / 60),
          seconds: timeRemaining % 60
        });

        // Check if user has already voted and get their vote
        if (connected && publicKey) {
          try {
            const hasVotedBest = await TokenService.hasUserVoted(publicKey, 'best');
            const hasVotedWorst = await TokenService.hasUserVoted(publicKey, 'worst');
            
            setHasVoted({ best: hasVotedBest, worst: hasVotedWorst });
            
            // If the user has voted, get their vote
            if (hasVotedBest) {
              const userBestVote = await TokenService.getUserVote(publicKey, 'best');
              if (userBestVote) {
                setUserVote(prev => ({ ...prev, best: userBestVote }));
                // If on the best tab, preselect their vote
                if (pollType === 'best') {
                  const candidate = bestCandidates.find(c => c.pubkey === userBestVote.candidatePubkey);
                  if (candidate) {
                    setSelectedCandidate(candidate);
                  }
                }
              }
            }
            
            if (hasVotedWorst) {
              const userWorstVote = await TokenService.getUserVote(publicKey, 'worst');
              if (userWorstVote) {
                setUserVote(prev => ({ ...prev, worst: userWorstVote }));
                // If on the worst tab, preselect their vote
                if (pollType === 'worst') {
                  const candidate = worstCandidates.find(c => c.pubkey === userWorstVote.candidatePubkey);
                  if (candidate) {
                    setSelectedCandidate(candidate);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error checking voting status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching poll data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load poll data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up timer to update remaining time
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [connected, publicKey, pollType]);

  // Update voting status when wallet connection changes
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          const hasVotedBest = await TokenService.hasUserVoted(publicKey, 'best');
          const hasVotedWorst = await TokenService.hasUserVoted(publicKey, 'worst');
          setHasVoted({ best: hasVotedBest, worst: hasVotedWorst });
          
          // Get user's current votes
          if (hasVotedBest) {
            const userBestVote = await TokenService.getUserVote(publicKey, 'best');
            if (userBestVote) {
              setUserVote(prev => ({ ...prev, best: userBestVote }));
            }
          }
          
          if (hasVotedWorst) {
            const userWorstVote = await TokenService.getUserVote(publicKey, 'worst');
            if (userWorstVote) {
              setUserVote(prev => ({ ...prev, worst: userWorstVote }));
            }
          }
        } catch (error) {
          console.error('Error checking voting status:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setHasVoted({ best: false, worst: false });
        setUserVote({ best: null, worst: null });
      }
    };

    checkVotingStatus();
  }, [connected, publicKey]);

  const handleTabChange = (event, newValue) => {
    setPollType(newValue);
    // When changing tabs, preselect user's vote if they have one
    if (userVote[newValue]) {
      const candidateList = candidates[newValue] || [];
      const candidate = candidateList.find(c => c.pubkey === userVote[newValue].candidatePubkey);
      setSelectedCandidate(candidate || null);
    } else {
      setSelectedCandidate(null);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleVote = async (candidate, pollType) => {
    if (!connected || !publicKey || isVoteLoading) return;
    
    setVoteLoading(true);
    setSelectedCandidate(candidate);
    
    try {
      // Check if user already voted
      const hasVoted = await TokenService.hasUserVoted(publicKey, pollType);
      if (hasVoted) {
        setSnackbar({
          open: true,
          message: 'You have already voted in this poll',
          severity: 'warning'
        });
        setVoteLoading(false);
        return;
      }
      
      // Get vote transaction
      const voteResult = await castVote(candidate.name, pollType);
      
      if (!voteResult.success) {
        throw new Error(voteResult.message || 'Failed to create vote transaction');
      }
      
      // If this is just a simulated vote in development
      if (voteResult.simulated) {
        notifySuccess(
          'Vote Cast Successfully', 
          `You voted for ${candidate.name} in the ${pollType} poll (simulated)`
        );
        
        setSnackbar({
          open: true,
          message: `Vote for ${candidate.name} recorded (simulated)`,
          severity: 'success'
        });
        
        setShowConfetti(true);
        setTimeout(() => fetchPollData(), 1000);
        return;
      }
      
      // Sign and send the transaction
      const txResult = await sendAndConfirmTransaction(
        voteResult.transaction,
        connection,
        wallet.signTransaction,
        {
          commitment: 'confirmed',
          fetchDetails: true
        }
      );
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to confirm vote transaction');
      }
      
      // Vote successful
      notifySuccess(
        'Vote Cast Successfully', 
        `You voted for ${candidate.name} in the ${pollType} poll`,
        txResult.signature
      );
      
      setSnackbar({
        open: true,
        message: `Vote for ${candidate.name} recorded successfully!`,
        severity: 'success'
      });
      
      setShowConfetti(true);
      setTimeout(() => fetchPollData(), 1000);
      
    } catch (error) {
      console.error('Error casting vote:', error);
      
      // Format the error message
      const errorMessage = formatTransactionError(error);
      
      notifyError('Vote Failed', errorMessage);
      
      setSnackbar({
        open: true,
        message: 'Vote failed: ' + errorMessage,
        severity: 'error'
      });
    } finally {
      setVoteLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };
  
  const getVerificationIcon = (candidateName) => {
    const verification = verificationData[candidateName];
    
    if (!verification || !verification.verified) {
      return null;
    }
    
    switch (verification.type) {
      case VERIFICATION_TYPES.SOCIAL:
        return (
          <Tooltip title="Verified through social media accounts">
            <CheckCircleIcon color="primary" style={{ fontSize: 20, marginLeft: 8 }} />
          </Tooltip>
        );
      case VERIFICATION_TYPES.BLOCKCHAIN:
        return (
          <Tooltip title="Verified through blockchain identity">
            <TokenIcon color="secondary" style={{ fontSize: 20, marginLeft: 8 }} />
          </Tooltip>
        );
      case VERIFICATION_TYPES.PLATFORM:
        return (
          <Tooltip title="Verified by platform">
            <VerifiedUserIcon color="success" style={{ fontSize: 20, marginLeft: 8 }} />
          </Tooltip>
        );
      case VERIFICATION_TYPES.OFFICIAL:
        return (
          <Tooltip title="Officially verified entity">
            <GavelIcon color="info" style={{ fontSize: 20, marginLeft: 8 }} />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  const renderCandidates = () => {
    const currentCandidates = candidates[pollType] || [];
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (currentCandidates.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No candidates available for this poll.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {currentCandidates.map((candidate) => {
          const isSelected = selectedCandidate?.pubkey === candidate.pubkey;
          const isUserVote = userVote[pollType]?.candidatePubkey === candidate.pubkey;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={candidate.pubkey}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: isSelected ? '2px solid #1976d2' : isUserVote ? '2px solid #4caf50' : 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', pt: '56.25%', overflow: 'hidden' }}>
                  {isUserVote && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                      }}
                    >
                      <CheckCircleIcon />
                    </Box>
                  )}
                  <img
                    src={candidate.imageUrl || `https://source.unsplash.com/random/300x200?${candidate.name}`}
                    alt={candidate.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {candidate.name}
                    </Typography>
                    {getVerificationIcon(candidate.name)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {candidate.description || "No description available."}
                  </Typography>
                  {isUserVote && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Your current vote
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant={isSelected ? "contained" : "outlined"}
                    color={isUserVote && !isSelected ? "success" : "primary"}
                    onClick={() => handleCandidateSelect(candidate)}
                    fullWidth
                  >
                    {isSelected 
                      ? "Selected" 
                      : isUserVote 
                        ? "Change Vote" 
                        : "Select"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const fetchPollData = async () => {
    try {
      const polls = await TokenService.getCurrentPolls();
      if (polls) {
        setCurrentPolls(polls);
      }
    } catch (error) {
      console.error('Error fetching poll data:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Cast Your Vote
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Tabs value={pollType} onChange={handleTabChange} aria-label="poll tabs">
            <Tab 
              value="best" 
              label={hasVoted.best ? "Best Person (Voted)" : "Best Person"} 
              icon={<ThumbUpAlt />} 
              iconPosition="start"
            />
            <Tab 
              value="worst" 
              label={hasVoted.worst ? "Worst Person (Voted)" : "Worst Person"}
              icon={<ThumbDownAlt />} 
              iconPosition="start"
            />
          </Tabs>
          
          <Box>
            <Typography variant="subtitle1" align="right">
              Time Remaining: {formatTime(remainingTime.hours)}:{formatTime(remainingTime.minutes)}:{formatTime(remainingTime.seconds)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {!connected ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Connect your wallet to vote
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <WalletButton />
            </Box>
          </Box>
        ) : (
          <>
            {tokenBalance === 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                You need $VOTE tokens to participate. <Button size="small" color="inherit" href="/buy">Get Tokens</Button>
              </Alert>
            )}
            
            {renderCandidates()}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => handleVote(selectedCandidate, pollType)}
                disabled={!connected || isVoteLoading || !selectedCandidate}
                sx={{ px: 4, py: 1 }}
              >
                {isVoteLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : hasVoted[pollType] ? (
                  'Update Vote'
                ) : (
                  'Submit Vote'
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Vote; 