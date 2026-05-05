import { useState, useRef, useCallback } from 'react';
import './AIResumeBuilder.css';

/* ─── Status Badge ─── */
function StatusBadge({ status, text }) {
  const map = {
    idle: { icon: 'fa-sparkles', cls: '' },
    generating: { icon: 'fa-spinner fa-spin', cls: 'arb-status-working' },
    compiling: { icon: 'fa-spinner fa-spin', cls: 'arb-status-working' },
    done: { icon: 'fa-check-circle', cls: 'arb-status-done' },
    error: { icon: 'fa-exclamation-circle', cls: 'arb-status-error' },
  };
  const { icon, cls } = map[status] || map.idle;
  return (
    <span className={`arb-status-badge ${cls}`}>
      <i className={`fas ${icon}`} /> {text}
    </span>
  );
}

/* ─── Main Component ─── */
export default function AIResumeBuilder({ isOpen, onClose }) {
  // Form state
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [editPrompt, setEditPrompt] = useState('');

  // Output state
  const [latex, setLatex] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [activeTab, setActiveTab] = useState('latex'); // 'latex' | 'preview'

  // Status
  const [genStatus, setGenStatus] = useState('idle');
  const [genMsg, setGenMsg] = useState('Ready to tailor your resume');
  const [compileStatus, setCompileStatus] = useState('idle');
  const [compileMsg, setCompileMsg] = useState('');
  const [editStatus, setEditStatus] = useState('idle');
  const [editMsg, setEditMsg] = useState('');

  const textareaRef = useRef(null);

  /* Helper to fetch the base resume.tex */
  async function fetchBaseResume() {
    try {
      const r = await fetch('/resume.tex');
      if (!r.ok) return '% Failed to load base resume';
      return await r.text();
    } catch {
      return '% Error loading base resume';
    }
  }

  /* ── NVIDIA AI call ──
     Dev:  stream:false → Vite proxy returns plain JSON (simple, reliable)
     Prod: stream:true  → Edge function pipes SSE (avoids Vercel 10s timeout)
  */
  async function callNVIDIA(systemPrompt, userMessage, onProgress) {
    const isProduction = import.meta.env.PROD;

    const payload = {
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 3000,
      temperature: 0.2,
      stream: isProduction, // stream only in prod (Edge fn); plain JSON in dev (Vite proxy)
    };

    const res = await fetch('/api/tailor-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // ── Dev mode: plain JSON response ──
    if (!isProduction) {
      const rawText = await res.text();
      if (!res.ok || !rawText.trim()) {
        let msg = `API Error ${res.status}`;
        try { msg = JSON.parse(rawText)?.error?.message || JSON.parse(rawText)?.error || msg; } catch {}
        throw new Error(msg);
      }
      let data;
      try { data = JSON.parse(rawText); } catch { throw new Error('Server returned invalid JSON. Check the console.'); }
      let out = (data.choices?.[0]?.message?.content || '')
        .replace(/^```(?:latex)?\s*/im, '').replace(/```\s*$/im, '').trim();
      if (!out.includes('\\documentclass') && !out.includes('\\begin{document}'))
        throw new Error(`AI returned invalid LaTeX (${out.slice(0,80)})`);
      return out;
    }

    // ── Production mode: SSE stream from Edge function ──
    if (!res.ok) {
      const rawText = await res.text();
      let msg = `API Error ${res.status}`;
      try { msg = JSON.parse(rawText)?.error?.message || JSON.parse(rawText)?.error || msg; } catch {}
      throw new Error(msg);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let sseBuffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content || '';
          fullContent += delta;
          onProgress?.(fullContent);
        } catch { /* ignore malformed SSE frames */ }
      }
    }
    let out = fullContent.replace(/^```(?:latex)?\s*/im, '').replace(/```\s*$/im, '').trim();
    if (!out.includes('\\documentclass') && !out.includes('\\begin{document}'))
      throw new Error('AI returned invalid LaTeX. Please try again.');
    return out;
  }


  /* ── Generate Tailored Resume ── */
  const generate = useCallback(async () => {
    if (!company.trim() || !jobTitle.trim() || !jobDesc.trim()) {
      alert('Please fill in Company Name, Job Title, and Job Description.');
      return;
    }
    setGenStatus('generating');
    setGenMsg('AI is tailoring your resume…');
    setPdfUrl('');
    setCompileStatus('idle');
    setCompileMsg('');

    try {
      const baseTex = await fetchBaseResume();
      const sys = `You are an expert ATS resume optimizer. Tailor the candidate's LaTeX resume for the job below. RULES: (1) Return ONLY valid compilable LaTeX — no markdown, no explanation. (2) Keep the exact same document structure and packages. (3) Reorder/expand skills to match JD keywords. (4) Rephrase bullets to mirror JD language naturally. (5) Do NOT invent new experience. (6) Output must compile with pdflatex.`;
      const msg = `COMPANY: ${company}\nJOB TITLE: ${jobTitle}\nJOB DESCRIPTION:\n${jobDesc}\n\n---\nBASE RESUME:\n${baseTex}\n\n---\nReturn ONLY the tailored LaTeX code.`;
      
      const newLatex = await callNVIDIA(sys, msg, (partial) => {
        // Live preview: show streaming LaTeX in editor as it arrives
        setLatex(partial);
        setActiveTab('latex');
        const lines = partial.split('\n').length;
        setGenMsg(`Streaming… ${lines} lines generated`);
      });
      
      setLatex(newLatex);
      setGenStatus('done');
      setGenMsg('Resume tailored! Review the LaTeX below, then compile to PDF.');
      setActiveTab('latex');
    } catch (err) {
      setGenStatus('error');
      setGenMsg(`Error: ${err.message}`);
    }
  }, [company, jobTitle, jobDesc]);

  /* ── Apply Edit Prompt ── */
  const applyEdit = useCallback(async () => {
    if (!editPrompt.trim() || !latex) return;
    setEditStatus('generating');
    setEditMsg('Applying your changes…');

    try {
      const sys = `You are a professional LaTeX resume editor. Return ONLY complete compilable LaTeX code — no explanation, no markdown fences. Preserve all LaTeX formatting.`;
      const msg = `Current LaTeX resume:\n\n${latex}\n\n---\nEdit request: "${editPrompt}"\n\nReturn the complete updated LaTeX code.`;
      
      const newLatex = await callNVIDIA(sys, msg, (partial) => {
        setLatex(partial);
        const lines = partial.split('\n').length;
        setEditMsg(`Streaming edits… ${lines} lines`);
      });
      
      setLatex(newLatex);
      setEditPrompt('');
      setPdfUrl('');
      setEditStatus('done');
      setEditMsg('Changes applied! Re-compile to see the updated PDF.');
    } catch (err) {
      setEditStatus('error');
      setEditMsg(`Error: ${err.message}`);
    }
  }, [editPrompt, latex]);

  /* ── Compile to PDF ── */
  const compilePDF = useCallback(async () => {
    if (!latex) return;
    setCompileStatus('compiling');
    setCompileMsg('Compiling LaTeX to PDF…');
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);

    try {
      const res = await fetch('/api/compile-pdf-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler: 'pdflatex', resources: [{ main: true, content: latex }] }),
      });
      
      if (!res.ok) {
        const errText = await res.text();
        // If it's JSON error payload, try to parse it
        try {
          const js = JSON.parse(errText);
          throw new Error(js.error || 'Compile failed');
        } catch {
          throw new Error(`Compile failed: ${errText.slice(0, 100)}`);
        }
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setPdfUrl(url);
      setCompileStatus('done');
      setCompileMsg('PDF compiled! Switch to Preview tab.');
      setActiveTab('preview');
    } catch (err) {
      setCompileStatus('error');
      setCompileMsg(`Compile error: ${err.message}`);
    }
  }, [latex, pdfUrl]);

  /* ── Download PDF ── */
  const downloadPDF = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${company || 'Resume'}_${jobTitle || 'Tailored'}.pdf`.replace(/\s+/g, '_');
    a.click();
  }, [pdfUrl, company, jobTitle]);

  /* ── Download LaTeX ── */
  const downloadLatex = useCallback(() => {
    if (!latex) return;
    const blob = new Blob([latex], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${company || 'Resume'}_${jobTitle || 'Tailored'}.tex`.replace(/\s+/g, '_');
    a.click();
  }, [latex, company, jobTitle]);

  if (!isOpen) return null;

  return (
    <div className="arb-overlay" id="ai-resume-builder-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="arb-modal" id="ai-resume-builder-modal">

        {/* ── Header ── */}
        <div className="arb-header">
          <div className="arb-header-left">
            <div className="arb-header-icon"><i className="fas fa-file-alt" /></div>
            <div>
              <h2>AI Resume Tailor</h2>
              <p>Generate ATS-optimized resumes tailored to any job in seconds</p>
            </div>
          </div>
          <button className="arb-close" onClick={onClose} aria-label="Close"><i className="fas fa-times" /></button>
        </div>

        <div className="arb-body">
          {/* ── LEFT: Inputs ── */}
          <div className="arb-sidebar">

            {/* Job Details */}
            <div className="arb-section">
              <div className="arb-section-title"><i className="fas fa-briefcase" /> Target Job</div>
              <label className="arb-label">Company Name *</label>
              <input
                id="arb-company"
                className="arb-input"
                placeholder="e.g. Biocon Limited"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
              <label className="arb-label">Job Title *</label>
              <input
                id="arb-jobtitle"
                className="arb-input"
                placeholder="e.g. Research Associate – Biologics"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              />
              <label className="arb-label">Job Description *</label>
              <textarea
                id="arb-jobdesc"
                className="arb-textarea arb-jobdesc"
                placeholder="Paste the full job description here…"
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                rows={8}
              />
            </div>

            {/* Generate */}
            <button
              id="arb-generate-btn"
              className={`arb-btn arb-btn-primary ${genStatus === 'generating' ? 'loading' : ''}`}
              onClick={generate}
              disabled={genStatus === 'generating'}>
              {genStatus === 'generating'
                ? <><i className="fas fa-spinner fa-spin" /> Generating…</>
                : <><i className="fas fa-magic" /> Generate Tailored Resume</>}
            </button>

            <StatusBadge status={genStatus} text={genMsg} />

            {/* Compile */}
            {latex && (
              <>
                <div className="arb-divider" />
                <button
                  id="arb-compile-btn"
                  className={`arb-btn arb-btn-compile ${compileStatus === 'compiling' ? 'loading' : ''}`}
                  onClick={compilePDF}
                  disabled={compileStatus === 'compiling'}>
                  {compileStatus === 'compiling'
                    ? <><i className="fas fa-spinner fa-spin" /> Compiling…</>
                    : <><i className="fas fa-file-pdf" /> Compile to PDF</>}
                </button>
                {compileMsg && <StatusBadge status={compileStatus} text={compileMsg} />}

                {/* Download buttons */}
                <div className="arb-dl-row">
                  <button className="arb-btn arb-btn-ghost" onClick={downloadLatex}>
                    <i className="fas fa-code" /> .tex
                  </button>
                  {pdfUrl && (
                    <button className="arb-btn arb-btn-ghost" onClick={downloadPDF}>
                      <i className="fas fa-download" /> PDF
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Edit Prompt */}
            {latex && (
              <>
                <div className="arb-divider" />
                <div className="arb-section-title"><i className="fas fa-edit" /> Refine with Prompt</div>
                <textarea
                  id="arb-edit-prompt"
                  className="arb-textarea arb-edit-area"
                  placeholder='e.g. "Make the skills section more concise" or "Emphasize Python and CRISPR experience more prominently"'
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  rows={3}
                />
                <button
                  id="arb-edit-btn"
                  className={`arb-btn arb-btn-edit ${editStatus === 'generating' ? 'loading' : ''}`}
                  onClick={applyEdit}
                  disabled={editStatus === 'generating' || !editPrompt.trim()}>
                  {editStatus === 'generating'
                    ? <><i className="fas fa-spinner fa-spin" /> Applying…</>
                    : <><i className="fas fa-wand-magic-sparkles" /> Apply Changes</>}
                </button>
                {editMsg && <StatusBadge status={editStatus} text={editMsg} />}
              </>
            )}
          </div>

          {/* ── RIGHT: Output ── */}
          <div className="arb-output">
            {/* Tabs */}
            <div className="arb-tabs">
              <button
                className={`arb-tab ${activeTab === 'latex' ? 'arb-tab-active' : ''}`}
                onClick={() => setActiveTab('latex')}>
                <i className="fas fa-code" /> LaTeX Code
              </button>
              <button
                className={`arb-tab ${activeTab === 'preview' ? 'arb-tab-active' : ''} ${!pdfUrl ? 'arb-tab-disabled' : ''}`}
                onClick={() => pdfUrl && setActiveTab('preview')}>
                <i className="fas fa-eye" /> PDF Preview {pdfUrl && <span className="arb-tab-badge">Ready</span>}
              </button>

              {/* ATS hint */}
              {genStatus === 'done' && (
                <div className="arb-ats-badge">
                  <i className="fas fa-robot" /> ATS-Optimized
                </div>
              )}
            </div>

            {/* Empty State */}
            {!latex && (
              <div className="arb-empty">
                <div className="arb-empty-icon"><i className="fas fa-file-lines" /></div>
                <h3>Your tailored resume will appear here</h3>
                <p>Fill in the job details on the left and click <strong>Generate Tailored Resume</strong>.</p>
                <ul className="arb-feature-list">
                  <li><i className="fas fa-check-circle" /> AI rewrites your resume to match the JD</li>
                  <li><i className="fas fa-check-circle" /> Keywords injected for maximum ATS score</li>
                  <li><i className="fas fa-check-circle" /> Same professional LaTeX formatting</li>
                  <li><i className="fas fa-check-circle" /> Edit with follow-up prompts</li>
                  <li><i className="fas fa-check-circle" /> Compile to PDF instantly</li>
                </ul>
              </div>
            )}

            {/* LaTeX Editor */}
            {latex && activeTab === 'latex' && (
              <div className="arb-editor-wrap">
                <div className="arb-editor-toolbar">
                  <span className="arb-editor-label"><i className="fas fa-code" /> LaTeX Editor — editable</span>
                  <button className="arb-editor-copy" onClick={() => navigator.clipboard.writeText(latex)}>
                    <i className="fas fa-copy" /> Copy
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  id="arb-latex-editor"
                  className="arb-editor"
                  value={latex}
                  onChange={e => { setLatex(e.target.value); setPdfUrl(''); }}
                  spellCheck={false}
                />
                <div className="arb-editor-footer">
                  <span>{latex.split('\n').length} lines</span>
                  <span>{latex.length.toLocaleString()} characters</span>
                  <span style={{ color: 'var(--gold)', opacity: 0.8 }}>
                    <i className="fas fa-info-circle" /> You can edit this directly or use the prompt
                  </span>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            {latex && activeTab === 'preview' && (
              <div className="arb-preview-wrap">
                {pdfUrl ? (
                  <iframe
                    id="arb-pdf-preview"
                    src={pdfUrl}
                    className="arb-pdf-iframe"
                    title="Resume PDF Preview"
                  />
                ) : (
                  <div className="arb-preview-empty">
                    <i className="fas fa-file-pdf" style={{ fontSize: '3em', color: 'var(--gold)', opacity: 0.5 }} />
                    <p>Click <strong>Compile to PDF</strong> to see the preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
