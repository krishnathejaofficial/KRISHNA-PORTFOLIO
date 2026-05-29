import { useState, useEffect, useRef } from 'react';

// Dynamic CDN Loader helpers
const loadScript = (src, id) => {
  return new Promise((resolve) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // avoid blocking on load failure
    document.head.appendChild(script);
  });
};

const loadStyle = (href, id) => {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
};

export default function SuperToolsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('finance'); // finance, calculator, latex, invoice, certificate
  const [auth, setAuth] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('super_tools_auth') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // LaTeX compiler states
  const [latexInput, setLatexInput] = useState(
    '\\section*{Biotechnology Research Summary}\n' +
    'Here is the standard structural equation for enzyme kinetics (Michaelis-Menten Equation):\n' +
    '$$ V_0 = \\frac{V_{max} [S]}{K_m + [S]} $$\n\n' +
    'Where $V_0$ is the initial rate, $V_{max}$ is the maximum velocity, and $K_m$ is the Michaelis constant.'
  );
  const [latexMode, setLatexMode] = useState('document'); // formula, document
  const [katexLoaded, setKatexLoaded] = useState(false);
  const latexPreviewRef = useRef(null);

  // Scientific calculator states
  const [calcDisplay, setCalcDisplay] = useState('');
  const [calcResult, setCalcResult] = useState('');
  const [calcHistory, setCalcHistory] = useState([]);
  const [calcAngleMode, setCalcAngleMode] = useState('Deg'); // Deg, Rad
  const [calcMemory, setCalcMemory] = useState(0);
  const [graphEquation, setGraphEquation] = useState('x^2');
  const [graphPath, setGraphPath] = useState('');

  // Finance calculators states
  const [financeSubTab, setFinanceSubTab] = useState('gst'); // gst, tds, emi, interest, spi
  // GST state
  const [gstAmount, setGstAmount] = useState('10000');
  const [gstRate, setGstRate] = useState('18');
  const [gstCustomRate, setGstCustomRate] = useState('');
  const [gstType, setGstType] = useState('add'); // add, remove
  // TDS state
  const [tdsAmount, setTdsAmount] = useState('50000');
  const [tdsSlab, setTdsSlab] = useState('194J-10'); // 194J-10, 194C-1, 194C-2, 194H-5, Custom
  const [tdsCustomRate, setTdsCustomRate] = useState('');
  // EMI state
  const [emiPrincipal, setEmiPrincipal] = useState('1000000');
  const [emiRate, setEmiRate] = useState('8.5');
  const [emiTenure, setEmiTenure] = useState('120'); // Months
  const [emiTenureType, setEmiTenureType] = useState('months'); // months, years
  const [emiAmortization, setEmiAmortization] = useState([]);
  const [showAmortization, setShowAmortization] = useState(false);
  // Interest state
  const [interestPrincipal, setInterestPrincipal] = useState('50000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [interestTime, setInterestTime] = useState('3'); // Years
  const [interestFreq, setInterestFreq] = useState('1'); // 1=yearly, 2=half-yearly, 4=quarterly, 12=monthly, 0=simple
  // SPI/CPI state
  const [spiCourses, setSpiCourses] = useState([
    { id: 1, name: 'Biochemistry', credits: 4, grade: 10 },
    { id: 2, name: 'Bioinformatics', credits: 3, grade: 9 },
    { id: 3, name: 'Genetic Eng.', credits: 4, grade: 8 },
    { id: 4, name: 'Technical Comm.', credits: 2, grade: 10 }
  ]);
  const [cpiSemesters, setCpiSemesters] = useState([
    { id: 1, sem: 'Semester 1', credits: 21, spi: 9.1 },
    { id: 2, sem: 'Semester 2', credits: 22, spi: 8.9 }
  ]);

  // Invoice Maker states
  const [invoiceTemplate, setInvoiceTemplate] = useState('modern'); // modern, corporate, luxury
  const [invoiceNum, setInvoiceNum] = useState(() => 'INV-' + Math.floor(100000 + Math.random() * 900000));
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().substring(0, 10);
  });
  const [invoiceSellerLogo, setInvoiceSellerLogo] = useState('');
  const [invoiceSellerName, setInvoiceSellerName] = useState('G. Krishna Teja BioConsultants');
  const [invoiceSellerAddr, setInvoiceSellerAddr] = useState('Madharapakkam, Tiruvallur, Tamil Nadu - 601202');
  const [invoiceSellerPhone, setInvoiceSellerPhone] = useState('+91 93908 50349');
  const [invoiceSellerEmail, setInvoiceSellerEmail] = useState('krishnatejareddy2003@gmail.com');
  const [invoiceClientName, setInvoiceClientName] = useState('Apex Healthcare Ltd.');
  const [invoiceClientAddr, setInvoiceClientAddr] = useState('Guindy Tech Park, Chennai - 600032');
  const [invoiceClientPhone, setInvoiceClientPhone] = useState('+91 98765 43210');
  const [invoiceClientEmail, setInvoiceClientEmail] = useState('billing@apexhealth.com');
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, desc: 'Clinical Trial Protocol Review', qty: 2, rate: 15000, tax: 18 },
    { id: 2, desc: 'Bioinformatics Pipeline Setup & Modeling', qty: 1, rate: 45000, tax: 18 }
  ]);
  const [invoiceDiscount, setInvoiceDiscount] = useState('5'); // flat or % handled as %
  const [invoiceTerms, setInvoiceTerms] = useState('1. Payment is due within 15 days of invoice date.\n2. Please mention the Invoice Number in bank transfer.');
  const [invoiceSignature, setInvoiceSignature] = useState('');

  // Certificate Generator states
  const [certTemplate, setCertTemplate] = useState('gold'); // gold, crimson, tech, navy, emerald, royal, minimalist, vintage
  const [certQuality, setCertQuality] = useState('2'); // 1=96dpi, 2=150dpi, 3=300dpi (html2canvas scale parameter)
  const [selectedElement, setSelectedElement] = useState(null);
  const [certElements, setCertElements] = useState({
    title: { text: 'CERTIFICATE OF APPRECIATION', font: 'Cormorant Garamond', size: 28, color: '#D4AF37', weight: 'bold', x: 50, y: 15, opacity: 1, align: 'center' },
    subtitle: { text: 'THIS IS PROUDLY PRESENTED TO', font: 'Montserrat', size: 10, color: '#c8c8c8', weight: 'normal', x: 50, y: 26, opacity: 0.8, align: 'center' },
    recipient: { text: 'G. KRISHNA TEJA', font: 'Great Vibes', size: 48, color: '#f0f0f0', weight: 'normal', x: 50, y: 38, opacity: 1, align: 'center' },
    description: { text: 'for exceptional scientific contributions and research excellence in Biotechnology & Bioinformatics during the academic session 2025-2026.', font: 'Cormorant Garamond', size: 13, color: '#c8c8c8', weight: 'normal', x: 50, y: 52, opacity: 0.9, align: 'center' },
    dateLabel: { text: 'DATE OF ISSUANCE', font: 'Montserrat', size: 8, color: '#888', weight: 'normal', x: 25, y: 76, opacity: 0.7, align: 'center' },
    dateValue: { text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), font: 'Montserrat', size: 11, color: '#D4AF37', weight: 'bold', x: 25, y: 71, opacity: 1, align: 'center' },
    orgLabel: { text: 'ISSUING AUTHORITY', font: 'Montserrat', size: 8, color: '#888', weight: 'normal', x: 75, y: 76, opacity: 0.7, align: 'center' },
    orgValue: { text: 'VIT UNIVERSITY, VELLORE', font: 'Montserrat', size: 11, color: '#D4AF37', weight: 'bold', x: 75, y: 71, opacity: 1, align: 'center' },
    bottomNote: { text: 'Verified Portfolio Certificate · ID: KTP-' + Math.floor(100000 + Math.random() * 900000), font: 'Montserrat', size: 7, color: 'gray', weight: 'normal', x: 50, y: 88, opacity: 0.6, align: 'center' },
  });
  const [certLogo, setCertLogo] = useState('');
  const [certSignature, setCertSignature] = useState('');
  const [logoPos, setLogoPos] = useState({ x: 50, y: 8, size: 50 }); // logo position
  const [sigPos, setSigPos] = useState({ x: 75, y: 64, size: 70 }); // signature position
  
  const certContainerRef = useRef(null);
  const dragItemRef = useRef(null);

  // Check if KaTeX needs to be loaded when activeTab is latex
  useEffect(() => {
    if (activeTab === 'latex' && isOpen) {
      loadStyle('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css', 'katex-css');
      Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js', 'katex-js'),
        loadScript('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Cinzel:wght@500;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap', 'cert-fonts-link')
      ]).then(() => {
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js', 'katex-autorender').then(() => {
          setKatexLoaded(true);
        });
      });
    }
  }, [activeTab, isOpen]);

  // Handle LaTeX real-time render
  useEffect(() => {
    if (activeTab === 'latex' && katexLoaded && latexPreviewRef.current) {
      if (latexMode === 'formula') {
        try {
          const rendered = window.katex.renderToString(latexInput, {
            throwOnError: false,
            displayMode: true
          });
          latexPreviewRef.current.innerHTML = `<div class="latex-formula-render">${rendered}</div>`;
        } catch (e) {
          latexPreviewRef.current.innerHTML = `<span style="color:#ef4444">${e.message}</span>`;
        }
      } else {
        // Document Mode: render full markdown/text with delimiters
        latexPreviewRef.current.innerHTML = latexInput.replace(/\n/g, '<br/>');
        if (window.renderMathInElement) {
          window.renderMathInElement(latexPreviewRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      }
    }
  }, [latexInput, latexMode, katexLoaded, activeTab]);

  // Load custom certificate fonts when cert tab is loaded
  useEffect(() => {
    if (activeTab === 'certificate' && isOpen) {
      loadStyle('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Cinzel:wght@500;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap', 'cert-fonts-link');
    }
  }, [activeTab, isOpen]);

  // Initialize scientific graphing plotter path
  useEffect(() => {
    if (activeTab === 'calculator') {
      plotGraph();
    }
  }, [graphEquation, activeTab]);

  if (!isOpen) return null;

  // --- Password Wall Authentication ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-only-password', password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('super_tools_auth', 'true');
        setAuth(true);
      } else {
        setAuthError(data.error || 'Incorrect admin password.');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const isProtectedTab = activeTab === 'invoice' || activeTab === 'certificate';

  // --- SCIENTIFIC CALCULATOR LOGIC ---
  const handleCalcBtn = (val) => {
    if (val === 'C') {
      setCalcDisplay('');
      setCalcResult('');
    } else if (val === '⌫') {
      setCalcDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safe evaluation replacement
        let exp = calcDisplay
          .replace(/pi/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, calcAngleMode === 'Deg' ? 'Math.sin(Math.PI/180*' : 'Math.sin(')
          .replace(/cos\(/g, calcAngleMode === 'Deg' ? 'Math.cos(Math.PI/180*' : 'Math.cos(')
          .replace(/tan\(/g, calcAngleMode === 'Deg' ? 'Math.tan(Math.PI/180*' : 'Math.tan(')
          .replace(/asin\(/g, calcAngleMode === 'Deg' ? '180/Math.PI*Math.asin(' : 'Math.asin(')
          .replace(/acos\(/g, calcAngleMode === 'Deg' ? '180/Math.PI*Math.acos(' : 'Math.acos(')
          .replace(/atan\(/g, calcAngleMode === 'Deg' ? '180/Math.PI*Math.atan(' : 'Math.atan(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/cbrt\(/g, 'Math.cbrt(')
          .replace(/\^/g, '**');

        // Evaluate safely
        const fn = new Function(`return (${exp})`);
        const res = fn();
        const formattedRes = Number.isInteger(res) ? res : parseFloat(res.toFixed(8));
        setCalcResult(formattedRes.toString());
        setCalcHistory(prev => [{ exp: calcDisplay, res: formattedRes.toString() }, ...prev.slice(0, 9)]);
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcDisplay(prev => prev + val);
    }
  };

  const handleCalcMemory = (op) => {
    const cur = parseFloat(calcResult || calcDisplay || '0');
    if (isNaN(cur)) return;
    if (op === 'MC') setCalcMemory(0);
    if (op === 'MR') setCalcDisplay(prev => prev + calcMemory);
    if (op === 'M+') setCalcMemory(prev => prev + cur);
    if (op === 'M-') setCalcMemory(prev => prev - cur);
    if (op === 'MS') setCalcMemory(cur);
  };

  const plotGraph = () => {
    try {
      // Safe graphing function parser
      // Replace algebraic formulas into safe JS
      let jsEq = graphEquation
        .toLowerCase()
        .replace(/(\d)x/g, '$1*x')
        .replace(/x\^(\d+)/g, 'Math.pow(x,$1)')
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sqrt/g, 'Math.sqrt');

      const fn = new Function('x', `try { return (${jsEq}); } catch(e) { return 0; }`);

      // SVG dimensions are 300 x 200
      // Scale: X matches -10 to +10, Y matches -10 to +10
      // SVG center (0,0) is at (150, 100)
      const scaleX = 15; // 150 / 10 = 15px per unit
      const scaleY = 10; // 100 / 10 = 10px per unit

      let points = [];
      for (let pixelX = 0; pixelX <= 300; pixelX += 2) {
        const x = (pixelX - 150) / scaleX;
        const y = fn(x);
        if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
          const pixelY = 100 - y * scaleY;
          if (pixelY >= -50 && pixelY <= 250) {
            points.push(`${pixelX},${pixelY}`);
          }
        }
      }

      if (points.length > 1) {
        setGraphPath(`M ${points.join(' L ')}`);
      } else {
        setGraphPath('');
      }
    } catch (e) {
      setGraphPath('');
    }
  };

  // --- LATEX TEMPLATE INSERTS ---
  const insertLatexPreset = (latexCode) => {
    setLatexInput(prev => prev + '\n' + latexCode);
  };

  // --- FINANCE CALCULATORS LOGIC ---
  const calculateGST = () => {
    const amt = parseFloat(gstAmount) || 0;
    const rate = parseFloat(gstCustomRate || gstRate) || 0;
    let net = 0, gst = 0, gross = 0;

    if (gstType === 'add') {
      net = amt;
      gst = amt * (rate / 100);
      gross = amt + gst;
    } else {
      gross = amt;
      net = amt / (1 + rate / 100);
      gst = amt - net;
    }

    return {
      net: net.toFixed(2),
      cgst: (gst / 2).toFixed(2),
      sgst: (gst / 2).toFixed(2),
      totalGst: gst.toFixed(2),
      gross: gross.toFixed(2)
    };
  };

  const calculateTDS = () => {
    const amt = parseFloat(tdsAmount) || 0;
    let rate = 0;
    if (tdsSlab === '194J-10') rate = 10;
    else if (tdsSlab === '194C-1') rate = 1;
    else if (tdsSlab === '194C-2') rate = 2;
    else if (tdsSlab === '194H-5') rate = 5;
    else rate = parseFloat(tdsCustomRate) || 0;

    const tds = amt * (rate / 100);
    const net = amt - tds;

    return {
      tds: tds.toFixed(2),
      net: net.toFixed(2),
      rate
    };
  };

  const calculateEMI = () => {
    const p = parseFloat(emiPrincipal) || 0;
    const r = (parseFloat(emiRate) || 0) / 12 / 100;
    const tenureMonths = emiTenureType === 'years' 
      ? (parseFloat(emiTenure) || 0) * 12 
      : parseFloat(emiTenure) || 0;

    if (p === 0 || r === 0 || tenureMonths === 0) return { emi: '0.00', totalInterest: '0.00', totalPayment: '0.00' };

    const emi = p * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1);
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - p;

    // Amortization Schedule generator
    let balance = p;
    let schedule = [];
    for (let i = 1; i <= Math.min(tenureMonths, 360); i++) {
      const interest = balance * r;
      const principal = emi - interest;
      balance = Math.max(balance - principal, 0);
      schedule.push({
        month: i,
        emi: emi.toFixed(2),
        interest: interest.toFixed(2),
        principal: principal.toFixed(2),
        balance: balance.toFixed(2)
      });
    }

    return {
      emi: emi.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      principalPercent: ((p / totalPayment) * 100).toFixed(1),
      interestPercent: ((totalInterest / totalPayment) * 100).toFixed(1),
      schedule
    };
  };

  const calculateInterest = () => {
    const p = parseFloat(interestPrincipal) || 0;
    const r = parseFloat(interestRate) || 0;
    const t = parseFloat(interestTime) || 0;
    const f = parseInt(interestFreq) || 0;

    if (f === 0) {
      // Simple Interest
      const interest = p * (r / 100) * t;
      const total = p + interest;
      return { interest: interest.toFixed(2), total: total.toFixed(2) };
    } else {
      // Compound Interest
      const total = p * Math.pow(1 + (r / 100) / f, f * t);
      const interest = total - p;
      return { interest: interest.toFixed(2), total: total.toFixed(2) };
    }
  };

  const calculateSPI = () => {
    let totalCredits = 0;
    let totalWeightedPoints = 0;
    spiCourses.forEach(c => {
      totalCredits += c.credits;
      totalWeightedPoints += c.credits * c.grade;
    });
    return totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculateCPI = () => {
    let totalCredits = 0;
    let totalWeightedPoints = 0;
    cpiSemesters.forEach(s => {
      totalCredits += s.credits;
      totalWeightedPoints += s.credits * s.spi;
    });
    return totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00';
  };

  const addSpiCourse = () => {
    setSpiCourses(prev => [...prev, { id: Date.now(), name: '', credits: 3, grade: 10 }]);
  };

  const updateSpiCourse = (id, field, val) => {
    setSpiCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: field === 'name' ? val : parseFloat(val) || 0 } : c));
  };

  const deleteSpiCourse = (id) => {
    setSpiCourses(prev => prev.filter(c => c.id !== id));
  };

  const addCpiSemester = () => {
    setCpiSemesters(prev => [...prev, { id: Date.now(), sem: `Semester ${prev.length + 1}`, credits: 20, spi: 9.0 }]);
  };

  const updateCpiSemester = (id, field, val) => {
    setCpiSemesters(prev => prev.map(s => s.id === id ? { ...s, [field]: field === 'sem' ? val : parseFloat(val) || 0 } : s));
  };

  const deleteCpiSemester = (id) => {
    setCpiSemesters(prev => prev.filter(s => s.id !== id));
  };

  // --- INVOICE MAKER ACTIONS ---
  const addInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, { id: Date.now(), desc: '', qty: 1, rate: 0, tax: 18 }]);
  };

  const updateInvoiceItem = (id, field, val) => {
    setInvoiceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: field === 'desc' ? val : parseFloat(val) || 0 } : item));
  };

  const deleteInvoiceItem = (id) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateInvoiceTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    invoiceItems.forEach(item => {
      const lineAmt = item.qty * item.rate;
      const lineTax = lineAmt * (item.tax / 100);
      subtotal += lineAmt;
      totalTax += lineTax;
    });

    const discPercent = parseFloat(invoiceDiscount) || 0;
    const discountAmt = subtotal * (discPercent / 100);
    const grandTotal = subtotal + totalTax - discountAmt;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmt: discountAmt.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const handleBase64Upload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadInvoicePDF = () => {
    // Generate high resolution canvas representation
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-cdn').then(() => {
      const target = document.getElementById('invoice-preview-area');
      if (!target || !window.html2canvas) return;

      // Temporary styles to maximize contrast for printing
      const prevBorder = target.style.border;
      target.style.border = 'none';

      window.html2canvas(target, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
        target.style.border = prevBorder;
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width
        const pageHeight = 295; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`${invoiceNum}.pdf`);
      });
    });
  };

  // --- CERTIFICATE MAKER ACTIONS ---
  const handleCertElementChange = (elKey, field, val) => {
    setCertElements(prev => ({
      ...prev,
      [elKey]: {
        ...prev[elKey],
        [field]: field === 'size' || field === 'x' || field === 'y' || field === 'opacity' ? parseFloat(val) || 0 : val
      }
    }));
  };

  const resetCertPositions = () => {
    setCertElements({
      title: { text: 'CERTIFICATE OF APPRECIATION', font: 'Cormorant Garamond', size: 28, color: '#D4AF37', weight: 'bold', x: 50, y: 15, opacity: 1, align: 'center' },
      subtitle: { text: 'THIS IS PROUDLY PRESENTED TO', font: 'Montserrat', size: 10, color: '#c8c8c8', weight: 'normal', x: 50, y: 26, opacity: 0.8, align: 'center' },
      recipient: { text: 'G. KRISHNA TEJA', font: 'Great Vibes', size: 48, color: '#f0f0f0', weight: 'normal', x: 50, y: 38, opacity: 1, align: 'center' },
      description: { text: 'for exceptional scientific contributions and research excellence in Biotechnology & Bioinformatics during the academic session 2025-2026.', font: 'Cormorant Garamond', size: 13, color: '#c8c8c8', weight: 'normal', x: 50, y: 52, opacity: 0.9, align: 'center' },
      dateLabel: { text: 'DATE OF ISSUANCE', font: 'Montserrat', size: 8, color: '#888', weight: 'normal', x: 25, y: 76, opacity: 0.7, align: 'center' },
      dateValue: { text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), font: 'Montserrat', size: 11, color: '#D4AF37', weight: 'bold', x: 25, y: 71, opacity: 1, align: 'center' },
      orgLabel: { text: 'ISSUING AUTHORITY', font: 'Montserrat', size: 8, color: '#888', weight: 'normal', x: 75, y: 76, opacity: 0.7, align: 'center' },
      orgValue: { text: 'VIT UNIVERSITY, VELLORE', font: 'Montserrat', size: 11, color: '#D4AF37', weight: 'bold', x: 75, y: 71, opacity: 1, align: 'center' },
      bottomNote: { text: 'Verified Portfolio Certificate · ID: KTP-' + Math.floor(100000 + Math.random() * 900000), font: 'Montserrat', size: 7, color: 'gray', weight: 'normal', x: 50, y: 88, opacity: 0.6, align: 'center' },
    });
    setLogoPos({ x: 50, y: 8, size: 50 });
    setSigPos({ x: 75, y: 64, size: 70 });
  };

  // Drag-and-drop Canva mechanics
  const handleDragStart = (e, itemKey) => {
    dragItemRef.current = itemKey;
    // For mouse/touch events offset calculation
    const rect = certContainerRef.current.getBoundingClientRect();
    e.dataTransfer?.setData('text/plain', ''); // Firefox fix
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragItemRef.current || !certContainerRef.current) return;

    const rect = certContainerRef.current.getBoundingClientRect();
    // Compute percentages inside container bounds
    const posX = ((e.clientX - rect.left) / rect.width) * 100;
    const posY = ((e.clientY - rect.top) / rect.height) * 100;

    const roundedX = Math.round(Math.max(0, Math.min(100, posX)));
    const roundedY = Math.round(Math.max(0, Math.min(100, posY)));

    if (dragItemRef.current === 'customLogo') {
      setLogoPos(prev => ({ ...prev, x: roundedX, y: roundedY }));
    } else if (dragItemRef.current === 'customSig') {
      setSigPos(prev => ({ ...prev, x: roundedX, y: roundedY }));
    } else {
      setCertElements(prev => ({
        ...prev,
        [dragItemRef.current]: {
          ...prev[dragItemRef.current],
          x: roundedX,
          y: roundedY
        }
      }));
    }

    dragItemRef.current = null;
  };

  const downloadCertificate = (format) => {
    // Generate high resolution certificate image exports
    const scaleFactor = parseFloat(certQuality) || 2;
    const target = document.getElementById('certificate-canvas-area');
    if (!target || !window.html2canvas) return;

    // Deselect selected element for visual neatness before capturing
    const prevSelected = selectedElement;
    setSelectedElement(null);

    // Timeout allows DOM re-paint before canvas capture
    setTimeout(() => {
      window.html2canvas(target, {
        scale: scaleFactor,
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {
        // Restore selection state
        setSelectedElement(prevSelected);

        if (format === 'pdf') {
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-cdn').then(() => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const { jsPDF } = window.jspdf;
            // Landscape layout for typical certificates
            const pdf = new jsPDF('l', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            pdf.save('Certificate.pdf');
          });
        } else {
          const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const ext = format === 'jpg' ? 'jpg' : 'png';
          const link = document.createElement('a');
          link.download = `Certificate.${ext}`;
          link.href = canvas.toDataURL(mime, format === 'jpg' ? 0.95 : undefined);
          link.click();
        }
      });
    }, 100);
  };

  // Certificate template visual styling parameters
  const getCertStyles = () => {
    const maps = {
      gold: {
        border: '15px solid #D4AF37',
        innerBorder: '2px solid rgba(212,175,55,0.4)',
        background: 'linear-gradient(135deg, #0e0e0e, #1a1a1a)',
        badge: '#D4AF37',
        ribbon: 'linear-gradient(to bottom, #d4af37, #aa820a)'
      },
      crimson: {
        border: '15px solid #8b0000',
        innerBorder: '2px solid rgba(212,175,55,0.6)',
        background: 'linear-gradient(135deg, #120202, #250808)',
        badge: '#D4AF37',
        ribbon: 'linear-gradient(to bottom, #d4af37, #8b0000)'
      },
      tech: {
        border: '12px solid #00f2fe',
        innerBorder: '1px solid rgba(0,242,254,0.3)',
        background: 'linear-gradient(135deg, #050515, #0a1128)',
        badge: '#00f2fe',
        ribbon: 'linear-gradient(to bottom, #4facfe, #00f2fe)'
      },
      navy: {
        border: '15px solid #002060',
        innerBorder: '3px double #D4AF37',
        background: 'linear-gradient(135deg, #020b1e, #0a1835)',
        badge: '#D4AF37',
        ribbon: 'linear-gradient(to bottom, #D4AF37, #002060)'
      },
      emerald: {
        border: '15px solid #046307',
        innerBorder: '2px solid rgba(212,175,55,0.5)',
        background: 'linear-gradient(135deg, #020f03, #0b260e)',
        badge: '#D4AF37',
        ribbon: 'linear-gradient(to bottom, #d4af37, #046307)'
      },
      royal: {
        border: '18px solid #b8932a',
        innerBorder: '4px dashed rgba(255,255,255,0.1)',
        background: 'radial-gradient(circle, #201a08 0%, #0c0a03 100%)',
        badge: '#ffdf7a',
        ribbon: 'linear-gradient(to bottom, #ffe89e, #b8932a)'
      },
      minimalist: {
        border: '2px solid rgba(255,255,255,0.08)',
        innerBorder: '1px solid var(--gold-dim)',
        background: '#090909',
        badge: '#D4AF37',
        ribbon: 'transparent'
      },
      vintage: {
        border: '20px solid #5a3e1b',
        innerBorder: '4px double #d4af37',
        background: 'radial-gradient(circle, #e0cb9d 0%, #c4a96b 100%)',
        badge: '#8a6421',
        ribbon: 'linear-gradient(to bottom, #8a6421, #5a3e1b)'
      }
    };
    return maps[certTemplate] || maps.gold;
  };

  const certStyle = getCertStyles();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-box super-tools-container" onClick={e => e.stopPropagation()} style={{
        maxWidth: '1200px',
        width: '95vw',
        height: '90vh',
        maxHeight: '900px',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        background: 'rgba(12, 12, 12, 0.95)',
        border: '1px solid var(--gold-dim)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.15)'
      }}>
        {/* Modal Header */}
        <div className="super-tools-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
          background: 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--gold), #8a6a10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--gold-glow)'
            }}>
              <i className="fas fa-tools" style={{ color: '#000', fontSize: '1.2em' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.4em', letterSpacing: '0.5px' }}>Super Tools Dashboard</h2>
              <span style={{ fontSize: '0.75em', color: 'gray' }}>Advanced utility widgets for users and administrators</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'gray',
            transition: 'all 0.3s'
          }} onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--gold)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'gray'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Modal Outer Layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} className="super-tools-layout">
          {/* Left Sidebar Nav */}
          <div className="super-tools-sidebar" style={{
            width: '240px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 8px'
          }}>
            {[
              { id: 'finance', icon: 'fa-file-invoice-dollar', label: 'Finance & CGPA' },
              { id: 'calculator', icon: 'fa-calculator', label: 'Scientific Grapher' },
              { id: 'latex', icon: 'fa-square-root-variable', label: 'LaTeX Compiler' },
              { id: 'invoice', icon: 'fa-receipt', label: 'Invoice Maker 🔒' },
              { id: 'certificate', icon: 'fa-award', label: 'Certificate Gen 🔒' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--gold-dim)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9em',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                marginBottom: '6px',
                transition: 'all 0.25s',
                borderLeft: activeTab === tab.id ? '3px solid var(--gold)' : '3px solid transparent'
              }} onMouseEnter={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = '#fff';
                }
              }} onMouseLeave={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}>
                <i className={`fas ${tab.icon}`} style={{ width: '18px', textAlign: 'center' }} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Main Panel */}
          <div className="super-tools-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '24px' }}>
            {/* Protected Tab Screen */}
            {isProtectedTab && !auth ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  maxWidth: '400px',
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--gold-dim)',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                  }}>
                    <i className="fas fa-lock" style={{ color: 'var(--gold)', fontSize: '1.6em' }} />
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4em', color: 'var(--text-bright)' }}>Administrator Authorization</h3>
                  <p style={{ fontSize: '0.85em', color: 'gray', marginBottom: '20px', lineHeight: 1.5 }}>
                    This feature is protected by the portfolio admin password. Please verify your password to proceed.
                  </p>
                  <form onSubmit={handleAuthSubmit}>
                    <input
                      type="password"
                      placeholder="Enter Admin Password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: '#fff',
                        marginBottom: '12px',
                        textAlign: 'center'
                      }}
                      required
                    />
                    {authError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8em', marginBottom: '12px' }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />
                        {authError}
                      </div>
                    )}
                    <button type="submit" className="btn" style={{ width: '100%', padding: '12px' }} disabled={authLoading}>
                      {authLoading ? <i className="fas fa-spinner fa-spin" /> : 'Unlock Access'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              // Active Tab Renderings
              <>
                {/* 1. FINANCE & SPI TAB */}
                {activeTab === 'finance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                      {[
                        { id: 'gst', label: 'GST Tax' },
                        { id: 'tds', label: 'TDS Deduction' },
                        { id: 'emi', label: 'EMI Loan' },
                        { id: 'interest', label: 'Interest Rates' },
                        { id: 'spi', label: 'SPI & CGPA (VIT)' }
                      ].map(sub => (
                        <button key={sub.id} onClick={() => setFinanceSubTab(sub.id)} style={{
                          padding: '6px 16px',
                          borderRadius: '20px',
                          border: '1px solid ' + (financeSubTab === sub.id ? 'var(--gold)' : 'rgba(255,255,255,0.1)'),
                          background: financeSubTab === sub.id ? 'var(--gold-dim)' : 'transparent',
                          color: financeSubTab === sub.id ? 'var(--gold)' : 'gray',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}>
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* SUB: GST */}
                    {financeSubTab === 'gst' && (() => {
                      const res = calculateGST();
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                          <div className="card" style={{ padding: '20px' }}>
                            <h3>GST Calculator</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Amount (₹)</label>
                              <input type="number" value={gstAmount} onChange={e => setGstAmount(e.target.value)} />

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>GST Slab (%)</label>
                              <select value={gstRate} onChange={e => { setGstRate(e.target.value); setGstCustomRate(''); }} style={{
                                padding: '12px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white'
                              }}>
                                <option value="5">5% (Goods & Services)</option>
                                <option value="12">12% (Electronics/Processors)</option>
                                <option value="18">18% (Services/Consulting)</option>
                                <option value="28">28% (Luxury Items)</option>
                                <option value="custom">Custom Slabs</option>
                              </select>

                              {gstRate === 'custom' && (
                                <>
                                  <label style={{ fontSize: '0.85em', color: 'gray' }}>Custom GST Rate (%)</label>
                                  <input type="number" value={gstCustomRate} placeholder="Enter Custom Rate" onChange={e => setGstCustomRate(e.target.value)} />
                                </>
                              )}

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Calculation Mode</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setGstType('add')} style={{
                                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid ' + (gstType === 'add' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'),
                                  background: gstType === 'add' ? 'var(--gold-dim)' : 'transparent', color: gstType === 'add' ? 'white' : 'gray', cursor: 'pointer'
                                }}>
                                  Add GST
                                </button>
                                <button onClick={() => setGstType('remove')} style={{
                                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid ' + (gstType === 'remove' ? 'var(--gold)' : 'rgba(255,255,255,0.1)'),
                                  background: gstType === 'remove' ? 'var(--gold-dim)' : 'transparent', color: gstType === 'remove' ? 'white' : 'gray', cursor: 'pointer'
                                }}>
                                  Reverse GST
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="card" style={{ padding: '20px', background: 'rgba(212,175,55,0.03)', borderColor: 'var(--gold-dim)' }}>
                            <h3>Calculation Results</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Base Amount:</span>
                                <strong style={{ color: '#fff' }}>₹ {res.net}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>CGST Display:</span>
                                <strong style={{ color: '#fff' }}>₹ {res.cgst}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>SGST Display:</span>
                                <strong style={{ color: '#fff' }}>₹ {res.sgst}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Total Tax Deducted:</span>
                                <strong style={{ color: 'var(--gold)' }}>₹ {res.totalGst}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Gross Amount:</span>
                                <strong style={{ fontSize: '1.2em', color: 'var(--gold)', textShadow: '0 0 10px var(--gold-glow)' }}>₹ {res.gross}</strong>
                              </div>
                              
                              {/* Stacked Chart Viz */}
                              <div style={{ marginTop: '20px' }}>
                                <span style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '8px' }}>Amount Composition</span>
                                <div style={{ height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.1)' }}>
                                  <div style={{ flex: res.net, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: '#000', fontWeight: 'bold' }} title={`Net: ₹${res.net}`}>
                                    Net ({((parseFloat(res.net) / parseFloat(res.gross)) * 100).toFixed(0)}%)
                                  </div>
                                  <div style={{ flex: res.totalGst, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: '#000', fontWeight: 'bold' }} title={`GST: ₹${res.totalGst}`}>
                                    Tax
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB: TDS */}
                    {financeSubTab === 'tds' && (() => {
                      const res = calculateTDS();
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                          <div className="card" style={{ padding: '20px' }}>
                            <h3>TDS Calculator</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Gross Amount (₹)</label>
                              <input type="number" value={tdsAmount} onChange={e => setTdsAmount(e.target.value)} />

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>TDS Section slab</label>
                              <select value={tdsSlab} onChange={e => { setTdsSlab(e.target.value); setTdsCustomRate(''); }} style={{
                                padding: '12px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white'
                              }}>
                                <option value="194J-10">Section 194J - Professional Svc (10%)</option>
                                <option value="194C-1">Section 194C - Contractor Indiv (1%)</option>
                                <option value="194C-2">Section 194C - Contractor Co. (2%)</option>
                                <option value="194H-5">Section 194H - Brokerage/Comm. (5%)</option>
                                <option value="custom">Custom Slabs</option>
                              </select>

                              {tdsSlab === 'custom' && (
                                <>
                                  <label style={{ fontSize: '0.85em', color: 'gray' }}>Custom TDS Rate (%)</label>
                                  <input type="number" value={tdsCustomRate} placeholder="Enter Custom Rate" onChange={e => setTdsCustomRate(e.target.value)} />
                                </>
                              )}
                            </div>
                          </div>

                          <div className="card" style={{ padding: '20px', background: 'rgba(212,175,55,0.03)', borderColor: 'var(--gold-dim)' }}>
                            <h3>TDS Calculation Breakdown</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Gross Receivable:</span>
                                <strong style={{ color: '#fff' }}>₹ {parseFloat(tdsAmount).toFixed(2)}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Tax Percentage Rate:</span>
                                <strong style={{ color: '#fff' }}>{res.rate}%</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>TDS Deducted Amount:</span>
                                <strong style={{ color: '#ef4444' }}>₹ {res.tds}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Net Payable Amount:</span>
                                <strong style={{ fontSize: '1.2em', color: 'var(--gold)', textShadow: '0 0 10px var(--gold-glow)' }}>₹ {res.net}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB: EMI */}
                    {financeSubTab === 'emi' && (() => {
                      const res = calculateEMI();
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            <div className="card" style={{ padding: '20px' }}>
                              <h3>EMI Loan Calculator</h3>
                              <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.85em', color: 'gray' }}>Loan Principal (₹)</label>
                                <input type="number" value={emiPrincipal} onChange={e => setEmiPrincipal(e.target.value)} />

                                <label style={{ fontSize: '0.85em', color: 'gray' }}>Interest Slabs (% per annum)</label>
                                <input type="number" step="0.05" value={emiRate} onChange={e => setEmiRate(e.target.value)} />

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                  <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85em', color: 'gray', display: 'block', marginBottom: '8px' }}>Tenure</label>
                                    <input type="number" value={emiTenure} onChange={e => setEmiTenure(e.target.value)} />
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <select value={emiTenureType} onChange={e => setEmiTenureType(e.target.value)} style={{
                                      padding: '12px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white', width: '100%'
                                    }}>
                                      <option value="months">Months</option>
                                      <option value="years">Years</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="card" style={{ padding: '20px', background: 'rgba(212,175,55,0.03)', borderColor: 'var(--gold-dim)' }}>
                              <h3>Loan Breakdown</h3>
                              <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                  <span style={{ color: 'gray' }}>Monthly EMI:</span>
                                  <strong style={{ color: 'var(--gold)', fontSize: '1.15em' }}>₹ {res.emi}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                  <span style={{ color: 'gray' }}>Principal Amount:</span>
                                  <strong style={{ color: '#fff' }}>₹ {parseFloat(emiPrincipal).toFixed(2)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                  <span style={{ color: 'gray' }}>Total Interest Payable:</span>
                                  <strong style={{ color: '#fff' }}>₹ {res.totalInterest}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                  <span style={{ color: 'gray' }}>Total Amount Payable:</span>
                                  <strong style={{ color: '#fff' }}>₹ {res.totalPayment}</strong>
                                </div>

                                {/* Stacked Chart Viz */}
                                <div style={{ marginTop: '10px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: 'gray', marginBottom: '6px' }}>
                                    <span>Composition: Principal vs Interest</span>
                                    <span>{res.principalPercent}% / {res.interestPercent}%</span>
                                  </div>
                                  <div style={{ height: '16px', borderRadius: '8px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.1)' }}>
                                    <div style={{ width: `${res.principalPercent}%`, background: 'var(--gold)' }} />
                                    <div style={{ width: `${res.interestPercent}%`, background: '#ef4444' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Amortization Schedule Table */}
                          <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAmortization(!showAmortization)}>
                              <h4 style={{ margin: 0, color: 'var(--gold)' }}><i className="fas fa-table" style={{ marginRight: '8px' }} /> View Amortization Schedule</h4>
                              <i className={`fas fa-chevron-${showAmortization ? 'up' : 'down'}`} style={{ color: 'var(--gold)' }} />
                            </div>
                            {showAmortization && res.schedule && (
                              <div style={{ marginTop: '20px', maxHeight: '250px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                      <th style={{ padding: '10px' }}>Month</th>
                                      <th style={{ padding: '10px' }}>EMI (₹)</th>
                                      <th style={{ padding: '10px' }}>Principal (₹)</th>
                                      <th style={{ padding: '10px' }}>Interest (₹)</th>
                                      <th style={{ padding: '10px' }}>Balance (₹)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {res.schedule.map(row => (
                                      <tr key={row.month} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '8px 10px', color: 'gray' }}>{row.month}</td>
                                        <td style={{ padding: '8px 10px' }}>{row.emi}</td>
                                        <td style={{ padding: '8px 10px', color: '#10b981' }}>{row.principal}</td>
                                        <td style={{ padding: '8px 10px', color: '#ef4444' }}>{row.interest}</td>
                                        <td style={{ padding: '8px 10px' }}>{row.balance}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB: INTEREST */}
                    {financeSubTab === 'interest' && (() => {
                      const res = calculateInterest();
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                          <div className="card" style={{ padding: '20px' }}>
                            <h3>Simple &amp; Compound Interest</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Principal (₹)</label>
                              <input type="number" value={interestPrincipal} onChange={e => setInterestPrincipal(e.target.value)} />

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Interest Rate (% per annum)</label>
                              <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} />

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Time Duration (Years)</label>
                              <input type="number" step="0.5" value={interestTime} onChange={e => setInterestTime(e.target.value)} />

                              <label style={{ fontSize: '0.85em', color: 'gray' }}>Compounding Frequency</label>
                              <select value={interestFreq} onChange={e => setInterestFreq(e.target.value)} style={{
                                padding: '12px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white'
                              }}>
                                <option value="0">Simple Interest (No compounding)</option>
                                <option value="1">Yearly Compounding</option>
                                <option value="2">Half-Yearly Compounding</option>
                                <option value="4">Quarterly Compounding</option>
                                <option value="12">Monthly Compounding</option>
                              </select>
                            </div>
                          </div>

                          <div className="card" style={{ padding: '20px', background: 'rgba(212,175,55,0.03)', borderColor: 'var(--gold-dim)' }}>
                            <h3>Interest Maturity Breakdown</h3>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Initial Principal:</span>
                                <strong style={{ color: '#fff' }}>₹ {parseFloat(interestPrincipal).toFixed(2)}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                                <span style={{ color: 'gray' }}>Earned Interest:</span>
                                <strong style={{ color: '#10b981', fontSize: '1.1em' }}>+ ₹ {res.interest}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Maturity Amount:</span>
                                <strong style={{ fontSize: '1.2em', color: 'var(--gold)', textShadow: '0 0 10px var(--gold-glow)' }}>₹ {res.total}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SUB: SPI / CGPA */}
                    {financeSubTab === 'spi' && (() => {
                      const spi = calculateSPI();
                      const cpi = calculateCPI();
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                          {/* Semester SPI */}
                          <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h3>SPI (GPA) Calculator</h3>
                              <button className="btn" onClick={addSpiCourse} style={{ padding: '6px 12px', fontSize: '0.75em' }}>+ Add Course</button>
                            </div>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxH: '250px', overflowY: 'auto', paddingRight: '4px', marginBottom: '15px' }}>
                              {spiCourses.map(course => (
                                <div key={course.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input type="text" placeholder="Course Name" value={course.name} onChange={e => updateSpiCourse(course.id, 'name', e.target.value)} style={{ flex: 2, padding: '8px 12px' }} />
                                  <input type="number" placeholder="Credits" value={course.credits} onChange={e => updateSpiCourse(course.id, 'credits', e.target.value)} style={{ flex: 1, padding: '8px 12px' }} />
                                  <select value={course.grade} onChange={e => updateSpiCourse(course.id, 'grade', e.target.value)} style={{
                                    flex: 1.2, padding: '9px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white'
                                  }}>
                                    <option value="10">O [10]</option>
                                    <option value="9">A+ [9]</option>
                                    <option value="8">A [8]</option>
                                    <option value="7">B+ [7]</option>
                                    <option value="6">B [6]</option>
                                    <option value="5">C [5]</option>
                                    <option value="0">F [0]</option>
                                  </select>
                                  <button onClick={() => deleteSpiCourse(course.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash-alt" /></button>
                                </div>
                              ))}
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Semester SPI Score:</span>
                              <strong style={{ fontSize: '1.3em', color: 'var(--gold)', textShadow: '0 0 10px var(--gold-glow)' }}>{spi}</strong>
                            </div>
                          </div>

                          {/* Cumulative CPI */}
                          <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h3>CPI (CGPA) Cumulative</h3>
                              <button className="btn" onClick={addCpiSemester} style={{ padding: '6px 12px', fontSize: '0.75em' }}>+ Add Sem</button>
                            </div>
                            <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxH: '250px', overflowY: 'auto', paddingRight: '4px', marginBottom: '15px' }}>
                              {cpiSemesters.map(sem => (
                                <div key={sem.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input type="text" value={sem.sem} onChange={e => updateCpiSemester(sem.id, 'sem', e.target.value)} style={{ flex: 1.5, padding: '8px 12px' }} />
                                  <input type="number" placeholder="Credits" value={sem.credits} onChange={e => updateCpiSemester(sem.id, 'credits', e.target.value)} style={{ flex: 1, padding: '8px 12px' }} />
                                  <input type="number" step="0.01" placeholder="SPI" value={sem.spi} onChange={e => updateCpiSemester(sem.id, 'spi', e.target.value)} style={{ flex: 1, padding: '8px 12px' }} />
                                  <button onClick={() => deleteCpiSemester(sem.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash-alt" /></button>
                                </div>
                              ))}
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Cumulative CPI (CGPA):</span>
                              <strong style={{ fontSize: '1.3em', color: 'var(--gold)', textShadow: '0 0 10px var(--gold-glow)' }}>{cpi}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. SCIENTIFIC GRAPHING CALCULATOR TAB */}
                {activeTab === 'calculator' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Calculator UI */}
                    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--gold-dim)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '15px'
                      }}>
                        <div style={{ fontSize: '0.85em', color: 'gray', wordBreak: 'break-all', textAlign: 'right', width: '100%' }}>{calcDisplay || '0'}</div>
                        <div style={{ fontSize: '1.4em', color: 'var(--gold)', fontWeight: 'bold', wordBreak: 'break-all' }}>{calcResult || '0'}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <button onClick={() => setCalcAngleMode(p => p === 'Deg' ? 'Rad' : 'Deg')} style={{
                          padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--gold-dim)', background: 'transparent', color: 'var(--gold)', fontSize: '0.75em', cursor: 'pointer'
                        }}>
                          Angle: {calcAngleMode}
                        </button>
                        <span style={{ fontSize: '0.75em', color: 'gray' }}>Memory: {calcMemory.toFixed(4)}</span>
                      </div>

                      {/* Memory Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                        {['MC', 'MR', 'M+', 'M-', 'MS'].map(op => (
                          <button key={op} onClick={() => handleCalcMemory(op)} style={{
                            padding: '8px 4px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.04)', color: 'gray', fontSize: '0.75em', cursor: 'pointer'
                          }}>{op}</button>
                        ))}
                      </div>

                      {/* Sci Operators */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                        {['sin(', 'cos(', 'tan(', 'asin(', 'acos('].map(op => (
                          <button key={op} onClick={() => handleCalcBtn(op)} style={{
                            padding: '8px 4px', borderRadius: '6px', border: 'none', background: 'rgba(212,175,55,0.08)', color: 'var(--gold)', fontSize: '0.8em', cursor: 'pointer'
                          }}>{op.replace('(', '')}</button>
                        ))}
                        {['atan(', 'ln(', 'log(', 'sqrt(', '^'].map(op => (
                          <button key={op} onClick={() => handleCalcBtn(op)} style={{
                            padding: '8px 4px', borderRadius: '6px', border: 'none', background: 'rgba(212,175,55,0.08)', color: 'var(--gold)', fontSize: '0.8em', cursor: 'pointer'
                          }}>{op === '^' ? 'x^y' : op.replace('(', '')}</button>
                        ))}
                      </div>

                      {/* Standard Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', flex: 1 }}>
                        {/* Row 1 */}
                        {['(', ')', 'pi', 'e', 'C'].map(btn => (
                          <button key={btn} onClick={() => handleCalcBtn(btn)} style={{
                            padding: '12px 4px', borderRadius: '8px', border: 'none', background: btn === 'C' ? '#ef4444' : 'rgba(255,255,255,0.06)', color: btn === 'C' ? 'white' : 'var(--text-bright)', fontWeight: 'bold', cursor: 'pointer'
                          }}>{btn}</button>
                        ))}
                        {/* Row 2 */}
                        {['7', '8', '9', '/', '⌫'].map(btn => (
                          <button key={btn} onClick={() => handleCalcBtn(btn)} style={{
                            padding: '12px 4px', borderRadius: '8px', border: 'none', background: btn === '⌫' ? '#f59e0b' : 'rgba(255,255,255,0.08)', color: btn === '⌫' ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer'
                          }}>{btn}</button>
                        ))}
                        {/* Row 3 */}
                        {['4', '5', '6', '*', '('].map(btn => {
                          const actual = btn === '(' ? '+' : btn; // fix template map
                          return (
                            <button key={btn} onClick={() => handleCalcBtn(actual)} style={{
                              padding: '12px 4px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                            }}>{actual}</button>
                          );
                        })}
                        {/* Row 4 */}
                        {['1', '2', '3', '-', ')'].map(btn => {
                          const actual = btn === ')' ? '=' : btn;
                          return (
                            <button key={btn} onClick={() => { if (actual === '=') handleCalcBtn('='); else handleCalcBtn(actual); }} style={{
                              gridRow: actual === '=' ? 'span 2' : 'auto',
                              padding: '12px 4px', borderRadius: '8px', border: 'none', background: actual === '=' ? 'var(--gold)' : 'rgba(255,255,255,0.08)', color: actual === '=' ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer'
                            }}>{actual}</button>
                          );
                        })}
                        {/* Row 5 */}
                        {['0', '.', '+'].map(btn => (
                          <button key={btn} onClick={() => handleCalcBtn(btn)} style={{
                            gridColumn: btn === '0' ? 'span 2' : 'auto',
                            padding: '12px 4px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                          }}>{btn}</button>
                        ))}
                      </div>
                    </div>

                    {/* Coordinate SVG Grapher */}
                    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <h3>Interactive SVG Function Grapher</h3>
                      <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                          type="text"
                          value={graphEquation}
                          onChange={e => setGraphEquation(e.target.value)}
                          placeholder="e.g. sin(x) or x^2 or cos(x)*2"
                          style={{ flex: 1, padding: '10px 14px' }}
                        />
                        <button className="btn" onClick={plotGraph} style={{ padding: '10px 20px' }}>Plot</button>
                      </div>

                      <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        minHeight: '220px'
                      }}>
                        {/* SVG Drawing Board */}
                        <svg width="300" height="200" viewBox="0 0 300 200" style={{ width: '100%', height: '100%' }}>
                          {/* Grid Lines */}
                          {Array.from({ length: 21 }).map((_, i) => (
                            <line key={`x-${i}`} x1={i * 15} y1="0" x2={i * 15} y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          ))}
                          {Array.from({ length: 21 }).map((_, i) => (
                            <line key={`y-${i}`} x1="0" y1={i * 10} x2="300" y2={i * 10} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                          ))}

                          {/* Axes */}
                          <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                          <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

                          {/* Ticks & Labels */}
                          <text x="290" y="112" fill="gray" fontSize="8">X</text>
                          <text x="155" y="10" fill="gray" fontSize="8">Y</text>

                          {/* Rendered Function Curve Path */}
                          {graphPath && (
                            <path d={graphPath} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                        </svg>
                      </div>

                      {/* Plotter Legend Help */}
                      <div style={{ marginTop: '10px', fontSize: '0.78em', color: 'gray' }}>
                        <strong>Supported syntax:</strong> <code>x^2</code>, <code>sin(x)</code>, <code>cos(x)</code>, <code>sqrt(x)</code>, <code>2*x + 1</code>.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LATEX COMPILER TAB */}
                {activeTab === 'latex' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                    {/* LaTeX Presets Panel */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85em', color: 'gray' }}>Insert Preset:</span>
                      {[
                        { label: 'Fraction', code: '\\frac{a}{b}' },
                        { label: 'Matrix', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
                        { label: 'Integral', code: '\\int_{a}^{b} x^2 \\, dx' },
                        { label: 'Sigma Sum', code: '\\sum_{i=1}^{n} i' },
                        { label: 'Limits', code: '\\lim_{x \\to \\infty} f(x)' },
                        { label: 'Square Root', code: '\\sqrt{x}' }
                      ].map(preset => (
                        <button key={preset.label} onClick={() => insertLatexPreset(preset.code)} style={{
                          padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.05)', color: 'var(--gold)', fontSize: '0.78em', cursor: 'pointer'
                        }}>{preset.label}</button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <label style={{ color: 'gray', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={latexMode === 'document'} onChange={() => setLatexMode('document')} />
                        Document Mode (Render inline $ and display $$ blocks)
                      </label>
                      <label style={{ color: 'gray', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="radio" checked={latexMode === 'formula'} onChange={() => setLatexMode('formula')} />
                        Formula Mode (Renders input directly inside math block)
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', flex: 1 }}>
                      {/* Editor */}
                      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <h3>LaTeX Code Editor</h3>
                        <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                        <textarea
                          value={latexInput}
                          onChange={e => setLatexInput(e.target.value)}
                          style={{
                            flex: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.9em',
                            lineHeight: 1.5,
                            background: '#090909',
                            color: '#e0e0e0',
                            border: '1.5px solid var(--gold-dim)',
                            borderRadius: '10px',
                            padding: '16px',
                            resize: 'none',
                            minHeight: '280px'
                          }}
                        />
                      </div>

                      {/* Compiler Live Preview */}
                      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <h3>Compiled Mathematical Preview</h3>
                        <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />
                        <div
                          ref={latexPreviewRef}
                          style={{
                            flex: 1,
                            background: '#fff',
                            color: '#111',
                            borderRadius: '10px',
                            padding: '24px',
                            overflow: 'auto',
                            lineHeight: 1.6,
                            fontSize: '0.95em',
                            border: '1px solid rgba(255,255,255,0.08)',
                            minHeight: '280px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PROFESSIONAL INVOICE MAKER TAB */}
                {activeTab === 'invoice' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                    {/* Invoice Editor Form Panel */}
                    <div className="card" style={{ padding: '20px', overflowY: 'auto', maxHeight: '680px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3>Invoice Details Form</h3>
                        <select value={invoiceTemplate} onChange={e => setInvoiceTemplate(e.target.value)} style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', fontSize: '0.8em', cursor: 'pointer'
                        }}>
                          <option value="modern" style={{ background: '#111' }}>Modern Corporate</option>
                          <option value="corporate" style={{ background: '#111' }}>Classic Navy</option>
                          <option value="luxury" style={{ background: '#111' }}>Luxurious Gold</option>
                        </select>
                      </div>
                      <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Invoice No.</label>
                            <input type="text" value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Discount (%)</label>
                            <input type="number" value={invoiceDiscount} onChange={e => setInvoiceDiscount(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Issue Date</label>
                            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Due Date</label>
                            <input type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          </div>
                        </div>

                        {/* Seller Metadata */}
                        <h4 style={{ color: 'var(--gold)', fontSize: '0.9em', marginTop: '10px' }}>Your Company Details (Seller)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            Upload Logo
                            <input type="file" accept="image/*" onChange={e => handleBase64Upload(e, setInvoiceSellerLogo)} style={{ display: 'none' }} />
                          </label>
                          <input type="text" placeholder="Company Name" value={invoiceSellerName} onChange={e => setInvoiceSellerName(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        </div>
                        <input type="text" placeholder="Seller Address" value={invoiceSellerAddr} onChange={e => setInvoiceSellerAddr(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input type="text" placeholder="Seller Phone" value={invoiceSellerPhone} onChange={e => setInvoiceSellerPhone(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          <input type="email" placeholder="Seller Email" value={invoiceSellerEmail} onChange={e => setInvoiceSellerEmail(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        </div>

                        {/* Client Details */}
                        <h4 style={{ color: 'var(--gold)', fontSize: '0.9em', marginTop: '10px' }}>Client Details (Bill To)</h4>
                        <input type="text" placeholder="Client Name" value={invoiceClientName} onChange={e => setInvoiceClientName(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        <input type="text" placeholder="Client Address" value={invoiceClientAddr} onChange={e => setInvoiceClientAddr(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <input type="text" placeholder="Client Phone" value={invoiceClientPhone} onChange={e => setInvoiceClientPhone(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                          <input type="email" placeholder="Client Email" value={invoiceClientEmail} onChange={e => setInvoiceClientEmail(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                        </div>

                        {/* Items Editor */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <h4 style={{ color: 'var(--gold)', fontSize: '0.9em' }}>Line Items</h4>
                          <button onClick={addInvoiceItem} style={{ padding: '4px 10px', fontSize: '0.7em' }} className="btn">+ Add Item</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {invoiceItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input type="text" placeholder="Item Description" value={item.desc} onChange={e => updateInvoiceItem(item.id, 'desc', e.target.value)} style={{ flex: 2, padding: '8px 10px', fontSize: '0.85em' }} />
                              <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateInvoiceItem(item.id, 'qty', e.target.value)} style={{ width: '50px', padding: '8px 4px', fontSize: '0.85em', textAlign: 'center' }} />
                              <input type="number" placeholder="Rate" value={item.rate} onChange={e => updateInvoiceItem(item.id, 'rate', e.target.value)} style={{ width: '80px', padding: '8px 4px', fontSize: '0.85em', textAlign: 'center' }} />
                              <input type="number" placeholder="Tax%" value={item.tax} onChange={e => updateInvoiceItem(item.id, 'tax', e.target.value)} style={{ width: '50px', padding: '8px 4px', fontSize: '0.85em', textAlign: 'center' }} />
                              <button onClick={() => deleteInvoiceItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><i className="fas fa-trash-alt" /></button>
                            </div>
                          ))}
                        </div>

                        {/* Terms and Signatures */}
                        <textarea placeholder="Terms and Conditions" value={invoiceTerms} onChange={e => setInvoiceTerms(e.target.value)} style={{ minHeight: '60px', fontSize: '0.85em', padding: '10px' }} />
                        <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                          Upload Digital Signature
                          <input type="file" accept="image/*" onChange={e => handleBase64Upload(e, setInvoiceSignature)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>

                    {/* Invoice Live Printable Preview Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div id="invoice-preview-area" style={{
                        background: '#ffffff',
                        color: '#111111',
                        padding: '30px',
                        fontFamily: "'DM Sans', sans-serif",
                        minHeight: '640px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'auto'
                      }}>
                        {/* Selected Template styling helper */}
                        <div style={{
                          borderTop: invoiceTemplate === 'corporate' ? '8px solid #002060' : invoiceTemplate === 'luxury' ? '8px solid #b8932a' : 'none'
                        }}>
                          {/* Invoice Top Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1.5px solid #eee', paddingBottom: '15px', alignItems: 'center' }}>
                            <div>
                              {invoiceSellerLogo ? (
                                <img src={invoiceSellerLogo} alt="Logo" style={{ maxHeight: '45px', maxWidth: '150px', objectFit: 'contain', marginBottom: '10px' }} />
                              ) : (
                                <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: invoiceTemplate === 'corporate' ? '#002060' : invoiceTemplate === 'luxury' ? '#b8932a' : '#111', marginBottom: '10px' }}>
                                  {invoiceSellerName}
                                </div>
                              )}
                              <div style={{ fontSize: '0.7em', color: '#555', lineHeight: 1.4 }}>
                                {invoiceSellerAddr}<br />
                                {invoiceSellerPhone} · {invoiceSellerEmail}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <h2 style={{ color: invoiceTemplate === 'corporate' ? '#002060' : invoiceTemplate === 'luxury' ? '#b8932a' : '#111', fontSize: '1.6em', margin: 0, fontWeight: 'bold' }}>INVOICE</h2>
                              <div style={{ fontSize: '0.8em', marginTop: '6px', color: '#333' }}>
                                <strong>No:</strong> {invoiceNum}<br />
                                <strong>Date:</strong> {invoiceDate}<br />
                                <strong style={{ color: '#ef4444' }}>Due Date:</strong> {invoiceDueDate}
                              </div>
                            </div>
                          </div>

                          {/* Billing Information Block */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '0.78em', color: '#333' }}>
                            <div style={{ background: '#fcfcfc', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                              <strong style={{ color: '#000', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BILL TO:</strong>
                              <span style={{ fontSize: '1em', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{invoiceClientName}</span>
                              {invoiceClientAddr}<br />
                              {invoiceClientPhone} · {invoiceClientEmail}
                            </div>
                          </div>

                          {/* Line Items Table */}
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78em', marginBottom: '20px' }}>
                            <thead>
                              <tr style={{
                                background: invoiceTemplate === 'corporate' ? '#002060' : invoiceTemplate === 'luxury' ? '#b8932a' : '#1f2937',
                                color: '#ffffff'
                              }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Item Description</th>
                                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate (₹)</th>
                                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Tax%</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Total (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceItems.map(item => {
                                const lineTotal = item.qty * item.rate;
                                return (
                                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: '500', color: '#111' }}>{item.desc || 'Consultancy Services'}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'gray' }}>{item.tax}%</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#111' }}>{lineTotal.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Totals Summary Block */}
                          {(() => {
                            const t = calculateInvoiceTotals();
                            return (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78em', marginTop: '10px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1.2, paddingRight: '20px' }}>
                                  {invoiceTerms && (
                                    <>
                                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85em', color: '#444' }}>Terms &amp; Notes:</strong>
                                      <p style={{ color: 'gray', fontSize: '0.9em', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{invoiceTerms}</p>
                                    </>
                                  )}
                                </div>
                                <div style={{ flex: 0.8, background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: 'gray' }}>Subtotal:</span>
                                    <strong>₹ {t.subtotal}</strong>
                                  </div>
                                  {parseFloat(t.discountAmt) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10b981' }}>
                                      <span>Discount ({invoiceDiscount}%):</span>
                                      <strong>- ₹ {t.discountAmt}</strong>
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                                    <span style={{ color: 'gray' }}>Total Taxes:</span>
                                    <strong>₹ {t.totalTax}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05em', color: invoiceTemplate === 'corporate' ? '#002060' : invoiceTemplate === 'luxury' ? '#b8932a' : '#000' }}>
                                    <span style={{ fontWeight: 'bold' }}>Grand Total:</span>
                                    <strong style={{ fontWeight: '900' }}>₹ {t.grandTotal}</strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Invoice Signature Block */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                          <div style={{ fontSize: '0.65em', color: 'gray' }}>
                            Thank you for your business! · generated via krishna's Portfolio Portal.
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {invoiceSignature ? (
                              <img src={invoiceSignature} alt="Signature" style={{ maxHeight: '35px', maxWidth: '100px', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginBottom: '4px' }} />
                            ) : (
                              <div style={{ width: '100px', borderBottom: '1.5px solid #eee', marginBottom: '4px', marginLeft: 'auto', height: '20px' }} />
                            )}
                            <strong style={{ fontSize: '0.7em', color: '#111', display: 'block' }}>Authorized Signatory</strong>
                          </div>
                        </div>
                      </div>

                      <button onClick={downloadInvoicePDF} className="btn" style={{ width: '100%' }}>
                        <i className="fas fa-file-pdf" style={{ marginRight: '8px' }} /> Download Professional PDF
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. DRAG AND DROP CERTIFICATE MAKER TAB */}
                {activeTab === 'certificate' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Canva controls sidebar panel */}
                    <div className="card" style={{ padding: '20px', overflowY: 'auto', maxHeight: '680px' }}>
                      <h3>Canva-like Certificate Controls</h3>
                      <div className="section-divider" style={{ margin: '10px 0 20px 0' }} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Selector parameters */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Template Theme</label>
                            <select value={certTemplate} onChange={e => setCertTemplate(e.target.value)} style={{
                              padding: '10px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white', width: '100%'
                            }}>
                              <option value="gold">Gold Ribbon Classic</option>
                              <option value="crimson">Crimson Royal</option>
                              <option value="tech">Modern Tech Cyan</option>
                              <option value="navy">Navy Elite</option>
                              <option value="emerald">Emerald Academic</option>
                              <option value="royal">Royal Gold Deluxe</option>
                              <option value="minimalist">Minimalist Luxury</option>
                              <option value="vintage">Vintage scroll</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '6px' }}>Render Quality DPI</label>
                            <select value={certQuality} onChange={e => setCertQuality(e.target.value)} style={{
                              padding: '10px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white', width: '100%'
                            }}>
                              <option value="1">Standard (96 DPI)</option>
                              <option value="2">High HD (150 DPI)</option>
                              <option value="3">Ultra Print (300 DPI)</option>
                            </select>
                          </div>
                        </div>

                        {/* File uploads */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                          <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            Upload Logo Image
                            <input type="file" accept="image/*" onChange={e => handleBase64Upload(e, setCertLogo)} style={{ display: 'none' }} />
                          </label>
                          <label style={{ fontSize: '0.78em', color: 'gray', display: 'block', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            Upload Signature
                            <input type="file" accept="image/*" onChange={e => handleBase64Upload(e, setCertSignature)} style={{ display: 'none' }} />
                          </label>
                        </div>

                        {/* Element Editor Sidebar Area */}
                        <h4 style={{ color: 'var(--gold)', fontSize: '0.9em', marginTop: '10px' }}>Active Element Customizer</h4>
                        <select value={selectedElement || ''} onChange={e => setSelectedElement(e.target.value || null)} style={{
                          padding: '10px', borderRadius: '10px', border: '1.5px solid var(--gold-dim)', background: 'var(--surface-2)', color: 'white'
                        }}>
                          <option value="">-- Choose Element to Edit --</option>
                          <option value="title">Certificate Title Text</option>
                          <option value="subtitle">Presentation Label</option>
                          <option value="recipient">Recipient Full Name</option>
                          <option value="description">Achievement Summary</option>
                          <option value="dateValue">Date String</option>
                          <option value="orgValue">Authority / Organization</option>
                          <option value="bottomNote">Verification Footer</option>
                        </select>

                        {selectedElement && certElements[selectedElement] && (
                          <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <label style={{ fontSize: '0.8em', color: 'gray' }}>Text Content</label>
                            <input type="text" value={certElements[selectedElement].text} onChange={e => handleCertElementChange(selectedElement, 'text', e.target.value)} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Font Family</label>
                                <select value={certElements[selectedElement].font} onChange={e => handleCertElementChange(selectedElement, 'font', e.target.value)} style={{
                                  padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-2)', color: 'white', width: '100%'
                                }}>
                                  <option value="Cormorant Garamond">Cormorant Garamond</option>
                                  <option value="Great Vibes">Great Vibes (Cursive)</option>
                                  <option value="Cinzel">Cinzel (Roman)</option>
                                  <option value="Montserrat">Montserrat (Sleek)</option>
                                  <option value="Playfair Display">Playfair Display</option>
                                  <option value="sans-serif">System Sans</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Font Size (px)</label>
                                <input type="number" value={certElements[selectedElement].size} onChange={e => handleCertElementChange(selectedElement, 'size', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Color Preset</label>
                                <select value={certElements[selectedElement].color} onChange={e => handleCertElementChange(selectedElement, 'color', e.target.value)} style={{
                                  padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-2)', color: 'white', width: '100%'
                                }}>
                                  <option value="#D4AF37">Premium Gold</option>
                                  <option value="#f0f0f0">Bright White</option>
                                  <option value="#c8c8c8">Light Slate</option>
                                  <option value="#888888">Medium Gray</option>
                                  <option value="#8b0000">Crimson Red</option>
                                  <option value="#00f2fe">Tech Cyan</option>
                                  <option value="#000000">Deep Black</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Font Weight</label>
                                <select value={certElements[selectedElement].weight} onChange={e => handleCertElementChange(selectedElement, 'weight', e.target.value)} style={{
                                  padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-2)', color: 'white', width: '100%'
                                }}>
                                  <option value="normal">Normal</option>
                                  <option value="bold">Bold</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Position X (%)</label>
                                <input type="number" min="0" max="100" value={certElements[selectedElement].x} onChange={e => handleCertElementChange(selectedElement, 'x', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.8em', color: 'gray', display: 'block', marginBottom: '4px' }}>Position Y (%)</label>
                                <input type="number" min="0" max="100" value={certElements[selectedElement].y} onChange={e => handleCertElementChange(selectedElement, 'y', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                              </div>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button onClick={resetCertPositions} style={{ flex: 1, padding: '10px', fontSize: '0.85em', background: 'var(--surface-2)', color: 'white', border: '1px solid var(--border)' }} className="btn">
                            <i className="fas fa-undo" style={{ marginRight: '6px' }} /> Reset Canvas
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Canvas Area with drag and drop */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div
                        id="certificate-canvas-area"
                        ref={certContainerRef}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                          width: '100%',
                          aspectRatio: '1.414', // Standard landscape ratio A4
                          background: certStyle.background,
                          border: certStyle.border,
                          outline: certStyle.innerBorder,
                          outlineOffset: '-10px',
                          borderRadius: '8px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          userSelect: 'none'
                        }}
                      >
                        {/* Certificate ribbon corner watermark background */}
                        {certStyle.ribbon !== 'transparent' && (
                          <div style={{
                            position: 'absolute',
                            width: '80px',
                            height: '80px',
                            background: certStyle.ribbon,
                            top: '-40px',
                            left: '-40px',
                            transform: 'rotate(45deg)',
                            opacity: 0.8
                          }} />
                        )}

                        {/* Logo Element */}
                        {certLogo && (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'customLogo')}
                            style={{
                              position: 'absolute',
                              left: `${logoPos.x}%`,
                              top: `${logoPos.y}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: 'move',
                              zIndex: 10
                            }}
                          >
                            <img src={certLogo} alt="Logo" style={{ width: `${logoPos.size}px`, objectFit: 'contain' }} />
                          </div>
                        )}

                        {/* Signature Element */}
                        {certSignature && (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'customSig')}
                            style={{
                              position: 'absolute',
                              left: `${sigPos.x}%`,
                              top: `${sigPos.y}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: 'move',
                              zIndex: 10
                            }}
                          >
                            <img src={certSignature} alt="Sig" style={{ width: `${sigPos.size}px`, objectFit: 'contain' }} />
                          </div>
                        )}

                        {/* Elements Mapping */}
                        {Object.entries(certElements).map(([key, el]) => (
                          <div
                            key={key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, key)}
                            onClick={() => setSelectedElement(key)}
                            style={{
                              position: 'absolute',
                              left: `${el.x}%`,
                              top: `${el.y}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: 'move',
                              fontFamily: el.font,
                              fontSize: `${el.size * 0.7}px`, // scaling factor for fit
                              color: el.color,
                              fontWeight: el.weight,
                              opacity: el.opacity,
                              textAlign: el.align,
                              whiteSpace: 'nowrap',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: selectedElement === key ? '1.5px dashed var(--gold)' : '1.5px dashed transparent',
                              background: selectedElement === key ? 'rgba(212,175,55,0.1)' : 'transparent',
                              zIndex: 5
                            }}
                          >
                            {el.text}
                          </div>
                        ))}
                      </div>

                      {/* Download Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <button onClick={() => downloadCertificate('png')} className="btn" style={{ padding: '10px 4px', fontSize: '0.8em' }}>
                          <i className="fas fa-file-image" style={{ marginRight: '6px' }} /> Download PNG
                        </button>
                        <button onClick={() => downloadCertificate('jpg')} className="btn" style={{ padding: '10px 4px', fontSize: '0.8em', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                          <i className="fas fa-file-image" style={{ marginRight: '6px' }} /> Download JPG
                        </button>
                        <button onClick={() => downloadCertificate('pdf')} className="btn" style={{ padding: '10px 4px', fontSize: '0.8em', background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                          <i className="fas fa-file-pdf" style={{ marginRight: '6px' }} /> Download PDF
                        </button>
                      </div>
                      <div style={{ fontSize: '0.75em', color: 'gray', textAlign: 'center', marginTop: '-5px' }}>
                        💡 <strong>Canva Tip:</strong> Click and drag elements directly on the certificate to move them!
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
