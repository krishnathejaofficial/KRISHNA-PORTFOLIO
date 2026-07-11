import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = req.body;
    const hasImageRef = payload.resources?.some(r => r.content && r.content.includes('krishnateja.jpg'));
    const hasImageResource = payload.resources?.some(r => r.path === 'krishnateja.jpg');

    if (hasImageRef && !hasImageResource) {
      const photoPath = path.join(globalThis.process.cwd(), 'public', 'images', 'krishna teja profile.jpg');
      if (fs.existsSync(photoPath)) {
        const imageBase64 = fs.readFileSync(photoPath).toString('base64');
        if (!payload.resources) payload.resources = [];
        payload.resources.push({ path: 'krishnateja.jpg', file: imageBase64 });
      }
    }

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
