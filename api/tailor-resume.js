// api/tailor-resume.js
// Simple auth-injecting proxy to NVIDIA NIM.
// All prompt building is done on the client side (AIResumeBuilder.jsx).

const NVIDIA_API_KEY = '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';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body), // pass through the full NVIDIA request body
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    console.error('tailor-resume proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
