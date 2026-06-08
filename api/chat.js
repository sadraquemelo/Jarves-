export default async function handler(req, res) {
  // Configuração de CORS para permitir que o seu Front-end se comunique sem bloqueios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // DIRETÓRIO DE MUNIÇÃO (DRIVE INTERNO DE PRODUTOS)
  // Insira aqui as especificações exatas de cada uma das 12 joias
  const DIRETORIO_PRODUTOS = [
    {
      id: "PECA-01",
      nome: "Corrente Grumet Ouro 18k Segunda Pele",
      descricao_integra: "Obra-prima esculpida em Ouro 18k maciço e certificado. Elos soldados individualmente com simetria milimétrica e acabamento em polimento espelhado de alta joalheria. Apresenta fecho gaveta exclusivo com trava dupla de segurança de alta pressão. Design imponente feito para se fundir ao corpo.",
      posicionamento: "Presença magnética, alta joalheria minimalista desenvolvida para homens maduros que constroem um legado.",
      estoque: "Apenas 1 exemplar físico disponível para pronta-entrega.",
      link_direto: "https://wa.me/55_SEU_NUMERO_AQUI?text=Quero%20reservar%20a%20Corrente%20Grumet%20Peca%2001"
    }
    // Adicione os próximos itens mantendo exatamente a mesma estrutura de chaves acima
  ];

  const { messages } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave API não configurada no servidor." });
  }

  try {
    // Chamada direta para o endpoint correto da Groq utilizando o modelo Llama 3
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Modelo robusto e veloz para interações de alto padrão
        messages: [
          {
            role: 'system',
            content: `Você é BARBARA MERCEDES, a inteligência e concierge de vendas exclusiva da marca de alta joalheria Sadraque Melo Segunda Pele. 
            
            Sua persona é madura, extremamente refinada, direta, segura e minimalista. Você nunca utiliza termos informais, gírias, respostas genéricas ou jargões de vendedor comum.
            
            DIRETRIZ DE PRODUTOS E MUNIÇÃO:
            Você tem acesso total e estrito ao diretório de estoque real da marca: ${JSON.stringify(DIRETORIO_PRODUTOS)}.
            Quando o cliente perguntar por uma peça disponível ou demonstrar interesse em um modelo (como visto nos Reels ou Stories), você deve buscar as informações técnica e estéticas desse diretório e responder detalhadamente NA ÍNTEGRA.
            
            REGRAS DE INTERAÇÃO:
            1. Seja sucinta porém profundamente descritiva nos detalhes da joia (mencione a pureza do Ouro 18k, os elos soldados e a segurança do fecho).
            2. Mantenha o posicionamento de escassez real: a produção é estritamente limitada.
            3. Encaminhe o lead para a mesa de fechamento no WhatsApp de forma natural assim que ele validar o interesse.`
          },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const respostaIA = data.choices[0].message.content;
      
      // Entrega o formato exato que o seu front-end espera ler na tela
      return res.status(200).json({
        content: [{ text: respostaIA }]
      });
    }

    return res.status(500).json({ error: "Erro na estrutura de resposta da API." });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
