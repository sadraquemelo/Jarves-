module.exports = async (req, res) => {
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    motor: 'Segunda Pele 24H — ATIVO',
    database: process.env.DATABASE_URL ? 'configurado' : 'ausente',
    leads_quentes: [],
    pecas_disponiveis: [],
    receita_hoje: { total_vendas: 0, receita_dia: 0 }
  });
};
