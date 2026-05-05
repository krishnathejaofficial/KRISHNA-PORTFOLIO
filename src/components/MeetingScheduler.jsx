import { useState } from 'react';

/* Meeting Scheduler — Calendly-style with manual slot system + email booking */
const SLOTS = {
  Mon: ['10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
  Tue: ['10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'],
  Wed: ['11:00 AM', '2:00 PM', '4:00 PM'],
  Thu: ['10:00 AM', '11:00 AM', '3:00 PM'],
  Fri: ['10:00 AM', '12:00 PM', '2:00 PM'],
};

const MEETING_TYPES = [
  { icon: 'fa-flask', label: 'Research Discussion', duration: '30 min', color: '#D4AF37' },
  { icon: 'fa-handshake', label: 'Collaboration Chat', duration: '45 min', color: '#60a5fa' },
  { icon: 'fa-briefcase', label: 'Interview / Hiring', duration: '30 min', color: '#a78bfa' },
  { icon: 'fa-comment-dots', label: 'General Connect', duration: '20 min', color: '#34d399' },
];

const WEB3FORMS_KEY = '4e9cf101-22a3-4552-9b1f-dc1f86224eaa';

export default function MeetingScheduler({ isOpen, onClose }) {
  const [meetType, setMeetType] = useState(null);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', note: '' });
  const [status, setStatus] = useState('idle');
  const [step, setStep] = useState(1);

  function set(field, val) { setForm(p => ({ ...p, [field]: val })); }

  async function book() {
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[Portfolio] Meeting Request: ${meetType?.label} — ${day} ${time}`,
          from_name: form.name,
          email: form.email,
          message: `Meeting Type: ${meetType?.label} (${meetType?.duration})\nDay: ${day} at ${time} (IST)\nNote: ${form.note || 'None'}\n\nFrom: ${form.name} <${form.email}>`,
        }),
      });
      if (res.ok) setStatus('success');
      else throw new Error();
    } catch { setStatus('error'); }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box scheduler-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-calendar-check" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Schedule a Meeting</strong>
              <span>Book time with Krishna · IST timezone</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        {/* Steps indicator */}
        <div className="sched-steps">
          {['Type', 'Slot', 'Confirm'].map((s, i) => (
            <div key={s} className={`sched-step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="sched-step-dot">{step > i + 1 ? <i className="fas fa-check" /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {status === 'success' ? (
            <div className="collab-success">
              <i className="fas fa-calendar-check" style={{ fontSize: '3em', color: '#22c55e' }} />
              <h3>Meeting Requested!</h3>
              <p>Krishna will confirm your <strong>{meetType?.label}</strong> on <strong>{day} at {time}</strong> via email within 24 hours.</p>
              <button className="btn" onClick={onClose} style={{ marginTop: '16px' }}>Done</button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <p className="sched-label">Select Meeting Type</p>
                  <div className="meeting-types">
                    {MEETING_TYPES.map(t => (
                      <button key={t.label}
                        className={`meeting-type-btn ${meetType?.label === t.label ? 'active' : ''}`}
                        style={{ '--mt-color': t.color }}
                        onClick={() => { setMeetType(t); setStep(2); }}>
                        <i className={`fas ${t.icon}`} />
                        <div>
                          <span>{t.label}</span>
                          <small><i className="fas fa-clock" style={{ marginRight: '4px' }} />{t.duration}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="sched-back-row">
                    <button className="sched-back" onClick={() => setStep(1)}>
                      <i className="fas fa-arrow-left" /> Back
                    </button>
                    <span className="sched-selected-type">
                      <i className={`fas ${meetType?.icon}`} style={{ color: 'var(--gold)' }} /> {meetType?.label}
                    </span>
                  </div>
                  <p className="sched-label">Pick a Day & Time</p>
                  {Object.entries(SLOTS).map(([d, times]) => (
                    <div key={d} className="sched-day-row">
                      <span className="sched-day-name">{d}</span>
                      <div className="sched-times">
                        {times.map(t => (
                          <button key={t}
                            className={`sched-time-btn ${day === d && time === t ? 'active' : ''}`}
                            onClick={() => { setDay(d); setTime(t); }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="btn" style={{ width: '100%', marginTop: '12px' }}
                    disabled={!day || !time} onClick={() => setStep(3)}>
                    Next <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }} />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="sched-back-row">
                    <button className="sched-back" onClick={() => setStep(2)}>
                      <i className="fas fa-arrow-left" /> Back
                    </button>
                    <span className="sched-selected-type" style={{ fontSize: '0.82em' }}>
                      {meetType?.label} · {day} {time}
                    </span>
                  </div>
                  <div className="sched-confirm-box">
                    <div className="sched-confirm-row"><i className="fas fa-video" /><span>{meetType?.label}</span></div>
                    <div className="sched-confirm-row"><i className="fas fa-clock" /><span>{meetType?.duration} · {day} at {time} IST</span></div>
                    <div className="sched-confirm-row"><i className="fas fa-video" /><span>Google Meet (link sent via email)</span></div>
                  </div>
                  <div className="clg-field" style={{ marginTop: '14px' }}>
                    <label>Your Name *</label>
                    <input type="text" placeholder="Full name" required value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="clg-field">
                    <label>Your Email *</label>
                    <input type="email" placeholder="Confirmation will be sent here" required value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="clg-field">
                    <label>Agenda / Note <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <textarea rows={2} placeholder="What would you like to discuss?" value={form.note} onChange={e => set('note', e.target.value)} />
                  </div>
                  <button className="btn" style={{ width: '100%' }}
                    disabled={status === 'sending' || !form.name || !form.email}
                    onClick={book}>
                    {status === 'sending'
                      ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Booking...</>
                      : <><i className="fas fa-calendar-check" style={{ marginRight: '8px' }} />Confirm Booking</>
                    }
                  </button>
                  {status === 'error' && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '0.82em', marginTop: '8px' }}>Failed to submit. Please email directly.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
