import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown } from 'react-icons/fi';

// ===== CUSTOM SVG ICONS =====

const ShieldIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 3, repeat: Infinity }}>
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow1">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <path d="M 100 20 L 160 60 L 160 140 Q 100 180 40 140 L 40 60 Z" fill="url(#shieldGrad)" filter="url(#shadow1)" />
    <path d="M 100 40 L 140 70 L 140 140 Q 100 165 60 140 L 60 70 Z" fill="white" opacity="0.95" />
    <circle cx="100" cy="105" r="20" fill="url(#shieldGrad)" />
    <path d="M 92 105 L 98 111 L 112 97" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

const DataIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 3.2, repeat: Infinity }}>
    <defs>
      <linearGradient id="dataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow2">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <rect x="30" y="40" width="140" height="150" rx="20" fill="white" stroke="url(#dataGrad)" strokeWidth="2.5" opacity="0.95" filter="url(#shadow2)" />
    <rect x="50" y="70" width="16" height="100" rx="8" fill="url(#dataGrad)" />
    <rect x="75" y="50" width="16" height="120" rx="8" fill="url(#dataGrad)" />
    <rect x="100" y="80" width="16" height="90" rx="8" fill="url(#dataGrad)" />
    <rect x="125" y="60" width="16" height="110" rx="8" fill="url(#dataGrad)" />
  </motion.svg>
);

const SignatureIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 3.4, repeat: Infinity }}>
    <defs>
      <linearGradient id="sigGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow3">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <rect x="25" y="50" width="150" height="130" rx="18" fill="white" stroke="url(#sigGrad)" strokeWidth="2.5" opacity="0.95" filter="url(#shadow3)" />
    <line x1="50" y1="95" x2="150" y2="95" stroke="url(#sigGrad)" strokeWidth="1.5" opacity="0.3" />
    <line x1="50" y1="110" x2="150" y2="110" stroke="url(#sigGrad)" strokeWidth="1.5" opacity="0.3" />
    <path d="M 55 130 Q 85 145 130 125" stroke="url(#sigGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="135" cy="120" r="7" fill="url(#sigGrad)" />
  </motion.svg>
);

const IdentityIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 3.6, repeat: Infinity }}>
    <defs>
      <linearGradient id="idGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow4">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <rect x="30" y="40" width="140" height="170" rx="18" fill="white" stroke="url(#idGrad)" strokeWidth="2.5" opacity="0.95" filter="url(#shadow4)" />
    <rect x="50" y="60" width="100" height="30" rx="6" fill="url(#idGrad)" />
    <circle cx="65" cy="120" r="16" fill="url(#idGrad)" />
    <rect x="90" y="110" width="60" height="8" rx="4" fill="url(#idGrad)" />
    <rect x="90" y="130" width="70" height="6" rx="3" fill="url(#idGrad)" opacity="0.6" />
    <line x1="50" y1="165" x2="150" y2="165" stroke="url(#idGrad)" strokeWidth="2" opacity="0.3" />
  </motion.svg>
);

const CloudIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 3.8, repeat: Infinity }}>
    <defs>
      <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow5">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <path d="M 60 120 Q 50 100 70 85 Q 80 75 95 80 Q 110 70 125 85 Q 140 80 145 100 Q 155 95 160 115 L 160 155 Q 160 165 150 165 L 50 165 Q 40 165 40 155 Z" fill="white" stroke="url(#cloudGrad)" strokeWidth="2.5" opacity="0.95" filter="url(#shadow5)" />
    <path d="M 80 110 L 120 130" stroke="url(#cloudGrad)" strokeWidth="2" opacity="0.4" />
    <path d="M 100 100 L 100 140" stroke="url(#cloudGrad)" strokeWidth="2" opacity="0.4" />
    <path d="M 80 130 L 120 110" stroke="url(#cloudGrad)" strokeWidth="2" opacity="0.4" />
  </motion.svg>
);

const LockIcon = ({ animated = false }) => (
  <motion.svg viewBox="0 0 200 240" className="w-100 h-100" animate={animated ? { y: [0, -10, 0] } : {}} transition={{ duration: 4, repeat: Infinity }}>
    <defs>
      <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow6">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.2" floodColor="#dc2626" />
      </filter>
    </defs>
    <path d="M 70 100 L 70 80 Q 70 60 90 60 Q 110 60 110 80 L 110 100" stroke="url(#lockGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="50" y="100" width="100" height="90" rx="12" fill="white" stroke="url(#lockGrad)" strokeWidth="2.5" opacity="0.95" filter="url(#shadow6)" />
    <circle cx="100" cy="135" r="12" fill="url(#lockGrad)" />
    <path d="M 100 130 L 100 140" stroke="white" strokeWidth="2.5" />
  </motion.svg>
);

// ===== HERO ILLUSTRATION =====

const HeroIllustration = () => (
  <motion.svg viewBox="0 0 500 500" className="w-100 h-100">
    <defs>
      <linearGradient id="heroMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 0.95 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 0.95 }} />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background animated circles */}
    <motion.circle cx="250" cy="250" r="220" fill="url(#heroMainGrad)" opacity="0.08" animate={{ r: [220, 240, 220] }} transition={{ duration: 8, repeat: Infinity }} />
    <motion.circle cx="250" cy="250" r="180" fill="url(#heroMainGrad)" opacity="0.06" animate={{ r: [180, 200, 180] }} transition={{ duration: 10, repeat: Infinity }} />

    {/* Main shield with gradient */}
    <g filter="url(#glow)">
      <path d="M 250 100 L 350 160 L 350 300 Q 250 380 150 300 L 150 160 Z" fill="url(#heroMainGrad)" />
      <path d="M 250 120 L 330 165 L 330 300 Q 250 365 170 300 L 170 165 Z" fill="white" opacity="0.95" />
    </g>

    {/* Checkmark inside */}
    <g>
      <circle cx="250" cy="240" r="45" fill="url(#heroMainGrad)" />
      <path d="M 230 240 L 245 255 L 280 220" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Floating elements */}
    <motion.circle cx="150" cy="120" r="10" fill="url(#heroMainGrad)" opacity="0.6" animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }} />
    <motion.circle cx="350" cy="140" r="8" fill="url(#heroMainGrad)" opacity="0.4" animate={{ y: [0, 15, 0], x: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity }} />
    <motion.circle cx="180" cy="350" r="6" fill="url(#heroMainGrad)" opacity="0.5" animate={{ y: [0, -15, 0], x: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity }} />

    {/* Decorative lines */}
    <motion.line x1="120" y1="180" x2="100" y2="160" stroke="url(#heroMainGrad)" strokeWidth="2" opacity="0.3" animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} />
    <motion.line x1="380" y1="190" x2="400" y2="170" stroke="url(#heroMainGrad)" strokeWidth="2" opacity="0.3" animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }} />
  </motion.svg>
);

// ===== NAVIGATION =====

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky-top transition-all ${scrolled ? 'shadow-lg' : ''}`} style={{ 
      zIndex: 1000, 
      background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="container-xl py-3">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="fw-900 text-dark" style={{ fontSize: '28px', textDecoration: 'none', letterSpacing: '-1px' }}>
            <span style={{ color: '#dc2626' }}>Sign</span>atura
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-8">
            {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-dark text-decoration-none fw-600 small" style={{ transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#dc2626'} onMouseLeave={(e) => e.target.style.color = '#111827'}>
                {item}
              </a>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
            <div className="position-relative d-none d-md-block">
              <button className="btn btn-link text-dark fw-600 small d-flex align-items-center gap-2 text-decoration-none" onClick={() => setLoginDropdown(!loginDropdown)} style={{ padding: '8px 0' }}>
                Login <FiChevronDown size={16} />
              </button>

              <AnimatePresence>
                {loginDropdown && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-xl overflow-hidden" style={{ minWidth: '220px', zIndex: 1001 }}>
                    <Link to="/login/issuer" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => e.target.style.background = '#fee2e2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      🔑 Issuer Login
                    </Link>
                    <div style={{ borderTop: '1px solid #fee2e2' }} />
                    <Link to="/login/owner" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => e.target.style.background = '#fee2e2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      👥 Owner Login
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-6" style={{ background: '#dc2626' }}>
                Start
              </Link>
            </motion.div>

            <button className="btn d-lg-none border-0 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-100 pb-4">
              {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500" onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="border-top my-2" />
              <Link to="/login/issuer" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                🔑 Issuer Login
              </Link>
              <Link to="/login/owner" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                👥 Owner Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// ===== FOOTER =====

const Footer = () => {
  return (
    <footer className="text-white py-10 mt-10" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
      <div className="container-xl">
        <div className="row g-8 mb-8">
          <div className="col-lg-4">
            <h5 className="fw-900 mb-4" style={{ letterSpacing: '-1px' }}>
              <span style={{ color: '#dc2626' }}>Sign</span>atura
            </h5>
            <p className="text-muted small mb-4 lh-lg">
              Enterprise-grade digital identity, data security, and signature solutions trusted worldwide.
            </p>
            <div className="d-flex gap-4">
              <a href="https://www.facebook.com/PHsignatura" className="text-muted text-decoration-none small fw-500" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg" className="text-muted text-decoration-none small fw-500" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-700 mb-4 text-white">Product</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#solutions" className="text-muted text-decoration-none">Solutions</a></li>
              <li className="mb-3"><a href="#industries" className="text-muted text-decoration-none">Industries</a></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-700 mb-4 text-white">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#about" className="text-muted text-decoration-none">About</a></li>
              <li className="mb-3"><a href="#partners" className="text-muted text-decoration-none">Partners</a></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6 className="fw-700 mb-4 text-white">Newsletter</h6>
            <div className="d-flex gap-2">
              <input type="email" placeholder="Your email" className="form-control form-control-sm rounded-pill border-0" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button className="btn btn-sm fw-700 text-white rounded-pill px-4" style={{ background: '#dc2626' }}>→</button>
            </div>
          </div>
        </div>
        <div className="border-top border-secondary opacity-25 pt-6">
          <p className="text-muted small mb-0 text-center">&copy; 2025 Signatura | Powered by 1Knight Solutions</p>
        </div>
      </div>
    </footer>
  );
};

// ===== MAIN COMPONENT =====

export default function SignaturaLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const solutions = [
    { Icon: ShieldIcon, title: 'Security First', desc: 'Military-grade encryption & protection' },
    { Icon: DataIcon, title: 'Smart Data', desc: 'Real-time analytics & insights' },
    { Icon: SignatureIcon, title: 'E-Signature', desc: 'QR-protected digital signatures' },
    { Icon: IdentityIcon, title: 'Identity', desc: 'KYC & biometric verification' },
    { Icon: CloudIcon, title: 'Cloud Ready', desc: 'Secure cloud storage & backup' },
    { Icon: LockIcon, title: 'Blockchain', desc: 'Immutable & transparent ledger' },
  ];

  return (
    <div style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-12 py-lg-14 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)',
        minHeight: '900px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        <div className="container-xl position-relative">
          <div className="row align-items-center g-6">
            <motion.div className="col-lg-6" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                ✨ Digital Transformation
              </motion.span>
              
              <h1 className="mb-4 lh-1" style={{ 
                fontSize: '72px',
                fontWeight: 900,
                letterSpacing: '-2px',
                color: '#111827',
                lineHeight: '1.1'
              }}>
                Your <span style={{ color: '#dc2626' }}>Secure</span> Digital Future
              </h1>
              
              <p className="mb-6" style={{ fontSize: '18px', color: '#6b7280', maxWidth: '500px', lineHeight: '1.8' }}>
                Enterprise-grade digital identity, data security, and signature solutions trusted by 500+ organizations worldwide.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-8 py-3" style={{ background: '#dc2626', fontSize: '16px' }}>
                    🔑 Issuer <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/owner" className="btn fw-700 rounded-pill px-8 py-3 border-2" style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '16px' }}>
                    👥 Owner <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
              </div>

              <div className="d-flex gap-6">
                {[{ num: '500+', text: 'Organizations' }, { num: '10M+', text: 'Verified' }, { num: '99.99%', text: 'Uptime' }].map((stat, idx) => (
                  <div key={idx}>
                    <p className="fw-900 h5 mb-1" style={{ color: '#dc2626' }}>{stat.num}</p>
                    <p className="text-muted small">{stat.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="col-lg-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div style={{ height: '600px', width: '100%' }}>
                <HeroIllustration />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-12 py-lg-14 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              Our Solutions
            </span>
            <h2 className="mb-4 lh-1" style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111827' }}>
              Powerful Tools
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Everything you need for complete digital transformation
            </p>
          </motion.div>

          <motion.div 
            className="row g-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {solutions.map((sol, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100 position-relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -16, 
                    boxShadow: '0 40px 80px rgba(220, 38, 38, 0.15)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div style={{ height: '100px', marginBottom: '32px' }}>
                    <sol.Icon animated={true} />
                  </div>
                  
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '20px' }}>{sol.title}</h5>
                  <p className="text-muted small lh-lg">{sol.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-12 py-lg-14 position-relative" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fafafa 100%)' }}>
        <div className="container-xl">
          <motion.div {...fadeInUp} className="row align-items-center g-8">
            <div className="col-lg-5">
              <div className="rounded-4 overflow-hidden" style={{ height: '500px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }} >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ width: '60%', height: '60%' }}>
                    <ShieldIcon />
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                Why Signatura
              </span>
              
              <h2 className="mb-4 lh-1" style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111827' }}>
                Transform Digitally
              </h2>
              <p className="lead text-muted mb-5">
                We believe in making digital transformation simple, secure, and accessible. Our platform combines cutting-edge technology with user-friendly design.
              </p>

              <div className="d-flex flex-column gap-4 mb-6">
                {[
                  'Military-grade encryption',
                  'Blockchain-backed security',
                  'Trusted by 500+ orgs',
                  'Global compliance'
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="d-flex align-items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-2 rounded-2" style={{ background: 'rgba(220, 38, 38, 0.15)' }}>
                      <FiCheckCircle style={{ color: '#dc2626', fontSize: '20px' }} />
                    </div>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#solutions" className="btn fw-700 text-white rounded-pill px-8 py-3" style={{ background: '#dc2626', fontSize: '16px' }}>
                  Learn More <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== INDUSTRIES SECTION ===== */}
      <section id="industries" className="py-12 py-lg-14 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              Industries
            </span>
            <h2 className="mb-4 lh-1" style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111827' }}>
              For Every Sector
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Trusted by organizations worldwide across multiple industries
            </p>
          </motion.div>

          <div className="row g-5">
            {[
              { emoji: '🏢', title: 'Insurance', desc: 'Policy management' },
              { emoji: '🏛️', title: 'Government', desc: 'Citizen services' },
              { emoji: '🏦', title: 'Banking', desc: 'Secure payments' },
              { emoji: '📚', title: 'Education', desc: 'Credentials' },
            ].map((ind, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 text-center h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: '0 40px 80px rgba(220, 38, 38, 0.15)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-5xl mb-3">{ind.emoji}</p>
                  <h5 className="fw-700 mb-2" style={{ color: '#111827' }}>{ind.title}</h5>
                  <p className="text-muted small">{ind.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNERS SECTION ===== */}
      <section id="partners" className="py-12 py-lg-14 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="container-xl position-relative">
          <motion.div {...fadeInUp} className="row align-items-center g-8">
            <div className="col-lg-6">
              <span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                Partnership
              </span>
              
              <h2 className="mb-4 lh-1 text-white" style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-1.5px' }}>
                Partner With Us
              </h2>
              <p className="lead text-white opacity-90 mb-5" style={{ maxWidth: '500px' }}>
                Join enterprises embracing digital platforms. Signatura brings reliable, secure, and innovative solutions.
              </p>

              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#contact" className="btn fw-700 rounded-pill px-8 py-3 text-danger" style={{ background: 'white', fontSize: '16px' }}>
                  Start Partnership <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </div>

            <motion.div className="col-lg-6" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} style={{ width: '80%', height: '80%' }}>
                  <LockIcon />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="contact" className="py-12 py-lg-14 position-relative" style={{ background: '#fafafa' }}>
        <div className="container-xl">
          <motion.div className="text-center" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              Get Started
            </span>
            
            <h2 className="mb-4 lh-1" style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111827' }}>
              Ready to Transform?
            </h2>
            <p className="lead text-muted mx-auto mb-8" style={{ maxWidth: '700px' }}>
              Join 500+ organizations using Signatura. Choose your role and get started today.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-8 py-3" style={{ background: '#dc2626', fontSize: '16px' }}>
                  🔑 Issuer Login <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link to="/owner" className="btn fw-700 rounded-pill px-8 py-3 border-2" style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '16px' }}>
                  👥 Owner Login <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
