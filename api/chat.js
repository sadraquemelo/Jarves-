export default async function handler(req, res) {
    // Configuração de segurança (CORS) para aceitar requisições do seu GitHub Pages
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://sadraquemelo.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Trata a requisição de pré-teste (Preflight) do navegador
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const { model, max_tokens, system, messages } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave ANTHROPIC_API_KEY não configurada na Vercel.' });
    }

    try {
        // Chamada oficial para a API da Anthropic (Claude)
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'claude-sonnet-4-20250514',
                max_tokens: max_tokens || 1000,
                system: system || '',
                messages: messages || []
            })
        });

        const data = await response.json();

        // Se a Anthropic retornar algum erro estrutural, repassa para o painel tratar
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Retorna a resposta exatamente no formato que o seu front-end espera ler (data.content)
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro interno no servidor:', error);
        return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
    }
}
