/**
 * Azure Function: Validate Invite Code
 * =====================================
 * Verifies invite code + email combination and generates session token.
 */

const crypto = require('crypto');

const INVITES_KEY = 'ea_invites_data';
const SESSIONS_KEY = 'ea_sessions_data';

function generateUserId(email) {
  return crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
}

function generateSessionToken(userId, email) {
  const payload = {
    userId,
    email,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifySessionToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (new Date(payload.expiresAt) < new Date()) {
      return { valid: false, error: 'Session expired' };
    }
    return { valid: true, ...payload };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

function setStorage(key, data) {
  process.env[key] = JSON.stringify(data);
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const { email, inviteCode } = req.body || {};
    
    if (!email || !inviteCode) {
      context.res.status = 400;
      context.res.body = { valid: false, error: 'Email and invite code required' };
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      context.res.status = 400;
      context.res.body = { valid: false, error: 'Invalid email format' };
      return;
    }
    
    const invites = getStorage(INVITES_KEY);
    const invite = invites[inviteCode];
    
    if (!invite) {
      context.res.status = 401;
      context.res.body = { valid: false, error: 'Invalid invite code' };
      return;
    }
    
    if (new Date(invite.expiresAt) < new Date()) {
      context.res.status = 401;
      context.res.body = { valid: false, error: 'Invite code expired' };
      return;
    }
    
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      context.res.status = 401;
      context.res.body = { valid: false, error: 'Invite not valid for this email' };
      return;
    }
    
    if (invite.used) {
      context.res.status = 401;
      context.res.body = { valid: false, error: 'Invite code already used' };
      return;
    }
    
    const userId = generateUserId(email);
    const sessionToken = generateSessionToken(userId, email);
    
    invite.used = true;
    invite.usedAt = new Date().toISOString();
    invite.usedBy = email;
    invites[inviteCode] = invite;
    setStorage(INVITES_KEY, invites);
    
    const sessions = getStorage(SESSIONS_KEY);
    sessions[sessionToken] = {
      userId,
      email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    setStorage(SESSIONS_KEY, sessions);
    
    context.res.status = 200;
    context.res.body = {
      valid: true,
      userId,
      sessionToken,
      email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
  } catch (error) {
    context.log.error('Validation error:', error);
    context.res.status = 500;
    context.res.body = { valid: false, error: 'Internal server error' };
  }
};

module.exports.verifySessionToken = verifySessionToken;
module.exports.generateUserId = generateUserId;
