export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roteiro, avatar_id } = req.body;

  if (!roteiro) {
    return res.status(400).json({ error: 'Roteiro é obrigatório' });
  }

  try {
    // ETAPA 1 — Gerar áudio com ElevenLabs (voz Bárbara)
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pssvUmEe4qWyjLI4bLyM';
    const audioRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: roteiro,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      }
    );

    if (!audioRes.ok) {
      const err = await audioRes.text();
      return res.status(500).json({ error: 'ElevenLabs falhou', detail: err });
    }

    const audioBuffer = await audioRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // ETAPA 2 — Gerar vídeo com VisionStory
    const vsRes = await fetch('https://app.visionstory.ai/api/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VISIONSTORY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: avatar_id || process.env.VISIONSTORY_AVATAR_ID,
        audio: audioDataUrl,
        resolution: '720p',
        aspect_ratio: '9:16',
        language: 'pt-BR',
      }),
    });

    if (!vsRes.ok) {
      const err = await vsRes.text();
      return res.status(500).json({ error: 'VisionStory falhou', detail: err });
    }

    const vsData = await vsRes.json();

    return res.status(200).json({
      success: true,
      video_id: vsData.id || vsData.video_id,
      status: vsData.status,
      message: 'Vídeo em processamento — Bárbara Mercedes sendo gerada',
    });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', detail: err.message });
  }
}
