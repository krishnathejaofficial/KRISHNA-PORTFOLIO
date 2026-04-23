// Vercel serverless function — proxies requests to NVIDIA NIM API
// This avoids CORS issues when calling from the browser

const NVIDIA_API_KEY = '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';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...req.body, stream: false }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
