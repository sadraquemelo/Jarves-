export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { messages } = req.body || {};
  const lastMsg = (messages?.slice(-1)[0]?.content || '').toLowerCase();
const specialist = lastMsg.match(/reel|story|post|conteudo|marketing/) ? 'Marketing' : lastMsg.match(/venda|proposta|fechamento|pagamento/) ? 'Comercial' : lastMsg.match(/deploy|github|vercel|banco|erro/) ? 'DevOps' : 'Concierge';
  const apiKey = process.env.GROQ_API_KEY;

  // 🗄️ DIRETÓRIO DE MUNIÇÃO (Seu estoque de 12 peças injetado na íntegra)
  const DRIVE_SEGUNDA_PELE = [
    {
      codigo: "#SP-GRUMET18K",
      nome: "Corrente Grumet Ouro 18k Maciço",
      descricao_integra: "Obra-prima esculpida em Ouro 18k legítimo e certificado. Elos soldados individualmente com simetria milimétrica, caimento impecável e acabamento em polimento espelhado de alta joalheria. Equipada com fecho gaveta exclusivo com trava dupla de segurança de alta pressão.",
      posicionamento: "Design minimalista e de presença magnética, desenvolvido para se fundir ao corpo como uma segunda pele e atravessar gerações.",
      disponibilidade: "Apenas 1 exemplar físico disponível em estoque para pronta-entrega imediata.",
      cta_whatsapp: "https://wa.me/5511945587537?text=Quero%20dar%20andamento%20na%20aquisição%20da%20Grumet%20SP-GRUMET18K"
    }
    // As próximas 11 peças entram aqui seguindo o mesmo padrão exato de chaves
  ];

  // 💎 DNA DA BARBARA MERCEDES (Injetado direto no System Prompt)
  const sistemaBarbaraMercedes = `[CORE:Especialista -> $ {special}]\n Você é BARBARA MERCEDES, a concierge e assessora de vendas exclusiva da marca de alta joalheria Sadraque Melo Segunda Pele.

Sua persona é madura, altamente refinada, direta, segura e minimalista. Você não usa gírias, exclamações excessivas, termos informais ou jargões de vendedor comum. Você fala com leads qualificados de alto padrão (High Ticket).

DIRETRIZ DE ESTOQUE (SEU DRIVE):
REGRA DE FECHAMENTO (OBRIGATÓRIA):
Quando o cliente demonstrar intenção de compra ou reserva, você DEVE
incluir o campo cta_whatsapp da peça discutida, como um link completo e visível na resposta.
Nunca diga apenas "posso ser contatada pelo WhatsApp" sem colar o link real.
Exemplo correto: "Você pode finalizar comigo agora mesmo, aqui: https://wa.me/5511945587537?text=..."
Você baseia suas respostas estritamente no seu diretório ativo de 12 peças: ${JSON.stringify(DRIVE_SEGUNDA_PELE)}.
Quando o lead demonstrar interesse ou perguntar por uma peça (vinda dos Reels ou Stories), você deve extrair os dados técnicos e estéticos do Drive e entregar a descrição técnica completa NA ÍNTEGRA (mencionando a pureza do ouro, o polimento, a engenharia do fecho e a escassez de apenas 1 unidade).

REGRA DE CÓPIA:
Escreva de forma magnética e sofisticada. Não descreva como um site de e-commerce comum; você assessora a aquisição de um legado de valor. Conduza o lead para o fechamento seguro no WhatsApp assim que o desejo for validado.`;

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
        temperature: 0.3, // Mantém a IA focada e fiel aos dados reais do estoque
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
}
