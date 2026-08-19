const { Pool } = require('pg');

// Conexão resiliente para ambiente Serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') 
    ? false 
    : { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Busca leads quentes do banco
    const leadsRes = await pool.query(
      `SELECT id, nome, telefone, score, temperatura 
       FROM clientes 
       WHERE temperatura = 'quente' OR score >= 80 
       LIMIT 5`
    );

    // 2. Busca peças disponíveis em estoque
    const joiasRes = await pool.query(
      `SELECT id, nome, valor, status_peca 
       FROM joias 
       WHERE status_peca = 'disponivel' 
       LIMIT 5`
    );

    // 3. Calcula total de vendas do dia
    const vendasRes = await pool.query(
      `SELECT COUNT(id) as total_vendas, COALESCE(SUM(valor), 0) as receita_dia 
       FROM vendas 
       WHERE DATE(data_venda) = CURRENT_DATE`
    );

    // Retorno dinâmico dos dados em tempo real
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      motor: 'Segunda Pele 24H – ATIVO',
      database: process.env.DATABASE_URL ? 'conectado' : 'ausente',
      leads_quentes: leadsRes.rows,
      pecas_disponiveis: joiasRes.rows,
      receita_hoje: {
        total_vendas: parseInt(vendasRes.rows[0].total_vendas),
        receita_dia: parseFloat(vendasRes.rows[0].receita_dia)
      }
    });

  } catch (error) {
    console.error("Erro na consulta do motor24h:", error.message);
    
    // Fallback defensivo caso o banco esteja indisponível no momento
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      motor: 'Segunda Pele 24H – MODO DE SEGURANÇA',
      database: 'erro_conexao',
      error: error.message,
      leads_quentes: [],
      pecas_disponiveis: [],
      receita_hoje: { total_vendas: 0, receita_dia: 0 }
    });
  }
};
