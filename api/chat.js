export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { messages, system } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        system: system || "Você é o assistente da Segunda Pele.",
        messages: messages
      })
    });
    const data = await response.json();
    //Entrega o formato exato que o seu front-end espera ler na tela
    return res.status(200).json({
      content: [{ text:data.content[0].text }]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
