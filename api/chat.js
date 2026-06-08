export default async function handler(req, res) {
  // Configuração rigorosa de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { messages, system } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'O array de mensagens é obrigatório.' });
    }

    // Tratamento rigoroso das mensagens para a API do Claude
    const cleanedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content || msg.text || '')
    })).filter(msg => msg.content.trim() !== '');

    const requestBody = {
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: cleanedMessages
    };

    // Só injeta o sistema se ele realmente existir e não for vazio
    if (system && String(system).trim() !== "") {
      requestBody.system = String(system);
    } else {
      requestBody.system = "Você é o assistente oficial de inteligência da Segunda Pele.";
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(response.status || 400).json({ 
        error: 'Erro na API Anthropic', 
        details: data.error 
      });
    }

    if (data.content && data.content[0] && data.content[0].text) {
      return res.status(200).json({
        content: [{ text: data.content[0].text }]
      });
    }

    return res.status(500).json({ error: 'Resposta da Anthropic veio em formato inesperado.' });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro interno no servidor Vercel.' });
  }
}
