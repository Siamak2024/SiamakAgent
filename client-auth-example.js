/**
 * Client-Side Security Migration Example
 * 
 * This file shows how to update your client code to work with the new secured API.
 */

// ==================== Authentication Service ====================

class AuthService {
  constructor() {
    this.tokenKey = 'ea_session_token';
    this.emailKey = 'ea_user_email';
  }

  /**
   * Login with invite code
   */
  async login(email, inviteCode) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, inviteCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store session token securely
        localStorage.setItem(this.tokenKey, data.sessionToken);
        localStorage.setItem(this.emailKey, data.email);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout (clear session)
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Get session token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get user email
   */
  getEmail() {
    return localStorage.getItem(this.emailKey);
  }

  /**
   * Get authorization header
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}

// ==================== Authenticated API Client ====================

class SecureAPIClient {
  constructor(authService) {
    this.auth = authService;
    this.baseURL = '/api';
  }

  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    // Check authentication
    if (!this.auth.isAuthenticated()) {
      throw new Error('Not authenticated. Please login first.');
    }

    // Add authentication header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const authHeader = this.auth.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make request
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle authentication errors
    if (response.status === 401) {
      this.auth.logout();
      throw new Error('Session expired. Please login again.');
    }

    // Handle rate limiting
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment.');
    }

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
  }

  /**
   * Get all models
   */
  async getModels() {
    return this.request('/models', { method: 'GET' });
  }

  /**
   * Get specific model
   */
  async getModel(id) {
    return this.request(`/models/${id}`, { method: 'GET' });
  }

  /**
   * Save model
   */
  async saveModel(id, name, data) {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify({ id, name, data })
    });
  }

  /**
   * Delete model
   */
  async deleteModel(id) {
    return this.request(`/models/${id}`, { method: 'DELETE' });
  }

  /**
   * Call OpenAI (secured)
   */
  async callOpenAI(input, options = {}) {
    return this.request('/openai/chat', {
      method: 'POST',
      body: JSON.stringify({ input, ...options })
    });
  }
}

// ==================== Usage Example ====================

// Initialize services
const authService = new AuthService();
const apiClient = new SecureAPIClient(authService);

// Example: Login flow
async function handleLogin() {
  const email = document.getElementById('email').value;
  const inviteCode = document.getElementById('inviteCode').value;

  const result = await authService.login(email, inviteCode);

  if (result.success) {
    console.log('Login successful!');
    // Redirect to main app
    window.location.href = '/NexGenEA/NexGenEA_V11.html';
  } else {
    alert('Login failed: ' + result.error);
  }
}

// Example: Load models after login
async function loadModels() {
  try {
    const models = await apiClient.getModels();
    console.log('Loaded models:', models);
    // Display models in UI
  } catch (error) {
    if (error.message.includes('Session expired')) {
      // Redirect to login
      window.location.href = '/auth/login.html';
    } else {
      console.error('Error loading models:', error);
    }
  }
}

// Example: Save model
async function saveModel(modelData) {
  try {
    const result = await apiClient.saveModel(
      modelData.id,
      modelData.name,
      modelData.data
    );
    console.log('Model saved:', result);
    return result;
  } catch (error) {
    console.error('Error saving model:', error);
    throw error;
  }
}

// Example: Call OpenAI securely
async function askAI(question) {
  try {
    const response = await apiClient.callOpenAI(question, {
      instructions: 'You are a helpful enterprise architecture assistant.',
      model: 'gpt-5.4'
    });
    console.log('AI response:', response.output_text);
    return response.output_text;
  } catch (error) {
    console.error('Error calling AI:', error);
    throw error;
  }
}

// ==================== Auto-retry with Exponential Backoff ====================

async function requestWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('Too many requests') && i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, i) * 1000;
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Example usage with retry
async function loadModelsWithRetry() {
  return requestWithRetry(() => apiClient.getModels());
}

// ==================== Export for use in other files ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthService, SecureAPIClient };
}
