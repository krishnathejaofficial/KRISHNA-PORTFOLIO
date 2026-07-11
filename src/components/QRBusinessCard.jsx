import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

/* QR code via qrserver.com CDN — no dependency needed */
const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=';
const PORTFOLIO_URL = 'https://gkrishnateja.vercel.app';

export default function QRBusinessCard({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('card');
  const [copied, setCopied] = useState('');
  const cardRef = useRef(null);

  const contactInfo = {
    name: 'G. Krishna Teja',
    title: 'Integrated M.Sc. Biotechnology | VIT Vellore',
    email: 'krishnatejareddy2003@gmail.com',
    phone: '+91 93908 50349',
    linkedin: 'linkedin.com/in/gkrishnateja',
    portfolio: PORTFOLIO_URL,
    github: 'github.com/krishnathejaofficial',
  };

  const vcardString = `BEGIN:VCARD\nVERSION:3.0\nN:Teja;G. Krishna;;;\nFN:G. Krishna Teja\nORG:VIT Vellore\nTITLE:Integrated M.Sc. Biotechnology Student\nTEL:+919390850349\nEMAIL:krishnatejareddy2003@gmail.com\nURL:${PORTFOLIO_URL}\nEND:VCARD`;
  const qrUrl = `${QR_BASE}${encodeURIComponent(PORTFOLIO_URL)}`;
  const vcardQrUrl = `${QR_BASE}${encodeURIComponent(vcardString)}`;

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function downloadQR(url, filename) {
    const a = document.createElement('a');
    a.href = url + '&format=png&size=400x400';
    a.download = filename;
    a.click();
  }

  async function downloadCardImage() {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#111', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = 'Krishna_Digital_Card.png';
      a.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box qr-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <i className="fas fa-qrcode" style={{ color: 'var(--gold)', fontSize: '1.3em' }} />
            <div>
              <strong>QR Business Card</strong>
              <span>Share your portfolio instantly</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        <div className="qr-tabs">
          {['card', 'qr', 'contact'].map(tab => (
            <button key={tab} className={`qr-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'card' && <><i className="fas fa-id-card" /> Digital Card</>}
              {tab === 'qr' && <><i className="fas fa-qrcode" /> QR Code</>}
              {tab === 'contact' && <><i className="fas fa-address-book" /> Contact Info</>}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div className="biz-card" ref={cardRef}>
                <div className="biz-card-front">
                  <div className="biz-card-top">
                    <img src="/images/krishna teja profile.jpg" alt="Krishna" className="biz-card-photo" />
                    <div>
                      <h3 style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4em', margin: '0 0 4px 0' }}>
                        G. Krishna Teja
                      </h3>
                      <p style={{ fontSize: '0.75em', opacity: 0.75, lineHeight: 1.5, margin: 0 }}>
                        Integrated M.Sc. Biotechnology<br />VIT Vellore · CGPA 9.01
                      </p>
                    </div>
                  </div>
                  <div className="biz-card-divider" />
                  <div className="biz-card-info">
                    <a href={`mailto:${contactInfo.email}`} className="biz-contact-row">
                      <i className="fas fa-envelope" /> {contactInfo.email}
                    </a>
                    <a href={`tel:${contactInfo.phone}`} className="biz-contact-row">
                      <i className="fas fa-phone" /> {contactInfo.phone}
                    </a>
                    <a href={`https://${contactInfo.portfolio}`} target="_blank" rel="noreferrer" className="biz-contact-row">
                      <i className="fas fa-globe" /> {contactInfo.portfolio}
                    </a>
                    <a href={`https://${contactInfo.linkedin}`} target="_blank" rel="noreferrer" className="biz-contact-row">
                      <i className="fab fa-linkedin" /> {contactInfo.linkedin}
                    </a>
                  </div>
                  <div className="biz-card-footer">
                    <span>Industrial Biotech · Pharma · Research</span>
                  </div>
                </div>
              </div>
              <button className="clg-action-btn" onClick={downloadCardImage} style={{ width: '100%', maxWidth: '300px' }}>
                <i className="fas fa-download" /> Download Card as PNG
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="qr-display">
              <div className="qr-pair">
                <div className="qr-item">
                  <img src={qrUrl} alt="Portfolio QR" className="qr-img" />
                  <p>🌐 Portfolio Website</p>
                  <button className="clg-action-btn" onClick={() => downloadQR(qrUrl, 'krishna_portfolio_qr.png')}>
                    <i className="fas fa-download" /> Save QR
                  </button>
                </div>
                <div className="qr-item">
                  <img src={vcardQrUrl} alt="Contact vCard QR" className="qr-img" />
                  <p>📇 Save Contact (vCard)</p>
                  <button className="clg-action-btn" onClick={() => downloadQR(vcardQrUrl, 'krishna_contact_qr.png')}>
                    <i className="fas fa-download" /> Save QR
                  </button>
                </div>
              </div>
              <p className="qr-hint">Scan with any phone camera to open portfolio or save contact</p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="contact-copy-list">
              {Object.entries(contactInfo).map(([key, val]) => (
                <div key={key} className="contact-copy-row">
                  <span className="contact-copy-label">{key}</span>
                  <span className="contact-copy-val">{val}</span>
                  <button className="contact-copy-btn" onClick={() => copy(val, key)}>
                    <i className={`fas ${copied === key ? 'fa-check' : 'fa-copy'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
