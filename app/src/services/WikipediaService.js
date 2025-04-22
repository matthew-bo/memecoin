import axios from 'axios';

/**
 * Service for interacting with Wikipedia API
 */
class WikipediaService {
  /**
   * Search Wikipedia for people
   * @param {string} query Search query
   * @returns {Promise<Array>} Search results
   */
  async searchPeople(query) {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srprop=snippet|titlesnippet`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.query || !response.data.query.search) {
        return [];
      }
      
      // Map the results to our format
      return response.data.query.search.map(item => ({
        id: item.pageid,
        title: item.title,
        snippet: this.cleanSnippet(item.snippet),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      }));
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return [];
    }
  }
  
  /**
   * Get full article details for a specific page
   * @param {number} pageId Wikipedia page ID
   * @returns {Promise<Object>} Page details
   */
  async getPageDetails(pageId) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts|images|info&inprop=url&format=json&origin=*&exintro=1`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.query || !response.data.query.pages || !response.data.query.pages[pageId]) {
        return null;
      }
      
      const page = response.data.query.pages[pageId];
      
      return {
        id: page.pageid,
        title: page.title,
        extract: this.cleanHtml(page.extract || ''),
        url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
        lastModified: page.touched,
      };
    } catch (error) {
      console.error('Error getting Wikipedia page details:', error);
      return null;
    }
  }
  
  /**
   * Clean HTML from Wikipedia snippets
   * @private
   * @param {string} html HTML string
   * @returns {string} Cleaned text
   */
  cleanSnippet(html) {
    if (!html) return '';
    // Remove HTML tags
    return html.replace(/<\/?[^>]+(>|$)/g, '');
  }
  
  /**
   * Clean HTML from Wikipedia extracts
   * @private
   * @param {string} html HTML string
   * @returns {string} Cleaned text
   */
  cleanHtml(html) {
    if (!html) return '';
    // For now, just remove HTML tags but preserve paragraph breaks
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  }
}

const wikipediaService = new WikipediaService();
export default wikipediaService; 