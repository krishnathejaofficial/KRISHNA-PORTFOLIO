// Vercel serverless function — proxies ElevenLabs TTS to avoid CORS + keep API key server-side
// Set these in Vercel Dashboard → Project → Settings → Environment Variables:
//   ELEVENLABS_API_KEY  = your ElevenLabs API key
//   ELEVENLABS_VOICE_ID = your cloned voice ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    console.error('ElevenLabs env vars not set');
    return res.status(503).json({ error: 'TTS service not configured' });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text in request body' });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 500), // safety cap — ElevenLabs charges per char
          model_id: 'eleven_turbo_v2_5', // fastest, lowest latency, free-tier compatible
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const audioBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('TTS proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
