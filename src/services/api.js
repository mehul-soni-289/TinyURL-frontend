import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

export const api = {
  /**
   * Shorten a URL
   * @param {string} url - Original URL to shorten
   * @param {string} collisionStrategy - Collision resolution strategy
   * @returns {Promise} Response with shortened URL data
   */
  shortenUrl: async (url, collisionStrategy = 'linear') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/shorten`, {
        url,
        collision_strategy: collisionStrategy
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to shorten URL';
    }
  },

  /**
   * Get statistics about DSA structures
   * @returns {Promise} Statistics data
   */
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch statistics';
    }
  },

  /**
   * Get top URLs by click count
   * @returns {Promise} Top URLs data
   */
  getTopUrls: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/top`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch top URLs';
    }
  },

  /**
   * Search URLs by prefix
   * @param {string} prefix - Search prefix
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise} Search results
   */
  searchUrls: async (prefix, maxResults = 5) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { prefix, max_results: maxResults }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to search URLs';
    }
  }
};
