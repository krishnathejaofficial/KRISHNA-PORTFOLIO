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

function encodePlusCode(latitude, longitude) {
  const ALPHABET = '23456789CFGHJMPQRVWX';
  let lat = Math.min(Math.max(latitude, -90), 90);
  let lon = longitude;
  while (lon < -180) lon += 360;
  while (lon >= 180) lon -= 360;

  lat += 90;
  lon += 180;

  let code = '';
  let latGrid = lat / 20;
  let lonGrid = lon / 20;

  // 1st pair
  code += ALPHABET.charAt(Math.floor(latGrid) % 20);
  code += ALPHABET.charAt(Math.floor(lonGrid) % 20);

  // 2nd pair
  latGrid = (latGrid % 1) * 20;
  lonGrid = (lonGrid % 1) * 20;
  code += ALPHABET.charAt(Math.floor(latGrid) % 20);
  code += ALPHABET.charAt(Math.floor(lonGrid) % 20);

  // 3rd pair
  latGrid = (latGrid % 1) * 20;
  lonGrid = (lonGrid % 1) * 20;
  code += ALPHABET.charAt(Math.floor(latGrid) % 20);
  code += ALPHABET.charAt(Math.floor(lonGrid) % 20);

  // 4th pair
  latGrid = (latGrid % 1) * 20;
  lonGrid = (lonGrid % 1) * 20;
  code += ALPHABET.charAt(Math.floor(latGrid) % 20);
  code += ALPHABET.charAt(Math.floor(lonGrid) % 20);

  code += '+';

  // 5th pair
  latGrid = (latGrid % 1) * 20;
  lonGrid = (lonGrid % 1) * 20;
  code += ALPHABET.charAt(Math.floor(latGrid) % 20);
  code += ALPHABET.charAt(Math.floor(lonGrid) % 20);

  return code;
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

      // Sizing scale responsive to image width (reference width 1080px)
      const scale = W / 1080;
      const pad = Math.round(W * 0.04);
      const padBottom = Math.round(W * 0.04);
      const mapSize = Math.round(W * 0.28);

      // Positioning coordinates
      const mapX = pad;
      const mapY = H - mapSize - padBottom;

      const boxX = mapSize + 2 * pad;
      const boxY = mapY;
      const boxWidth = W - boxX - pad;
      const boxHeight = mapSize;

      // ── Map thumbnail (bottom-left corner) ──
      try {
        const tileUrl = TILE(gpsData.lat, gpsData.lon, 14);
        const tileImg = new Image();
        tileImg.crossOrigin = 'anonymous';
        await new Promise((res) => {
          tileImg.onload = () => {
            // Clip map to rounded rect
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, Math.round(W * 0.015));
            ctx.clip();
            ctx.drawImage(tileImg, mapX, mapY, mapSize, mapSize);
            ctx.restore();

            // Map border
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = Math.round(W * 0.003 + 1);
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, Math.round(W * 0.015));
            ctx.stroke();

            // Red pin dot in center of map
            const cx = mapX + mapSize / 2;
            const cy = mapY + mapSize / 2;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(cx, cy - Math.round(W * 0.004), Math.round(W * 0.006 + 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy - Math.round(W * 0.004), Math.round(W * 0.0025 + 1), 0, Math.PI * 2);
            ctx.fill();

            // Google Maps logo area
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            const watermarkH = Math.round(W * 0.018 + 6);
            const watermarkW = Math.round(W * 0.05 + 20);
            ctx.fillRect(mapX, mapY + mapSize - watermarkH, watermarkW, watermarkH);
            ctx.fillStyle = '#333';
            ctx.font = `bold ${Math.round(W * 0.01 + 4)}px Arial`;
            ctx.fillText('Google', mapX + Math.round(W * 0.004 + 2), mapY + mapSize - Math.round(watermarkH * 0.25));

            res();
          };
          tileImg.onerror = () => {
            // Fallback: draw a placeholder map
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.roundRect(mapX, mapY, mapSize, mapSize, Math.round(W * 0.015));
            ctx.fill();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = Math.round(W * 0.003 + 1);
            ctx.stroke();

            ctx.fillStyle = '#D4AF37';
            ctx.font = `bold ${Math.round(W * 0.02 + 8)}px Arial`;
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

      // ── Semi-transparent background box on bottom-right ──
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, Math.round(W * 0.015));
      ctx.fill();

      // ── Branding logo (top-right corner of box) ──
      const boxPadX = Math.round(W * 0.035);
      const boxPadY = Math.round(W * 0.035);
      const logoFontSize = Math.round(W * 0.016);
      const logoX = boxX + boxWidth - boxPadX;
      const logoY = boxY + boxPadY + Math.round(logoFontSize * 0.4);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `bold ${logoFontSize}px Arial`;
      ctx.textAlign = 'right';
      ctx.fillText('📷 krishnateja.vercel.app', logoX, logoY);

      // ── Dynamic text rendering inside box ──
      const cityFontSize = Math.round(W * 0.024);
      const addrFontSize = Math.round(W * 0.017);
      const coordFontSize = Math.round(W * 0.015);
      const dtFontSize = Math.round(W * 0.015);

      const gap1 = Math.round(W * 0.008);
      const gap2 = Math.round(W * 0.004);
      const gap3 = Math.round(W * 0.008);
      const gap4 = Math.round(W * 0.004);

      const totalTextHeight = cityFontSize + gap1 + addrFontSize + gap2 + addrFontSize + gap3 + coordFontSize + gap4 + dtFontSize;

      // Text truncation helper to prevent overflow
      const maxW = boxWidth - 2 * boxPadX;
      const truncateText = (text, maxAllowedWidth, fontSpec) => {
        ctx.font = fontSpec;
        if (ctx.measureText(text).width <= maxAllowedWidth) return text;
        let low = 0, high = text.length;
        while (low < high) {
          const mid = Math.floor((low + high) / 2);
          const test = text.slice(0, mid) + '…';
          if (ctx.measureText(test).width <= maxAllowedWidth) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return text.slice(0, Math.max(0, low - 2)) + '…';
      };

      // Formulate text content
      const cityLine = `${gpsData.city || gpsData.state || 'Unknown'}, ${gpsData.state || ''}, ${gpsData.country || ''} ${gpsData.flag || ''}`;

      const road = gpsData.road || '';
      const suburb = gpsData.suburb || '';
      const village = gpsData.village || '';
      const town = gpsData.town || '';
      const postcode = gpsData.postcode || '';
      const plusCode = gpsData.plusCode || '';

      let addrLine1 = '';
      let addrLine2 = '';

      if (gpsData.road || gpsData.suburb || gpsData.village || gpsData.town) {
        addrLine1 = [plusCode, road, suburb].filter(Boolean).join(', ') + (road || suburb ? ',' : '');
        addrLine2 = [village || town || gpsData.city, gpsData.state + (postcode ? ` ${postcode}` : ''), gpsData.country].filter(Boolean).join(', ');
      } else {
        // Fallback split for address
        const fullAddr = gpsData.address || '';
        const half = Math.ceil(fullAddr.length / 2);
        addrLine1 = fullAddr.slice(0, half);
        addrLine2 = fullAddr.slice(half);
      }

      const coordLine = `Lat ${gpsData.lat.toFixed(6)}° Long ${gpsData.lon.toFixed(6)}°` + (gpsData.accuracy ? ` (±${Math.round(gpsData.accuracy)}m)` : '');
      const dtLine = `${gpsData.dateStr} ${gpsData.timeStr}`;

      const truncatedCity = truncateText(cityLine, maxW - Math.round(W * 0.22), `bold ${cityFontSize}px Arial`);
      const truncatedAddr1 = truncateText(addrLine1, maxW, `${addrFontSize}px Arial`);
      const truncatedAddr2 = truncateText(addrLine2, maxW, `${addrFontSize}px Arial`);
      const truncatedCoord = truncateText(coordLine, maxW, `${coordFontSize}px Arial`);
      const truncatedDt = truncateText(dtLine, maxW, `${dtFontSize}px Arial`);

      // Center vertically
      let txtY = boxY + (boxHeight - totalTextHeight) / 2 + cityFontSize;
      const txtX = boxX + boxPadX;

      // Line 1: City & Country Flag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${cityFontSize}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(truncatedCity, txtX, txtY);

      // Line 2: Address line 1
      txtY += gap1 + addrFontSize;
      ctx.fillStyle = '#EEEEEE';
      ctx.font = `${addrFontSize}px Arial`;
      ctx.fillText(truncatedAddr1, txtX, txtY);

      // Line 3: Address line 2
      txtY += gap2 + addrFontSize;
      ctx.fillText(truncatedAddr2, txtX, txtY);

      // Line 4: Lat/Long
      txtY += gap3 + coordFontSize;
      ctx.fillStyle = '#DDDDDD';
      ctx.font = `${coordFontSize}px Arial`;
      ctx.fillText(truncatedCoord, txtX, txtY);

      // Line 5: Date/Time
      txtY += gap4 + dtFontSize;
      ctx.fillStyle = '#CCCCCC';
      ctx.font = `${dtFontSize}px Arial`;
      ctx.fillText(truncatedDt, txtX, txtY);

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

        let road = '';
        let suburb = '';
        let village = '';
        let town = '';
        let postcode = '';

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
          plusCode = encodePlusCode(lat, lon);
          road = a.road || '';
          suburb = a.suburb || a.neighbourhood || '';
          village = a.village || a.hamlet || '';
          town = a.town || '';
          postcode = a.postcode || '';

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

        setGpsData({ 
          lat, 
          lon, 
          accuracy, 
          address, 
          city, 
          state, 
          country, 
          countryCode, 
          flag, 
          plusCode, 
          dateStr, 
          timeStr, 
          dmsCoords: toLatLonDMS(lat, lon),
          road,
          suburb,
          village,
          town,
          postcode
        });
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
