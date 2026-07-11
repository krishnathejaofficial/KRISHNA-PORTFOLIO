import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export default function TrackingWidget({ isOpen, onClose }) {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, result, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const scannerRef = useRef(null);
  const barcodeCanvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Scanner cleanup failed", err));
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'result' && result?.trackingId) {
      // Generate QR Code dynamically
      const trackUrl = `${window.location.origin}/?track=${result.trackingId}`;
      QRCode.toDataURL(trackUrl, { width: 220, margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error("QR Code generation failed:", err));

      // Generate Barcode on Canvas
      setTimeout(() => {
        if (barcodeCanvasRef.current) {
          try {
            JsBarcode(barcodeCanvasRef.current, result.trackingId, {
              format: "CODE128",
              width: 1.8,
              height: 45,
              displayValue: true,
              fontSize: 13,
              margin: 8,
              background: "#ffffff",
              lineColor: "#000000"
            });
          } catch (err) {
            console.error("Barcode generation failed:", err);
          }
        }
      }, 150);
    }
  }, [status, result]);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!trackingId.trim()) return;
    await triggerTrackDirectly(trackingId.trim());
  };

  const triggerTrackDirectly = async (idToTrack) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/track?id=${idToTrack}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
        setStatus('result');
      } else {
        setErrorMsg(data.error || 'Tracking ID not found');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
      setStatus('error');
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setErrorMsg('');
    setStatus('idle');
    setResult(null);
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // Success
            let val = decodedText.trim();
            if (val.includes('?track=')) {
              const parts = val.split('?track=');
              if (parts.length > 1) {
                val = parts[1].split('&')[0];
              }
            }
            setTrackingId(val);
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(100);
            stopScanner();
            triggerTrackDirectly(val);
          },
          () => {
            // Scanning in progress...
          }
        );
      } catch (err) {
        console.error("Camera scanner start failed:", err);
        setErrorMsg("Failed to access camera. Please enter your ID manually.");
        setStatus('error');
        setIsScanning(false);
      }
    }, 150);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Camera stop failed:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const getStatusColor = (s) => {
    if (s === 'Accepted') return '#10b981';
    if (s === 'Rejected') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-search-location" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>Track Your Request</strong>
              <span>Enter or scan your Tracking ID below</span>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}><i className="fas fa-times" /></button>
        </div>

        <div className="modal-body">
          {!isScanning ? (
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="e.g. KT-123456" 
                value={trackingId} 
                onChange={e => setTrackingId(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'white' }}
                required
              />
              <button type="button" className="btn btn-secondary" onClick={startScanner} style={{ padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Scan QR or Barcode">
                <i className="fas fa-camera" />
              </button>
              <button type="submit" className="btn" disabled={status === 'loading'} style={{ height: '44px' }}>
                {status === 'loading' ? <i className="fas fa-spinner fa-spin" /> : 'Track'}
              </button>
            </form>
          ) : (
            <div className="scanner-container" style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' }}>
              <div id="reader" style={{ width: '100%', borderRadius: '6px', overflow: 'hidden' }}></div>
              <div className="scanner-overlay">
                <div className="scanner-reticle">
                  <div className="scanner-laser"></div>
                </div>
              </div>
              <button type="button" className="btn" style={{ width: '100%', background: '#ef4444', color: 'white', marginTop: '12px', zIndex: 10 }} onClick={stopScanner}>
                <i className="fas fa-times-circle" style={{ marginRight: '6px' }} /> Cancel Scan
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', textAlign: 'center', marginBottom: '20px' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }} />
              {errorMsg}
            </div>
          )}

          {status === 'result' && result && (
            <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--gold-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9em', color: 'gray' }}>Status</span>
                <span style={{ background: `${getStatusColor(result.status)}20`, color: getStatusColor(result.status), padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9em' }}>
                  {result.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9em', color: 'gray', display: 'block', marginBottom: '4px' }}>Request Type</span>
                <strong style={{ color: 'white' }}>{result.source === 'collaboration' || result.source === 'meeting' ? result.type : 'General Contact'}</strong>
              </div>

              {result.source === 'meeting' && result.timeline && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.9em', color: 'gray', display: 'block', marginBottom: '4px' }}>Scheduled Time</span>
                  <strong style={{ color: '#60a5fa' }}>{result.timeline} · {result.duration || 30} min</strong>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '0.9em', color: 'gray', display: 'block', marginBottom: '4px' }}>Submitted On</span>
                <strong style={{ color: 'white' }}>{new Date(result.createdAt).toLocaleDateString()}</strong>
              </div>

              {/* Jitsi Meeting Button */}
              {result.meetingLink && (
                <div style={{ margin: '15px 0', padding: '14px', background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37, 99, 235, 0.4)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85em', color: '#60a5fa', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    <i className="fas fa-video" style={{ marginRight: '6px' }} /> Video Meeting Room Ready
                  </span>
                  <a href={result.meetingLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#2563eb', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontWeight: 'bold', textDecoration: 'none', borderRadius: '6px', height: '40px' }}>
                    <i className="fas fa-video" /> Join Video Call
                  </a>
                </div>
              )}

              {/* Code Visualizer (QR & Barcode) */}
              <div style={{ margin: '15px 0 0 0', padding: '16px', background: '#ffffff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8em', color: '#111827', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Scan Codes</span>
                
                {/* QR Code */}
                {qrUrl ? (
                  <img src={qrUrl} alt="QR Code" style={{ width: '140px', height: '140px', border: '1px solid #e5e7eb', padding: '4px', background: 'white' }} />
                ) : (
                  <div style={{ width: '140px', height: '140px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    <i className="fas fa-spinner fa-spin" />
                  </div>
                )}
                
                {/* Barcode Canvas */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                  <canvas ref={barcodeCanvasRef} style={{ maxWidth: '100%', height: 'auto' }}></canvas>
                </div>
              </div>

              {result.adminNote && (
                <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px', border: '1px solid var(--gold-dim)' }}>
                  <span style={{ fontSize: '0.85em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    <i className="fas fa-comment-dots" style={{ marginRight: '6px' }}/>Note from Krishna:
                  </span>
                  <p style={{ margin: 0, fontSize: '0.9em', color: 'white', lineHeight: 1.5 }}>{result.adminNote}</p>
                </div>
              )}
              <p style={{ marginTop: '15px', fontSize: '0.8em', color: 'gray', textAlign: 'center', marginBottom: 0 }}>For queries, email krishnatejareddy2003@gmail.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
