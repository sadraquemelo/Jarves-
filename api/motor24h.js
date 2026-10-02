const { Pool } = require('pg');

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

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query('SELECT NOW() as server_time;');
    await pool.end();

    return res.status(200).json({
      status: 'online',
      motor: 'Motor 24H Jarves Core',
      timestamp: result.rows[0].server_time
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};