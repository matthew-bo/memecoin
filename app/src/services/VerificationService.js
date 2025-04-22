/**
 * Verification Service
 * 
 * Handles verification of candidates to ensure they are real entities with proper verification
 * Instead of relying on Wikipedia, we use a combination of:
 * 1. Official social media verification
 * 2. Public key registration (for entities with blockchain presence)
 * 3. Verification badges issued by the platform after manual review
 */

/**
 * Verification types for candidates
 */
export const VERIFICATION_TYPES = {
  SOCIAL: 'social',       // Verified through social media accounts
  BLOCKCHAIN: 'blockchain', // Verified through blockchain identity systems
  PLATFORM: 'platform',   // Manually verified by platform admins
  OFFICIAL: 'official',   // Verified through official government/corporate records
  NONE: 'none'            // Not verified
};

/**
 * Service for verifying candidate information
 */
class VerificationService {
  /**
   * Verify a candidate
   * @param {string} candidateName - Name of the candidate to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyCandidate(candidateName) {
    try {
      if (!candidateName) {
        throw new Error('Candidate name is required');
      }

      console.log(`Verifying candidate: ${candidateName}`);
      
      // In a production environment, this would make API calls or check blockchain data
      // For now, we'll return mock verification data based on the candidate name
      
      // Create deterministic verification based on name
      const hash = this.stringToHash(candidateName);
      const isVerified = (hash % 100) < 80; // 80% chance of verification
      
      if (!isVerified) {
        return {
          verified: false,
          type: VERIFICATION_TYPES.NONE,
          source: null
        };
      }
      
      // Determine verification type based on hash
      const verificationTypes = [
        VERIFICATION_TYPES.SOCIAL,
        VERIFICATION_TYPES.BLOCKCHAIN,
        VERIFICATION_TYPES.PLATFORM,
        VERIFICATION_TYPES.OFFICIAL
      ];
      
      const typeIndex = hash % verificationTypes.length;
      const verificationType = verificationTypes[typeIndex];
      
      // Mock verification sources based on type
      let source = '';
      switch (verificationType) {
        case VERIFICATION_TYPES.SOCIAL:
          source = (hash % 2 === 0) ? 'Twitter' : 'Facebook';
          break;
        case VERIFICATION_TYPES.BLOCKCHAIN:
          source = (hash % 2 === 0) ? 'Ethereum' : 'Solana';
          break;
        case VERIFICATION_TYPES.PLATFORM:
          source = 'PopularVote Platform';
          break;
        case VERIFICATION_TYPES.OFFICIAL:
          source = 'Official Registry';
          break;
        default:
          source = null;
      }
      
      return {
        verified: true,
        type: verificationType,
        source: source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying candidate:', error);
      return {
        verified: false,
        type: VERIFICATION_TYPES.NONE,
        source: null,
        error: error.message
      };
    }
  }
  
  /**
   * Convert a string to a deterministic hash number
   * @param {string} str - String to hash
   * @returns {number} Hash number
   */
  stringToHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Look up verification data from our mock database
   * @param {string} candidateName - Name of the candidate to look up
   * @returns {Promise<Object|null>} Verification data or null if not found
   */
  async lookupVerificationData(candidateName) {
    // In production, this would query a database
    // For demo purposes, we use a mock object
    const mockVerificationDatabase = {
      'Elon Musk': {
        verified: true,
        type: VERIFICATION_TYPES.SOCIAL,
        data: {
          accounts: [
            { platform: 'twitter', username: 'elonmusk', verified: true },
            { platform: 'instagram', username: 'elonmusk', verified: true }
          ],
          officialWebsite: 'https://www.tesla.com/elon-musk',
          description: 'CEO of Tesla, SpaceX, and X',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg',
          timestamp: '2023-10-15T12:00:00Z'
        }
      },
      'Donald Trump': {
        verified: true,
        type: VERIFICATION_TYPES.OFFICIAL,
        data: {
          officialPosition: '45th President of the United States',
          officialWebsite: 'https://www.donaldjtrump.com',
          description: 'Businessman and former U.S. President',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg',
          timestamp: '2023-09-20T14:30:00Z'
        }
      },
      'Vitalik Buterin': {
        verified: true,
        type: VERIFICATION_TYPES.BLOCKCHAIN,
        data: {
          publicKey: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          platforms: ['Ethereum', 'Optimism'],
          description: 'Creator of Ethereum',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/800px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg',
          timestamp: '2023-11-05T09:45:00Z'
        }
      }
    };
    
    // Check if the candidate exists in our mock database (case insensitive search)
    const match = Object.keys(mockVerificationDatabase).find(
      name => name.toLowerCase() === candidateName.toLowerCase()
    );
    
    return match ? mockVerificationDatabase[match] : null;
  }
  
  /**
   * Get verification badge icon based on verification type
   * @param {string} verificationType - Type of verification
   * @returns {string} Material-UI icon name to use for the badge
   */
  getVerificationBadgeIcon(verificationType) {
    switch (verificationType) {
      case VERIFICATION_TYPES.SOCIAL:
        return 'CheckCircle';
      case VERIFICATION_TYPES.BLOCKCHAIN:
        return 'Token';
      case VERIFICATION_TYPES.PLATFORM:
        return 'VerifiedUser';
      case VERIFICATION_TYPES.OFFICIAL:
        return 'Gavel';
      case VERIFICATION_TYPES.NONE:
      default:
        return 'Cancel';
    }
  }
  
  /**
   * Request manual verification for a candidate
   * @param {string} candidateName - Name of the candidate
   * @param {Object} verificationData - Supporting verification evidence
   * @returns {Promise<Object>} Request status
   */
  async requestVerification(candidateName, verificationData) {
    try {
      // In production, this would submit to an admin verification queue
      console.log(`Verification requested for ${candidateName}`, verificationData);
      
      // Simulate a successful request
      return {
        success: true,
        requestId: `req-${Date.now()}`,
        message: 'Verification request submitted successfully',
        estimatedTime: '24-48 hours'
      };
    } catch (error) {
      console.error('Error requesting verification:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  /**
   * Get list of suggested verified candidates for a category
   * @param {string} category - Category to get candidates for
   * @returns {Promise<Array>} Array of verified candidates
   */
  async getSuggestedCandidates(category) {
    try {
      // In production, this would query a database of verified candidates
      // For demo purposes, return some mock data based on category
      
      // Sample categories: 'politics', 'business', 'tech', 'entertainment'
      const mockSuggestions = {
        politics: [
          {
            name: 'Joe Biden',
            description: '46th President of the United States',
            verified: true,
            verificationType: VERIFICATION_TYPES.OFFICIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Joe_Biden_presidential_portrait.jpg'
          },
          {
            name: 'Donald Trump',
            description: '45th President of the United States',
            verified: true,
            verificationType: VERIFICATION_TYPES.OFFICIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg'
          }
        ],
        business: [
          {
            name: 'Elon Musk',
            description: 'CEO of Tesla, SpaceX, and X',
            verified: true,
            verificationType: VERIFICATION_TYPES.SOCIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg'
          },
          {
            name: 'Tim Cook',
            description: 'CEO of Apple Inc.',
            verified: true,
            verificationType: VERIFICATION_TYPES.OFFICIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Tim_Cook_%282017%2C_cropped%29.jpg'
          }
        ],
        tech: [
          {
            name: 'Vitalik Buterin',
            description: 'Creator of Ethereum',
            verified: true,
            verificationType: VERIFICATION_TYPES.BLOCKCHAIN,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/800px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg'
          },
          {
            name: 'Mark Zuckerberg',
            description: 'CEO of Meta',
            verified: true,
            verificationType: VERIFICATION_TYPES.SOCIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg'
          }
        ],
        entertainment: [
          {
            name: 'Taylor Swift',
            description: 'Singer-songwriter',
            verified: true,
            verificationType: VERIFICATION_TYPES.SOCIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png'
          },
          {
            name: 'Dwayne Johnson',
            description: 'Actor and former wrestler',
            verified: true,
            verificationType: VERIFICATION_TYPES.SOCIAL,
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Dwayne_Johnson_2%2C_2013.jpg'
          }
        ]
      };
      
      return mockSuggestions[category] || [];
    } catch (error) {
      console.error('Error getting suggested candidates:', error);
      return [];
    }
  }
}

const verificationService = new VerificationService();
export default verificationService; 