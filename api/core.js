const { Pool } = require('pg');

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

const SPECIALISTS = {
  concierge:    'Bárbara Mercedes — atendimento e qualificação de leads',
  marketing:    'Marketing Orgânico — scripts, Reels e Stories',
  comercial:    'Comercial Premium — propostas, reservas e fechamento',
  inteligencia: 'Inteligência — insights, métricas e próximas ações',
  devops:       'DevOps — GitHub, Vercel, deploy e banco de dados'
};

function detectSpecialist(message) {
  const m = message.toLowerCase();
  if (m.match(/lead|cliente|atend|reserva|whatsapp|barbara/)) return 'concierge';
  if (m.match(/reel|story|post|conteudo|marketing|instagram/))  return 'marketing';
  if (m.match(/venda|proposta|fechamento|pagamento|preco/))      return 'comercial';
  if (m.match(/metrica|insight|relatorio|analise|resultado/))    return 'inteligencia';
  if (m.match(/deploy|github|vercel|banco|log|api|erro/))        return 'devops';
  return 'concierge';
}

async function getContextoMotor() {
  if (!pool) return null;
  try {
    const client = await pool.connect();
    const [quentes, pecas, receita] = await Promise.all([
      client.query(`
        SELECT id, nome, telefone, score, canal_origem
        FROM clientes
        WHERE temperatura = 'quente'
        AND status_funil NOT IN ('vendido','perdido')
        ORDER BY score DESC LIMIT 5
      `),
      client.query(`
        SELECT id, nome, valor, peso, numero_serie
        FROM joias
        WHERE status_peca = 'disponivel'
        ORDER BY valor DESC LIMIT 5
      `),
      client.query(`
        SELECT COUNT(*) as total_vendas,
               COALESCE(SUM(valor), 0) as receita_dia
        FROM vendas
        WHERE data_venda >= CURRENT_DATE
        AND status_venda = 'confirmado'
      `)
    ]);
    client.release();
    return {
      leads_quentes:    quentes.rows,
      pecas_disponiveis: pecas.rows,
      receita_hoje:     receita.rows[0]
    };
  } catch (e) {
    console.error('[CORE] Erro motor contexto:', e.message);
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body || {};
  const specialist = detectSpecialist(message || '');
  const contextoMotor = await getContextoMotor();

  const log = {
    timestamp:       new Date().toISOString(),
    specialist,
    message_preview: (message || '').substring(0, 80),
    context:         context || 'direct',
    motor_ativo:     !!contextoMotor
  };

  console.log('[JARVES CORE]', JSON.stringify(log));

  return res.status(200).json({
    specialist,
    specialist_name: SPECIALISTS[specialist],
    contexto_operacional: contextoMotor,
    log
  });
};