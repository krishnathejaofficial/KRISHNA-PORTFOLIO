import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [step, setStep] = useState('password'); // password, otp, dashboard
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      setStep('dashboard');
      fetchSubmissions();
    }
  }, [token]);

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-otp', password })
      });
      const data = await res.json();
      if (res.ok) setStep('otp');
      else setError(data.error);
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', otp })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else setError(data.error);
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-submissions', token })
      });
      const data = await res.json();
      if (res.ok) setSubmissions(data.data);
      else if (res.status === 401) logout();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (trackingId, newStatus) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-status', token, trackingId, newStatus })
      });
      if (res.ok) fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    setStep('password');
    setSubmissions([]);
  };

  const renderLogin = () => (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--gold-dim)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--gold)' }}>Admin Secure Login</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
      
      {step === 'password' ? (
        <form onSubmit={requestOtp}>
          <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }} />
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? 'Sending OTP...' : 'Login'}</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <p style={{ marginBottom: '15px', textAlign: 'center', fontSize: '0.9em' }}>An OTP has been sent to your email.</p>
          <input type="text" placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }} />
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
        </form>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2><i className="fas fa-shield-alt" style={{ color: 'var(--gold)', marginRight: '10px' }}/> Admin Dashboard</h2>
        <div>
          <button onClick={fetchSubmissions} className="btn" style={{ marginRight: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}><i className="fas fa-sync-alt"/></button>
          <button onClick={logout} className="btn" style={{ background: '#ef4444' }}><i className="fas fa-sign-out-alt"/> Logout</button>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
        {loading ? <p style={{ textAlign: 'center' }}>Loading submissions...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.trackingId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontSize: '0.9em' }}>{sub.trackingId}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', color: 'var(--gold)' }}>
                      {sub.source.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{sub.name} <br/><span style={{ fontSize: '0.8em', color: 'gray' }}>{sub.email}</span></td>
                  <td style={{ padding: '12px', fontSize: '0.85em' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      color: sub.status === 'Accepted' ? '#10b981' : sub.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                      fontWeight: 'bold', fontSize: '0.9em'
                    }}>{sub.status}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={sub.status} 
                      onChange={(e) => updateStatus(sub.trackingId, e.target.value)}
                      style={{ padding: '6px', background: 'var(--bg)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No submissions found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '20px' }}>
      {step === 'dashboard' ? renderDashboard() : renderLogin()}
    </div>
  );
}
