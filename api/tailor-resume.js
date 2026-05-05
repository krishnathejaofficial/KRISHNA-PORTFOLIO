// /api/tailor-resume.js
// Reads base resume.tex, generates a tailored LaTeX resume using NVIDIA NIM AI
// Supports both initial generation and follow-up prompt-based edits

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const NVIDIA_API_KEY = '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';
const MODEL = 'meta/llama-3.1-70b-instruct';

// Load the base resume at cold-start
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let BASE_RESUME_TEX = '';
try {
  // Check typical local dev path (../resume.tex)
  const devPath = path.join(__dirname, '..', 'resume.tex');
  // Check Vercel deployed path (resume.tex at function root)
  const prodPath = path.join(process.cwd(), 'resume.tex');
  
  if (fs.existsSync(devPath)) {
    BASE_RESUME_TEX = fs.readFileSync(devPath, 'utf8');
  } else if (fs.existsSync(prodPath)) {
    BASE_RESUME_TEX = fs.readFileSync(prodPath, 'utf8');
  } else {
    // Fallback if neither works
    BASE_RESUME_TEX = fs.readFileSync(path.join(__dirname, 'resume.tex'), 'utf8');
  }
} catch (e) {
  console.error("Could not load resume.tex:", e);
  BASE_RESUME_TEX = '% resume.tex not found';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, jobTitle, jobDescription, editPrompt, currentLatex } = req.body || {};

  // ── Mode 1: Edit existing generated LaTeX with a follow-up prompt
  const isEditMode = !!(editPrompt && currentLatex);

  let systemPrompt, userMessage;

  if (isEditMode) {
    systemPrompt = `You are a professional LaTeX resume editor. The user has a tailored LaTeX resume and wants specific edits. 
Return ONLY the complete, compilable LaTeX code — no explanation, no markdown, no \`\`\` fences. 
Do NOT change the document class, packages, or overall structure unless explicitly asked.
Preserve all LaTeX formatting and special characters.`;

    userMessage = `Here is the current LaTeX resume:\n\n${currentLatex}\n\n---\nUser edit request: "${editPrompt}"\n\nReturn the complete updated LaTeX code with only the requested changes applied.`;

  } else {
    // ── Mode 2: Generate fresh tailored resume from base
    if (!company || !jobTitle || !jobDescription) {
      return res.status(400).json({ error: 'company, jobTitle, and jobDescription are required.' });
    }

    systemPrompt = `You are an expert ATS resume optimizer and LaTeX resume writer. 
Your task is to take a candidate's base LaTeX resume and tailor it specifically for a job application.

RULES:
1. Return ONLY valid, compilable LaTeX code — no explanation, no markdown code fences, no preamble text.
2. Keep the EXACT same LaTeX document structure, packages, and formatting style as the base resume.
3. Tailor the following to maximize ATS score for the given job:
   - Summary/objective section (if present, or add one)
   - Skills section — reorder and emphasize skills matching the JD
   - Experience/Research bullet points — rephrase to mirror JD keywords naturally
   - Project descriptions — highlight most relevant projects prominently
4. Do NOT fabricate or invent any experience, education, or qualifications not in the base resume.
5. Integrate keywords from the job description naturally into existing content.
6. Keep the same name, contact info, education institution, dates, and factual data.
7. The output must be 100% compilable with pdflatex.`;

    userMessage = `TARGET COMPANY: ${company}
TARGET JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
${jobDescription}

---
BASE RESUME (LaTeX):
${BASE_RESUME_TEX}

---
Generate the complete tailored LaTeX resume for this specific role. Return ONLY the LaTeX code.`;
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('NVIDIA API error:', err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    let latex = data.choices?.[0]?.message?.content || '';

    // Strip any accidental markdown fences the model may wrap in
    latex = latex.replace(/^```latex\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    // Ensure it starts with a LaTeX document (basic validation)
    if (!latex.includes('\\documentclass') && !latex.includes('\\begin{document}')) {
      return res.status(500).json({ error: 'AI did not return valid LaTeX. Please try again.', raw: latex });
    }

    return res.status(200).json({ latex, mode: isEditMode ? 'edit' : 'generate' });

  } catch (err) {
    console.error('Tailor resume error:', err);
    return res.status(500).json({ error: err.message });
  }
}
