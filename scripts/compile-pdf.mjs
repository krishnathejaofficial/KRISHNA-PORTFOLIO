import fs from 'fs';
import path from 'path';

async function compile() {
  console.log("Reading LaTeX source...");
  const texContent = fs.readFileSync('resume.tex', 'utf8');
  
  // Read and base64 encode the profile image so the API has it
  const imagePath = path.join('public', 'images', 'krishna teja profile.jpg');
  let imageBase64 = '';
  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    imageBase64 = imageBuffer.toString('base64');
  } else {
    console.warn("Profile image not found at", imagePath);
  }

  // Create payload for LaTeX on HTTP API
  const payload = {
    compiler: "pdflatex",
    resources: [
      {
        main: true,
        content: texContent
      },
      {
        path: "krishnateja.jpg",
        content: imageBase64,
        encoding: "base64"
      }
    ]
  };

  console.log("Sending request to LaTeX compiler API...");
  
  const response = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Compilation failed:", response.status, errorText);
    process.exit(1);
  }

  // The API returns the PDF as a binary stream
  const buffer = await response.arrayBuffer();
  fs.writeFileSync('public/resume.pdf', Buffer.from(buffer));
  console.log("PDF successfully generated and saved to public/resume.pdf");
}

compile().catch(err => {
  console.error("Error during compilation:", err);
  process.exit(1);
});
