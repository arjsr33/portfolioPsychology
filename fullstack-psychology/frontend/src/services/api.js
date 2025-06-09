// fullstack-psychology/frontend/src/services/api.js - Backend API Service
const API_BASE = 'http://localhost:3001/api';

class PsychologyAPI {
  constructor() {
    this.baseURL = API_BASE;
    this.timeout = 10000; // 10 second timeout
  }

  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw new Error(`API Error: ${error.message}`);
    }
  }

  // Consciousness Session Management
  async createSession(sessionData) {
    return this.request('/consciousness/session', {
      method: 'POST',
      body: JSON.stringify({
        userAgent: sessionData.userAgent || 'React Psychology Demo',
        mentalState: sessionData.mentalState,
        location: sessionData.location || {}
      })
    });
  }

  async getSession(sessionId) {
    return this.request(`/consciousness/session/${sessionId}`);
  }

  async updateMentalState(sessionId, mentalState, interactions) {
    return this.request(`/consciousness/session/${sessionId}/state`, {
      method: 'PUT',
      body: JSON.stringify({
        mentalState,
        interactions: interactions || 0
      })
    });
  }

  async endSession(sessionId) {
    return this.request(`/consciousness/session/${sessionId}/end`, {
      method: 'POST'
    });
  }

  async getBrainwaves(sessionId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.timeframe) params.append('timeframe', options.timeframe);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/consciousness/session/${sessionId}/brainwaves${query}`);
  }

  // Consciousness Records
  async recordConsciousness(consciousnessData) {
    return this.request('/consciousness/record', {
      method: 'POST',
      body: JSON.stringify(consciousnessData)
    });
  }

  // Psychology Tests
  async submitReactionTest(testData) {
    return this.request('/psychology/tests/reaction', {
      method: 'POST',
      body: JSON.stringify({
        ...testData,
        testType: 'reaction_time'
      })
    });
  }

  async submitMemoryTest(testData) {
    return this.request('/psychology/tests/memory', {
      method: 'POST',
      body: JSON.stringify({
        ...testData,
        testType: 'memory_sequence'
      })
    });
  }

  async submitColorTest(testData) {
    return this.request('/psychology/tests/color', {
      method: 'POST',
      body: JSON.stringify({
        ...testData,
        testType: 'color_perception'
      })
    });
  }

  // Test Analytics
  async getTestsByType(testType, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/psychology/tests/${testType}${query}`);
  }

  async getSessionTests(sessionId) {
    return this.request(`/psychology/session/${sessionId}/tests`);
  }

  async getTestImprovement(sessionId, testType) {
    return this.request(`/psychology/improvement/${sessionId}/${testType}`);
  }

  // Analytics
  async getConsciousnessAnalytics(options = {}) {
    const params = new URLSearchParams();
    if (options.timeframe) params.append('timeframe', options.timeframe);
    if (options.sessionId) params.append('sessionId', options.sessionId);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/consciousness/analytics${query}`);
  }

  async getPsychologyAnalytics(options = {}) {
    const params = new URLSearchParams();
    if (options.timeframe) params.append('timeframe', options.timeframe);
    if (options.testType) params.append('testType', options.testType);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/psychology/analytics${query}`);
  }

  async getCombinedAnalytics(options = {}) {
    const params = new URLSearchParams();
    if (options.timeframe) params.append('timeframe', options.timeframe);
    if (options.sessionId) params.append('sessionId', options.sessionId);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/analytics${query}`);
  }

  async getPsychologyOverview() {
    return this.request('/psychology/stats/overview');
  }

  // Health and Status
  async getHealth() {
    return this.request('/health', { timeout: 5000 });
  }

  async getStatus() {
    return this.request('/status', { timeout: 5000 });
  }

  // Demo and Testing
  async createDemoData(count = 1) {
    return this.request('/demo-data', {
      method: 'POST',
      body: JSON.stringify({ count })
    });
  }

  async testEndpoints() {
    return this.request('/test-endpoints', {
      method: 'POST'
    });
  }

  // Connection testing
  async testConnection() {
    try {
      const response = await this.getHealth();
      return {
        connected: true,
        status: response.status,
        latency: Date.now()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        latency: null
      };
    }
  }

  // Real-time connection status
  async monitorConnection(callback, interval = 30000) {
    const checkConnection = async () => {
      const status = await this.testConnection();
      callback(status);
    };

    // Initial check
    await checkConnection();

    // Set up periodic monitoring
    const intervalId = setInterval(checkConnection, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

// Create and export singleton instance
const api = new PsychologyAPI();

// Export both the class and the instance
export default api;
export { PsychologyAPI };