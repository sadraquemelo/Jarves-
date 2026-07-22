const SPECIALISTS = {
  concierge: 'Bárbara Mercedes — atendimento e qualificação de leads',
  marketing: 'Marketing Orgânico — scripts, Reels e Stories',
  comercial: 'Comercial Premium — propostas, reservas e fechamento',
  inteligencia: 'Inteligência — insights, métricas e próximas ações',
  devops: 'DevOps — GitHub, Vercel, deploy e banco de dados'
};

function detectSpecialist(message) {
  const m = message.toLowerCase();
  if (m.match(/lead|cliente|atend|reserva|whatsapp|barbara/)) return 'concierge';
  if (m.match(/reel|story|post|conteudo|marketing|instagram/)) return 'marketing';
  if (m.match(/venda|proposta|fechamento|pagamento|preco/)) return 'comercial';
  if (m.match(/metrica|insight|relatorio|analise|resultado/)) return 'inteligencia';
  if (m.match(/deploy|github|vercel|banco|log|api|erro/)) return 'devops';
  return 'concierge'; // padrão
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body;
  const specialist = detectSpecialist(message || '');

  const log = {
    timestamp: new Date().toISOString(),
    specialist,
    message_preview: (message || '').substring(0, 80),
    context: context || 'direct'
  };

  console.log('[JARVES CORE]', JSON.stringify(log));

  return res.status(200).json({
    specialist,
    specialist_name: SPECIALISTS[specialist],
    log
  });
}
