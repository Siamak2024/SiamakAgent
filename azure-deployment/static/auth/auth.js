/**
 * EA Platform Authentication Library
 * Handles login, session management, and API authentication
 */

class EAAuth {
  constructor() {
    this.sessionKey = 'ea_session';
    this.apiBase = '/api'; // Azure Functions endpoint
  }

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Get current session
  getSession() {
    const sessionData = sessionStorage.getItem(this.sessionKey);
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  }

  // Validate invite code and create session
  async login(email, inviteCode) {
    const response = await fetch(`${this.apiBase}/auth/validate-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, inviteCode })
    });

    const result = await response.json();

    if (!result.valid) {
      throw new Error(result.error || 'Invalid invite code');
    }

    // Store session
    sessionStorage.setItem(this.sessionKey, JSON.stringify({
      userId: result.userId,
      email: result.email,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt
    }));

    console.log('✅ Login successful:', result.email);
    return result;
  }

  // Logout and clear session
  logout() {
    sessionStorage.removeItem(this.sessionKey);
    window.location.href = '/auth/login.html';
  }

  // Get headers for API calls
  getAuthHeaders() {
    const session = this.getSession();
    if (!session) throw new Error('Not authenticated');

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.sessionToken}`
    };
  }
  
  // Get current user info
  getCurrentUser() {
    const session = this.getSession();
    return session ? {
      userId: session.userId,
      email: session.email,
      expiresAt: session.expiresAt
    } : null;
  }
}

// Global instance
window.EAAuth = new EAAuth();

// Auto-redirect if not authenticated (for protected pages)
if (window.location.pathname !== '/auth/login.html' && 
    !window.location.pathname.includes('/auth/') &&
    !window.EAAuth.isAuthenticated()) {
  console.log('⚠️ Not authenticated, redirecting to login...');
  window.location.href = '/auth/login.html';
}
