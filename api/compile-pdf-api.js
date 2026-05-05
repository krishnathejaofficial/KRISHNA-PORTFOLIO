// /api/compile-pdf-api.js
// Accepts a LaTeX string, compiles it via latex.ytotech.com, returns PDF as base64

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { latex } = req.body || {};
  if (!latex) return res.status(400).json({ error: 'latex field is required' });

  const payload = {
    compiler: 'pdflatex',
    resources: [{ main: true, content: latex }],
  };

  try {
    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LaTeX compile error:', errText);
      return res.status(422).json({ error: `Compilation failed: ${errText.slice(0, 400)}` });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ pdf: base64 });

  } catch (err) {
    console.error('Compile PDF API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
