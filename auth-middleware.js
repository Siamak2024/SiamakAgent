/**
 * Authentication & Authorization Middleware
 * Provides JWT-based authentication and user session management
 */

const crypto = require('crypto');

// In-memory session store (for production, use Redis or database)
const sessions = new Map();

/**
 * Generate a secure session token
 */
function generateSessionToken(userId, email) {
  const payload = {
    userId,
    email,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    tokenId: crypto.randomBytes(16).toString('hex')
  };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  sessions.set(token, payload);
  return token;
}

/**
 * Verify and decode session token
 */
function verifySessionToken(token) {
  try {
    // Check in-memory store first
    if (sessions.has(token)) {
      const payload = sessions.get(token);
      if (new Date(payload.expiresAt) > new Date()) {
        return { valid: true, ...payload };
      }
      sessions.delete(token);
      return { valid: false, error: 'Session expired' };
    }

    // Fallback to decoding token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (new Date(payload.expiresAt) < new Date()) {
      return { valid: false, error: 'Session expired' };
    }
    return { valid: true, ...payload };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Generate user ID from email
 */
function generateUserId(email) {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Authentication middleware - requires valid session token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authorization header' 
    });
  }

  const token = authHeader.substring(7);
  const session = verifySessionToken(token);

  if (!session.valid) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: session.error || 'Invalid session' 
    });
  }

  // Attach user info to request
  req.user = {
    userId: session.userId,
    email: session.email
  };

  next();
}

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifySessionToken(token);
    
    if (session.valid) {
      req.user = {
        userId: session.userId,
        email: session.email
      };
    }
  }

  next();
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

function rateLimit(req, res, next) {
  const identifier = req.user ? req.user.userId : req.ip;
  const now = Date.now();
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, []);
  }
  
  const requests = requestCounts.get(identifier);
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Rate limit exceeded. Please try again later.' 
    });
  }
  
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  
  next();
}

// Clean up old rate limit data every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [identifier, requests] of requestCounts.entries()) {
    const recent = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (recent.length === 0) {
      requestCounts.delete(identifier);
    } else {
      requestCounts.set(identifier, recent);
    }
  }
}, 5 * 60 * 1000);

/**
 * Input validation helpers
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  // Remove potential XSS vectors
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .trim();
}

module.exports = {
  requireAuth,
  optionalAuth,
  rateLimit,
  generateSessionToken,
  verifySessionToken,
  generateUserId,
  validateEmail,
  sanitizeInput,
  sessions
};
