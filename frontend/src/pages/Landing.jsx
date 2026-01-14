import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown, FiStar, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';

// ===== CUSTOM SVG ILLUSTRATIONS =====

const FloatingShield = () => (
  <motion.svg viewBox="0 0 300 300" className="w-100 h-100" animate={{ y: [0, -30, 0] }} transition={{ duration: 5, repeat: Infinity }}>
    <defs>
      <linearGradient id="shield1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow1">
        <feDropShadow dx="0" dy="15" stdDeviation="10" floodOpacity="0.25" />
      </filter>
    </defs>
    <path d="M 150 40 L 220 90 L 220 180 Q 150 240 80 180 L 80 90 Z" fill="url(#shield1)" filter="url(#shadow1)" />
    <path d="M 150 60 L 200 100 L 200 180 Q 150 220 100 180 L 100 100 Z" fill="white" opacity="0.95" />
    <circle cx="150" cy="140" r="30" fill="url(#shield1)" />
    <path d="M 135 140 L 148 153 L 170 130" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

const FloatingAnalytics = () => (
  <motion.svg viewBox="0 0 300 300" className="w-100 h-100" animate={{ y: [0, -30, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.2 }}>
    <defs>
      <linearGradient id="analytics" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow2">
        <feDropShadow dx="0" dy="15" stdDeviation="10" floodOpacity="0.25" />
      </filter>
    </defs>
    <rect x="40" y="50" width="220" height="180" rx="30" fill="white" stroke="url(#analytics)" strokeWidth="3" opacity="0.95" filter="url(#shadow2)" />
    <rect x="70" y="100" width="25" height="100" rx="8" fill="url(#analytics)" />
    <rect x="110" y="80" width="25" height="120" rx="8" fill="url(#analytics)" />
    <rect x="150" y="110" width="25" height="90" rx="8" fill="url(#analytics)" />
    <rect x="190" y="70" width="25" height="130" rx="8" fill="url(#analytics)" />
  </motion.svg>
);

const FloatingSignature = () => (
  <motion.svg viewBox="0 0 300 300" className="w-100 h-100" animate={{ y: [0, -30, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.4 }}>
    <defs>
      <linearGradient id="signature" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow3">
        <feDropShadow dx="0" dy="15" stdDeviation="10" floodOpacity="0.25" />
      </filter>
    </defs>
    <rect x="40" y="60" width="220" height="160" rx="25" fill="white" stroke="url(#signature)" strokeWidth="3" opacity="0.95" filter="url(#shadow3)" />
    <line x1="70" y1="90" x2="230" y2="90" stroke="url(#signature)" strokeWidth="1.5" opacity="0.3" />
    <line x1="70" y1="110" x2="230" y2="110" stroke="url(#signature)" strokeWidth="1.5" opacity="0.3" />
    <path d="M 75 155 Q 110 175 180 150" stroke="url(#signature)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="185" cy="145" r="8" fill="url(#signature)" />
  </motion.svg>
);

const BlockchainIllustration = () => (
  <motion.svg viewBox="0 0 300 300" className="w-100 h-100" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
    <defs>
      <linearGradient id="chain" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
    <circle cx="150" cy="70" r="25" fill="white" stroke="url(#chain)" strokeWidth="3" />
    <circle cx="240" cy="150" r="25" fill="white" stroke="url(#chain)" strokeWidth="3" />
    <circle cx="150" cy="230" r="25" fill="white" stroke="url(#chain)" strokeWidth="3" />
    <circle cx="60" cy="150" r="25" fill="white" stroke="url(#chain)" strokeWidth="3" />
    <line x1="170" y1="85" x2="220" y2="135" stroke="url(#chain)" strokeWidth="3" />
    <line x1="230" y1="170" x2="160" y2="210" stroke="url(#chain)" strokeWidth="3" />
    <line x1="130" y1="220" x2="80" y2="170" stroke="url(#chain)" strokeWidth="3" />
    <line x1="75" y1="130" x2="130" y2="85" stroke="url(#chain)" strokeWidth="3" />
  </motion.svg>
);

const DashboardIllustration = () => (
  <motion.svg viewBox="0 0 400 300" className="w-100 h-100">
    <defs>
      <linearGradient id="dash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadowDash">
        <feDropShadow dx="0" dy="20" stdDeviation="15" floodOpacity="0.25" />
      </filter>
    </defs>
    <rect x="20" y="20" width="360" height="260" rx="25" fill="white" stroke="url(#dash)" strokeWidth="3" filter="url(#shadowDash)" opacity="0.95" />
    <rect x="40" y="40" width="320" height="60" rx="12" fill="url(#dash)" opacity="0.1" />
    <rect x="40" y="120" width="70" height="140" rx="8" fill="url(#dash)" opacity="0.2" />
    <rect x="125" y="120" width="70" height="140" rx="8" fill="url(#dash)" opacity="0.3" />
    <rect x="210" y="120" width="70" height="140" rx="8" fill="url(#dash)" opacity="0.2" />
    <rect x="295" y="120" width="60" height="140" rx="8" fill="url(#dash)" opacity="0.25" />
    <circle cx="60" cy="60" r="8" fill="url(#dash)" />
    <circle cx="85" cy="60" r="8" fill="url(#dash)" opacity="0.5" />
    <circle cx="110" cy="60" r="8" fill="url(#dash)" opacity="0.3" />
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
    <motion.nav 
      className={`sticky-top transition-all ${scrolled ? 'shadow-xl' : ''}`} 
      style={{ 
        zIndex: 1000, 
        background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-xl py-3">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="fw-900 text-dark" style={{ fontSize: '28px', textDecoration: 'none', letterSpacing: '-1px' }}>
            <span style={{ color: '#dc2626' }}>Sign</span>atura
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-8">
            {['Features', 'Solutions', 'Industries', 'Security', 'Pricing', 'Developers'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-dark text-decoration-none fw-600 small"
                whileHover={{ color: '#dc2626', scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
            <div className="position-relative d-none d-md-block">
              <motion.button 
                className="btn btn-link text-dark fw-600 small d-flex align-items-center gap-2 text-decoration-none" 
                onClick={() => setLoginDropdown(!loginDropdown)}
                style={{ padding: '8px 0' }}
                whileHover={{ scale: 1.05 }}
              >
                Login <FiChevronDown size={16} />
              </motion.button>

              <AnimatePresence>
                {loginDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -15, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    className="position-absolute end-0 mt-3 bg-white rounded-4 shadow-xl overflow-hidden"
                    style={{ minWidth: '240px', zIndex: 1001 }}
                  >
                    <Link to="/login/issuer" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => e.target.style.background = '#fee2e2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      🔑 Issuer Portal
                    </Link>
                    <div style={{ borderTop: '1px solid #fee2e2' }} />
                    <Link to="/login/owner" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => e.target.style.background = '#fee2e2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      👥 Owner Portal
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-6 py-2" style={{ background: '#dc2626' }}>
                Get Started
              </Link>
            </motion.div>

            <button className="btn d-lg-none border-0 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-100 pb-4"
            >
              {['Features', 'Solutions', 'Industries', 'Security', 'Pricing', 'Developers'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500" onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="border-top my-2" />
              <Link to="/login/issuer" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                🔑 Issuer Portal
              </Link>
              <Link to="/login/owner" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                👥 Owner Portal
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// ===== FOOTER =====

const Footer = () => {
  return (
    <footer className="text-white py-12 mt-12" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
      <div className="container-xl">
        <div className="row g-8 mb-10">
          <div className="col-lg-4">
            <h5 className="fw-900 mb-4" style={{ letterSpacing: '-1px' }}>
              <span style={{ color: '#dc2626' }}>Sign</span>atura
            </h5>
            <p className="text-muted small mb-6 lh-lg">
              Enterprise-grade digital identity, data security, and signature solutions trusted by 500+ organizations worldwide.
            </p>
            <div className="d-flex gap-4">
              <a href="https://www.facebook.com/PHsignatura" className="text-muted text-decoration-none small fw-500 hover-text-danger" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg" className="text-muted text-decoration-none small fw-500" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-700 mb-4">Product</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#features" className="text-muted text-decoration-none">Features</a></li>
              <li className="mb-3"><a href="#solutions" className="text-muted text-decoration-none">Solutions</a></li>
              <li className="mb-3"><a href="#security" className="text-muted text-decoration-none">Security</a></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-700 mb-4">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#" className="text-muted text-decoration-none">About</a></li>
              <li className="mb-3"><a href="#" className="text-muted text-decoration-none">Blog</a></li>
              <li className="mb-3"><a href="#" className="text-muted text-decoration-none">Careers</a></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6 className="fw-700 mb-4">Newsletter</h6>
            <p className="text-muted small mb-3">Get the latest updates on digital security</p>
            <div className="d-flex gap-2">
              <input type="email" placeholder="your@email.com" className="form-control form-control-sm rounded-pill border-0" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button className="btn btn-sm fw-700 text-white rounded-pill px-4" style={{ background: '#dc2626' }}>→</button>
            </div>
          </div>
        </div>
        <div className="border-top border-secondary opacity-25 pt-6">
          <p className="text-muted small mb-0 text-center">&copy; 2025 Signatura | Enterprise Digital Identity Platform</p>
        </div>
      </div>
    </footer>
  );
};

// ===== MAIN COMPONENT =====

export default function SignaturaLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f3f4f6 100%)',
        minHeight: '900px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        <div className="container-xl position-relative">
          <div className="row align-items-center g-8">
            <motion.div className="col-lg-6" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.span className="d-inline-block mb-4 px-5 py-3 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                ✨ Enterprise Security Platform
              </motion.span>
              
              <motion.h1 
                className="mb-5 lh-1" 
                style={{ 
                  fontSize: '80px',
                  fontWeight: 900,
                  letterSpacing: '-3px',
                  color: '#111827',
                  lineHeight: '1.05'
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your Digital Identity, <span style={{ color: '#dc2626' }}>Secured</span>
              </motion.h1>
              
              <motion.p 
                className="mb-8" 
                style={{ fontSize: '18px', color: '#6b7280', maxWidth: '550px', lineHeight: '1.8' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Enterprise-grade digital identity, blockchain-backed security, and legally-binding digital signatures. Trusted by 500+ organizations worldwide for secure digital transformation.
              </motion.p>

              <motion.div 
                className="d-flex flex-column flex-sm-row gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/issuer" className="btn btn-lg fw-700 text-white rounded-pill px-10 py-3" style={{ background: '#dc2626', fontSize: '16px' }}>
                    🔑 Issuer Portal <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-10 py-3 border-3" style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '16px' }}>
                    👥 Owner Portal <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                className="d-flex gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { num: '500+', text: 'Organizations', icon: '🏢' },
                  { num: '10M+', text: 'Verified Identities', icon: '✓' },
                  { num: '99.99%', text: 'Uptime SLA', icon: '⚡' }
                ].map((stat, idx) => (
                  <div key={idx}>
                    <p className="fw-900 h5 mb-1" style={{ color: '#dc2626', fontSize: '24px' }}>{stat.icon} {stat.num}</p>
                    <p className="text-muted small" style={{ fontSize: '13px' }}>{stat.text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="col-lg-6" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div style={{ height: '650px', width: '100%' }}>
                <FloatingShield />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-14 py-lg-16 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <motion.span 
              className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small" 
              style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              Powerful Features
            </motion.span>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Everything You Need
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Comprehensive digital identity and security solutions designed for enterprises that demand the highest standards
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🛡️', title: 'Military-Grade Security', desc: 'End-to-end encrypted data protection with blockchain backing', color: '#dc2626' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Real-time verification and processing in milliseconds', color: '#dc2626' },
              { icon: '🌍', title: 'Global Compliance', desc: 'GDPR, eIDAS, and international standards compliant', color: '#dc2626' },
              { icon: '🔗', title: 'Easy Integration', desc: 'RESTful APIs and SDKs for seamless implementation', color: '#dc2626' },
              { icon: '📱', title: 'Mobile-First', desc: 'Native iOS & Android apps for on-the-go access', color: '#dc2626' },
              { icon: '👥', title: '24/7 Support', desc: 'Dedicated enterprise support team always available', color: '#dc2626' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100 position-relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -20, 
                    boxShadow: '0 50px 100px rgba(220, 38, 38, 0.2)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <motion.div 
                    className="text-6xl mb-4" 
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '20px' }}>{feature.title}</h5>
                  <p className="text-muted" style={{ lineHeight: '1.7' }}>{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-14 py-lg-16 position-relative" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fafafa 100%)' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }}>
              Our Solutions
            </span>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Complete Solutions
            </h2>
          </motion.div>

          <div className="row g-6 align-items-center mb-10">
            <motion.div className="col-lg-6" {...fadeInUp}>
              <div style={{ height: '500px' }}>
                <FloatingAnalytics />
              </div>
            </motion.div>
            <motion.div className="col-lg-6" variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } }} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <h3 className="h2 fw-bold mb-5" style={{ fontSize: '48px', color: '#111827' }}>Digital Identity & Verification</h3>
              <div className="d-flex flex-column gap-4 mb-6">
                {['KYC/Selfie verification', 'Biometric authentication', 'Multi-factor security', 'Real-time verification'].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="d-flex align-items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-2 rounded-2 flex-shrink-0" style={{ background: 'rgba(220, 38, 38, 0.15)' }}>
                      <FiCheckCircle style={{ color: '#dc2626', fontSize: '24px' }} />
                    </div>
                    <div>
                      <p className="fw-600 mb-1" style={{ color: '#111827' }}>{item}</p>
                      <p className="text-muted small mb-0">Enterprise-grade verification system</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#contact" className="btn btn-lg fw-700 text-white rounded-pill px-10 py-3" style={{ background: '#dc2626' }}>
                  Learn More <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className="row g-6 align-items-center mb-10">
            <motion.div className="col-lg-6 order-lg-2" {...fadeInUp}>
              <div style={{ height: '500px' }}>
                <FloatingSignature />
              </div>
            </motion.div>
            <motion.div className="col-lg-6 order-lg-1" variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } }} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <h3 className="h2 fw-bold mb-5" style={{ fontSize: '48px', color: '#111827' }}>Digital Signatures</h3>
              <div className="d-flex flex-column gap-4 mb-6">
                {['Legally binding signatures', 'QR code protection', 'Audit trail tracking', 'Global recognition'].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="d-flex align-items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-2 rounded-2 flex-shrink-0" style={{ background: 'rgba(220, 38, 38, 0.15)' }}>
                      <FiCheckCircle style={{ color: '#dc2626', fontSize: '24px' }} />
                    </div>
                    <div>
                      <p className="fw-600 mb-1" style={{ color: '#111827' }}>{item}</p>
                      <p className="text-muted small mb-0">eIDAS and ESIGN compliant</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#contact" className="btn btn-lg fw-700 text-white rounded-pill px-10 py-3" style={{ background: '#dc2626' }}>
                  Get Started <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECURITY SECTION ===== */}
      <section id="security" className="py-14 py-lg-16 position-relative text-white" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small text-white" style={{ background: 'rgba(255,255,255,0.25)' }}>
              Blockchain Secured
            </span>
            <h2 className="mb-5 lh-1 text-white" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>
              Enterprise-Grade Security
            </h2>
            <p className="lead text-white opacity-90" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '18px' }}>
              Military-grade encryption, blockchain technology, and continuous monitoring ensure your data is always protected
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🔐', title: 'Multi-Factor Auth', desc: 'Multiple verification layers' },
              { icon: '👤', title: 'Biometric Verification', desc: 'Liveness detection & KYC' },
              { icon: '🔒', title: 'Military Encryption', desc: 'AES-256 & TLS 1.3' },
              { icon: '⛓️', title: 'Blockchain Ledger', desc: 'Immutable record keeping' },
              { icon: '📡', title: '24/7 Monitoring', desc: 'Real-time threat detection' },
              { icon: '🛡️', title: 'Zero Trust Architecture', desc: 'Verify every transaction' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-8 rounded-4 text-center h-100"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                  whileHover={{ 
                    y: -16, 
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-5xl mb-4">{feature.icon}</p>
                  <h5 className="fw-700 mb-2 text-white">{feature.title}</h5>
                  <p className="text-white opacity-80 small">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INDUSTRIES SECTION ===== */}
      <section id="industries" className="py-14 py-lg-16 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }}>
              Industries
            </span>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Trusted Worldwide
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Serving 500+ organizations across banking, insurance, government, and education sectors
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🏦', title: 'Banking & Finance', subtitle: 'Secure transactions' },
              { icon: '🏢', title: 'Insurance', subtitle: 'Policy management' },
              { icon: '🏛️', title: 'Government', subtitle: 'Citizen services' },
              { icon: '📚', title: 'Education', subtitle: 'Credential verification' },
            ].map((ind, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <motion.div
                  className="p-10 rounded-4 text-center h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -20, 
                    boxShadow: '0 50px 100px rgba(220, 38, 38, 0.2)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-6xl mb-4">{ind.icon}</p>
                  <h5 className="fw-700 mb-2" style={{ color: '#111827', fontSize: '22px' }}>{ind.title}</h5>
                  <p className="text-muted small">{ind.subtitle}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== DASHBOARD SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }}>
              Analytics & Insights
            </span>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Real-Time Dashboard
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Comprehensive analytics and monitoring tools to track all your digital identity operations
            </p>
          </motion.div>

          <motion.div {...fadeInUp} style={{ height: '600px' }}>
            <DashboardIllustration />
          </motion.div>

          <motion.div 
            className="row g-6 mt-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { title: 'Real-Time Monitoring', desc: 'Track all transactions and events instantly' },
              { title: 'Advanced Analytics', desc: 'Detailed insights and trend analysis' },
              { title: 'Custom Reports', desc: 'Generate comprehensive compliance reports' },
              { title: 'API Access', desc: 'Integrate with your existing systems' },
            ].map((item, idx) => (
              <motion.div key={idx} className="col-md-6 col-lg-3" variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}>
                <div className="text-center">
                  <motion.div whileHover={{ scale: 1.1 }} className="mb-3">
                    <FiTrendingUp style={{ color: '#dc2626', fontSize: '40px' }} />
                  </motion.div>
                  <h5 className="fw-700 mb-2" style={{ color: '#111827' }}>{item.title}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <span className="d-inline-block mb-5 px-5 py-3 rounded-pill fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' }}>
              Testimonials
            </span>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Trusted by Leaders
            </h2>
          </motion.div>

          <motion.div 
            className="row g-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { name: 'John Smith', role: 'CEO, FinTech Corp', text: '"Signatura transformed our digital operations completely. The security and ease of use are unmatched."' },
              { name: 'Maria Garcia', role: 'Head of Compliance', text: '"We achieved full regulatory compliance in weeks. The platform is enterprise-ready out of the box."' },
              { name: 'David Lee', role: 'CTO, InsureHub', text: '"The API integration was seamless. Customer adoption rates exceeded our expectations by 300%."' },
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(220, 38, 38, 0.15)' }}
                >
                  <div className="d-flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={18} style={{ color: '#dc2626', fill: '#dc2626' }} />
                    ))}
                  </div>
                  <p className="mb-5" style={{ fontSize: '16px', color: '#374151', fontStyle: 'italic' }}>{testimonial.text}</p>
                  <div className="pt-4 border-top" style={{ borderColor: '#fee2e2' }}>
                    <p className="fw-700 mb-0" style={{ color: '#111827' }}>{testimonial.name}</p>
                    <p className="text-muted small mb-0">{testimonial.role}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative text-white overflow-hidden" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="mb-5 lh-1 text-white" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>
              Transform Digitally Today
            </h2>
            <p className="lead text-white opacity-90 mx-auto mb-10" style={{ maxWidth: '800px', fontSize: '20px' }}>
              Join 500+ organizations securing their digital future. Get started in minutes with our intuitive platform.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link to="/issuer" className="btn btn-lg fw-700 text-danger rounded-pill px-12 py-4" style={{ background: 'white', fontSize: '18px' }}>
                  🔑 Issuer Portal <FiArrowRight className="ms-3" size={24} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-12 py-4 border-3" style={{ borderColor: 'white', color: 'white', fontSize: '18px' }}>
                  👥 Owner Portal <FiArrowRight className="ms-3" size={24} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.p 
              className="text-white opacity-75 mt-6 small"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.75 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              Free setup • No credit card required • 30-day free trial
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
