import fs from 'fs';
import path from 'path';

async function compile() {
  console.log("[PDF] Reading LaTeX source...");
  const texContent = fs.readFileSync('resume.tex', 'utf8');

  const imagePath = path.join('public', 'images', 'krishna teja profile.jpg');
  let imageBase64 = '';
  if (fs.existsSync(imagePath)) {
    imageBase64 = fs.readFileSync(imagePath).toString('base64');
    console.log("[PDF] Profile image encoded.");
  } else {
    console.warn("[PDF] Profile image not found, continuing without it.");
  }

  const payload = {
    compiler: "pdflatex",
    resources: [
      { main: true, content: texContent }
    ]
  };

  if (imageBase64) {
    payload.resources.push({ path: "krishnateja.jpg", file: imageBase64 });
  }

  console.log("[PDF] Sending to LaTeX API...");
  const response = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API returned ${response.status}: ${errorText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/resume.pdf', Buffer.from(buffer));
  console.log("[PDF] Successfully generated public/resume.pdf");
}

compile().catch(err => {
  // Non-blocking: log the error but don't fail the build.
  // The pre-committed public/resume.pdf will be used as fallback.
  console.error("[PDF] Compilation skipped:", err.message);
  console.log("[PDF] Using existing public/resume.pdf as fallback.");
});
