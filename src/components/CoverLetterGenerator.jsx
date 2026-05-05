import { useState } from 'react';
import { knowledgeChunks } from '../data/knowledgeBase';
import { getRelevantContext } from '../utils/ragUtils';

const NVIDIA_API_KEY = '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';
const MODEL = 'meta/llama-3.1-70b-instruct';

export default function CoverLetterGenerator({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ company: '', role: '', jd: '', tone: 'professional' });
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = [
    { value: 'professional', label: '🎯 Professional', desc: 'Formal & ATS-optimized' },
    { value: 'enthusiastic', label: '🚀 Enthusiastic', desc: 'Energetic & passionate' },
    { value: 'research', label: '🔬 Research-focused', desc: 'Academic & technical' },
    { value: 'concise', label: '⚡ Concise', desc: 'Short & impactful' },
  ];

  async function generate() {
    if (!form.company || !form.role) return;
    setLoading(true);
    setStep(2);
    const context = getRelevantContext(form.role + ' ' + form.jd, knowledgeChunks, 8);
    const prompt = `You are writing a cover letter FOR G. Krishna Teja, an Integrated M.Sc. Biotechnology student at VIT Vellore (CGPA 9.01). Write a ${form.tone} cover letter for the position of "${form.role}" at "${form.company}".

Use ONLY these facts about Krishna:
${context}

${form.jd ? `Job Description Keywords: ${form.jd}` : ''}

Rules:
- Write in first person as Krishna
- Start with a compelling opening (NOT "Dear Hiring Manager" as first words)
- Highlight 3 most relevant achievements matching the role
- Keep it to 3 paragraphs max
- End with a clear call to action
- Tone: ${form.tone}
- Do NOT include "[Your Name]" or placeholder text — use "G. Krishna Teja"
- Sign off with: "Warm regards,\nG. Krishna Teja\nkrishnatejareddy2003@gmail.com | +91 93908 50349"`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: 'You are a professional cover letter writer. Write compelling, personalized cover letters.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.75, max_tokens: 600, stream: false,
        }),
      });
      const data = await res.json();
      setLetter(data.choices?.[0]?.message?.content || 'Could not generate. Please try again.');
    } catch {
      setLetter('Error generating letter. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyLetter() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadLetter() {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${form.company}_${form.role}.txt`.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() { setStep(1); setLetter(''); setForm({ company: '', role: '', jd: '', tone: 'professional' }); }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box clg-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-file-signature" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Smart Cover Letter</strong>
              <span>AI-powered, tailored to the job</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        {step === 1 && (
          <div className="modal-body">
            <div className="clg-field">
              <label>Company Name *</label>
              <input type="text" placeholder="e.g. Biocon, Dr. Reddy's, Pfizer..." value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="clg-field">
              <label>Position / Role *</label>
              <input type="text" placeholder="e.g. Research Intern, Biotech Analyst..." value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="clg-field">
              <label>Key Job Description Points <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <textarea placeholder="Paste keywords or requirements from the job posting..." value={form.jd}
                onChange={e => setForm(p => ({ ...p, jd: e.target.value })} rows={3} />
            </div>
            <div className="clg-field">
              <label>Tone</label>
              <div className="clg-tones">
                {tones.map(t => (
                  <button key={t.value} className={`clg-tone-btn ${form.tone === t.value ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, tone: t.value }))}>
                    <span>{t.label}</span>
                    <small>{t.desc}</small>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn" style={{ width: '100%', marginTop: '8px' }}
              onClick={generate} disabled={!form.company || !form.role}>
              <i className="fas fa-magic" style={{ marginRight: '8px' }} />Generate Cover Letter
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            {loading ? (
              <div className="clg-loading">
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2em', color: 'var(--gold)' }} />
                <p>Crafting your personalized letter...</p>
              </div>
            ) : (
              <>
                <div className="clg-result">
                  <pre>{letter}</pre>
                </div>
                <div className="clg-actions">
                  <button className="clg-action-btn" onClick={copyLetter}>
                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="clg-action-btn" onClick={downloadLetter}>
                    <i className="fas fa-download" /> Download
                  </button>
                  <button className="clg-action-btn" onClick={reset}>
                    <i className="fas fa-redo" /> New Letter
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
