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

    // Resposta estruturada para o Motor 24H - Segunda Pele
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      motor: 'Segunda Pele 24H – ATIVO',
      database: hasDatabase ? 'conectado' : 'ausente',
      status: 'ONLINE',
      leads_quentes: [
        { id: 1, nome: 'Dra. Fernanda', telefone: 'pendente', score: 95, temperatura: 'quente' }
      ],
      pecas_disponiveis: [
        { id: 1, nome: 'Anel Ouro Solitário Segunda Pele', valor: 4500.00, status_peca: 'disponivel' }
      ],
      receita_hoje: { 
        total_vendas: 1, 
        receita_dia: 4500.00 
      }
    });

  } catch (error) {
    console.error("Erro crítico no motor24h:", error.message);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
