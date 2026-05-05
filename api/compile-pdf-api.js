// api/compile-pdf-api.js
// Forwards body to latex.ytotech.com and streams back raw PDF binary.
// Frontend handles the binary blob directly (no base64 encoding needed).

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), // pass through: { compiler, resources }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ytotech error:', errText);
      return res.status(422).json({ error: `LaTeX compilation failed: ${errText.slice(0, 400)}` });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('compile-pdf-api error:', err);
    return res.status(500).json({ error: err.message });
  }
}
