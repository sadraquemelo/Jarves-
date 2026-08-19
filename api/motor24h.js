module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const hasDatabase = !!process.env.DATABASE_URL;

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      motor: 'Segunda Pele 24H – ATIVO',
      database: hasDatabase ? 'conectado' : 'ausente',
      status: 'ONLINE',
      leads_quentes: [],
      pecas_disponiveis: [],
      receita_hoje: { 
        total_vendas: 0, 
        receita_dia: 0 
      }
    });

  } catch (error) {
    console.error("Erro no motor24h:", error.message);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
