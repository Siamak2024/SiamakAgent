const { verifySessionToken } = require('../validate-invite');

function getStorage(key) {
  const data = process.env[key];
  return data ? JSON.parse(data) : {};
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const projectId = req.query.projectId;
    
    const storageKey = `user_projects_${userId}`;
    const userProjects = getStorage(storageKey) || {};
    
    if (projectId) {
      const project = userProjects[projectId];
      if (!project) {
        context.res.status = 404;
        context.res.body = { success: false, error: 'Project not found' };
        return;
      }
      
      context.res.status = 200;
      context.res.body = { success: true, project, userId };
      return;
    }
    
    const projectsList = Object.values(userProjects).map(p => ({
      id: p.id,
      name: p.data?.projectName || p.data?.name || 'Untitled Project',
      description: p.data?.description || '',
      lastModified: p.lastModified,
      version: p.version,
      completionStatus: p.data?.metadata?.completionStatus
    }));
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      projects: projectsList,
      count: projectsList.length,
      userId
    };
    
  } catch (error) {
    context.log.error('Load error:', error);
    context.res.status = 500;
    context.res.body = { success: false, error: 'Failed to load projects' };
  }
};
