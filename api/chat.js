const { Pool } = require('pg');

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

// 🗄️ DRIVE SEGUNDA PELE — 12 PEÇAS
const DRIVE_SEGUNDA_PELE = [
  {
    codigo: "#SP-GRUMET18K",
    nome: "Corrente Grumet Ouro 18k Maciço",
    descricao_integra: "Obra-prima esculpida em Ouro 18k legítimo e certificado. Elos soldados individualmente com simetria milimétrica, caimento impecável e acabamento em polimento espelhado de alta joalheria. Equipada com fecho gaveta exclusivo com trava dupla de segurança de alta pressão.",
    posicionamento: "Design minimalista e de presença magnética, desenvolvido para se fundir ao corpo como uma segunda pele e atravessar gerações.",
    disponibilidade: "Apenas 1 exemplar físico disponível em estoque para pronta-entrega imediata.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20dar%20andamento%20na%20aquisição%20da%20Grumet%20SP-GRUMET18K"
  },
  {
    codigo: "#SP-COLAR45",
    nome: "Colar Gourmet 45cm Ouro 18k",
    descricao_integra: "Colar em ouro 18k maciço, 45cm de comprimento, elos gourmet com acabamento polido espelhado. Fecho canhão com dupla trava. Peso mínimo garantido para presença real no colo.",
    posicionamento: "Para quem entende que joia não é enfeite — é investimento que se usa.",
    disponibilidade: "1 unidade disponível para pronta-entrega.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20o%20Colar%20Gourmet%2045cm%20SP-COLAR45"
  },
  {
    codigo: "#SP-ANEL-SOLITARIO",
    nome: "Anel Solitário Ouro 18k",
    descricao_integra: "Anel em ouro 18k maciço com engaste solitário em prata 925. Acabamento polido espelhado. Conforto interno garantido por arredondamento manual do aro.",
    posicionamento: "O clássico que nunca sai de moda. Presença discreta e valor inegável.",
    disponibilidade: "Sob encomenda — prazo de 15 dias úteis.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20o%20Anel%20Solitário%20SP-ANEL-SOLITARIO"
  },
  {
    codigo: "#SP-ALIANCA-18K",
    nome: "Aliança Ouro 18k Par",
    descricao_integra: "Par de alianças em ouro 18k maciço, acabamento liso polido ou fosco. Personalizável com gravação interna. Peso mínimo 4g cada.",
    posicionamento: "O compromisso merece ser selado em ouro de verdade.",
    disponibilidade: "Sob encomenda — prazo 20 dias úteis.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20as%20Alianças%20SP-ALIANCA-18K"
  },
  {
    codigo: "#SP-BRINCO-ARGOLA",
    nome: "Brinco Argola Ouro 18k 3cm",
    descricao_integra: "Argola em ouro 18k maciço, 3cm de diâmetro, espessura 2.5mm. Acabamento polido espelhado. Sistema click interno com trava de segurança.",
    posicionamento: "Argola que não sai — literalmente. Feita para durar décadas.",
    disponibilidade: "1 par disponível para pronta-entrega.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20o%20Brinco%20Argola%20SP-BRINCO-ARGOLA"
  },
  {
    codigo: "#SP-PULSEIRA-GRUMET",
    nome: "Pulseira Grumet Ouro 18k 21cm",
    descricao_integra: "Pulseira grumet em ouro 18k maciço, 21cm, elos soldados individualmente. Fecho gaveta com dupla trava. Peso mínimo 8g.",
    posicionamento: "O pulso que usa ouro de verdade não precisa de mais nada.",
    disponibilidade: "1 unidade disponível para pronta-entrega.",
    cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20a%20Pulseira%20Grumet%20SP-PULSEIRA-GRUMET"
  }
];

// 🧠 CONTEXTO DO MOTOR24H — ALIMENTA A BÁRBARA
async function getContextoMotor() {
  if (!pool) return null;
  try {
    const client = await pool.connect();
    const [quentes, pecas, receita] = await Promise.all([
      client.query(`SELECT nome, telefone, score, canal_origem FROM clientes WHERE temperatura = 'quente' AND status_funil NOT IN ('vendido','perdido') ORDER BY score DESC LIMIT 5`),
      client.query(`SELECT nome, valor FROM joias WHERE status_peca = 'disponivel' ORDER BY valor DESC LIMIT 5`),
      client.query(`SELECT COUNT(*) as total_vendas, COALESCE(SUM(valor),0) as receita_dia FROM vendas WHERE data_venda >= CURRENT_DATE AND status_venda = 'confirmado'`)
    ]);
    client.release();
    return { leads_quentes: quentes.rows, pecas_disponiveis: pecas.rows, receita_hoje: receita.rows[0] };
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { messages } = req.body || {};
  const lastMsg = (messages?.slice(-1)[0]?.content || '').toLowerCase();

  const specialist = lastMsg.match(/reel|story|post|conteudo|marketing|instagram/) ? 'Marketing' :
                     lastMsg.match(/venda|proposta|fechamento|pagamento|preco/) ? 'Comercial' :
                     lastMsg.match(/deploy|github|vercel|banco|erro|api/) ? 'DevOps' : 'Concierge';

  const contextoMotor = await getContextoMotor();
  const apiKey = process.env.GROQ_API_KEY;

  const sistemaBarbaraMercedes = `[CORE: Especialista → ${specialist}]

Você é BÁRBARA MERCEDES, concierge e assessora exclusiva da marca de alta joalheria SEGUNDA PELE — Sadraque Melo.

Sua persona é madura, refinada, direta, segura e minimalista. Você não usa gírias, exclamações excessivas ou jargões de vendedor comum. Você fala com leads de alto padrão — High Ticket.

DIRETÓRIO DE PEÇAS ATIVO:
${JSON.stringify(DRIVE_SEGUNDA_PELE, null, 2)}

${contextoMotor ? `CONTEXTO OPERACIONAL EM TEMPO REAL (Motor24H):
- Leads quentes agora: ${JSON.stringify(contextoMotor.leads_quentes)}
- Peças disponíveis: ${JSON.stringify(contextoMotor.pecas_disponiveis)}
- Receita hoje: ${JSON.stringify(contextoMotor.receita_hoje)}` : ''}

REGRA DE FECHAMENTO (OBRIGATÓRIA):
Quando o cliente demonstrar intenção de compra ou reserva, inclua o campo cta_whatsapp da peça como link completo e visível.
Nunca diga "posso ser contatada pelo WhatsApp" sem colar o link real.
Exemplo: "Você pode finalizar agora mesmo aqui: https://wa.me/5511945587537?text=..."

FUNIL ARPÃO:
1. CLAREZA — O lead vê a peça e se identifica
2. SOLUÇÃO — A joia resolve o desejo de se valorizar
3. INVESTIMENTO — O valor é menor que continuar sem
4. FECHAMENTO — Link direto para WhatsApp

Escreva de forma magnética e sofisticada. Você assessora a aquisição de um legado de valor.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: 'system', content: sistemaBarbaraMercedes },
          ...messages
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ text }] });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};