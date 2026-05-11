import { useState } from 'react';

export default function TrackingWidget({ isOpen, onClose }) {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, result, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setStatus('loading');
    try {
      const res = await fetch(`/api/track?id=${trackingId.trim()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
        setStatus('result');
      } else {
        setErrorMsg(data.error || 'Tracking ID not found');
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
      setStatus('error');
    }
  };

  const getStatusColor = (s) => {
    if (s === 'Accepted') return '#10b981';
    if (s === 'Rejected') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-search-location" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Track Your Request</strong>
              <span>Enter your Tracking ID below</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="e.g. KT-123456" 
              value={trackingId} 
              onChange={e => setTrackingId(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }}
              required
            />
            <button type="submit" className="btn" disabled={status === 'loading'}>
              {status === 'loading' ? <i className="fas fa-spinner fa-spin" /> : 'Track'}
            </button>
          </form>

          {status === 'error' && (
            <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', textAlign: 'center' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }} />
              {errorMsg}
            </div>
          )}

          {status === 'result' && result && (
            <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--gold-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9em', color: 'gray' }}>Status</span>
                <span style={{ 
                  background: `${getStatusColor(result.status)}20`, 
                  color: getStatusColor(result.status), 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  fontWeight: 'bold',
                  fontSize: '0.9em'
                }}>
                  {result.status}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9em', color: 'gray', display: 'block', marginBottom: '4px' }}>Request Type</span>
                <strong style={{ color: 'white' }}>{result.source === 'collaboration' ? result.type : 'General Contact'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.9em', color: 'gray', display: 'block', marginBottom: '4px' }}>Submitted On</span>
                <strong style={{ color: 'white' }}>{new Date(result.createdAt).toLocaleDateString()}</strong>
              </div>
              <p style={{ marginTop: '20px', fontSize: '0.85em', color: 'gray', textAlign: 'center' }}>
                If you have questions, please email directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
