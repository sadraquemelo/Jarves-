const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const client = await pool.connect();

    // 1. BUSCA LEADS QUENTES
    const quentes = await client.query(`
      SELECT id, nome, telefone, score, canal_origem
      FROM clientes
      WHERE temperatura = 'quente'
      AND status_funil NOT IN ('vendido','perdido')
      ORDER BY score DESC
      LIMIT 10
    `);

    // 2. BUSCA LEADS MORNOS SEM CONTATO 7 DIAS
    const mornos = await client.query(`
      SELECT c.id, c.nome, c.telefone, c.score
      FROM clientes c
      WHERE c.temperatura = 'morno'
      AND c.status_funil = 'qualificado'
      AND c.data_cadastro < NOW() - INTERVAL '7 days'
      LIMIT 20
    `);

    // 3. PEÇAS DISPONÍVEIS
    const pecas = await client.query(`
      SELECT id, nome, valor, peso, numero_serie
      FROM joias
      WHERE status_peca = 'disponivel'
      ORDER BY valor DESC
    `);

    // 4. RECEITA DO DIA
    const receita = await client.query(`
      SELECT
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor), 0) as receita_dia
      FROM vendas
      WHERE data_venda >= CURRENT_DATE
      AND status_venda = 'confirmado'
    `);

    client.release();

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      motor: 'Segunda Pele 24H — ATIVO',
      leads_quentes: quentes.rows,
      leads_mornos: mornos.rows,
      pecas_disponiveis: pecas.rows,
      receita_hoje: receita.rows[0]
    });

  } catch (erro) {
    console.error('Motor 24H erro:', erro);
    return res.status(500).json({ erro: erro.message });
  }
};