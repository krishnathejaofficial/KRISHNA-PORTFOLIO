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
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, jobTitle, jobDescription: jobDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setLatex(data.latex);
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
    if (!editPrompt.trim()) return;
    if (!latex) { alert('Generate a resume first, then apply edits.'); return; }
    setEditStatus('generating');
    setEditMsg('Applying your changes…');
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editPrompt, currentLatex: latex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Edit failed');
      setLatex(data.latex);
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
    if (!latex) { alert('Generate a resume first.'); return; }
    setCompileStatus('compiling');
    setCompileMsg('Compiling LaTeX to PDF…');
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(''); }
    try {
      const res = await fetch('/api/compile-pdf-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Compilation failed');
      // Decode base64 → Blob URL for iframe
      const bytes = Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
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
