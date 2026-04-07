const crypto = require('crypto');

const INVITES_KEY = 'ea_invites_data';

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

function setStorage(key, data) {
  process.env[key] = JSON.stringify(data);
}

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const adminKey = req.headers['x-admin-key'];
    const expectedAdminKey = process.env.ADMIN_SECRET_KEY || 'CHANGE_THIS_IN_PRODUCTION';
    
    if (adminKey !== expectedAdminKey) {
      context.res.status = 401;
      context.res.body = { success: false, error: 'Invalid admin key' };
      return;
    }
    
    const { email, expiresInHours = 24 } = req.body || {};
    
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    
    const invite = {
      code: inviteCode,
      email: email || null,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false,
      usedAt: null,
      usedBy: null
    };
    
    const invites = getStorage(INVITES_KEY);
    invites[inviteCode] = invite;
    setStorage(INVITES_KEY, invites);
    
    const baseUrl = process.env.APP_BASE_URL || 'https://yourapp.azurestaticapps.net';
    const inviteLink = `${baseUrl}/auth/login.html?invite=${inviteCode}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
    
    context.log('Invite created:', inviteCode, 'for', email || 'any email');
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      inviteCode,
      inviteLink,
      email: email || null,
      expiresAt,
      expiresInHours
    };
    
  } catch (error) {
    context.log.error('Create invite error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to create invite' };
  }
};
