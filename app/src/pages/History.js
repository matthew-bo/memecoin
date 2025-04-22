import React, { useState, useEffect } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { ExpandMore, ExpandLess, ThumbUpAlt, ThumbDownAlt, CalendarMonth } from '@mui/icons-material';

// Mock data for past polls - would be fetched from blockchain or database in production
const MOCK_HISTORY = [
  {
    id: 1,
    date: '2023-12-31',
    title: 'December 31, 2023',
    results: {
      best: [
        { name: 'Lionel Messi', votes: 250000 },
        { name: 'Taylor Swift', votes: 200000 },
        { name: 'Bob Iger', votes: 150000 },
      ],
      worst: [
        { name: 'Vladimir Putin', votes: 300000 },
        { name: 'Kim Jong-un', votes: 250000 },
        { name: 'Harvey Weinstein', votes: 200000 },
      ]
    }
  },
  {
    id: 2,
    date: '2023-12-30',
    title: 'December 30, 2023',
    results: {
      best: [
        { name: 'Lionel Messi', votes: 240000 },
        { name: 'Taylor Swift', votes: 190000 },
        { name: 'Bob Iger', votes: 140000 },
      ],
      worst: [
        { name: 'Vladimir Putin', votes: 290000 },
        { name: 'Kim Jong-un', votes: 240000 },
        { name: 'Harvey Weinstein', votes: 190000 },
      ]
    }
  },
  {
    id: 3,
    date: '2023-12-29',
    title: 'December 29, 2023',
    results: {
      best: [
        { name: 'Lionel Messi', votes: 230000 },
        { name: 'Taylor Swift', votes: 180000 },
        { name: 'Bob Iger', votes: 130000 },
      ],
      worst: [
        { name: 'Vladimir Putin', votes: 280000 },
        { name: 'Kim Jong-un', votes: 230000 },
        { name: 'Harvey Weinstein', votes: 180000 },
      ]
    }
  },
  {
    id: 4,
    date: '2023-12-28',
    title: 'December 28, 2023',
    results: {
      best: [
        { name: 'Lionel Messi', votes: 220000 },
        { name: 'Taylor Swift', votes: 170000 },
        { name: 'Bob Iger', votes: 120000 },
      ],
      worst: [
        { name: 'Vladimir Putin', votes: 270000 },
        { name: 'Kim Jong-un', votes: 220000 },
        { name: 'Harvey Weinstein', votes: 170000 },
      ]
    }
  },
  {
    id: 5,
    date: '2023-12-27',
    title: 'December 27, 2023',
    results: {
      best: [
        { name: 'Lionel Messi', votes: 210000 },
        { name: 'Taylor Swift', votes: 160000 },
        { name: 'Bob Iger', votes: 110000 },
      ],
      worst: [
        { name: 'Vladimir Putin', votes: 260000 },
        { name: 'Kim Jong-un', votes: 210000 },
        { name: 'Harvey Weinstein', votes: 160000 },
      ]
    }
  },
];

const History = () => {
  const [pollType, setPollType] = useState('best');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const itemsPerPage = 5;
  
  // Simulate fetching history data - would connect to blockchain in production
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistory(MOCK_HISTORY);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setPollType(newValue);
  };
  
  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    setExpandedId(null); // Close any expanded items when changing pages
  };
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate percentage of votes for each candidate
  const calculatePercentage = (votes, totalVotes) => {
    return totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
  };
  
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  
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
          Historical Poll Results
        </Typography>
        
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
        
        {currentItems.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ py: 4 }}>
            No historical data available yet.
          </Typography>
        ) : (
          <List>
            {currentItems.map((poll) => (
              <React.Fragment key={poll.id}>
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 0 }}>
                    <ListItem
                      button
                      onClick={() => handleExpandClick(poll.id)}
                      secondaryAction={
                        <IconButton edge="end" aria-label="expand">
                          {expandedId === poll.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      }
                    >
                      <CalendarMonth sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText 
                        primary={<Typography variant="h6">{poll.title}</Typography>}
                        secondary={formatDate(poll.date)}
                      />
                    </ListItem>
                    
                    <Collapse in={expandedId === poll.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 3, pt: 0 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          {pollType === 'best' ? 'Best Person' : 'Worst Person'} Results:
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {poll.results[pollType].map((result, index) => {
                            // Calculate total votes for this poll
                            const totalVotes = poll.results[pollType].reduce((sum, item) => sum + item.votes, 0);
                            const percentage = calculatePercentage(result.votes, totalVotes);
                            
                            return (
                              <Grid item xs={12} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="body1" sx={{ minWidth: 30 }}>
                                    {index + 1}.
                                  </Typography>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1">
                                      {result.name}
                                    </Typography>
                                    {index < 3 && (
                                      <Box sx={{ width: '100%', mt: 1 }}>
                                        <Box sx={{ 
                                          height: 8, 
                                          borderRadius: 5, 
                                          width: '100%', 
                                          bgcolor: 'background.paper',
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}>
                                          <Box sx={{ 
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '100%',
                                            width: `${percentage}%`,
                                            bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : 'warning.main',
                                            borderRadius: 5
                                          }} />
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                  <Box sx={{ textAlign: 'right', minWidth: 140 }}>
                                    <Typography variant="body1" color="text.secondary">
                                      {formatNumber(result.votes)} votes
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {percentage}% of all votes
                                    </Typography>
                                  </Box>
                                </Box>
                                {index < poll.results[pollType].length - 1 && <Divider sx={{ my: 1 }} />}
                              </Grid>
                            );
                          })}
                        </Grid>
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Total votes: {formatNumber(poll.results[pollType].reduce((sum, item) => sum + item.votes, 0))}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </List>
        )}
        
        {history.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={Math.ceil(history.length / itemsPerPage)} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default History; 