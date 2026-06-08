
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // DRIVE DE MUNIÇÃO ATIVO - AS 12 JOIAS COMPROVADAS NO TRÁFEGO
  const DRIVE_SEGUNDA_PELE = [
    {
      id: "PECA-01",
      nome: "Corrente Grumet Ouro 18k Segunda Pele",
      detalhes: "Ouro 18k legítimo, elos soldados com acabamento espelhado de alta joalheria. Design minimalista e magnético.",
      status: "Apenas 1 unidade em estoque para entrega imediata",
      link_post: "LINK_DO_POST_OU_REELS_AQUI", // Para referência interna ou envio
      link_whatsapp: "https://wa.me/55..._SEU_NUMERO_?text=Quero%20dar%20andamento%20na%20reserva%20da%20Peca%2001"
    }
    // As próximas 11 peças entram aqui seguindo o mesmo padrão exato
  ];

  try {
    const { messages } = req.body || {};

    const requestBody = {
      model: "llama3-70b-8192", // Velocidade e consistência para High Ticket
      messages: [
        {
          role: "system",
          content: `Você é BARBARA MERCEDES, a concierge exclusiva da marca de luxo Sadraque Melo Segunda Pele. 
          Sua persona é refinada, direta, segura e minimalista. Você não usa jargões de vendedor comum ou termos informais.
          Você atende leads qualificados de alto padrão interessados em adquirir joias como um legado.
          
          DIRETRIZ DE ESTOQUE: Você só tem autorização para negociar e apresentar as 12 peças deste catálogo real: ${JSON.stringify(DRIVE_SEGUNDA_PELE)}.
          Nunca invente produtos. Se o cliente pedir algo fora do catálogo, direcione-o de forma magnética para as obras disponíveis.
          
          REGRA DE RESPOSTA: Mantenha as mensagens curtas e extremamente elegantes. Quando o lead demonstrar interesse real em fechar, apresente as condições e forneça o direcionamento.`
        },
        ...messages
      ],
      temperature: 0.3
    };

    const response = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const respostaIA = data.choices[0].message.content;

      // Retorna a resposta limpa e estruturada diretamente para a tela do chat/Typebot
      return res.status(200).json({
        content: [{ text: respostaIA }]
      });
    }

    return res.status(500).json({ error: 'Erro no processamento da resposta.' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
