import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Zap,
  Database,
  Code,
  CheckCircle,
  Lock,
  Copy,
  Menu,
  X,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Server,
  Globe,
  FileText,
  List,
  Search,
  Check,
  Key,
  Share2,
  Activity
} from 'lucide-react';

// --- CONFIGURATION ---
// ⚠️ PENTING: Masukkan SITE KEY Google Recaptcha Anda di sini.
// Contoh: const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZZZZZZZZZZZZZZZZZZZZZ";
// JANGAN masukkan Secret Key di sini! Secret Key hanya untuk backend.
const RECAPTCHA_SITE_KEY = "";

// --- Components ---

const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) => {
  const baseStyle = "px-5 py-2.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white focus:ring-gray-200",
    subtle: "text-blue-600 hover:bg-blue-50 bg-transparent",
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

// --- Google Recaptcha Components ---

// 1. Mock Component (Fallback jika Key belum ada)
const MockRecaptcha = ({ onChange }) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (checked || loading) return;
    setLoading(true);
    // Simulate network verification delay
    setTimeout(() => {
      setLoading(false);
      setChecked(true);
      if (onChange) onChange("dummy-recaptcha-token-mock");
    }, 1000);
  };

  return (
    <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] w-full sm:w-[302px] h-[76px] flex items-center px-3 shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] select-none my-4 relative overflow-hidden">
      <div className="flex items-center z-10">
        <div
          onClick={handleClick}
          className={`w-[28px] h-[28px] border-[2px] rounded-[2px] cursor-pointer bg-white flex items-center justify-center transition-all ${checked ? 'border-transparent' : 'border-[#c1c1c1] hover:border-[#b2b2b2]'}`}
        >
          {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          {checked && <Check className="w-5 h-5 text-[#009688] stroke-[4]" />}
        </div>
        <span className="ml-3 text-[14px] text-[#282828] font-normal cursor-pointer" onClick={handleClick}>I'm not a robot (Mode Simulasi)</span>
      </div>
      <div className="ml-auto flex flex-col items-end justify-center h-full pr-1 z-10">
        <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-[32px] h-[32px] opacity-100 block mb-1" />
        <div className="text-[10px] text-[#555] leading-none mb-[2px]">reCAPTCHA</div>
        <div className="flex gap-1 text-[8px] text-[#555] leading-none">
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span>-</span>
          <span className="hover:underline cursor-pointer">Terms</span>
        </div>
      </div>
    </div>
  );
};

// 2. Real Google Recaptcha Implementation
const GoogleRecaptcha = ({ onChange }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    // Load Script Dynamically
    const loadScript = () => {
      if (document.getElementById('g-recaptcha-script')) {
        setIsScriptLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.id = 'g-recaptcha-script';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.grecaptcha && window.grecaptcha.render && containerRef.current) {
      // Pastikan container kosong sebelum render untuk menghindari duplikasi
      if (containerRef.current.innerHTML !== '') return;

      try {
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          'sitekey': RECAPTCHA_SITE_KEY,
          'callback': (token) => onChange(token),
          'expired-callback': () => onChange(null)
        });
      } catch (err) {
        console.error("Recaptcha Render Error:", err);
      }
    } else if (isScriptLoaded) {
      // Retry jika script loaded tapi object belum ready
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(interval);
          if (containerRef.current && containerRef.current.innerHTML === '') {
            widgetId.current = window.grecaptcha.render(containerRef.current, {
              'sitekey': RECAPTCHA_SITE_KEY,
              'callback': (token) => onChange(token),
              'expired-callback': () => onChange(null)
            });
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isScriptLoaded, onChange]);

  if (!RECAPTCHA_SITE_KEY) {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-md">
          <strong>Setup Diperlukan:</strong> Site Key belum dimasukkan di kode `App.jsx`. Menggunakan Mode Simulasi.
        </div>
        <MockRecaptcha onChange={onChange} />
      </div>
    );
  }

  return <div ref={containerRef} className="my-4 min-h-[78px]"></div>;
};

// --- Sections ---

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'docs', label: 'Dokumentasi API' },
    { id: 'contact', label: 'Hubungi Kami' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            {/* <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
              <Zap className="h-6 w-6 text-white" />
            </div> */}
            <img
              src="public/firecek-logo.png"
              alt="Firecek Logo"
              className="h-10 object-contain"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-sm font-medium transition-colors ${activeTab === item.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex">
            <Button variant="primary" onClick={() => setActiveTab('docs')}>Mulai Integrasi</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-900 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 pb-4 shadow-lg absolute w-full left-0 animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <Button className="w-full" variant="primary" onClick={() => { setActiveTab('docs'); setIsOpen(false); }}>Mulai Integrasi</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onCtaClick }) => (
  <div className="relative overflow-hidden bg-white">
    <div className="max-w-7xl mx-auto">
      {/* Content Wrapper */}
      {/* On mobile: bg-transparent to show the image behind. On Desktop: bg-white for clean look */}
      <div className="relative z-10 pb-8 bg-transparent lg:bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
        <main className="mt-8 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Integrasi Sistem</span>{' '}
              <span className="block text-blue-600 xl:inline">Pemadam Cerdas</span>
            </h1>
            <p className="mt-4 text-base text-gray-600 font-medium sm:text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Hubungkan sistem gedung Anda dengan Firecek. Monitoring alat pemadam api ringan (APAR) secara realtime, manajemen inspeksi digital, dan notifikasi kedaluwarsa otomatis.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
              <div className="rounded-md shadow">
                <Button onClick={onCtaClick} className="w-full flex items-center justify-center px-8 py-3 text-base md:py-4 md:text-lg">
                  Baca Dokumentasi
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="">
                <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-base md:py-4 md:text-lg bg-white/80 backdrop-blur-sm lg:bg-white">
                  Hubungi Sales
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    {/* Image Container */}
    {/* On Mobile: Absolute inset-0 (full screen bg), z-0. On Desktop: Right side 50% width. */}
    {/* Fixed: Added lg:left-auto to prevent left:0 from overriding right positioning on desktop */}
    <div className="absolute inset-0 lg:inset-y-0 lg:right-0 lg:w-1/2 lg:left-auto bg-blue-50/50 lg:bg-blue-50 flex items-center justify-center z-0">
      <div className="relative w-full h-full flex justify-center items-center">
        {/* <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 right-10"></div> */}

        {/* Image */}
        {/* On Mobile: opacity-15 (faded bg). On Desktop: opacity-100 (full visibility) */}
        <img
          src="public/hero.jpg"
          alt="Firecek Hero Image"
          className="w-full h-full object-cover opacity-15 lg:opacity-100"
        />
      </div>
    </div>
  </div>
);

// --- Integration Steps ---
const IntegrationSteps = () => {
  const steps = [
    {
      id: '01',
      title: 'Dapatkan Akses Token',
      description: 'Daftarkan perusahaan Anda dan generate Bearer Token melalui dashboard developer kami yang aman.',
      icon: Key
    },
    {
      id: '02',
      title: 'Hubungkan API',
      description: 'Gunakan endpoint standar kami untuk menyinkronkan data APAR dan jadwal inspeksi dari sistem gedung Anda.',
      icon: Share2
    },
    {
      id: '03',
      title: 'Monitoring Otomatis',
      description: 'Data inspeksi akan masuk secara real-time. Terima notifikasi kedaluwarsa dan laporan audit instan.',
      icon: Activity
    }
  ];

  return (
    <div className="py-12 lg:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-16">
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Alur Kerja</span>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Mulai dalam 3 Langkah Mudah</h2>
          <p className="mt-4 max-w-2xl text-lg lg:text-xl text-gray-500 mx-auto">Integrasi sistem proteksi kebakaran tidak pernah sesederhana ini. Kami mempermudah prosesnya untuk developer.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.id} className="relative group p-6 lg:p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                {step.id}
              </div>
              <div className="mt-8 text-center">
                <div className="flex justify-center mb-4 text-blue-500">
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      name: 'Real-time Monitoring',
      description: 'Dapatkan status tekanan dan kondisi APAR secara langsung melalui dashboard terintegrasi.',
      icon: Zap,
    },
    {
      name: 'Keamanan Data',
      description: 'Enkripsi end-to-end memastikan data inspeksi dan aset keselamatan Anda tetap aman.',
      icon: Lock,
    },
    {
      name: 'Integrasi Mudah',
      description: 'RESTful API yang terdokumentasi dengan baik memudahkan tim developer Anda untuk terhubung.',
      icon: Code,
    },
    {
      name: 'Manajemen Terpusat',
      description: 'Kelola ribuan titik APAR dari satu sistem yang tersinkronisasi dengan Firecek.',
      icon: Database,
    },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Fitur Unggulan</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Mengapa Integrasi dengan Firecek?
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Solusi modern untuk manajemen keselamatan kebakaran yang lebih efisien dan terukur.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

// --- Documentation Components ---

const EndpointViewer = ({ title, description, method, path, params, onExecute, responseExample }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [paramValues, setParamValues] = useState({});

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Toast would go here
  };

  const handleExecute = () => {
    setLoading(true);
    setResponse(null);
    // Simulation
    setTimeout(() => {
      setLoading(false);
      setResponse(responseExample);
    }, 1500);
  };

  const methodColor = {
    'GET': 'text-blue-800 bg-blue-100 border-blue-200',
    'POST': 'text-green-800 bg-green-100 border-green-200',
    'PUT': 'text-yellow-800 bg-yellow-100 border-yellow-200',
    'DELETE': 'text-red-800 bg-red-100 border-red-200',
  }[method] || 'text-gray-800 bg-gray-100 border-gray-200';

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-8 whitespace-pre-line">{description}</p>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${methodColor}`}>
              {method}
            </span>
            <code className="text-sm font-mono text-gray-700 whitespace-nowrap">{path}</code>
          </div>
          <button onClick={() => handleCopy(`https://web.firecek.com${path}`)} className="text-gray-400 hover:text-gray-600 ml-4">
            <Copy size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parameters</h3>
              <div className="space-y-4">
                {params.map((param, idx) => (
                  <div key={idx}>
                    <Input
                      label={param.name}
                      type={param.type}
                      placeholder={param.placeholder}
                      required={param.required}
                      value={paramValues[param.name] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                    />
                    {param.desc && <p className="text-xs text-gray-500 mt-1 -mb-2">{param.desc}</p>}
                  </div>
                ))}

                <Button
                  onClick={handleExecute}
                  className="w-full flex justify-center items-center mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : null}
                  {loading ? 'Sending Request...' : 'Execute Request'}
                </Button>
              </div>
            </div>

            {/* Response Preview */}
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto text-gray-300 h-full min-h-[300px] flex flex-col mt-6 md:mt-0">
              <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                <span className="text-gray-400">Response</span>
                {response && <span className="text-green-400 text-xs">200 OK</span>}
              </div>
              {response ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                  <Server size={32} className="mb-2 opacity-50" />
                  <p>Click Execute to see response.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Documentation = () => {
  const [activeDoc, setActiveDoc] = useState('auth');

  // API Data
  const apiDocs = {
    auth: {
      title: "Authentication",
      description: "Firecek API menggunakan autentikasi berbasis Token (Bearer Token). Anda perlu menukarkan kredensial akun Anda untuk mendapatkan akses token.",
      method: "POST",
      path: "/api/shared/v1/get_token",
      params: [
        { name: "login", type: "text", placeholder: "user@company.com", required: true },
        { name: "password", type: "password", placeholder: "••••••••", required: true }
      ],
      responseExample: {
        status: 200,
        message: "Success",
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjM0NTYs...",
          expires_in: 3600,
          token_type: "Bearer"
        }
      }
    },
    self_checking: {
      title: "Self Checking",
      description: "Mengambil daftar realisasi/inspeksi untuk user yang terautentikasi.\nHasil dapat difilter berdasarkan rentang tanggal dan kata kunci pencarian (q).",
      method: "GET",
      path: "/api/shared/v1/self_checking",
      params: [
        { name: "date_from", type: "date", placeholder: "YYYY-MM-DD", required: false, desc: "Format: YYYY-MM-DD" },
        { name: "date_to", type: "date", placeholder: "YYYY-MM-DD", required: false, desc: "Format: YYYY-MM-DD" },
        { name: "q", type: "text", placeholder: "Pencarian...", required: false, desc: "Cari inspeksi title, no_jadwal, atau no_realisasi" }
      ],
      responseExample: {
        success: true,
        message: "Request success",
        data: [
          {
            title: "Inspeksi APAR BLN NOVEMBER 2025",
            no_jadwal: "A1/.../2025",
            customer_name: "PT. COMPANY NAME",
            no_realisasi: "R/XXX/A1/7797XXX",
            date: "04 Nov 2025",
            date_raw: "2025-11-05 02:50:51"
          }
        ]
      }
    },
    detail_inspection: {
      title: "Detail Inspection",
      description: "Mengambil detail lengkap hasil inspeksi (header + grouped checklist per barcode).\nEndpoint ini mengembalikan informasi header realisasi, ringkasan, dan struktur detail.",
      method: "GET",
      path: "/api/shared/v1/detail_inspection",
      params: [
        { name: "no_realisasi", type: "text", placeholder: "R/PMS/A1/151XX", required: true, desc: "Nomor realisasi inspeksi" }
      ],
      responseExample: {
        success: true,
        message: "Request success",
        data: {
          header: {
            id: 38022,
            no_realisasi: "R/PMS/A1/74XX",
            tanggal: "2025-10-02",
            customerName: "PT. COMPANY NAME",
            checkerName: "Checker Name"
          },
          detail: {
            "FE.CEK1504MDQxMTE2XXX": {
              inventoryBarcode: "FE.CEK1504MDQxMTE2XXX",
              inventoryBrand: "Firefix",
              inventoryMedium: "Powder",
              inventoryCapacity: "3.0",
              inventoryExpiredDate: "2029-03-15",
              locationRoom: "Gedung >> Lantai 2 >> Dekat Tangga",
              pressure: { "checklistName": "Pressure", "checklistValue": "Good", "gambar": "-" },
              seal: { "checklistName": "Seal", "checklistValue": "Good", "gambar": "-" },
              hose: { "checklistName": "Hose", "checklistValue": "Good", "gambar": "-" },
              cylinder: { "checklistName": "Cylinder", "checklistValue": "Good", "gambar": "-" },
              headgrip: { "checklistName": "Head Grip", "checklistValue": "Good", "gambar": "-" },
              spindlehead: { "checklistName": "Spindle Head", "checklistValue": "Good", "gambar": "-" },
              hidrotest: { "checklistName": "Hidrotest", "checklistValue": "Belum", "gambar": "-" },
              needrefill: { "checklistName": "Need Refill", "checklistValue": "No", "gambar": "-" }
            }
          },
          summary: {
            brokenSeal: 0,
            brokenHose: 0,
            expiredFE: 0
          }
        }
      }
    }
  };

  const activeData = apiDocs[activeDoc];

  // Render logic specific for Authentication which has unique Captcha UI
  const renderContent = () => {
    if (activeDoc === 'auth') {
      return <AuthDocumentation />;
    }
    return (
      <EndpointViewer
        key={activeDoc}
        {...activeData}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Sidebar Nav */}
        <div className="hidden lg:block lg:col-span-3">
          <nav className="sticky top-24 space-y-1">
            <button
              onClick={() => setActiveDoc('auth')}
              className={`${activeDoc === 'auth' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <Lock className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="truncate">Authentication</span>
            </button>
            <button
              onClick={() => setActiveDoc('self_checking')}
              className={`${activeDoc === 'self_checking' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <List className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="truncate">Self Checking</span>
            </button>
            <button
              onClick={() => setActiveDoc('detail_inspection')}
              className={`${activeDoc === 'detail_inspection' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
            >
              <FileText className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="truncate">Detail Inspection</span>
            </button>
          </nav>
        </div>

        {/* Mobile Sidebar Dropdown */}
        <div className="lg:hidden mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Endpoint</label>
          <select
            value={activeDoc}
            onChange={(e) => setActiveDoc(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="auth">Authentication</option>
            <option value="self_checking">Self Checking</option>
            <option value="detail_inspection">Detail Inspection</option>
          </select>
        </div>

        {/* Main Content */}
        <main className="lg:col-span-9">
          <div className="prose prose-blue max-w-none">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Reused Auth specific component with Captcha logic
const AuthDocumentation = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRequestToken = async (e) => {
    e.preventDefault();

    // Validate Recaptcha
    if (!recaptchaToken) {
      alert("Please verify you are not a robot.");
      return;
    }

    setLoading(true);
    setResponse(null);

    // REAL FETCH REQUEST
    try {
      const res = await fetch('https://web.firecek.com/api/shared/v1/get_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          login: username,
          password: password,
          // Recaptcha token dikirim ke server untuk diverifikasi dengan Secret Key
          recaptcha_token: recaptchaToken
        })
      });

      // Handle non-JSON responses or errors gracefully
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        data = { error: "Non-JSON response", status: res.status, text: await res.text() };
      }

      setResponse(data);
    } catch (error) {
      // CORS errors usually end up here in browsers
      setResponse({
        error: "Request Failed",
        details: "Jika Anda melihat ini di Preview, kemungkinan besar karena CORS (Cross-Origin Resource Sharing). API Firecek memblokir request dari domain preview ini.",
        solution: "Kode ini sudah benar. Saat di-deploy ke domain Anda sendiri, request ini akan berhasil.",
        technical_error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication</h1>
      <p className="text-gray-600 mb-8">
        Bagi customer yang sudah terdaftar, silakan gunakan fitur di bawah ini untuk mendapatkan <strong>Access Token</strong>. Masukkan kredensial Anda dan verifikasi captcha.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              POST
            </span>
            <code className="text-sm font-mono text-gray-700 whitespace-nowrap">/api/shared/v1/get_token</code>
          </div>
          <button onClick={() => handleCopy('https://web.firecek.com/api/shared/v1/get_token')} className="text-gray-400 hover:text-gray-600 ml-4">
            <Copy size={16} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Endpoint ini membutuhkan parameter <code>login</code> dan <code>password</code>.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Get Access Token</h3>
              <form onSubmit={handleRequestToken} className="space-y-4">
                <Input
                  label="Username / Email"
                  placeholder="user@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Google Recaptcha Implementation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Security Check</label>
                  <GoogleRecaptcha onChange={(token) => setRecaptchaToken(token)} />
                </div>

                <Button
                  type="submit"
                  className="w-full flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : null}
                  {loading ? 'Requesting Token...' : 'Request Token'}
                </Button>
              </form>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto text-gray-300 h-full min-h-[300px] flex flex-col mt-6 md:mt-0">
              <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                <span className="text-gray-400">Response</span>
                {response && !response.error && <span className="text-green-400 text-xs">200 OK</span>}
                {response && response.error && <span className="text-red-400 text-xs">Error</span>}
              </div>
              {response ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                  <Server size={32} className="mb-2 opacity-50" />
                  <p>Masukkan kredensial untuk melihat token.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${formData.fullName}`);
    const body = encodeURIComponent(
      `Nama: ${formData.fullName}\nEmail: ${formData.email}\n\nPesan:\n${formData.message}`
    );
    window.location.href = `mailto:hai@firecek.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white py-10 lg:py-24 px-4 overflow-hidden sm:px-6 lg:px-8">
      <div className="relative max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Hubungi Tim Integrasi
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Butuh bantuan custom untuk sistem Firecek? Kami siap membantu.
          </p>
        </div>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 mb-8">
            <Card className="p-6 flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
              <p className="mt-2 text-base text-gray-500">hai@firecek.com</p>
            </Card>
            <Card className="p-6 flex flex-col items-center text-center">
              <Phone className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Telepon</h3>
              <p className="mt-2 text-base text-gray-500">+62 882-0055-87019</p>
            </Card>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="fullName"
                  id="full-name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md border"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Perusahaan
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md border"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Detail Kebutuhan Integrasi
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <Button type="submit" className="w-full py-3">Kirim Pesan</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
      <div className="flex justify-center space-x-6 md:order-2">
        <a href="#" className="text-gray-400 hover:text-gray-500">
          <Globe className="h-6 w-6" />
        </a>
      </div>
      <div className="mt-8 md:mt-0 md:order-1">
        <p className="text-center text-base text-gray-400">
          &copy; 2025 Firecek Indonesia. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Hero onCtaClick={() => setActiveTab('docs')} />
            <IntegrationSteps />
            <Features />
          </>
        );
      case 'docs':
        return <Documentation />;
      case 'contact':
        return <Contact />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}