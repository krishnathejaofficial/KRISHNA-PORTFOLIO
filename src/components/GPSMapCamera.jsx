import { useRef, useState, useEffect, useCallback } from 'react';

/* ──────────────────────────────────────────────
   GPS Map Camera — like a real GPS cam app
   Shows: City/Region, full address, Plus Code,
   Lat/Long, Date, Time, Timezone, Country flag
   Overlays it all on a captured photo
──────────────────────────────────────────────── */

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';
const TILE = (lat, lon, z = 15) =>
  `https://tile.openstreetmap.org/${z}/${lon2tile(lon, z)}/${lat2tile(lat, z)}.png`;

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

function toLatLonDMS(lat, lon) {
  const fmt = (v, pos, neg) => {
    const d = Math.floor(Math.abs(v));
    const m = Math.floor((Math.abs(v) - d) * 60);
    const s = ((Math.abs(v) - d - m / 60) * 3600).toFixed(1);
    return `${d}°${m}'${s}"${v >= 0 ? pos : neg}`;
  };
  return `${fmt(lat, 'N', 'S')} ${fmt(lon, 'E', 'W')}`;
}

function getCountryFlag(countryCode) {
  if (!countryCode) return '';
  const cp = countryCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397));
  return cp.join('');
}

function formatDateTime(d) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[d.getDay()];
  const date = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  // Timezone offset
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const absOff = Math.abs(off);
  const tzH = String(Math.floor(absOff / 60)).padStart(2, '0');
  const tzM = String(absOff % 60).padStart(2, '0');
  const tz = `GMT ${sign}${tzH}:${tzM}`;

  return {
    dateStr: `${day}, ${date}/${month}/${year}`,
    timeStr: `${hours}:${minutes} ${ampm} ${tz}`,
    fullDate: `${day}, ${date} ${months[d.getMonth()]} ${year}`,
  };
}

// Draw the GPS overlay on the captured canvas
async function drawGPSOverlay(canvas, photoDataUrl, gpsData) {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const W = canvas.width;
      const H = canvas.height;

      // Panel sizing responsive to image
      const scale = Math.min(W / 1080, H / 1920, 1);
      const panelH = Math.max(220, Math.round(H * 0.22));
      const panelY = H - panelH;
      const pad = Math.round(16 * scale + 8);
      const mapSize = Math.round(panelH * 0.72);

      // ── Semi-transparent background panel ──
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.beginPath();
      ctx.roundRect(0, panelY, W, panelH, [0, 0, 0, 0]);
      ctx.fill();

      // ── Gold top accent line ──
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(0, panelY, W, 3);

      // ── Map thumbnail (top-right corner) ──
      const mapX = W - mapSize - pad;
      const mapY = panelY + pad;

      // Try to load OSM tile
      try {
        const tileUrl = TILE(gpsData.lat, gpsData.lon, 14);
        const tileImg = new Image();
        tileImg.crossOrigin = 'anonymous';
        await new Promise((res) => {
          tileImg.onload = () => {
            // Clip map to rounded rect
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
            ctx.clip();
            ctx.drawImage(tileImg, mapX, mapY, mapSize, mapSize);
            ctx.restore();

            // Map border
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
            ctx.stroke();

            // Red pin dot in center of map
            const cx = mapX + mapSize / 2;
            const cy = mapY + mapSize / 2;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy - 4, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Google Maps logo area
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.fillRect(mapX, mapY + mapSize - 18, 52, 18);
            ctx.fillStyle = '#333';
            ctx.font = `bold ${Math.round(9 * scale + 6)}px Arial`;
            ctx.fillText('OpenStreet', mapX + 3, mapY + mapSize - 5);

            res();
          };
          tileImg.onerror = () => {
            // Fallback: draw a placeholder map
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, 8);
            ctx.fill();
            ctx.fillStyle = '#D4AF37';
            ctx.font = `${Math.round(10 * scale + 8)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('📍 Map', mapX + mapSize / 2, mapY + mapSize / 2);
            ctx.textAlign = 'left';
            res();
          };
          tileImg.src = tileUrl;
        });
      } catch (_) {
        // ignore
      }

      // ── GPS Camera logo (top-right of panel) ──
      const logoX = W - pad;
      const logoY = panelY + 14;
      ctx.fillStyle = '#D4AF37';
      ctx.font = `bold ${Math.round(9 * scale + 7)}px Arial`;
      ctx.textAlign = 'right';
      ctx.fillText('📷 GPS Map Camera', logoX, logoY);

      // ── Text content (left side) ──
      const txtX = pad;
      let txtY = panelY + pad + 4;
      const lineGap = Math.round(22 * scale + 14);

      // City / Region (large)
      const cityFontSize = Math.round(18 * scale + 16);
      ctx.font = `bold ${cityFontSize}px Arial`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      const cityLine = `${gpsData.city || gpsData.state || 'Unknown'}, ${gpsData.state || ''}, ${gpsData.country || ''} ${gpsData.flag}`;
      ctx.fillText(cityLine, txtX, txtY);
      txtY += cityFontSize + 6;

      // Full address
      const addrFontSize = Math.round(10 * scale + 9);
      ctx.font = `${addrFontSize}px Arial`;
      ctx.fillStyle = '#DDDDDD';
      // Wrap address if too long
      const maxW = mapX - txtX - pad;
      const words = (gpsData.address || '').split(' ');
      let line1 = '';
      let line2 = '';
      let lineNum = 0;
      for (const word of words) {
        const test = (lineNum === 0 ? line1 : line2) + word + ' ';
        const testW = ctx.measureText(test).width;
        if (testW > maxW && lineNum === 0) {
          lineNum = 1;
          line2 = word + ' ';
        } else if (lineNum === 0) {
          line1 = test;
        } else {
          line2 = test;
        }
      }
      ctx.fillText(line1.trim(), txtX, txtY);
      if (line2.trim()) {
        txtY += addrFontSize + 4;
        ctx.fillText(line2.trim(), txtX, txtY);
      }
      txtY += addrFontSize + 8;

      // Lat / Long (gold)
      const coordFontSize = Math.round(10 * scale + 9);
      ctx.font = `bold ${coordFontSize}px 'Courier New', monospace`;
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(
        `Lat ${gpsData.lat.toFixed(6)}°  Long ${gpsData.lon.toFixed(6)}°`,
        txtX,
        txtY
      );
      txtY += coordFontSize + 6;

      // Date & Time
      const dtFontSize = Math.round(10 * scale + 8);
      ctx.font = `${dtFontSize}px Arial`;
      ctx.fillStyle = '#CCCCCC';
      ctx.fillText(`${gpsData.dateStr}  ${gpsData.timeStr}`, txtX, txtY);

      // ── Accuracy badge ──
      if (gpsData.accuracy) {
        const accTxt = `±${Math.round(gpsData.accuracy)}m`;
        ctx.font = `bold ${Math.round(8 * scale + 7)}px Arial`;
        const accW = ctx.measureText(accTxt).width + 12;
        ctx.fillStyle = gpsData.accuracy < 20 ? 'rgba(34,197,94,0.85)' : 'rgba(234,179,8,0.85)';
        ctx.beginPath();
        ctx.roundRect(txtX, panelY + panelH - 28, accW, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(accTxt, txtX + 6, panelY + panelH - 13);
      }

      ctx.textAlign = 'left';
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = photoDataUrl;
  });
}

export default function GPSMapCamera({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | locating | camera | processing | result | error
  const [gpsData, setGpsData] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [taggedPhoto, setTaggedPhoto] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [flashActive, setFlashActive] = useState(false);
  const [locProgress, setLocProgress] = useState('Requesting GPS access…');

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhase('idle');
      setCapturedPhoto(null);
      setTaggedPhoto(null);
      setGpsData(null);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startLocating = useCallback(async () => {
    setPhase('locating');
    setLocProgress('Requesting GPS access…');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setPhase('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
        setLocProgress('Got GPS fix. Fetching address…');

        let address = `Lat ${lat.toFixed(5)}, Long ${lon.toFixed(5)}`;
        let city = '';
        let state = '';
        let country = '';
        let countryCode = '';
        let flag = '';
        let plusCode = '';

        try {
          const res = await fetch(
            `${NOMINATIM}?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};
          city = a.city || a.town || a.village || a.county || a.suburb || '';
          state = a.state || a.region || '';
          country = a.country || '';
          countryCode = a.country_code?.toUpperCase() || '';
          flag = getCountryFlag(countryCode);
          plusCode = data.place_id ? `${Math.abs(Math.floor(lat * 20) % 20).toString(36).toUpperCase()}${Math.abs(Math.floor(lon * 20) % 20).toString(36).toUpperCase()}+${Math.abs(Math.floor((lat * 20) % 1 * 100)).toString(36).toUpperCase()}${Math.abs(Math.floor((lon * 20) % 1 * 100)).toString(36).toUpperCase()}` : '';

          // Build a clean address string
          const parts = [
            a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road || '',
            a.suburb || a.neighbourhood || '',
            city,
            state,
            a.postcode || '',
            country,
          ].filter(Boolean);

          address = parts.join(', ');
        } catch (_) {
          // Use coordinate fallback
        }

        const now = new Date();
        const { dateStr, timeStr } = formatDateTime(now);

        setGpsData({ lat, lon, accuracy, address, city, state, country, countryCode, flag, plusCode, dateStr, timeStr, dmsCoords: toLatLonDMS(lat, lon) });
        setLocProgress('Location found! Opening camera…');

        // Start camera
        await openCamera();
      },
      (err) => {
        const msgs = {
          1: 'Location access denied. Please allow location permissions in your browser settings.',
          2: 'Position unavailable. Make sure GPS/location services are enabled.',
          3: 'Location request timed out. Please try again.',
        };
        setErrorMsg(msgs[err.code] || 'Failed to get location.');
        setPhase('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const openCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPhase('camera');
      // Attach to video after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setErrorMsg('Camera access denied or unavailable. ' + (err.message || ''));
      setPhase('error');
    }
  }, []);

  const switchCamera = useCallback(async () => {
    stopCamera();
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newFacing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setErrorMsg('Failed to switch camera: ' + err.message);
      setPhase('error');
    }
  }, [facingMode]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Flash effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setPhase('processing');
    stopCamera();

    // Draw GPS overlay
    const now = new Date();
    const { dateStr, timeStr } = formatDateTime(now);
    const updatedGps = { ...gpsData, dateStr, timeStr };
    setGpsData(updatedGps);

    try {
      const tagged = await drawGPSOverlay(canvas, rawDataUrl, updatedGps);
      setTaggedPhoto(tagged);
      setCapturedPhoto(rawDataUrl);
      setPhase('result');
    } catch (e) {
      setTaggedPhoto(rawDataUrl);
      setCapturedPhoto(rawDataUrl);
      setPhase('result');
    }
  }, [gpsData]);

  const downloadPhoto = () => {
    if (!taggedPhoto) return;
    const a = document.createElement('a');
    a.href = taggedPhoto;
    a.download = `GPS_${gpsData?.city || 'Photo'}_${Date.now()}.jpg`;
    a.click();
  };

  const retake = useCallback(async () => {
    setTaggedPhoto(null);
    setCapturedPhoto(null);
    await openCamera();
  }, [openCamera]);

  if (!isOpen) return null;

  return (
    <div className="gps-cam-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gps-cam-modal">
        {/* ── Header ── */}
        <div className="gps-cam-header">
          <div className="gps-cam-title">
            <i className="fas fa-map-marker-alt" style={{ color: '#D4AF37' }} />
            <span>GPS Map Camera</span>
          </div>
          <button className="gps-cam-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="gps-cam-body">

          {/* IDLE */}
          {phase === 'idle' && (
            <div className="gps-cam-start">
              <div className="gps-cam-icon-ring">
                <i className="fas fa-camera-retro" />
              </div>
              <h3>GPS Map Camera</h3>
              <p>Capture a geotagged photo with your exact location, address, coordinates, date &amp; time stamped directly on the image.</p>
              <div className="gps-cam-features">
                <span><i className="fas fa-map-pin" /> Real GPS coordinates</span>
                <span><i className="fas fa-map" /> Map thumbnail</span>
                <span><i className="fas fa-address-card" /> Full address</span>
                <span><i className="fas fa-clock" /> Date &amp; time</span>
              </div>
              <button className="gps-cam-btn-primary" onClick={startLocating}>
                <i className="fas fa-location-crosshairs" /> Open GPS Camera
              </button>
            </div>
          )}

          {/* LOCATING */}
          {phase === 'locating' && (
            <div className="gps-cam-locating">
              <div className="gps-cam-pulse-ring">
                <i className="fas fa-location-dot" />
              </div>
              <p className="gps-loc-status">{locProgress}</p>
              <p className="gps-loc-hint">Make sure location services are enabled in your browser and device settings.</p>
            </div>
          )}

          {/* CAMERA */}
          {phase === 'camera' && (
            <div className="gps-cam-viewfinder">
              <div className="gps-cam-video-wrap">
                <video ref={videoRef} playsInline muted autoPlay className="gps-cam-video" />
                {flashActive && <div className="gps-cam-flash" />}

                {/* Crosshair corners */}
                <div className="gps-cam-corner tl" />
                <div className="gps-cam-corner tr" />
                <div className="gps-cam-corner bl" />
                <div className="gps-cam-corner br" />

                {/* GPS info overlay on viewfinder */}
                {gpsData && (
                  <div className="gps-cam-live-info">
                    <div className="gps-live-city">
                      {gpsData.flag} {gpsData.city || gpsData.state}, {gpsData.state}
                    </div>
                    <div className="gps-live-coords">
                      {gpsData.lat.toFixed(6)}° N &nbsp; {gpsData.lon.toFixed(6)}° E
                    </div>
                    <div className="gps-live-addr">{gpsData.address?.slice(0, 60)}{gpsData.address?.length > 60 ? '…' : ''}</div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="gps-cam-controls">
                <button className="gps-cam-ctrl-btn" onClick={switchCamera} title="Flip camera">
                  <i className="fas fa-rotate" />
                </button>
                <button className="gps-cam-shutter" onClick={capturePhoto} title="Capture">
                  <span className="gps-shutter-inner" />
                </button>
                <button className="gps-cam-ctrl-btn" onClick={onClose} title="Close">
                  <i className="fas fa-xmark" />
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING */}
          {phase === 'processing' && (
            <div className="gps-cam-locating">
              <div className="gps-cam-pulse-ring">
                <i className="fas fa-wand-magic-sparkles" />
              </div>
              <p className="gps-loc-status">Stamping GPS data on your photo…</p>
            </div>
          )}

          {/* RESULT */}
          {phase === 'result' && taggedPhoto && (
            <div className="gps-cam-result">
              <div className="gps-cam-preview-wrap">
                <img src={taggedPhoto} alt="GPS tagged photo" className="gps-cam-preview" />
              </div>

              {/* GPS Info Card (below the image) */}
              {gpsData && (
                <div className="gps-result-card">
                  <div className="gps-result-header">
                    <i className="fas fa-location-dot" style={{ color: '#ef4444' }} />
                    <div>
                      <div className="gps-result-city">{gpsData.flag} {gpsData.city || gpsData.state}, {gpsData.state}, {gpsData.country}</div>
                      <div className="gps-result-addr">{gpsData.address}</div>
                    </div>
                  </div>
                  <div className="gps-result-meta">
                    <div className="gps-meta-item">
                      <i className="fas fa-crosshairs" style={{ color: '#D4AF37' }} />
                      <span>Lat {gpsData.lat.toFixed(6)}°&nbsp; Long {gpsData.lon.toFixed(6)}°</span>
                    </div>
                    <div className="gps-meta-item">
                      <i className="fas fa-calendar" style={{ color: '#D4AF37' }} />
                      <span>{gpsData.dateStr}</span>
                    </div>
                    <div className="gps-meta-item">
                      <i className="fas fa-clock" style={{ color: '#D4AF37' }} />
                      <span>{gpsData.timeStr}</span>
                    </div>
                    {gpsData.accuracy && (
                      <div className="gps-meta-item">
                        <i className="fas fa-bullseye" style={{ color: gpsData.accuracy < 20 ? '#22c55e' : '#eab308' }} />
                        <span>Accuracy ±{Math.round(gpsData.accuracy)}m</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="gps-result-actions">
                <button className="gps-cam-btn-primary" onClick={downloadPhoto}>
                  <i className="fas fa-download" /> Download Photo
                </button>
                <button className="gps-cam-btn-secondary" onClick={retake}>
                  <i className="fas fa-camera" /> Retake
                </button>
                <button className="gps-cam-btn-secondary" onClick={onClose}>
                  <i className="fas fa-check" /> Done
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <div className="gps-cam-locating">
              <div className="gps-cam-pulse-ring error">
                <i className="fas fa-triangle-exclamation" />
              </div>
              <p className="gps-loc-status" style={{ color: '#f87171' }}>{errorMsg}</p>
              <button className="gps-cam-btn-primary" style={{ marginTop: 20 }} onClick={() => { setPhase('idle'); setErrorMsg(''); }}>
                <i className="fas fa-redo" /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
