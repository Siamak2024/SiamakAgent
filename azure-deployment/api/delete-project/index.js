const { verifySessionToken } = require('../validate-invite');

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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
  
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }
  
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      context.res.status = 401;
      context.res.body = { success: false, error: 'Missing authorization header' };
      return;
    }
    
    const sessionToken = authHeader.substring(7);
    const session = verifySessionToken(sessionToken);
    
    if (!session.valid) {
      context.res.status = 401;
      context.res.body = { success: false, error: session.error || 'Invalid session' };
      return;
    }
    
    const { userId } = session;
    const projectId = req.params.projectId || req.body?.projectId;
    
    if (!projectId) {
      context.res.status = 400;
      context.res.body = { success: false, error: 'projectId required' };
      return;
    }
    
    const storageKey = `user_projects_${userId}`;
    const userProjects = getStorage(storageKey) || {};
    
    if (!userProjects[projectId]) {
      context.res.status = 404;
      context.res.body = { success: false, error: 'Project not found' };
      return;
    }
    
    delete userProjects[projectId];
    setStorage(storageKey, userProjects);
    
    context.log('Project deleted:', projectId, 'for user:', userId);
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      projectId,
      deletedAt: new Date().toISOString()
    };
    
  } catch (error) {
    context.log.error('Delete error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to delete project' };
  }
};
