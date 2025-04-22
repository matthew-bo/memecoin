import React, { useState, useEffect } from 'react';
import { useToken } from '../contexts/TokenContext';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { ThumbUpAlt, ThumbDownAlt, EmojiEvents } from '@mui/icons-material';

const Results = () => {
  const { getPollResults, getPollTimeRemaining } = useToken();
  const [pollType, setPollType] = useState('best');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    best: [],
    worst: []
  });
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  // Fetch results on initial load and when poll type changes
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const pollResults = await getPollResults(pollType);
        setResults(prev => ({
          ...prev,
          [pollType]: pollResults
        }));
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pollType, getPollResults]);
  
  // Fetch initial time remaining
  useEffect(() => {
    const fetchTimeRemaining = async () => {
      try {
        const time = await getPollTimeRemaining();
        setTimeRemaining(time);
      } catch (error) {
        console.error('Error fetching time remaining:', error);
      }
    };
    
    fetchTimeRemaining();
  }, [getPollTimeRemaining]);
  
  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds -= 1;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes -= 1;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours -= 1;
            } else {
              // Poll ended
              clearInterval(timer);
            }
          }
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setPollType(newValue);
  };
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };
  
  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };
  
  const calculatePercentage = (votes) => {
    const currentResults = results[pollType] || [];
    const totalVotes = currentResults.reduce((acc, curr) => acc + curr.votes, 0);
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };
  
  const sortedResults = (results[pollType] || []).sort((a, b) => b.votes - a.votes);
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Current Poll Results
        </Typography>
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Poll ends in:
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
            {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
          </Typography>
        </Box>
        
        <Tabs
          value={pollType}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3 }}
        >
          <Tab 
            value="best" 
            label="Best Person" 
            icon={<ThumbUpAlt />} 
            iconPosition="start"
          />
          <Tab 
            value="worst" 
            label="Worst Person" 
            icon={<ThumbDownAlt />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Divider sx={{ mb: 4 }} />
        
        {sortedResults.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ py: 4 }}>
            No results available for this poll yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {sortedResults.map((candidate, index) => (
              <Grid item xs={12} key={candidate.pubkey || `candidate-${index}`}>
                <Card sx={{ 
                  position: 'relative',
                  overflow: 'visible',
                  mb: 2
                }}>
                  {index === 0 && (
                    <Avatar
                      sx={{
                        position: 'absolute',
                        top: -15,
                        right: -15,
                        bgcolor: 'primary.main',
                        width: 50,
                        height: 50,
                        zIndex: 2,
                      }}
                    >
                      <EmojiEvents fontSize="large" />
                    </Avatar>
                  )}
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h5" component="h2">
                          {candidate.name}
                        </Typography>
                        <Box 
                          component="a" 
                          href={candidate.wikipediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Wikipedia Page
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ width: '100%', mb: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={calculatePercentage(candidate.votes)} 
                            sx={{ 
                              height: 15, 
                              borderRadius: 2,
                              backgroundColor: 'background.paper',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: index === 0 ? 'primary.main' : 'secondary.main',
                              }
                            }}
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(candidate.votes)} votes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {calculatePercentage(candidate.votes).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Total votes: {formatNumber(sortedResults.reduce((acc, curr) => acc + curr.votes, 0))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Results; 