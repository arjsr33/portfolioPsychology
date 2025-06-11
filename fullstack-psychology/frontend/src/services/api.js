// fullstack-psychology/frontend/src/services/api.js - Backend API Service
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class PsychologyAPI {
  constructor() {
    this.baseURL = `${API_BASE}/api`;
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
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
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
        location: sessionData.location || {
          country: 'US',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    });
  }

  async getSession(sessionId) {
    return this.request(`/consciousness/session/${sessionId}`);
  }

  async updateMentalState(sessionId, mentalState, interactions = 0) {
    return this.request(`/consciousness/session/${sessionId}/state`, {
      method: 'PUT',
      body: JSON.stringify({
        mentalState,
        interactions
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
    if (options.limit) params.append('limit', options.limit.toString());
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

  // Psychology Tests - Fixed to match backend validation schema
  async submitReactionTest(testData) {
    return this.request('/psychology/tests/reaction', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: testData.sessionId,
        results: testData.results,
        mentalStateAtStart: testData.mentalStateAtStart,
        mentalStateAtEnd: testData.mentalStateAtEnd,
        difficulty: testData.difficulty || 3
      })
    });
  }

  async submitMemoryTest(testData) {
    return this.request('/psychology/tests/memory', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: testData.sessionId,
        results: testData.results,
        mentalStateAtStart: testData.mentalStateAtStart,
        mentalStateAtEnd: testData.mentalStateAtEnd,
        difficulty: testData.difficulty || 3
      })
    });
  }

  async submitColorTest(testData) {
    return this.request('/psychology/tests/color', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: testData.sessionId,
        results: testData.results,
        mentalStateAtStart: testData.mentalStateAtStart,
        mentalStateAtEnd: testData.mentalStateAtEnd,
        difficulty: testData.difficulty || 3
      })
    });
  }

  // Test Analytics
  async getTestsByType(testType, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
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

  async getLeaderboard(testType, options = {}) {
    const params = new URLSearchParams();
    if (options.metric) params.append('metric', options.metric);
    if (options.limit) params.append('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/psychology/leaderboard/${testType}${query}`);
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
    // Health endpoint is not under /api path
    const url = `${API_BASE}/health`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async getStatus() {
    return this.request('/status', { timeout: 5000 });
  }

  // Demo and Testing
  async createDemoData(count = 1) {
    return this.request('/demo-data', {
      method: 'POST',
      body: JSON.stringify({ count: Math.min(count, 5) }) // Backend limits to 5
    });
  }

  async testEndpoints() {
    return this.request('/test-endpoints', {
      method: 'POST'
    });
  }

  // Connection testing and monitoring
  async testConnection() {
    try {
      const start = Date.now();
      const response = await this.getHealth();
      const latency = Date.now() - start;
      
      return {
        connected: true,
        status: response.status,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        latency: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Real-time connection monitoring
  async monitorConnection(callback, interval = 30000) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const checkConnection = async () => {
      try {
        const status = await this.testConnection();
        callback(status);
      } catch (error) {
        callback({
          connected: false,
          error: error.message,
          latency: null,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Initial check
    await checkConnection();

    // Set up periodic monitoring
    const intervalId = setInterval(checkConnection, interval);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }

  // Utility methods for frontend state management
  calculateBrainwaves(mentalState) {
    return {
      alpha: Math.round((8 + (mentalState.creativity / 100) * 5) * 10) / 10,
      beta: Math.round((13 + (mentalState.focus / 100) * 17) * 10) / 10,
      theta: Math.round((4 + ((100 - mentalState.stress) / 100) * 4) * 10) / 10,
      gamma: Math.round((30 + ((mentalState.focus + mentalState.creativity) / 200) * 70) * 10) / 10,
      delta: Math.round((1 + Math.random() * 2) * 10) / 10
    };
  }

  calculateConsciousnessScore(mentalState, brainwaves) {
    // Mental state component (70% weight)
    const mentalScore = (
      mentalState.focus * 0.3 +
      mentalState.creativity * 0.25 +
      mentalState.energy * 0.2 +
      (100 - mentalState.stress) * 0.25
    );

    // Brainwave optimization (30% weight)
    const brainwaveScore = (
      Math.min(brainwaves.alpha / 12, 1) * 25 +
      Math.min(brainwaves.beta / 25, 1) * 30 +
      Math.min(brainwaves.theta / 8, 1) * 20 +
      Math.min(brainwaves.gamma / 50, 1) * 25
    );

    return Math.round((mentalScore * 0.7) + (brainwaveScore * 0.3));
  }

  determineEmotionalState(mentalState) {
    const { focus, creativity, stress, energy } = mentalState;

    if (focus > 80 && creativity > 80 && stress < 30) {
      return 'peak_performance';
    } else if (focus > 70 && creativity > 70 && stress < 40) {
      return 'flow_state';
    } else if (creativity > 80 && stress < 40) {
      return 'highly_creative';
    } else if (stress > 70) {
      return 'overwhelmed';
    } else if (focus > 60 && stress < 30) {
      return 'focused';
    } else if (stress < 30 && energy > 60) {
      return 'relaxed';
    } else if (energy > 70 && stress < 40) {
      return 'energetic';
    } else if (focus < 30 && energy < 40) {
      return 'distracted';
    } else {
      return 'balanced';
    }
  }

  // Environment and utility methods
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `sess_${timestamp}_${random}`;
  }
}

// Create and export singleton instance
const api = new PsychologyAPI();

// Export both the class and the instance
export default api;
export { PsychologyAPI };