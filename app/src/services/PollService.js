import { PublicKey, Transaction } from '@solana/web3.js';
import { deserializeUnchecked } from 'borsh';
import { getDeploymentInfo } from '../utils/deployment';

// Mock data for testing without blockchain interaction
const mockPolls = {
  best: {
    id: 'best-poll-1',
    name: 'Best Person Poll',
    description: 'Vote for the best person',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    candidates: [
      {
        id: 'elon-musk',
        name: 'Elon Musk',
        wikiUrl: 'https://en.wikipedia.org/wiki/Elon_Musk',
        votes: 1250,
      },
      {
        id: 'bill-gates',
        name: 'Bill Gates',
        wikiUrl: 'https://en.wikipedia.org/wiki/Bill_Gates',
        votes: 980,
      },
      {
        id: 'satoshi-nakamoto',
        name: 'Satoshi Nakamoto',
        wikiUrl: 'https://en.wikipedia.org/wiki/Satoshi_Nakamoto',
        votes: 1640,
      },
    ],
  },
  worst: {
    id: 'worst-poll-1',
    name: 'Worst Person Poll',
    description: 'Vote for the worst person',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    candidates: [
      {
        id: 'vladimir-putin',
        name: 'Vladimir Putin',
        wikiUrl: 'https://en.wikipedia.org/wiki/Vladimir_Putin',
        votes: 1820,
      },
      {
        id: 'kim-jong-un',
        name: 'Kim Jong-un',
        wikiUrl: 'https://en.wikipedia.org/wiki/Kim_Jong-un',
        votes: 1560,
      },
      {
        id: 'xi-jinping',
        name: 'Xi Jinping',
        wikiUrl: 'https://en.wikipedia.org/wiki/Xi_Jinping',
        votes: 1340,
      },
    ],
  },
};

class PollService {
  constructor(connection) {
    this.connection = connection;
    this.deploymentInfo = getDeploymentInfo();
    this.programId = this.deploymentInfo.programId 
      ? new PublicKey(this.deploymentInfo.programId)
      : null;
  }

  /**
   * Get all active polls
   * @returns {Promise<Array>} Array of poll objects
   */
  async getAllPolls() {
    try {
      // In a real implementation, this would fetch polls from the blockchain
      // For development, we're using mock data
      return [
        {
          id: 'best-poll-1',
          name: mockPolls.best.name,
          description: mockPolls.best.description,
          startDate: mockPolls.best.startDate.toISOString(),
          endDate: mockPolls.best.endDate.toISOString(),
          candidates: mockPolls.best.candidates.length,
          type: 'best',
        },
        {
          id: 'worst-poll-1',
          name: mockPolls.worst.name,
          description: mockPolls.worst.description,
          startDate: mockPolls.worst.startDate.toISOString(),
          endDate: mockPolls.worst.endDate.toISOString(),
          candidates: mockPolls.worst.candidates.length,
          type: 'worst',
        },
      ];
    } catch (error) {
      console.error('Error fetching polls:', error);
      throw error;
    }
  }

  /**
   * Get candidates for a specific poll
   * @param {string} pollId The poll ID
   * @returns {Promise<Array>} Array of candidate objects
   */
  async getPollCandidates(pollType) {
    try {
      // In a real implementation, this would fetch candidates from the blockchain
      if (pollType === 'best') {
        return mockPolls.best.candidates;
      } else if (pollType === 'worst') {
        return mockPolls.worst.candidates;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching candidates for poll ${pollType}:`, error);
      throw error;
    }
  }

  /**
   * Get poll results
   * @param {string} pollType The poll type ('best' or 'worst')
   * @returns {Promise<Array>} Array of candidates with vote counts
   */
  async getPollResults(pollType) {
    try {
      // In a real implementation, this would fetch results from the blockchain
      if (pollType === 'best') {
        return [...mockPolls.best.candidates].sort((a, b) => b.votes - a.votes);
      } else if (pollType === 'worst') {
        return [...mockPolls.worst.candidates].sort((a, b) => b.votes - a.votes);
      }
      return [];
    } catch (error) {
      console.error(`Error fetching results for poll ${pollType}:`, error);
      throw error;
    }
  }

  /**
   * Create a new poll
   * @param {Object} pollData The poll data
   * @returns {Promise<Object>} The created poll
   */
  async createPoll(pollData) {
    try {
      // In a real implementation, this would create a poll on the blockchain
      console.log('Creating poll:', pollData);
      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: `poll-${Date.now()}`,
        ...pollData,
        candidates: 0,
      };
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Add a candidate to a poll
   * @param {string} pollId The poll ID
   * @param {Object} candidateData The candidate data
   * @returns {Promise<Object>} The created candidate
   */
  async addCandidate(pollId, candidateData) {
    try {
      // In a real implementation, this would add a candidate on the blockchain
      console.log('Adding candidate to poll:', pollId, candidateData);
      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: `candidate-${Date.now()}`,
        pollId,
        ...candidateData,
        votes: 0,
        dateAdded: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error adding candidate:', error);
      throw error;
    }
  }

  /**
   * Get time remaining for current poll
   * @returns {Promise<Object>} Time remaining in hours, minutes, seconds
   */
  async getPollTimeRemaining() {
    try {
      // In a real implementation, this would fetch from the blockchain
      const endDate = mockPolls.best.endDate;
      const timeRemaining = endDate.getTime() - Date.now();
      
      if (timeRemaining <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    } catch (error) {
      console.error('Error getting poll time remaining:', error);
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  }
}

// Export a singleton instance
const pollService = new PollService();
export default pollService; 