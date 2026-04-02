export default async function handler(req, res) {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
  
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return res.status(500).json({ error: 'Tokens não configurados' });
  }

  if ((req.method === 'POST' || req.method === 'GET') && req.url === '/api/vercel/deploy') {
    try {
      const response = await fetch(`https://api.vercel.com/v6/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: VERCEL_PROJECT_ID,
          gitSource: {
            type: 'github',
            repo: process.env.VERCEL_REPO,
            ref: process.env.VERCEL_BRANCH || 'main'
          }
        })
      });
      
      const data = await response.json();
      res.status(response.ok ? 200 : response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }

  const url = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=10`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });
    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}