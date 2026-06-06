import React, { useState, useEffect, useCallback, useRef } from 'react';
import CoverLetterGenerator from './CoverLetterGenerator';
import AIResumeBuilder from './AIResumeBuilder';

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
  const [step, setStep] = useState('password'); // password, otp, forgot-email, forgot-otp, dashboard
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem('adminToken') || '');
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

  // Weekly Timetable state
  const [weeklyTimetable, setWeeklyTimetable] = useState({});
  const [wtDay, setWtDay] = useState('Monday');
  const [wtStart, setWtStart] = useState('08:00 AM');
  const [wtEnd, setWtEnd] = useState('02:00 PM');
  const [wtLabel, setWtLabel] = useState('Job / Class');
  const [editingWtIndex, setEditingWtIndex] = useState(null); // { day, index }

  // Admin Tools Modals
  const [modals, setModals] = useState({ clg: false, resumeAI: false });

  const [filterSource, setFilterSource] = useState('ALL');
  const [reminders, setReminders] = useState([]);

  // New feature state
  const [activeTab, setActiveTab] = useState('submissions'); // submissions | calendar | weekly | tools | analytics | log | availability | testimonials
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [availability, setAvailability] = useState({ status: 'available', message: '' });
  const [availLoading, setAvailLoading] = useState(false);
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const notifPollRef = useRef(null);
  const lastSubmissionCount = useRef(0);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null); // null | {} | {_id,...} (existing)
  const EMPTY_T = { name: '', role: '', org: '', avatar: '', avatarColor: '#D4AF37', rating: 5, text: '', relation: '', date: '' };

  // Doubts state
  const [doubts, setDoubts] = useState([]);
  const [doubtsLoading, setDoubtsLoading] = useState(false);
  const [expandedDoubtId, setExpandedDoubtId] = useState(null);
  const [doubtAnswers, setDoubtAnswers] = useState({}); // { [doubtId]: answerText }
  const [answeringId, setAnsweringId] = useState(null); // id being submitted
  const [doubtFilter, setDoubtFilter] = useState('ALL'); // ALL | Pending | Answered

  // Notification state
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimeout = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type, id: Date.now() });
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const confirmAction = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm: () => { setConfirmDialog(null); onConfirm(); } });
  }, []);

  const logout = useCallback(() => {
    setToken('');
    sessionStorage.removeItem('adminToken');
    setStep('password');
  }, []);

  const api = useCallback(async (body) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, token })
    });
    if (res.status === 401) {
      logout();
      return { success: false, error: 'Unauthorized' };
    }
    return res.json();
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      setStep('dashboard');
      fetchSubmissions();
      fetchWeeklyTimetable();
      fetchReminders();
      fetchAnalytics();
      fetchActivityLog();
      fetchAvailability();
      fetchTestimonials();
      fetchDoubts();
    }
  }, [token]);

  useEffect(() => {
    if (step === 'dashboard' && calDate) fetchCalSlots();
  }, [calDate, step]);

  // Browser notification support check
  useEffect(() => {
    if ('Notification' in window) {
      setNotifSupported(true);
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  // Poll for new submissions every 60s and fire browser notification
  useEffect(() => {
    if (!token || !notifGranted) return;
    notifPollRef.current = setInterval(async () => {
      const d = await api({ action: 'get-submissions' });
      if (d.success) {
        const count = d.data.length;
        if (lastSubmissionCount.current > 0 && count > lastSubmissionCount.current) {
          const newest = d.data[0];
          new Notification("📬 New Portfolio Submission!", {
            body: `${newest.name} submitted a ${newest.source} request.`,
            icon: '/favicon.svg',
            tag: 'portfolio-submission'
          });
        }
        lastSubmissionCount.current = count;
        setSubmissions(d.data);
      }
    }, 60000);
    return () => clearInterval(notifPollRef.current);
  }, [token, notifGranted]);


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
    if (r.ok) { setToken(d.token); sessionStorage.setItem('adminToken', d.token); }
    else setError(d.error);
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    const d = await api({ action: 'get-submissions' });
    if (d.success) { setSubmissions(d.data); lastSubmissionCount.current = d.data.length; }
    setLoading(false);
  };

  const fetchReminders = async () => {
    const d = await api({ action: 'get-reminders' });
    if (d.success) setReminders(d.reminders);
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const r = await fetch('/api/analytics?type=summary');
      const d = await r.json();
      if (d.success) setAnalytics(d.data);
    } catch (e) { console.error(e); }
    setAnalyticsLoading(false);
  };

  const fetchActivityLog = async () => {
    setLogLoading(true);
    const d = await api({ action: 'get-activity-log' });
    if (d.success) setActivityLog(d.log);
    setLogLoading(false);
  };

  const fetchAvailability = async () => {
    try {
      const r = await fetch('/api/availability');
      const d = await r.json();
      if (d.success) setAvailability({ status: d.status, message: d.message || '' });
    } catch (e) { console.error(e); }
  };

  const updateAvailability = async () => {
    setAvailLoading(true);
    try {
      const r = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: availability.status, message: availability.message, token })
      });
      const d = await r.json();
      if (d.success) showToast('Availability updated!');
      else showToast(d.error || 'Failed to update', 'error');
    } catch (e) { showToast('Error updating availability', 'error'); }
    setAvailLoading(false);
  };

  const requestNotifPermission = async () => {
    const perm = await Notification.requestPermission();
    setNotifGranted(perm === 'granted');
    if (perm === 'granted') showToast('Notifications enabled! You will be notified of new submissions.');
    else showToast('Notifications were denied. Please allow them in browser settings.', 'error');
  };

  // ── TESTIMONIALS CRUD ─────────────────────────────────────────────────────
  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const r = await fetch('/api/testimonials');
      const d = await r.json();
      if (d.success) setTestimonials(d.testimonials || []);
    } catch (e) { console.error(e); }
    setTestimonialsLoading(false);
  };

  const fetchDoubts = async () => {
    setDoubtsLoading(true);
    try {
      const r = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-doubts', token })
      });
      const d = await r.json();
      if (d.success) setDoubts(d.doubts || []);
    } catch (e) { console.error(e); }
    setDoubtsLoading(false);
  };

  const answerDoubt = async (doubtId) => {
    const answer = doubtAnswers[doubtId]?.trim();
    if (!answer) return showToast('Please write an answer first', 'error');
    setAnsweringId(doubtId);
    try {
      const r = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer-doubt', token, doubtId, answer })
      });
      const d = await r.json();
      if (d.success) {
        showToast('Answer sent! Email notified the questioner 📧');
        setDoubtAnswers(p => ({ ...p, [doubtId]: '' }));
        setExpandedDoubtId(null);
        fetchDoubts();
      } else {
        showToast(d.error || 'Failed to send answer', 'error');
      }
    } catch (e) { showToast('Error sending answer', 'error'); }
    setAnsweringId(null);
  };

  const deleteDoubt = async (doubtId) => {
    confirmAction('Permanently delete this question?', async () => {
      try {
        const r = await fetch('/api/doubts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete-doubt', token, doubtId })
        });
        const d = await r.json();
        if (d.success) { showToast('Question deleted'); fetchDoubts(); }
        else showToast(d.error || 'Delete failed', 'error');
      } catch (e) { showToast('Error deleting', 'error'); }
    });
  };

  const saveTestimonial = async (data) => {
    const isNew = !data._id;
    const body = {
      action: isNew ? 'add' : 'update',
      token,
      ...data,
      id: data._id
    };
    try {
      const r = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const d = await r.json();
      if (d.success) { setEditingTestimonial(null); fetchTestimonials(); }
      else showToast(d.error || 'Save failed', 'error');
    } catch (e) { showToast('Error saving testimonial', 'error'); }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm('Permanently delete this testimonial?')) return;
    try {
      const r = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', token, id })
      });
      const d = await r.json();
      if (d.success) fetchTestimonials();
      else showToast(d.error || 'Delete failed', 'error');
    } catch (e) { showToast('Error deleting', 'error'); }
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
    if (d.success) { showToast(`Status updated to "${newStatus}" & email sent!`); fetchSubmissions(); }
  };

  const deleteSubmission = async (trackingId) => {
    confirmAction('Permanently delete this request?', async () => {
      const d = await api({ action: 'delete-submission', trackingId });
      if (d.success) fetchSubmissions();
    });
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
    if (!reminderTime || !reminderText) return showToast('Enter reminder time and text', 'error');
    await api({ action: 'set-reminder', date: calDate, time: reminderTime, reminderText });
    showToast('Reminder set! Email sent to confirm.');
    setReminderText(''); setReminderTime('');
    fetchReminders();
  };

  const deleteReminder = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    await api({ action: 'delete-reminder', id });
    fetchReminders();
  };

  const fetchWeeklyTimetable = async () => {
    const d = await api({ action: 'get-weekly-timetable' });
    if (d.success) setWeeklyTimetable(d.timetable);
  };

  const addWeeklyBlock = async () => {
    const action = editingWtIndex ? 'update-weekly-block' : 'add-weekly-block';
    const body = { action, day: wtDay, start: wtStart, end: wtEnd, label: wtLabel };
    if (editingWtIndex) body.index = editingWtIndex.index;
    
    const d = await api(body);
    if (!d.success) return showToast(d.error, 'error');
    
    setEditingWtIndex(null);
    setWtStart('08:00 AM');
    setWtEnd('02:00 PM');
    setWtLabel('Job / Class');
    fetchWeeklyTimetable();
    fetchCalSlots();
  };

  const deleteWeeklyBlock = async (day, index) => {
    if (!confirm('Delete this recurring time block?')) return;
    await api({ action: 'delete-weekly-block', day, index });
    fetchWeeklyTimetable();
    fetchCalSlots();
  };

  const handleEditWeeklyBlock = (day, index, block) => {
    setWtDay(day);
    setWtStart(block.start);
    setWtEnd(block.end);
    setWtLabel(block.label || '');
    setEditingWtIndex({ day, index });
    document.getElementById('weekly-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Password Change Logic ---
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdStep, setPwdStep] = useState('request'); // 'request' or 'verify'
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [pwdOtp, setPwdOtp] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // --- Forgot Password Logic ---
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  const requestForgotPwd = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const d = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'request-forgot-password', email: forgotEmail }) }).then(r => r.json());
    if (d.success) setStep('forgot-otp'); else setError(d.error);
    setLoading(false);
  };

  const resetForgotPwd = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    if (forgotNewPwd !== forgotConfirmPwd) { setError('Passwords do not match'); setLoading(false); return; }
    const d = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset-forgot-password', otp: forgotOtp, newPassword: forgotNewPwd }) }).then(r => r.json());
    if (d.success) {
      showToast('Password reset successful! Please login with your new password.');
      setStep('password');
      setForgotEmail(''); setForgotOtp(''); setForgotNewPwd(''); setForgotConfirmPwd('');
    } else {
      setError(d.error);
    }
    setLoading(false);
  };

  const requestPwdChange = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    if (newPwd !== confirmNewPwd) { setError('New passwords do not match'); setLoading(false); return; }
    const d = await api({ action: 'request-password-change-otp', currentPassword: currentPwd, newPassword: newPwd });
    if (d.success) setPwdStep('verify'); else setError(d.error);
    setLoading(false);
  };

  const verifyPwdChange = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const d = await api({ action: 'verify-password-change-otp', otp: pwdOtp });
    if (d.success) {
      showToast('Password changed successfully! Please log in again.');
      setShowPwdModal(false);
      logout();
    } else {
      setError(d.error);
    }
    setLoading(false);
  };

  if (step !== 'dashboard') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '90%', padding: '40px', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--gold-dim)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '2em', color: 'var(--gold)', marginBottom: '10px' }} />
          <h2 style={{ color: 'var(--gold)', margin: 0 }}>Admin Login</h2>
        </div>
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
        
        {step === 'password' && (
          <form onSubmit={requestOtp}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input type={showPwd ? 'text' : 'password'} placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)}
                required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
              <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '15px', color: 'gray', cursor: 'pointer' }}/>
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginBottom: '12px' }} disabled={loading}>{loading ? 'Sending OTP…' : 'Get OTP'}</button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setStep('forgot-email')} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.85em', cursor: 'pointer', textDecoration: 'underline' }}>Forgot Password?</button>
            </div>
          </form>
        )}
        
        {step === 'otp' && (
          <form onSubmit={verifyOtp}>
            <p style={{ textAlign: 'center', color: 'gray', marginBottom: '12px', fontSize: '0.9em' }}>OTP sent to your email.</p>
            <input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)}
              required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2em' }} />
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? 'Verifying…' : 'Verify & Login'}</button>
          </form>
        )}

        {step === 'forgot-email' && (
          <form onSubmit={requestForgotPwd}>
            <p style={{ textAlign: 'center', color: 'gray', marginBottom: '12px', fontSize: '0.9em' }}>Enter admin email to reset password.</p>
            <input type="email" placeholder="Admin Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
              required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
            <button type="submit" className="btn" style={{ width: '100%', marginBottom: '12px' }} disabled={loading}>{loading ? 'Sending OTP…' : 'Send Reset OTP'}</button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setStep('password')} style={{ background: 'none', border: 'none', color: 'gray', fontSize: '0.85em', cursor: 'pointer' }}>Back to Login</button>
            </div>
          </form>
        )}

        {step === 'forgot-otp' && (
          <form onSubmit={resetForgotPwd}>
            <p style={{ textAlign: 'center', color: 'gray', marginBottom: '12px', fontSize: '0.9em' }}>OTP sent! Set your new password.</p>
            <input type="text" placeholder="6-digit OTP" value={forgotOtp} onChange={e => setForgotOtp(e.target.value)}
              required style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2em' }} />
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input type={showForgotPwd ? 'text' : 'password'} placeholder="New Password" value={forgotNewPwd} onChange={e => setForgotNewPwd(e.target.value)}
                required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
              <i className={`fas ${showForgotPwd ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowForgotPwd(!showForgotPwd)} style={{ position: 'absolute', right: '12px', top: '15px', color: 'gray', cursor: 'pointer' }}/>
            </div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input type={showForgotPwd ? 'text' : 'password'} placeholder="Confirm New Password" value={forgotConfirmPwd} onChange={e => setForgotConfirmPwd(e.target.value)}
                required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', background: '#10b981', color: 'white' }} disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5em' }}><i className="fas fa-shield-alt" style={{ color: 'var(--gold)', marginRight: '10px' }}/> Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {notifSupported && (
              <button onClick={notifGranted ? () => showToast('Notifications already enabled!') : requestNotifPermission}
                className="btn" style={{ background: notifGranted ? '#10b981' : 'var(--surface-2)', border: `1px solid ${notifGranted ? '#10b981' : 'var(--border)'}`, color: 'white', fontSize: '0.82em' }}>
                <i className={`fas fa-bell${notifGranted ? '' : '-slash'}`}/> {notifGranted ? 'Notifs ON' : 'Enable Notifs'}
              </button>
            )}
            <button onClick={() => { setShowPwdModal(true); setPwdStep('request'); setError(''); setCurrentPwd(''); setNewPwd(''); setPwdOtp(''); }} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white' }}><i className="fas fa-key"/> Change Password</button>
            <button onClick={fetchSubmissions} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white' }}><i className="fas fa-sync-alt"/></button>
            <button onClick={logout} className="btn" style={{ background: '#ef4444' }}><i className="fas fa-sign-out-alt"/> Logout</button>
          </div>
        </div>

        {/* Analytics Quick Stats */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total Visits', value: analytics.totalVisits, icon: 'fa-eye', color: '#3b82f6' },
              { label: 'Today', value: analytics.todayVisits, icon: 'fa-calendar-day', color: '#10b981' },
              { label: 'This Week', value: analytics.weekVisits, icon: 'fa-chart-line', color: '#f59e0b' },
              { label: 'Unique (30d)', value: analytics.uniqueVisitors, icon: 'fa-users', color: '#8b5cf6' },
              { label: 'Submissions', value: submissions.length, icon: 'fa-inbox', color: '#D4AF37' },
              { label: 'Pending', value: submissions.filter(s => s.status === 'Pending Review').length, icon: 'fa-clock', color: '#ef4444' }
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '16px', border: `1px solid ${stat.color}30`, textAlign: 'center' }}>
                <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: '1.2em', marginBottom: '6px', display: 'block' }} />
                <div style={{ fontSize: '1.6em', fontWeight: 800, color: stat.color }}>{stat.value ?? '—'}</div>
                <div style={{ fontSize: '0.72em', color: 'gray' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        {(() => {
          const tabs = [
            { id: 'submissions', icon: 'fa-inbox', label: 'Submissions' },
            { id: 'doubts', icon: 'fa-question-circle', label: 'Doubts', badge: doubts.filter(d => d.status === 'Pending').length },
            { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendar' },
            { id: 'weekly', icon: 'fa-clock', label: 'Schedule' },
            { id: 'availability', icon: 'fa-circle-check', label: 'Availability' },
            { id: 'testimonials', icon: 'fa-star', label: 'Testimonials' },
            { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
            { id: 'log', icon: 'fa-list-alt', label: 'Activity Log' },
            { id: 'tools', icon: 'fa-toolbox', label: 'Tools' },
          ];
          return (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', padding: '6px', background: 'var(--surface-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.82em', fontWeight: 600, border: 'none',
                    background: activeTab === t.id ? (t.id === 'doubts' ? '#8b5cf6' : 'var(--gold)') : 'transparent',
                    color: activeTab === t.id ? (t.id === 'doubts' ? '#fff' : '#111') : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s', position: 'relative'
                  }}>
                  <i className={`fas ${t.icon}`} />{t.label}
                  {t.badge > 0 && (
                    <span style={{
                      background: '#ef4444', color: '#fff', fontSize: '0.7em', fontWeight: 800,
                      borderRadius: '10px', padding: '1px 6px', minWidth: '16px', textAlign: 'center'
                    }}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>
          );
        })()}

        {/* ── TOOLS TAB ── */}
        {activeTab === 'tools' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}><i className="fas fa-toolbox" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Admin Tools</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn hero-btn-outline" onClick={() => setModals(p => ({ ...p, resumeAI: true }))}>
                <i className="fas fa-robot" /> AI Resume Tailor
              </button>
              <button className="btn hero-btn-outline" onClick={() => setModals(p => ({ ...p, clg: true }))}>
                <i className="fas fa-magic" /> Cover Letter
              </button>
            </div>
          </div>
        )}

        {/* ── DOUBTS TAB ── */}
        {activeTab === 'doubts' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '30px', boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}>
                  <i className="fas fa-question-circle" style={{ color: '#fff', fontSize: '1.1em' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-bright)' }}>Doubt Clarification Center</h3>
                  <p style={{ margin: 0, fontSize: '0.78em', color: 'rgba(255,255,255,0.45)' }}>{doubts.filter(d => d.status === 'Pending').length} pending · {doubts.filter(d => d.status === 'Answered').length} answered</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Filter Buttons */}
                {['ALL', 'Pending', 'Answered'].map(f => (
                  <button key={f} onClick={() => setDoubtFilter(f)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 700,
                      cursor: 'pointer', border: `1px solid ${doubtFilter === f ? '#8b5cf6' : 'var(--border)'}`,
                      background: doubtFilter === f ? 'rgba(139,92,246,0.25)' : 'var(--bg)',
                      color: doubtFilter === f ? '#a78bfa' : 'gray', transition: 'all 0.2s'
                    }}>
                    {f}
                  </button>
                ))}
                <button onClick={fetchDoubts} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'white', fontSize: '0.82em' }}>
                  <i className="fas fa-sync-alt" /> Refresh
                </button>
              </div>
            </div>

            {/* Doubts List */}
            {doubtsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b5cf6' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5em', marginBottom: '10px', display: 'block' }} />
                Loading questions…
              </div>
            ) : doubts.filter(d => doubtFilter === 'ALL' || d.status === doubtFilter).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'gray' }}>
                <i className="fas fa-question-circle" style={{ fontSize: '2.5em', marginBottom: '16px', display: 'block', opacity: 0.25, color: '#8b5cf6' }} />
                <p style={{ fontSize: '0.9em' }}>No {doubtFilter === 'ALL' ? '' : doubtFilter.toLowerCase()} questions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {doubts
                  .filter(d => doubtFilter === 'ALL' || d.status === doubtFilter)
                  .map(doubt => (
                    <div key={doubt.doubtId} style={{
                      background: 'var(--bg)', borderRadius: '14px',
                      border: `1px solid ${doubt.status === 'Answered' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.25)'}`,
                      overflow: 'hidden', transition: 'all 0.2s'
                    }}>
                      {/* Doubt Header Row */}
                      <div
                        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '14px' }}
                        onClick={() => setExpandedDoubtId(expandedDoubtId === doubt.doubtId ? null : doubt.doubtId)}
                      >
                        {/* Status indicator */}
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                          background: doubt.status === 'Answered' ? '#10b981' : '#f59e0b',
                          boxShadow: `0 0 8px ${doubt.status === 'Answered' ? '#10b981' : '#f59e0b'}60`
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.78em', color: '#8b5cf6', fontWeight: 700 }}>{doubt.doubtId}</span>
                            <span style={{ fontSize: '0.73em', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.25)' }}>{doubt.category}</span>
                            <span style={{ fontSize: '0.73em', color: doubt.status === 'Answered' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{doubt.status === 'Answered' ? '✅ Answered' : '⏳ Pending'}</span>
                            {doubt.isPublic && <span style={{ fontSize: '0.72em', color: '#60a5fa' }}>🌍 Public</span>}
                            <span style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.92em', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '4px' }}>{doubt.subject}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.55)' }}>{doubt.name} · {doubt.email}</span>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={e => { e.stopPropagation(); deleteDoubt(doubt.doubtId); }}
                            style={{ background: 'transparent', border: 'none', color: '#ef444480', cursor: 'pointer', padding: '4px 8px', transition: 'color 0.2s' }}
                            title="Delete"
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#ef444480'}
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                          <i className={`fas fa-chevron-${expandedDoubtId === doubt.doubtId ? 'up' : 'down'}`} style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center', fontSize: '0.8em' }} />
                        </div>
                      </div>

                      {/* Expanded Panel */}
                      {expandedDoubtId === doubt.doubtId && (
                        <div style={{ borderTop: '1px solid rgba(139,92,246,0.15)', padding: '20px' }}>
                          {/* Full Question */}
                          <div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(139,92,246,0.15)', marginBottom: '16px' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.75em', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Full Question</p>
                            <p style={{ margin: 0, fontSize: '0.9em', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{doubt.question}</p>
                          </div>

                          {/* Existing Answer */}
                          {doubt.answer && (
                            <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '16px' }}>
                              <p style={{ margin: '0 0 8px 0', fontSize: '0.75em', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>✅ Krishna's Answer</p>
                              <p style={{ margin: 0, fontSize: '0.9em', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{doubt.answer}</p>
                              <p style={{ margin: '10px 0 0 0', fontSize: '0.72em', color: 'rgba(255,255,255,0.3)' }}>Answered on {new Date(doubt.answeredAt).toLocaleString()}</p>
                            </div>
                          )}

                          {/* Answer Form */}
                          <div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.82em', color: 'rgba(255,255,255,0.6)' }}>
                              {doubt.answer ? '📝 Update your answer (will re-notify the user):' : '📝 Write your answer (user will be notified via email):'}
                            </p>
                            <textarea
                              rows={5}
                              placeholder="Type your detailed answer here…"
                              value={doubtAnswers[doubt.doubtId] || ''}
                              onChange={e => setDoubtAnswers(p => ({ ...p, [doubt.doubtId]: e.target.value }))}
                              style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid rgba(139,92,246,0.35)',
                                background: 'var(--surface-2)', color: 'white',
                                boxSizing: 'border-box', marginBottom: '12px',
                                resize: 'vertical', lineHeight: 1.6, fontSize: '0.9em',
                                outline: 'none', transition: 'border-color 0.2s'
                              }}
                              onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                              onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.35)'}
                            />
                            <button
                              onClick={() => answerDoubt(doubt.doubtId)}
                              disabled={!doubtAnswers[doubt.doubtId]?.trim() || answeringId === doubt.doubtId}
                              style={{
                                background: answeringId === doubt.doubtId ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                                color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '30px',
                                cursor: 'pointer', fontWeight: 700, fontSize: '0.9em',
                                boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                              }}
                            >
                              {answeringId === doubt.doubtId ? (
                                <><i className="fas fa-spinner fa-spin" />Sending Answer…</>
                              ) : (
                                <><i className="fas fa-paper-plane" />{doubt.answer ? 'Update & Re-notify' : 'Send Answer & Notify User'}</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR BLOCK SECTION ── */}
        {activeTab === 'calendar' && <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
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
            <button onClick={setReminder} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--gold-dim)', color: 'white' }}>
              <i className="fas fa-bell" style={{ marginRight: '6px' }}/>Set Reminder
            </button>
            <button onClick={() => {
              // Google Calendar Sync: open add event for selected date
              const title = encodeURIComponent('Available Slot - Krishna Teja Portfolio');
              const date = calDate.replace(/-/g, '');
              const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${encodeURIComponent('Booked via portfolio calendar')}`;
              window.open(url, '_blank');
            }} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid #4285f4', color: '#4285f4' }}>
              <i className="fab fa-google" style={{ marginRight: '6px' }}/>Sync to Google Calendar
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

          {reminders.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--gold)', fontSize: '0.9em' }}><i className="fas fa-bell" style={{ marginRight: '6px' }}/> Active Reminders</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reminders.map(rem => (
                  <div key={rem._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '0.85em', color: '#60a5fa' }}>{rem.date} at {rem.time}</strong>
                      <div style={{ fontSize: '0.85em', marginTop: '4px' }}>{rem.reminderText}</div>
                    </div>
                    <button onClick={() => deleteReminder(rem._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete Reminder"><i className="fas fa-trash-alt"/></button>
                  </div>
                ))}
              </div>
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
                  <button onClick={() => setEditingSlot(null)} className="btn" style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'white' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>}

        {/* ── WEEKLY RECURRING TIMETABLE ── */}
        {activeTab === 'weekly' && <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}><i className="fas fa-clock" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Weekly Recurring Schedule</h3>
          <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '20px' }}>Set your recurring busy hours (e.g., job or classes). These will automatically block slots every week on the selected day.</p>
          
          <div id="weekly-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.8em', color: 'gray' }}>Day</label>
              <select value={wtDay} onChange={e => setWtDay(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '100px' }}>
              <label style={{ fontSize: '0.8em', color: 'gray' }}>Start Time</label>
              <select value={wtStart} onChange={e => setWtStart(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white' }}>
                {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '100px' }}>
              <label style={{ fontSize: '0.8em', color: 'gray' }}>End Time</label>
              <select value={wtEnd} onChange={e => setWtEnd(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white' }}>
                {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2, minWidth: '150px' }}>
              <label style={{ fontSize: '0.8em', color: 'gray' }}>Label (e.g. Work)</label>
              <input type="text" value={wtLabel} onChange={e => setWtLabel(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button onClick={addWeeklyBlock} className="btn" style={{ background: editingWtIndex ? '#3b82f6' : 'var(--gold)', color: editingWtIndex ? 'white' : '#111', padding: '10px 20px', height: '40px' }}>
                <i className={`fas ${editingWtIndex ? 'fa-save' : 'fa-plus'}`}/> {editingWtIndex ? 'Update' : 'Add'}
              </button>
              {editingWtIndex && (
                <button onClick={() => setEditingWtIndex(null)} className="btn" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white', padding: '10px', height: '40px' }}>
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              weeklyTimetable[day] && weeklyTimetable[day].length > 0 && (
                <div key={day} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--gold)', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>{day}</h4>
                  {weeklyTimetable[day].map((block, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '0.85em' }}>
                      <div>
                        <strong style={{ color: 'white' }}>{block.start} - {block.end}</strong>
                        <div style={{ color: 'gray', fontSize: '0.9em' }}>{block.label}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditWeeklyBlock(day, idx, block)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><i className="fas fa-edit"/></button>
                        <button onClick={() => deleteWeeklyBlock(day, idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-times"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>}

        {/* ── AVAILABILITY STATUS TAB ── */}
        {activeTab === 'availability' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}><i className="fas fa-circle-check" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Public Availability Status</h3>
            <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '20px' }}>This status is shown publicly on your portfolio as a colored widget. Update it to reflect your current availability.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[['available','Available','#10b981'],['busy','Busy','#f59e0b'],['away','Away','#6366f1'],['dnd','Do Not Disturb','#ef4444']].map(([s, label, color]) => (
                <button key={s} onClick={() => setAvailability(p => ({ ...p, status: s }))}
                  style={{ padding: '10px 20px', borderRadius: '24px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85em', border: `2px solid ${color}`, background: availability.status === s ? color : 'transparent', color: availability.status === s ? '#fff' : color, transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
            <textarea value={availability.message} onChange={e => setAvailability(p => ({ ...p, message: e.target.value }))}
              placeholder="Status message shown on portfolio (e.g. Open to opportunities! Feel free to reach out.)" rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', marginBottom: '16px', resize: 'vertical' }} />
            <button onClick={updateAvailability} disabled={availLoading} className="btn" style={{ background: 'var(--gold)', color: '#111', fontWeight: 700 }}>
              <i className="fas fa-save" style={{ marginRight: '6px' }}/>{availLoading ? 'Saving…' : 'Save Availability'}
            </button>
          </div>
        )}

        {/* ── TESTIMONIALS TAB ── */}
        {activeTab === 'testimonials' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-star" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Manage Testimonials</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={fetchTestimonials} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'white', fontSize: '0.82em' }}>
                  <i className="fas fa-sync-alt"/> Refresh
                </button>
                <button onClick={() => setEditingTestimonial({ ...EMPTY_T })} className="btn" style={{ background: 'var(--gold)', color: '#111', fontWeight: 700 }}>
                  <i className="fas fa-plus" style={{ marginRight: '6px' }}/> Add Testimonial
                </button>
              </div>
            </div>

            {/* Add / Edit form */}
            {editingTestimonial && (() => {
              const et = editingTestimonial;
              const set = (k, v) => setEditingTestimonial(p => ({ ...p, [k]: v }));
              const isNew = !et._id;
              const COLORS = ['#D4AF37','#10b981','#3b82f6','#6366f1','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
              return (
                <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '20px', border: '1px solid var(--gold-dim)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: 'var(--gold)' }}>{isNew ? '➕ Add New Testimonial' : '✏️ Edit Testimonial'}</h4>
                    <button onClick={() => setEditingTestimonial(null)} style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', fontSize: '1.1em' }}><i className="fas fa-times"/></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Name *</label>
                      <input value={et.name} onChange={e => { set('name', e.target.value); if (!et._id) set('avatar', e.target.value.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()); }}
                        placeholder="Dr. Jane Smith" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Role / Title</label>
                      <input value={et.role} onChange={e => set('role', e.target.value)}
                        placeholder="Professor, Dept. of Biotechnology" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Organisation</label>
                      <input value={et.org} onChange={e => set('org', e.target.value)}
                        placeholder="VIT University" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Relation</label>
                      <input value={et.relation} onChange={e => set('relation', e.target.value)}
                        placeholder="Academic Mentor" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Avatar Initials</label>
                      <input value={et.avatar} onChange={e => set('avatar', e.target.value.slice(0,3).toUpperCase())}
                        placeholder="JS" maxLength={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box', letterSpacing: '2px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Date</label>
                      <input value={et.date} onChange={e => set('date', e.target.value)}
                        placeholder="March 2025" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  {/* Star rating */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '6px' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(i => (
                        <i key={i} className="fas fa-star" onClick={() => set('rating', i)}
                          style={{ fontSize: '1.3em', color: i <= et.rating ? '#D4AF37' : 'rgba(212,175,55,0.2)', cursor: 'pointer', transition: 'color 0.15s' }} />
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '0.85em', color: 'gray', alignSelf: 'center' }}>{et.rating}/5</span>
                    </div>
                  </div>

                  {/* Avatar color */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '6px' }}>Avatar Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => set('avatarColor', c)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: et.avatarColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', outline: 'none' }} />
                      ))}
                      {/* Preview */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: et.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8em', color: '#fff', marginLeft: '8px', border: `2px solid ${et.avatarColor}80` }}>
                        {et.avatar || 'AB'}
                      </div>
                    </div>
                  </div>

                  {/* Testimonial text */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', marginBottom: '4px' }}>Testimonial Text *</label>
                    <textarea value={et.text} onChange={e => set('text', e.target.value)} rows={4}
                      placeholder="Write the testimonial here…"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }} />
                    <div style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{et.text.length} characters</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => saveTestimonial(et)} className="btn" style={{ background: 'var(--gold)', color: '#111', fontWeight: 700 }}
                      disabled={!et.name || !et.text}>
                      <i className="fas fa-save" style={{ marginRight: '6px' }}/>{isNew ? 'Add Testimonial' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditingTestimonial(null)} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'white' }}>Cancel</button>
                  </div>
                </div>
              );
            })()}

            {/* Testimonials list */}
            {testimonialsLoading
              ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold)' }}><i className="fas fa-spinner fa-spin"/> Loading…</div>
              : testimonials.length === 0
                ? <div style={{ textAlign: 'center', padding: '40px', color: 'gray' }}>
                    <i className="fas fa-star" style={{ fontSize: '2em', marginBottom: '12px', display: 'block', opacity: 0.3 }}/>
                    No testimonials yet. Click "Add Testimonial" to get started.
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {testimonials.map((t, idx) => (
                      <div key={t._id} style={{
                        background: 'var(--bg)', borderRadius: '12px', padding: '16px 20px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', gap: '14px', alignItems: 'flex-start'
                      }}>
                        {/* Avatar */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: t.avatarColor || '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85em', color: '#fff', flexShrink: 0 }}>
                          {t.avatar || t.name?.slice(0,2)}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95em' }}>{t.name}</span>
                            <span style={{ fontSize: '0.75em', color: t.avatarColor || 'var(--gold)' }}>{t.role}</span>
                            {t.org && <span style={{ fontSize: '0.72em', color: 'gray' }}>· {t.org}</span>}
                            {/* Stars */}
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                              {[1,2,3,4,5].map(i => <i key={i} className="fas fa-star" style={{ color: i <= (t.rating||5) ? '#D4AF37' : 'rgba(212,175,55,0.2)', fontSize: '0.75em' }}/>)}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.83em', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontStyle: 'italic' }}>
                            "{t.text?.slice(0, 120)}{t.text?.length > 120 ? '…' : ''}"
                          </p>
                          <div style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.3)' }}>
                            {t.relation && <span style={{ marginRight: '10px' }}>{t.relation}</span>}
                            {t.date && <span>{t.date}</span>}
                          </div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button onClick={() => setEditingTestimonial({ ...t })}
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--gold)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.82em', fontWeight: 600 }}>
                            <i className="fas fa-edit" style={{ marginRight: '4px' }}/>Edit
                          </button>
                          <button onClick={() => deleteTestimonial(t._id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.82em', fontWeight: 600 }}>
                            <i className="fas fa-trash" style={{ marginRight: '4px' }}/>Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-chart-bar" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Portfolio Visitor Analytics</h3>
              <button onClick={fetchAnalytics} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'white', fontSize: '0.82em' }}><i className="fas fa-sync-alt"/> Refresh</button>
            </div>
            {analyticsLoading ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold)' }}><i className="fas fa-spinner fa-spin"/> Loading…</div> : analytics ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {[{label:'Total Visits',value:analytics.totalVisits,color:'#3b82f6'},{label:'Today',value:analytics.todayVisits,color:'#10b981'},{label:'This Week',value:analytics.weekVisits,color:'#f59e0b'},{label:'This Month',value:analytics.monthVisits,color:'#8b5cf6'},{label:'Unique (30d)',value:analytics.uniqueVisitors,color:'#D4AF37'}].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: `1px solid ${s.color}30` }}>
                      <div style={{ fontSize: '2em', fontWeight: 800, color: s.color }}>{s.value ?? 0}</div>
                      <div style={{ fontSize: '0.78em', color: 'gray', marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {analytics.dailyChart?.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '12px', fontSize: '0.9em' }}>Last 7 Days</h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '80px' }}>
                      {analytics.dailyChart.map(d => {
                        const max = Math.max(...analytics.dailyChart.map(x => x.count), 1);
                        return (
                          <div key={d.date} title={`${d.date}: ${d.count} visits`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '100%', background: 'var(--gold)', borderRadius: '4px 4px 0 0', height: `${(d.count / max) * 60}px`, minHeight: '4px' }} />
                            <div style={{ fontSize: '0.65em', color: 'gray' }}>{d.date.slice(5)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {analytics.topPages?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '12px', fontSize: '0.9em' }}>Top Pages</h4>
                    {analytics.topPages.map(p => (
                      <div key={p.page} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: '6px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85em' }}>{p.page || '/'}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85em' }}>{p.count} visits</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : <p style={{ color: 'gray', textAlign: 'center' }}>No analytics data yet. Visits will be tracked automatically.</p>}
          </div>
        )}

        {/* ── ACTIVITY LOG TAB ── */}
        {activeTab === 'log' && (
          <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-list-alt" style={{ color: 'var(--gold)', marginRight: '8px' }}/> Activity Log</h3>
              <button onClick={fetchActivityLog} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'white', fontSize: '0.82em' }}><i className="fas fa-sync-alt"/> Refresh</button>
            </div>
            {logLoading ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold)' }}><i className="fas fa-spinner fa-spin"/> Loading…</div> : activityLog.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                {activityLog.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <i className={`fas ${entry.action === 'new_submission' ? 'fa-inbox' : 'fa-shield-alt'}`} style={{ color: entry.action === 'new_submission' ? '#D4AF37' : '#6366f1', width: '16px' }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85em', fontWeight: 600 }}>{(entry.action || '').replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.75em', color: 'gray' }}>{entry.name || entry.detail || entry.trackingId || ''}</div>
                    </div>
                    <div style={{ fontSize: '0.72em', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'gray', textAlign: 'center' }}>No activity logged yet.</p>}
          </div>
        )}

        {/* ── SUBMISSIONS TABLE ── */}
        {activeTab === 'submissions' && <div style={{ background: 'var(--surface-2)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}><i className="fas fa-inbox" style={{ color: 'var(--gold)', marginRight: '8px' }}/> All Submissions ({submissions.length})</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['ALL', 'HIRE', 'HIRE-KRISHNA', 'MEETING', 'COLLABORATION'].map(f => (
                <button key={f} onClick={() => setFilterSource(f)} style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold', cursor: 'pointer',
                  background: filterSource === f ? 'var(--gold)' : 'var(--bg)',
                  color: filterSource === f ? '#111' : 'gray',
                  border: `1px solid ${filterSource === f ? 'var(--gold)' : 'var(--border)'}`,
                  transition: 'all 0.2s'
                }}>{f}</button>
              ))}
            </div>
          </div>
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
                {submissions.filter(s => filterSource === 'ALL' || (s.source || '').toUpperCase() === filterSource).map(sub => (
                  <React.Fragment key={sub.trackingId}>
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
                  </React.Fragment>
                ))}
                {submissions.filter(s => filterSource === 'ALL' || (s.source || '').toUpperCase() === filterSource).length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>}
      </div>
      
      {/* Password Change Modal */}
      {showPwdModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '30px', maxWidth: '400px', width: '90%', border: '1px solid var(--gold-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--gold)' }}><i className="fas fa-key" style={{ marginRight: '8px' }}/> Change Password</h3>
              <button onClick={() => setShowPwdModal(false)} style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', fontSize: '1.2em' }}><i className="fas fa-times"/></button>
            </div>
            
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '12px', fontSize: '0.9em' }}>{error}</p>}
            
            {pwdStep === 'request' ? (
              <form onSubmit={requestPwdChange}>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <input type={showCurrentPwd ? 'text' : 'password'} placeholder="Current Password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                    required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
                  <i className={`fas ${showCurrentPwd ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowCurrentPwd(!showCurrentPwd)} style={{ position: 'absolute', right: '12px', top: '15px', color: 'gray', cursor: 'pointer' }}/>
                </div>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <input type={showNewPwd ? 'text' : 'password'} placeholder="New Password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
                  <i className={`fas ${showNewPwd ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: '12px', top: '15px', color: 'gray', cursor: 'pointer' }}/>
                </div>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input type={showNewPwd ? 'text' : 'password'} placeholder="Confirm New Password" value={confirmNewPwd} onChange={e => setConfirmNewPwd(e.target.value)}
                    required style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', background: 'var(--gold)', color: '#111' }} disabled={loading}>{loading ? 'Sending OTP…' : 'Request OTP'}</button>
              </form>
            ) : (
              <form onSubmit={verifyPwdChange}>
                <p style={{ textAlign: 'center', color: 'gray', marginBottom: '16px', fontSize: '0.9em' }}>An OTP has been sent to your admin email.</p>
                <input type="text" placeholder="6-digit OTP" value={pwdOtp} onChange={e => setPwdOtp(e.target.value)}
                  required style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2em' }} />
                <button type="submit" className="btn" style={{ width: '100%', background: '#10b981', color: 'white' }} disabled={loading}>{loading ? 'Verifying…' : 'Verify & Update Password'}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tool Modals */}
      <CoverLetterGenerator isOpen={modals.clg} onClose={() => setModals(p => ({ ...p, clg: false }))} />
      <AIResumeBuilder isOpen={modals.resumeAI} onClose={() => setModals(p => ({ ...p, resumeAI: false }))} />

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div key={toast.id} style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: 'white', padding: '14px 24px', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontWeight: 600, fontSize: '0.95em', border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
          animation: 'toast-slide-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`} style={{ fontSize: '1.2em' }} />
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '8px', cursor: 'pointer', opacity: 0.7 }}><i className="fas fa-times" /></button>
        </div>
      )}

      {/* ── CONFIRMATION MODAL ── */}
      {confirmDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fade-in 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', padding: '30px', borderRadius: '16px',
            border: '1px solid var(--border)', maxWidth: '400px', width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center'
          }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8em', margin: '0 auto 20px' }}>
              <i className="fas fa-exclamation-triangle" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: 'white' }}>Are you sure?</h3>
            <p style={{ margin: '0 0 24px 0', color: 'gray', fontSize: '0.95em', lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn" onClick={() => setConfirmDialog(null)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'white', flex: 1 }}>
                Cancel
              </button>
              <button className="btn" onClick={confirmDialog.onConfirm} style={{ background: '#ef4444', color: 'white', flex: 1, border: 'none' }}>
                Yes, Do it
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-slide-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
