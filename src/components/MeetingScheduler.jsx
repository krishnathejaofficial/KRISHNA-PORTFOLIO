import { useState, useEffect } from 'react';

const MEETING_TYPES = [
  { icon: 'fa-flask', label: 'Research Discussion', color: '#D4AF37' },
  { icon: 'fa-handshake', label: 'Collaboration Chat', color: '#60a5fa' },
  { icon: 'fa-briefcase', label: 'Interview / Hiring', color: '#a78bfa' },
  { icon: 'fa-comment-dots', label: 'General Connect', color: '#34d399' },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

export default function MeetingScheduler({ isOpen, onClose }) {
  const [meetType, setMeetType] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [step, setStep] = useState(1);
  const [trackingId, setTrackingId] = useState('');
  const [slots, setSlots] = useState([]);
  const [dayLocked, setDayLocked] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  useEffect(() => {
    if (step === 2 && date) {
      setFetchingSlots(true);
      setTime('');
      fetch(`/api/slots?date=${date}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) { setSlots(data.slots); setDayLocked(data.dayLocked); }
          else { setSlots([]); setDayLocked(false); }
        })
        .catch(() => { setSlots([]); setDayLocked(false); })
        .finally(() => setFetchingSlots(false));
    }
  }, [date, step]);

  // Check if a slot can be selected (considering consecutive slots needed for duration)
  const isSlotSelectable = (slot, idx) => {
    if (!slot.available) return false;
    const slotsNeeded = Math.ceil(duration / 30);
    for (let i = 0; i < slotsNeeded; i++) {
      if (!slots[idx + i] || !slots[idx + i].available) return false;
    }
    return true;
  };

  // Get slot status label
  const getSlotStatus = (slot, idx) => {
    if (slot.isPast) return 'past';
    if (slot.isBooked) return 'booked';
    if (slot.isAdminBlocked) return 'blocked';
    if (!isSlotSelectable(slot, idx)) return 'partial'; // not enough consecutive slots
    return 'available';
  };

  async function book() {
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'meeting',
          type: meetType?.label,
          name: form.name,
          email: form.email,
          phone: form.phone,
          timeline: `${date} at ${time} IST`,
          duration,
          detail: form.note || 'No agenda provided.',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) { setTrackingId(result.trackingId); setStatus('success'); }
      else throw new Error();
    } catch { setStatus('error'); }
  }

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

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

        <div className="sched-steps">
          {['Type', 'Date & Time', 'Confirm'].map((s, i) => (
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
              <p>Krishna will confirm your <strong>{meetType?.label}</strong> on <strong>{date} at {time} ({duration} min)</strong> via email within 24 hours.</p>
              <div style={{ background: 'var(--surface-2)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--gold)', margin: '20px 0' }}>
                <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '5px' }}>Your Tracking ID</p>
                <strong style={{ fontSize: '1.4em', letterSpacing: '2px', color: 'white' }}>{trackingId}</strong>
                <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '10px' }}>Use this ID to track your request status.</p>
              </div>
              <button className="btn" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              {/* STEP 1: Meeting Type */}
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
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <p className="sched-label">Duration Needed</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {DURATION_OPTIONS.map(d => (
                        <button key={d}
                          onClick={() => setDuration(d)}
                          style={{
                            padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9em',
                            background: duration === d ? 'var(--gold)' : 'var(--surface-2)',
                            border: `1px solid ${duration === d ? 'var(--gold)' : 'var(--border)'}`,
                            color: duration === d ? '#111' : 'white', fontWeight: duration === d ? 'bold' : 'normal'
                          }}>
                          {d < 60 ? `${d} min` : `${d / 60} hr${d > 60 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '8px' }}>
                      Requires {Math.ceil(duration / 30)} consecutive slot{Math.ceil(duration / 30) > 1 ? 's' : ''} of 30 min each
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Date & Time */}
              {step === 2 && (
                <div>
                  <div className="sched-back-row">
                    <button className="sched-back" onClick={() => setStep(1)}>
                      <i className="fas fa-arrow-left" /> Back
                    </button>
                    <span className="sched-selected-type">
                      <i className={`fas ${meetType?.icon}`} style={{ color: 'var(--gold)' }} /> {meetType?.label} · {duration < 60 ? `${duration} min` : `${duration / 60} hr${duration > 60 ? 's' : ''}`}
                    </span>
                  </div>

                  <div className="clg-field">
                    <label>Select Date *</label>
                    <input type="date" min={today}
                      value={date} onChange={e => setDate(e.target.value)}
                      style={{ padding: '12px', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', borderRadius: '6px', width: '100%' }} />
                  </div>

                  {date && (
                    <div style={{ marginTop: '15px' }}>
                      {fetchingSlots ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', padding: '20px 0' }}>
                          <i className="fas fa-spinner fa-spin" /> Fetching live availability...
                        </div>
                      ) : dayLocked ? (
                        <div style={{ padding: '15px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', textAlign: 'center' }}>
                          <i className="fas fa-calendar-times" style={{ color: '#ef4444', fontSize: '1.5em', marginBottom: '8px' }} />
                          <p style={{ color: '#ef4444', margin: 0 }}>This entire day is unavailable. Please choose another date.</p>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '0.8em' }}>
                            <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'#22c55e', marginRight:4 }}/>Available</span>
                            <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'rgba(239,68,68,0.4)', marginRight:4 }}/>Booked</span>
                            <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'rgba(251,191,36,0.4)', marginRight:4 }}/>Blocked</span>
                            <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'rgba(107,114,128,0.3)', marginRight:4 }}/>Past/Unavail.</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                            {slots.map((slot, idx) => {
                              const status = getSlotStatus(slot, idx);
                              const isSelected = time === slot.time;
                              return (
                                <button key={slot.time}
                                  disabled={status !== 'available'}
                                  onClick={() => setTime(slot.time)}
                                  style={{
                                    padding: '10px 6px', borderRadius: '8px', cursor: status === 'available' ? 'pointer' : 'not-allowed',
                                    fontSize: '0.82em', textAlign: 'center', border: `2px solid ${isSelected ? 'var(--gold)' : 'transparent'}`,
                                    background: isSelected ? 'var(--gold)' : status === 'available' ? 'rgba(34,197,94,0.15)' :
                                      status === 'booked' ? 'rgba(239,68,68,0.15)' : status === 'blocked' ? 'rgba(251,191,36,0.1)' : 'rgba(107,114,128,0.1)',
                                    color: isSelected ? '#111' : status === 'available' ? '#22c55e' :
                                      status === 'booked' ? '#ef4444' : status === 'blocked' ? '#f59e0b' : '#6b7280',
                                    fontWeight: isSelected ? 'bold' : 'normal',
                                    position: 'relative'
                                  }}>
                                  {slot.time}
                                  {status === 'booked' && <div style={{ fontSize: '0.75em', marginTop: '2px', opacity: 0.8 }}>BOOKED</div>}
                                  {status === 'blocked' && <div style={{ fontSize: '0.75em', marginTop: '2px', opacity: 0.8 }}>BLOCKED</div>}
                                  {status === 'past' && <div style={{ fontSize: '0.75em', marginTop: '2px', opacity: 0.8 }}>PAST</div>}
                                </button>
                              );
                            })}
                          </div>
                          {time && (
                            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', border: '1px solid var(--gold-dim)', fontSize: '0.9em' }}>
                              <i className="fas fa-check-circle" style={{ color: 'var(--gold)', marginRight: '8px' }} />
                              Selected: <strong>{time} → {duration} min block</strong>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <button className="btn" style={{ width: '100%', marginTop: '20px' }}
                    disabled={!date || !time} onClick={() => setStep(3)}>
                    Next <i className="fas fa-arrow-right" style={{ marginLeft: '6px' }} />
                  </button>
                </div>
              )}

              {/* STEP 3: Confirm */}
              {step === 3 && (
                <div>
                  <div className="sched-back-row">
                    <button className="sched-back" onClick={() => setStep(2)}>
                      <i className="fas fa-arrow-left" /> Back
                    </button>
                    <span className="sched-selected-type" style={{ fontSize: '0.82em' }}>
                      {meetType?.label} · {date} {time}
                    </span>
                  </div>
                  <div className="sched-confirm-box">
                    <div className="sched-confirm-row"><i className="fas fa-video" /><span>{meetType?.label}</span></div>
                    <div className="sched-confirm-row"><i className="fas fa-clock" /><span>{date} at {time} IST · {duration < 60 ? `${duration} min` : `${duration / 60}hr${duration > 60 ? 's' : ''}`}</span></div>
                    <div className="sched-confirm-row"><i className="fas fa-video" /><span>Google Meet (link sent via email)</span></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                    <div className="clg-field">
                      <label>Your Name *</label>
                      <input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div className="clg-field">
                      <label>Mobile Number *</label>
                      <input type="tel" placeholder="+91 90000 00000" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                    </div>
                  </div>
                  <div className="clg-field">
                    <label>Your Email *</label>
                    <input type="email" placeholder="Confirmation & updates sent here" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div className="clg-field">
                    <label>Agenda / Note <span style={{ opacity: 0.5 }}>(optional)</span></label>
                    <textarea rows={3} placeholder="What would you like to discuss? Topics, goals..." value={form.note} onChange={e => set('note', e.target.value)} />
                  </div>

                  <button className="btn" style={{ width: '100%' }}
                    disabled={status === 'sending' || !form.name || !form.email || !form.phone}
                    onClick={book}>
                    {status === 'sending'
                      ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Booking...</>
                      : <><i className="fas fa-calendar-check" style={{ marginRight: '8px' }} />Confirm Booking</>}
                  </button>
                  {status === 'error' && <p style={{ color: '#f87171', textAlign: 'center', fontSize: '0.82em', marginTop: '8px' }}>Failed to submit. Please email krishnatejareddy2003@gmail.com directly.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
