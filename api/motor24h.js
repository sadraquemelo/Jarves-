const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'DATABASE_URL nao configurada.'
      });
    }

    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as server_time;`;

    return res.status(200).json({
      status: 'online',
      motor: 'Motor 24H Jarves Core',
      timestamp: result[0].server_time
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};