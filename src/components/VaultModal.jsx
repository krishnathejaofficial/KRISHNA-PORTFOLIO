import { useState } from 'react';

const VAULT_TYPES = {
  aadhar: { icon: 'fa-id-card', label: 'Aadhar Card', color: '#3b82f6' },
  pan: { icon: 'fa-credit-card', label: 'PAN Card', color: '#10b981' },
  voter: { icon: 'fa-address-card', label: 'Voter ID', color: '#f59e0b' },
  passport: { icon: 'fa-passport', label: 'Passport', color: '#ec4899' },
  link: { icon: 'fa-link', label: 'External Link', color: '#d4af37' },
  other: { icon: 'fa-file-shield', label: 'Other Document', color: '#a78bfa' }
};

export default function VaultModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  
  // Public user uploads states
  const [activeTab, setActiveTab] = useState('admin'); // admin | user
  const [userUploads, setUserUploads] = useState([]);
  const [userUploading, setUserUploading] = useState(false);
  const [userUploadName, setUserUploadName] = useState('');
  const [userUploadFile, setUserUploadFile] = useState(null);
  const [userUploadFileName, setUserUploadFileName] = useState('');
  const [userUploadSize, setUserUploadSize] = useState(0);

  async function handleUnlock(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-vault-documents',
          password: password.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(data.documents || []);
        setUnlocked(true);
        // Fetch user uploads simultaneously
        fetchUserUploads(password.trim());
      } else {
        setError(data.error || 'Incorrect Admin Password');
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserUploads(pass = password) {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-user-uploads',
          password: pass.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserUploads(data.uploads || []);
      }
    } catch {
      // Ignore background errors
    }
  }

  async function handleUserUpload(e) {
    e.preventDefault();
    if (!userUploadFile || !userUploadName.trim()) return;
    setUserUploading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload-user-file',
          password: password.trim(),
          name: userUploadName.trim(),
          fileData: userUploadFile,
          size: userUploadSize
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserUploadName('');
        setUserUploadFile(null);
        setUserUploadFileName('');
        setUserUploadSize(0);
        fetchUserUploads(password);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload error. Try again.');
    } finally {
      setUserUploading(false);
    }
  }

  function handleUserFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserUploadFile(reader.result);
      setUserUploadFileName(file.name);
      setUserUploadSize(file.size);
      if (!userUploadName) {
        setUserUploadName(file.name.replace(/\.\w+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDownload(doc) {
    try {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download document: ' + err.message);
    }
  }

  function formatSize(bytes) {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function handleClose() {
    setPassword('');
    setUnlocked(false);
    setError('');
    setDocuments([]);
    setUserUploads([]);
    setActiveTab('admin');
    setUserUploadName('');
    setUserUploadFile(null);
    setUserUploadFileName('');
    setUserUploadSize(0);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-box vault-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '540px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(212,175,55,0.08))', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="modal-header-left">
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#ef4444,#D4AF37)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
            }}>
              <i className={`fas ${unlocked ? 'fa-unlock-alt' : 'fa-lock'}`} style={{ color: '#fff', fontSize: '1.1em' }} />
            </div>
            <div>
              <strong style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2em', color: '#D4AF37' }}>
                Emergency Document Vault
              </strong>
              <span>Protected Administrator Storage</span>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '24px' }}>
          {!unlocked ? (
            <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <i className="fas fa-shield-halved" style={{ fontSize: '3em', color: '#ef4444', opacity: 0.8, marginBottom: '14px', display: 'block' }} />
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-bright)', fontSize: '1.1em' }}>Secure Identity Check</h4>
                <p style={{ margin: 0, fontSize: '0.82em', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  This folder is encrypted and contains personal identity documents. Enter the admin credentials to view or upload documents.
                </p>
              </div>

              <div className="clg-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-key" style={{ color: '#ef4444' }} /> Admin Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter portfolio admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="vault-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'var(--surface-2)',
                    color: 'white',
                    fontSize: '0.95em',
                    textAlign: 'center'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8em',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <i className="fas fa-circle-exclamation" /> {error}
                </div>
              )}

              <button
                type="submit"
                className="btn"
                disabled={loading || !password.trim()}
                style={{
                  background: 'linear-gradient(135deg,#ef4444,#D4AF37)',
                  color: '#000',
                  fontWeight: 'bold',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.95em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.25)'
                }}
              >
                {loading ? <i className="fas fa-spinner fa-spin" /> : 'Decrypt & Access Vault'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Tab Selector */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '6px' }}>
                <button
                  onClick={() => setActiveTab('admin')}
                  style={{
                    background: 'none', border: 'none',
                    color: activeTab === 'admin' ? 'var(--gold)' : 'gray',
                    fontSize: '0.88em', fontWeight: 600, padding: '10px 14px',
                    borderBottom: activeTab === 'admin' ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <i className="fas fa-folder-closed" /> Official Documents
                </button>
                <button
                  onClick={() => setActiveTab('user')}
                  style={{
                    background: 'none', border: 'none',
                    color: activeTab === 'user' ? 'var(--gold)' : 'gray',
                    fontSize: '0.88em', fontWeight: 600, padding: '10px 14px',
                    borderBottom: activeTab === 'user' ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <i className="fas fa-cloud-arrow-up" /> Public Uploads
                </button>
                <button
                  onClick={() => {
                    setUnlocked(false);
                    setPassword('');
                    setDocuments([]);
                    setUserUploads([]);
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#ef4444',
                    fontSize: '0.82em', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <i className="fas fa-lock" /> Lock
                </button>
              </div>

              {activeTab === 'admin' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.45)' }}>
                      Total items available: <strong>{documents.length}</strong>
                    </span>
                  </div>

                  {documents.length === 0 ? (
                    <div style={{
                      padding: '40px 20px', border: '1px dashed rgba(255,255,255,0.1)',
                      borderRadius: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.4)'
                    }}>
                      <i className="fas fa-folder-open" style={{ fontSize: '2em', display: 'block', marginBottom: '10px', opacity: 0.5 }} />
                      No documents found in vault.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }} className="vault-file-list">
                      {documents.map(doc => {
                        const typeConfig = VAULT_TYPES[doc.type] || VAULT_TYPES.other;
                        return (
                          <div
                            key={doc.docId}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 16px', background: 'var(--surface-2)',
                              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
                              transition: 'border-color 0.2s', gap: '10px'
                            }}
                            className="vault-item vault-item-row"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
                                background: `${typeConfig.color}20`, border: `1px solid ${typeConfig.color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <i className={`fas ${typeConfig.icon}`} style={{ color: typeConfig.color }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <strong style={{ display: 'block', color: 'var(--text-bright)', fontSize: '0.88em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</strong>
                                <span style={{ fontSize: '0.75em', color: 'gray', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{typeConfig.label}</span>
                                  {doc.type !== 'link' && (
                                    <>
                                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'gray' }} />
                                      <span>{formatSize(doc.size)}</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="vault-item-actions" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              {doc.type === 'link' ? (
                                <button
                                  onClick={() => window.open(doc.fileData, '_blank', 'noopener,noreferrer')}
                                  className="btn vault-download-btn"
                                  title="Open link"
                                  style={{
                                    background: 'linear-gradient(135deg,rgba(212,175,55,0.25),rgba(212,175,55,0.08))',
                                    border: '1px solid var(--gold-dim)', color: 'var(--gold)',
                                    padding: '8px 14px', borderRadius: '8px', fontSize: '0.8em',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    cursor: 'pointer', fontWeight: 600
                                  }}
                                >
                                  <i className="fas fa-external-link-alt" /> Open Link
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="btn vault-download-btn"
                                  title="Download document"
                                  style={{
                                    background: 'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.08))',
                                    border: '1px solid var(--gold-dim)', color: 'var(--gold)',
                                    padding: '8px 14px', borderRadius: '8px', fontSize: '0.8em',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    cursor: 'pointer', fontWeight: 600
                                  }}
                                >
                                  <i className="fas fa-download" /> Download
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Public Upload Section */}
                  <form onSubmit={handleUserUpload} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h5 style={{ margin: 0, color: 'var(--gold)', fontSize: '0.9em' }}>Upload New File to Admin</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Enter file label/title"
                        required
                        value={userUploadName}
                        onChange={e => setUserUploadName(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'white', fontSize: '0.88em' }}
                      />
                      <div
                        onClick={() => document.getElementById('user-vault-upload').click()}
                        style={{
                          border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                          background: userUploadFile ? 'rgba(212,175,55,0.05)' : 'transparent', transition: 'all 0.2s'
                        }}
                      >
                        <i className="fas fa-cloud-arrow-up" style={{ color: userUploadFile ? 'var(--gold)' : 'gray', marginBottom: '4px' }} />
                        <span style={{ display: 'block', fontSize: '0.8em', color: userUploadFile ? 'white' : 'gray' }}>
                          {userUploadFile ? `${userUploadFileName} (${formatSize(userUploadSize)})` : 'Click to choose file (max 5 MB)'}
                        </span>
                      </div>
                      <input id="user-vault-upload" type="file" onChange={handleUserFileSelect} style={{ display: 'none' }} />
                    </div>
                    <button
                      type="submit"
                      disabled={userUploading || !userUploadFile || !userUploadName.trim()}
                      className="btn"
                      style={{
                        background: 'linear-gradient(135deg,#D4AF37,#b89225)', color: '#000', fontWeight: 'bold',
                        padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.88em'
                      }}
                    >
                      {userUploading ? <i className="fas fa-spinner fa-spin" /> : 'Encrypt & Upload File'}
                    </button>
                  </form>

                  {/* Public Uploaded Files List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }} className="vault-file-list">
                    <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.45)', marginBottom: '2px' }}>
                      Shared uploads: <strong>{userUploads.length}</strong>
                    </span>
                    {userUploads.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'gray', fontSize: '0.8em' }}>
                        No files uploaded by users yet.
                      </div>
                    ) : (
                      userUploads.map(upl => (
                        <div
                          key={upl.uploadId}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', background: 'var(--surface-2)',
                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <i className="fas fa-file-arrow-up" style={{ color: 'var(--gold)', fontSize: '1.2em' }} />
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', color: 'var(--text-bright)', fontSize: '0.82em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upl.name}</strong>
                              <span style={{ fontSize: '0.7em', color: 'gray' }}>
                                {formatSize(upl.size)} · {new Date(upl.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(upl)}
                            className="btn"
                            style={{
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                              padding: '6px 10px', borderRadius: '6px', fontSize: '0.75em', cursor: 'pointer'
                            }}
                          >
                            <i className="fas fa-download" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <style>{`
          .vault-file-list::-webkit-scrollbar { width: 4px; }
          .vault-file-list::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 4px; }
          .vault-item:hover {
            border-color: rgba(212,175,55,0.3) !important;
          }
          .vault-modal button:hover {
            opacity: 0.9;
          }
        `}</style>
      </div>
    </div>
  );
}

