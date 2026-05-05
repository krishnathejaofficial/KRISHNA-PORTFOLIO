import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const NVIDIA_KEY = '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';

/* Helper: collect full request body as JSON */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

/* Local API plugin — mirrors the Vercel /api/* handlers */
const localApiPlugin = {
  name: 'local-api-routes',
  configureServer(server) {

    /* ── /api/tailor-resume ── */
    server.middlewares.use('/api/tailor-resume', async (req, res, next) => {
      if (req.method !== 'POST') { next(); return; }
      res.setHeader('Content-Type', 'application/json');
      try {
        const body = await readBody(req);
        const { company, jobTitle, jobDescription, editPrompt, currentLatex } = body;
        const isEdit = !!(editPrompt && currentLatex);

        let baseTex = '';
        try { baseTex = fs.readFileSync('./resume.tex', 'utf8'); } catch { baseTex = '% not found'; }

        let systemPrompt, userMessage;
        if (isEdit) {
          systemPrompt = `You are a professional LaTeX resume editor. Return ONLY complete compilable LaTeX code — no explanation, no markdown fences. Preserve all LaTeX formatting.`;
          userMessage  = `Current LaTeX resume:\n\n${currentLatex}\n\n---\nEdit request: "${editPrompt}"\n\nReturn the complete updated LaTeX code.`;
        } else {
          if (!company || !jobTitle || !jobDescription) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'company, jobTitle, and jobDescription are required.' }));
          }
          systemPrompt = `You are an expert ATS resume optimizer. Tailor the candidate's LaTeX resume for the job below. RULES: (1) Return ONLY valid compilable LaTeX — no markdown, no explanation. (2) Keep the exact same document structure and packages. (3) Reorder/expand skills to match JD keywords. (4) Rephrase bullets to mirror JD language naturally. (5) Do NOT invent new experience. (6) Output must compile with pdflatex.`;
          userMessage  = `COMPANY: ${company}\nJOB TITLE: ${jobTitle}\nJOB DESCRIPTION:\n${jobDescription}\n\n---\nBASE RESUME:\n${baseTex}\n\n---\nReturn ONLY the tailored LaTeX code.`;
        }

        const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${NVIDIA_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'meta/llama-3.3-70b-instruct',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
            max_tokens: 4096,
            temperature: 0.2,
          }),
        });

        if (!nvRes.ok) {
          const txt = await nvRes.text();
          res.statusCode = nvRes.status;
          return res.end(JSON.stringify({ error: `NVIDIA ${nvRes.status}: ${txt.slice(0, 300)}` }));
        }

        const data = await nvRes.json();
        let latex = data.choices?.[0]?.message?.content || '';
        latex = latex.replace(/^```(?:latex)?\s*/im, '').replace(/```\s*$/im, '').trim();

        if (!latex.includes('\\documentclass') && !latex.includes('\\begin{document}')) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'AI returned invalid LaTeX. Please try again.', raw: latex.slice(0, 200) }));
        }

        res.end(JSON.stringify({ latex, mode: isEdit ? 'edit' : 'generate' }));

      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    /* ── /api/compile-pdf-api ── */
    server.middlewares.use('/api/compile-pdf-api', async (req, res, next) => {
      if (req.method !== 'POST') { next(); return; }
      res.setHeader('Content-Type', 'application/json');
      try {
        const { latex } = await readBody(req);
        if (!latex) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'latex required' })); }

        const ytRes = await fetch('https://latex.ytotech.com/builds/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compiler: 'pdflatex', resources: [{ main: true, content: latex }] }),
        });

        if (!ytRes.ok) {
          const txt = await ytRes.text();
          res.statusCode = 422;
          return res.end(JSON.stringify({ error: `Compile failed: ${txt.slice(0, 400)}` }));
        }

        const buf = Buffer.from(await ytRes.arrayBuffer());
        res.end(JSON.stringify({ pdf: buf.toString('base64') }));

      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  },
};

export default defineConfig({
  /* Single plugins array — no duplicates */
  plugins: [
    react(),
    localApiPlugin,
  ],

  server: {
    proxy: {
      /* AI chat → NVIDIA NIM */
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace('/api/chat', '/chat/completions'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Bearer ${NVIDIA_KEY}`);
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        },
      },
    },
  },
});
