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
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
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
    const { projectId, projectData } = req.body || {};
    
    if (!projectId || !projectData) {
      context.res.status = 400;
      context.res.body = { success: false, error: 'projectId and projectData required' };
      return;
    }
    
    const project = {
      id: projectId,
      userId,
      data: projectData,
      lastModified: new Date().toISOString(),
      version: projectData.version || '5.0'
    };
    
    const storageKey = `user_projects_UTF8{userId}`;
    const userProjects = getStorage(storageKey) || {};
    userProjects[projectId] = project;
    setStorage(storageKey, userProjects);
    
    context.log('Project saved:', projectId, 'for user:', userId);
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      projectId,
      savedAt: project.lastModified
    };
    
  } catch (error) {
    context.log.error('Save error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to save project' };
  }
};
