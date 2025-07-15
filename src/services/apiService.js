const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔑 Sending token:', this.token.substring(0, 20) + '...');
    } else {
      console.log('❌ No token available');
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401/403 errors by redirecting to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Monitor endpoints
  async getAllMonitors() {
    return this.request('/monitors');
  }

  async getMonitorById(id) {
    return this.request(`/monitors/${id}`);
  }

  async createMonitor(formData) {
    const url = `${this.baseURL}/monitors`;
    
    try {
      const headers = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers, // Let browser set Content-Type for FormData, but include auth
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401/403 errors by redirecting to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async executeMonitor(id) {
    return this.request(`/monitors/${id}/execute`, {
      method: 'POST',
    });
  }

  async getMonitorStatus(id) {
    return this.request(`/monitors/${id}/status`);
  }

  async getMonitorLogs(id) {
    return this.request(`/monitors/${id}/logs`);
  }

  async deleteMonitor(id) {
    return this.request(`/monitors/${id}`, {
      method: 'DELETE',
    });
  }

  async testMonitor(targetUrl) {
    return this.request('/monitors/test', {
      method: 'POST',
      body: JSON.stringify({ targetUrl }),
    });
  }

  async getBrokenMonitors() {
    return this.request('/monitors/status/broken');
  }

  async getMonitorStats() {
    return this.request('/monitors/stats/overview');
  }

  // Alert endpoints
  async getAlerts() {
    return this.request('/monitors/alerts/all');
  }

  async resolveAlert(id) {
    return this.request(`/monitors/alerts/${id}/resolve`, {
      method: 'PUT',
    });
  }

  // Deployment endpoints
  async getAllDeployments() {
    return this.request('/deployments');
  }

  async getDeploymentById(id) {
    return this.request(`/deployments/${id}`);
  }

  async createDeployment(deploymentData) {
    return this.request('/deployments', {
      method: 'POST',
      body: JSON.stringify(deploymentData),
    });
  }

  async updateDeployment(id, deploymentData) {
    return this.request(`/deployments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deploymentData),
    });
  }

  async deleteDeployment(id) {
    return this.request(`/deployments/${id}`, {
      method: 'DELETE',
    });
  }

  // Repository endpoints
  async getAllRepositories() {
    return this.request('/repositories');
  }

  async getRepositoryById(id) {
    return this.request(`/repositories/${id}`);
  }

  async createRepository(repositoryData) {
    return this.request('/repositories', {
      method: 'POST',
      body: JSON.stringify(repositoryData),
    });
  }

  async updateRepository(id, repositoryData) {
    return this.request(`/repositories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(repositoryData),
    });
  }

  async deleteRepository(id) {
    return this.request(`/repositories/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async analyzeCode(code) {
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

const apiService = new ApiService();
export default apiService; 