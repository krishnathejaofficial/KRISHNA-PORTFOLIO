import { useState, useEffect, useCallback } from 'react';

// All slots 8AM–11:30PM
const ALL_SLOTS = (() => {
  const s = [];
  for (let h = 8; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ap = h >= 12 ? 'PM' : 'AM';
      s.push(`${String(h12).padStart(2,'0')}:${m===0?'00':'30'} ${ap}`);
    }
  }
  return s;
})();

const STATUS_COLORS = { 'Accepted': '#10b981', 'Rejected': '#ef4444', 'In Progress': '#3b82f6', 'Pending Review': '#f59e0b' };

export default function AdminDashboard() {
  const [step, setStep] = useState('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calendar state
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [calSlots, setCalSlots] = useState([]);
  const [dayLocked, setDayLocked] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // { time, note }
  const [slotNote, setSlotNote] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Admin note for status update
  const [adminNotes, setAdminNotes] = useState({}); // { [trackingId]: note }

  // Expanded submission row
  const [expandedId, setExpandedId] = useState(null);

  const api = useCallback(async (body) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, token })
    });
    return res.json();
  }, [token]);

  useEffect(() => {
    if (token) { setStep('dashboard'); fetchSubmissions(); }
  }, [token]);

  useEffect(() => {
    if (step === 'dashboard' && calDate) fetchCalSlots();
  }, [calDate, step]);

  const requestOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'request-otp', password }) });
    const d = await r.json();
    if (r.ok) setStep('otp'); else setError(d.error);
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify-otp', otp }) });
    const d = await r.json();
    if (r.ok) { setToken(d.token); localStorage.setItem('adminToken', d.token); }
    else setError(d.error);
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    const d = await api({ action: 'get-submissions' });
    if (d.success) setSubmissions(d.data);
    setLoading(false);
  };

  const fetchCalSlots = async () => {
    setCalLoading(true);
    const d = await api({ action: 'get-calendar-slots', date: calDate });
    if (d.success) { setCalSlots(d.slots); setDayLocked(d.dayLocked); }
    setCalLoading(false);
  };

  const updateStatus = async (trackingId, newStatus) => {
    const note = adminNotes[trackingId] || '';
    const d = await api({ action: 'update-status', trackingId, newStatus, adminNote: note });
    if (d.success) { alert(`Status updated to "${newStatus}" & email sent!`); fetchSubmissions(); }
  };

  const deleteSubmission = async (trackingId) => {
    if (!confirm('Permanently delete this request?')) return;
    const d = await api({ action: 'delete-submission', trackingId });
    if (d.success) fetchSubmissions();
  };

  const saveSlot = async (time, blocked, note) => {
    await api({ action: 'set-slot', date: calDate, time, blocked, note });
    setEditingSlot(null);
    fetchCalSlots();
  };

  const toggleDayLock = async () => {
    await api({ action: 'lock-day', date: calDate, locked: !dayLocked });
    fetchCalSlots();
  };

  const setReminder = async () => {
    if (!reminderTime || !reminderText) return alert('Enter reminder time and text');
    await api({ action: 'set-reminder', date: calDate, time: reminderTime, reminderText });
    alert('Reminder set! Email sent to confirm.');
    setReminderText(''); setReminderTime('');
  };

  const logout = () => { setToken(''); localStorage.removeItem('adminToken'); setStep('password'); };

  if (step !== 'dashboard') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '90%', padding: '40px', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--gold-dim)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '2em', color: 'var(--gold)', marginBottom: '10px' }} />
          <h2 style={{ color: 'var(--gold)', margin: 0 }}>Admin Login</h2>
        </div>
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
        {step === 'password' ? (
          <form onSubmit={requestOtp}>
            <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)}
              required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? 'Sending OTP…' : 'Get OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <p style={{ textAlign: 'center', color: 'gray', marginBottom: '12px', fontSize: '0.9em' }}>OTP sent to your email.</p>
            <input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)}
              required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2em' }} />
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? 'Verifying…' : 'Verify & Login'}</button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5em' }}><i className="fas fa-shield-alt" style={{ color: 'var(--gold)', marginRight: '10px' }}/> Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchSubmissions} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}><i className="fas fa-sync-alt"/></button>
            <button onClick={logout} className="btn" style={{ background: '#ef4444' }}><i className="fas fa-sign-out-alt"/> Logout</button>
          </div>
        </div>

        {/* ── CALENDAR BLOCK SECTION ── */}
        <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-calendar-alt" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Availability Calendar</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" value={calDate} onChange={e => setCalDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }} />
              <button onClick={toggleDayLock} style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85em',
                background: dayLocked ? '#ef4444' : 'var(--bg)', color: 'white',
                border: `1px solid ${dayLocked ? '#ef4444' : 'var(--border)'}`
              }}>
                <i className={`fas fa-${dayLocked ? 'lock-open' : 'lock'}`} style={{ marginRight: '6px' }}/>
                {dayLocked ? 'Unlock Full Day' : 'Lock Full Day'}
              </button>
            </div>
          </div>

          {/* Reminder */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white' }} />
            <input type="text" placeholder="Reminder note (e.g. Faculty Meeting)" value={reminderText} onChange={e => setReminderText(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', minWidth: '160px' }} />
            <button onClick={setReminder} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--gold-dim)' }}>
              <i className="fas fa-bell" style={{ marginRight: '6px' }}/>Set Reminder
            </button>
          </div>

          {calLoading ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gold)' }}><i className="fas fa-spinner fa-spin"/> Loading slots…</div> :
            dayLocked ? <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'center' }}><i className="fas fa-lock" style={{ color: '#ef4444' }}/> Full day is locked. Users cannot book on this date.</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                {calSlots.map(slot => (
                  <div key={slot.time}
                    onClick={() => { setEditingSlot(slot); setSlotNote(slot.note || ''); }}
                    style={{
                      padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                      borderColor: slot.isBooked ? '#3b82f6' : slot.isAdminBlocked ? '#ef4444' : 'var(--border)',
                      background: slot.isBooked ? 'rgba(59,130,246,0.15)' : slot.isAdminBlocked ? 'rgba(239,68,68,0.15)' : 'var(--bg)',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: slot.isBooked ? '#60a5fa' : slot.isAdminBlocked ? '#ef4444' : 'white' }}>
                      {slot.time}
                    </div>
                    {slot.isBooked && slot.bookedBy && (
                      <div style={{ fontSize: '0.75em', color: '#60a5fa', marginTop: '4px' }}>
                        <i className="fas fa-user" style={{ marginRight: '3px' }}/>{slot.bookedBy.name}<br/>
                        <span style={{ opacity: 0.8 }}>{slot.bookedBy.purpose}</span>
                      </div>
                    )}
                    {slot.isAdminBlocked && <div style={{ fontSize: '0.75em', color: '#ef4444', marginTop: '4px' }}><i className="fas fa-lock" style={{ marginRight: '3px' }}/>{slot.note || 'Blocked'}</div>}
                    {!slot.isBooked && !slot.isAdminBlocked && <div style={{ fontSize: '0.75em', color: '#22c55e', marginTop: '4px' }}>Available</div>}
                  </div>
                ))}
              </div>
            )}

          {/* Slot Edit Modal */}
          {editingSlot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '24px', maxWidth: '380px', width: '90%', border: '1px solid var(--gold-dim)' }}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--gold)' }}>{editingSlot.time} — {calDate}</h3>
                <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '12px' }}>
                  {editingSlot.isBooked ? `Booked by ${editingSlot.bookedBy?.name} for ${editingSlot.bookedBy?.purpose}` : 'Click "Block" to mark unavailable with a reason.'}
                </p>
                <textarea placeholder="Note / reason (e.g. Faculty Meeting, Lab Work)" value={slotNote} onChange={e => setSlotNote(e.target.value)}
                  rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => saveSlot(editingSlot.time, true, slotNote)} className="btn" style={{ flex: 1, background: '#ef4444' }}><i className="fas fa-lock"/> Block</button>
                  {editingSlot.isAdminBlocked && <button onClick={() => saveSlot(editingSlot.time, false, '')} className="btn" style={{ flex: 1, background: '#10b981' }}><i className="fas fa-lock-open"/> Unblock</button>}
                  <button onClick={() => setEditingSlot(null)} className="btn" style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SUBMISSIONS TABLE ── */}
        <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 20px 0' }}><i className="fas fa-inbox" style={{ color: 'var(--gold)', marginRight: '8px' }}/> All Submissions ({submissions.length})</h3>
          {loading ? <p style={{ textAlign: 'center' }}>Loading…</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.85em', color: 'gray' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Contact</th>
                  <th style={{ padding: '10px' }}>Timeline</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <>
                    <tr key={sub.trackingId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                      onClick={() => setExpandedId(expandedId === sub.trackingId ? null : sub.trackingId)}>
                      <td style={{ padding: '12px', fontSize: '0.85em', fontFamily: 'monospace', color: 'var(--gold)' }}>{sub.trackingId}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'var(--bg)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8em', color: 'var(--gold)' }}>{(sub.source||'').toUpperCase()}</span>
                        <div style={{ fontSize: '0.78em', color: 'gray', marginTop: '3px' }}>{sub.type}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong style={{ fontSize: '0.9em' }}>{sub.name}</strong><br/>
                        <span style={{ fontSize: '0.78em', color: 'gray' }}><i className="fas fa-envelope" style={{ marginRight: '3px' }}/>{sub.email}</span><br/>
                        {sub.phone && <span style={{ fontSize: '0.78em', color: 'gray' }}><i className="fas fa-phone" style={{ marginRight: '3px' }}/>{sub.phone}</span>}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.85em' }}>
                        {sub.source === 'meeting'
                          ? <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{sub.timeline}<br/><span style={{ color: 'gray', fontSize: '0.85em' }}>{sub.duration} min</span></span>
                          : new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: STATUS_COLORS[sub.status] || '#f59e0b', fontWeight: 'bold', fontSize: '0.9em' }}>{sub.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={e => { e.stopPropagation(); deleteSubmission(sub.trackingId); }}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}
                          title="Delete"><i className="fas fa-trash-alt"/></button>
                      </td>
                    </tr>
                    {/* Expanded detail row */}
                    {expandedId === sub.trackingId && (
                      <tr key={`${sub.trackingId}-expanded`}>
                        <td colSpan="6" style={{ padding: '16px', background: 'rgba(212,175,55,0.05)', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '6px' }}>Agenda / Message:</p>
                              <p style={{ fontSize: '0.9em', background: 'var(--bg)', padding: '10px', borderRadius: '6px', margin: 0, whiteSpace: 'pre-wrap' }}>{sub.detail || sub.message || '—'}</p>
                              {sub.adminNote && (
                                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', border: '1px solid #10b981' }}>
                                  <p style={{ fontSize: '0.8em', color: '#10b981', margin: '0 0 4px 0' }}>Your previous note:</p>
                                  <p style={{ margin: 0, fontSize: '0.9em' }}>{sub.adminNote}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '6px' }}>Update Status with Note:</p>
                              <textarea placeholder="Add a note to the user (optional — shows in their tracking & email)"
                                value={adminNotes[sub.trackingId] || ''}
                                onChange={e => setAdminNotes(p => ({ ...p, [sub.trackingId]: e.target.value }))}
                                rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', marginBottom: '10px' }} />
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Pending Review', 'In Progress', 'Accepted', 'Rejected'].map(s => (
                                  <button key={s} onClick={() => updateStatus(sub.trackingId, s)}
                                    style={{
                                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82em',
                                      background: sub.status === s ? STATUS_COLORS[s] : 'var(--bg)',
                                      color: sub.status === s ? 'white' : 'gray',
                                      border: `1px solid ${STATUS_COLORS[s] || 'var(--border)'}`,
                                      fontWeight: sub.status === s ? 'bold' : 'normal'
                                    }}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
