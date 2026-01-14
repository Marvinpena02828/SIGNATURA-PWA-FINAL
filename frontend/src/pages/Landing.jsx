import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown, FiStar,
  FiMail, FiPhone, FiMapPin, FiShield, FiFacebook, FiYoutube, FiTwitter, FiLinkedin, FiInstagram
} from 'react-icons/fi';

// ===== CUSTOM SVG ICONS =====
const SecurityIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L85 30 L85 55 Q50 80 15 55 L15 30 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="15" stroke={color} strokeWidth="3" fill="none"/>
    <path d="M45 48 L48 51 L56 43" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightningIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 10 L30 50 L50 50 L40 90 L70 40 L50 40 Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GlobalIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="35" stroke={color} strokeWidth="3"/>
    <path d="M20 35 Q50 25 80 35" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M20 50 Q50 60 80 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M35 20 Q35 50 35 80" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M65 20 Q65 50 65 80" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const IntegrationIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="25" height="25" rx="3" stroke={color} strokeWidth="3" fill="none"/>
    <rect x="60" y="25" width="25" height="25" rx="3" stroke={color} strokeWidth="3" fill="none"/>
    <rect x="15" y="50" width="25" height="25" rx="3" stroke={color} strokeWidth="3" fill="none"/>
    <line x1="40" y1="37.5" x2="60" y2="37.5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="40" y1="62.5" x2="60" y2="62.5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const MobileIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="15" width="44" height="70" rx="4" stroke={color} strokeWidth="3" fill="none"/>
    <rect x="30" y="20" width="40" height="45" fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
    <circle cx="50" cy="75" r="2.5" fill={color}/>
  </svg>
);

const SupportIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="35" r="15" stroke={color} strokeWidth="3" fill="none"/>
    <path d="M35 55 Q35 50 50 50 Q65 50 65 55" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M40 60 L35 85 Q50 80 50 80 Q50 80 65 85 L60 60" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IdentityIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="55" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
    <circle cx="35" cy="40" r="12" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M22 60 Q35 53 48 60" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="55" y1="30" x2="80" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="55" y1="42" x2="80" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="55" y1="54" x2="80" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const SignatureIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 Q30 35 50 40 T80 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 65 L75 65" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="20" y="20" width="60" height="60" rx="3" stroke={color} strokeWidth="2" fill="none" opacity="0.5"/>
  </svg>
);

const EncryptionIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="45" width="60" height="35" rx="3" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M35 45 L35 30 Q35 20 50 20 Q65 20 65 30 L65 45" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="50" cy="62" r="4" fill={color}/>
  </svg>
);

const BankingIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 L50 25 L80 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="15" y="50" width="70" height="30" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
  </svg>
);

const InsuranceIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L30 25 L30 50 Q30 70 50 85 Q70 70 70 50 L70 25 Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 50 L48 58 L62 42" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GovernmentIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L70 30 L70 80 L30 80 L30 30 Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 15 L50 5 L45 10 M50 15 L55 10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const EducationIcon = ({ size = 48, color = "#dc2626" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 50 L50 30 L85 50 L80 50 L80 75 L20 75 L20 50 Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="40" r="3" fill={color}/>
  </svg>
);

// ===== FLOATING PHONE MOCKUP =====
const FloatingPhoneMockup = () => {
  const phoneRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <motion.div ref={phoneRef} style={{ y }} className="w-100 h-100">
      <motion.svg 
        viewBox="0 0 300 600" 
        className="w-100 h-100" 
        animate={{ 
          y: [0, -25, 0],
          rotateZ: [0, -5, 5, 0],
          rotateX: [0, 10, -10, 0]
        }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#b91c1c', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#7f1d1d', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="20" stdDeviation="15" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Phone Body */}
        <g filter="url(#shadow)">
          {/* Phone Back */}
          <rect x="25" y="30" width="250" height="540" rx="50" fill="url(#phoneGrad)" />
          
          {/* Phone Bezel/Frame */}
          <rect x="25" y="30" width="250" height="540" rx="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          
          {/* Screen Area */}
          <rect x="35" y="50" width="230" height="500" rx="42" fill="url(#screenGrad)" />
          
          {/* Notch */}
          <rect x="110" y="50" width="80" height="35" rx="0 0 20 20" fill="#1f2937" />
          <circle cx="135" cy="62" r="4" fill="#0a0a0a" opacity="0.6" />
          <circle cx="165" cy="62" r="4" fill="#0a0a0a" opacity="0.6" />
          
          {/* Status Bar */}
          <rect x="35" y="50" width="230" height="30" fill="white" opacity="0.5" />
          <text x="55" y="70" fontSize="10" fill="#374151" fontWeight="600">9:41</text>
          
          {/* App Content - Top Section */}
          <rect x="45" y="95" width="210" height="35" rx="12" fill="white" />
          <text x="55" y="118" fontSize="14" fill="#111827" fontWeight="700">Digital Identity</text>
          <circle cx="260" cy="112" r="8" fill="#dc2626" />
          
          {/* Card 1 - Verified Badge */}
          <g>
            <rect x="45" y="145" width="210" height="55" rx="16" fill="white" stroke="#fee2e2" strokeWidth="1" />
            <circle cx="65" cy="172" r="14" fill="#fecaca" />
            <path d="M 61 172 L 64 175 L 69 170" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x="85" y="165" fontSize="12" fill="#111827" fontWeight="700">Status: Verified</text>
            <text x="85" y="182" fontSize="10" fill="#6b7280">Active Credentials</text>
          </g>
          
          {/* Card 2 - Document */}
          <g>
            <rect x="45" y="215" width="210" height="55" rx="16" fill="white" stroke="#fee2e2" strokeWidth="1" />
            <rect x="60" y="228" width="28" height="35" rx="4" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
            <text x="62" y="253" fontSize="8" fill="#dc2626" fontWeight="700" textAnchor="middle">ID</text>
            <text x="95" y="245" fontSize="12" fill="#111827" fontWeight="700">National ID</text>
            <text x="95" y="262" fontSize="10" fill="#6b7280">Expires in 4 years</text>
          </g>
          
          {/* Card 3 - Lock */}
          <g>
            <rect x="45" y="285" width="210" height="55" rx="16" fill="white" stroke="#fee2e2" strokeWidth="1" />
            <circle cx="65" cy="312" r="14" fill="#fecaca" />
            <rect x="59" y="308" width="12" height="8" rx="2" stroke="#dc2626" strokeWidth="1.5" fill="none" />
            <path d="M 62 308 L 62 303 Q 62 300 65 300 Q 68 300 68 303 L 68 308" stroke="#dc2626" strokeWidth="1" fill="none" strokeLinecap="round" />
            <text x="85" y="310" fontSize="12" fill="#111827" fontWeight="700">Encrypted Data</text>
            <text x="85" y="327" fontSize="10" fill="#6b7280">Military-grade AES-256</text>
          </g>
          
          {/* Bottom Info */}
          <g>
            <rect x="45" y="360" width="210" height="45" rx="12" fill="#fafafa" />
            <circle cx="60" cy="382" r="5" fill="#dc2626" />
            <text x="72" y="377" fontSize="11" fill="#111827" fontWeight="600">Real-time Sync</text>
            <text x="72" y="389" fontSize="9" fill="#6b7280">Updated 2 minutes ago</text>
          </g>
          
          {/* Bottom Navigation */}
          <rect x="35" y="510" width="230" height="40" rx="15" fill="white" stroke="#fee2e2" strokeWidth="1" />
          <circle cx="65" cy="530" r="6" fill="#dc2626" />
          <circle cx="150" cy="530" r="6" fill="#d1d5db" />
          <circle cx="235" cy="530" r="6" fill="#d1d5db" />
          
          {/* Gloss Effect */}
          <ellipse cx="100" cy="80" rx="80" ry="30" fill="white" opacity="0.15" />
        </g>

        {/* Floating Elements Around Phone */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        >
          <circle cx="30" cy="150" r="6" fill="#dc2626" opacity="0.4" />
        </motion.g>
        
        <motion.g
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          <circle cx="280" cy="300" r="5" fill="#dc2626" opacity="0.3" />
        </motion.g>
        
        <motion.g
          animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <circle cx="20" cy="450" r="4" fill="#dc2626" opacity="0.35" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

// ===== NAVIGATION =====
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`sticky-top transition-all`} 
      style={{ 
        zIndex: 1000, 
        background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.08)' : 'none'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-xl py-2">
        <div className="d-flex justify-content-between align-items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="d-flex align-items-center text-decoration-none">
              <img 
                src="/logo31.png" 
                alt="Signatura" 
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>
          </motion.div>

          <div className="d-none d-lg-flex align-items-center gap-6">
            {['Features', 'Solutions', 'Security', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-dark text-decoration-none fw-500"
                style={{ fontSize: '13px' }}
                whileHover={{ color: '#dc2626', y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
            <div className="position-relative d-none d-md-block">
              <motion.button 
                className="btn btn-link text-dark fw-500 small d-flex align-items-center gap-2 text-decoration-none" 
                onClick={() => setLoginDropdown(!loginDropdown)}
                style={{ padding: '6px 0', fontSize: '13px' }}
                whileHover={{ scale: 1.05 }}
              >
                Login <motion.div animate={{ rotate: loginDropdown ? 180 : 0 }}><FiChevronDown size={14} /></motion.div>
              </motion.button>

              <AnimatePresence>
                {loginDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="position-absolute end-0 mt-2 bg-white rounded-2 shadow-lg overflow-hidden"
                    style={{ minWidth: '200px', zIndex: 1001 }}
                  >
                    <Link to="/login/issuer" className="btn btn-link w-100 text-start px-3 py-2 text-dark text-decoration-none fw-500 border-0" style={{ fontSize: '13px' }}>
                      🔑 Issuer Portal
                    </Link>
                    <div style={{ borderTop: '1px solid #fee2e2' }} />
                    <Link to="/login/owner" className="btn btn-link w-100 text-start px-3 py-2 text-dark text-decoration-none fw-500 border-0" style={{ fontSize: '13px' }}>
                      👥 Owner Portal
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-4 py-2" style={{ background: '#dc2626', fontSize: '12px' }}>
                Start Free
              </Link>
            </motion.div>

            <button className="btn d-lg-none border-0 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }}>
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-100 pb-3 overflow-hidden mt-2"
            >
              {['Features', 'Solutions', 'Security', 'Pricing'].map((item) => (
                <motion.a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontSize: '13px' }}
                  whileHover={{ x: 8, color: '#dc2626' }}
                >
                  {item}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// ===== FEATURE CARD =====
const FeatureCard = ({ feature, idx }) => {
  const IconComponent = feature.icon;
  return (
    <motion.div 
      className="col-6 col-md-4 col-lg-3"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="p-4 rounded-3 h-100 text-center"
        style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '1px solid #fee2e2' }}
        whileHover={{ 
          y: -16, 
          boxShadow: '0 30px 60px rgba(220, 38, 38, 0.15)',
          borderColor: '#dc2626'
        }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-3" style={{ display: 'flex', justifyContent: 'center' }}>
          <IconComponent size={48} />
        </div>
        <h6 className="fw-700 mb-2" style={{ color: '#111827', fontSize: '14px' }}>{feature.title}</h6>
        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{feature.desc}</p>
      </motion.div>
    </motion.div>
  );
};

// ===== MAIN COMPONENT =====
export default function SignaturaLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true, margin: '0px 0px -80px 0px' }
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-8 py-md-12 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container-xl position-relative">
          <div className="row align-items-center g-4">
            <motion.div 
              className="col-lg-6 mb-4 mb-lg-0" 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="mb-3 lh-1" 
                style={{ fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your Digital <motion.span 
                  style={{ color: '#dc2626' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  Identity,
                </motion.span> <br /> Secured
              </motion.h1>
              
              <motion.p 
                className="mb-5" 
                style={{ fontSize: '16px', color: '#6b7280', maxWidth: '500px', lineHeight: '1.7' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Enterprise-grade digital identity with military-grade security and legally-binding digital signatures. Trusted by 500+ organizations worldwide.
              </motion.p>

              <motion.div 
                className="d-flex flex-column flex-sm-row gap-3 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button 
                  className="btn fw-700 text-white rounded-pill px-6 py-2" 
                  style={{ background: '#dc2626', fontSize: '14px' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.button>
                <motion.button 
                  className="btn fw-700 rounded-pill px-6 py-2" 
                  style={{ border: '2px solid #dc2626', color: '#dc2626', fontSize: '14px', background: 'transparent' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.button>
              </motion.div>

              <motion.div 
                className="d-flex gap-6 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[{ num: '500+', text: 'Organizations' }, { num: '10M+', text: 'Verified' }, { num: '99.99%', text: 'Uptime' }].map((stat) => (
                  <motion.div key={stat.num}>
                    <p className="fw-900 h6 mb-0" style={{ color: '#dc2626', fontSize: '16px' }}>{stat.num}</p>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{stat.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="col-lg-6" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div style={{ height: 'clamp(250px, 60vw, 400px)', width: '100%' }}>
                <FloatingPhoneMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-8 py-md-10 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <motion.h2 
              className="mb-3 lh-1" 
              style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}
            >
              Core Features
            </motion.h2>
            <p className="text-muted" style={{ maxWidth: '600px', fontSize: '15px', margin: '0 auto' }}>
              Everything you need for secure digital identity management
            </p>
          </motion.div>

          <motion.div 
            className="row g-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
          >
            {[
              { icon: SecurityIcon, title: 'Military-Grade Security', desc: 'AES-256 encryption' },
              { icon: LightningIcon, title: 'Lightning Fast', desc: 'Real-time verification' },
              { icon: GlobalIcon, title: 'Global Compliance', desc: 'GDPR & eIDAS' },
              { icon: IntegrationIcon, title: 'Easy Integration', desc: 'RESTful APIs' },
              { icon: MobileIcon, title: 'Mobile-First', desc: 'iOS & Android' },
              { icon: SupportIcon, title: '24/7 Support', desc: 'Always available' },
            ].map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} idx={idx} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-8 py-md-10 position-relative" style={{ background: '#fafafa' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="mb-3 lh-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}>
              Solutions
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', fontSize: '15px', margin: '0 auto' }}>
              Comprehensive identity and security solutions
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              }
            }}
          >
            {[
              { icon: IdentityIcon, title: 'Digital Identity', desc: 'KYC verification, biometric authentication', features: ['Selfie verification', 'Real-time KYC', 'Secure storage'] },
              { icon: SignatureIcon, title: 'Digital Signatures', desc: 'Legally binding signatures with QR protection', features: ['Legal compliance', 'QR codes', 'Audit logs'] },
              { icon: EncryptionIcon, title: 'Data Security', desc: 'Military-grade encryption for documents', features: ['AES-256', 'TLS 1.3', 'Zero knowledge'] },
            ].map((solution, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-5 rounded-3 h-100"
                  style={{ background: '#ffffff', border: '1px solid #fee2e2' }}
                  whileHover={{ 
                    y: -16, 
                    boxShadow: '0 30px 60px rgba(220, 38, 38, 0.15)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <solution.icon size={64} />
                  </div>
                  <h5 className="fw-700 mb-2" style={{ color: '#111827', fontSize: '18px' }}>{solution.title}</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '14px' }}>{solution.desc}</p>
                  <ul className="list-unstyled">
                    {solution.features.map((feature, fidx) => (
                      <li key={fidx} className="mb-2" style={{ fontSize: '13px' }}>
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SECURITY SECTION ===== */}
      <section id="security" className="py-8 py-md-10 position-relative text-white" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <div className="container-xl position-relative">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="mb-3 lh-1 text-white" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px' }}>
              Enterprise Security
            </h2>
            <p className="text-white opacity-90" style={{ maxWidth: '600px', fontSize: '15px', margin: '0 auto' }}>
              Military-grade encryption and advanced monitoring
            </p>
          </motion.div>

          <motion.div 
            className="row g-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
          >
            {[
              { icon: SecurityIcon, title: 'Multi-Factor Auth', desc: 'Multiple verification' },
              { icon: SignatureIcon, title: 'Biometric', desc: 'Liveness detection' },
              { icon: EncryptionIcon, title: 'Encryption', desc: 'AES-256 & TLS' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-6 col-md-4"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-4 rounded-3 text-center h-100"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  whileHover={{ 
                    y: -12, 
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)'
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <feature.icon size={48} color="white" />
                  </div>
                  <h6 className="fw-700 mb-1 text-white" style={{ fontSize: '14px' }}>{feature.title}</h6>
                  <p className="text-white opacity-80 mb-0" style={{ fontSize: '12px' }}>{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INDUSTRIES SECTION ===== */}
      <section id="industries" className="py-8 py-md-10 position-relative" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="mb-3 lh-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}>
              Trusted Industries
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', fontSize: '15px', margin: '0 auto' }}>
              Serving 500+ organizations across sectors
            </p>
          </motion.div>

          <motion.div 
            className="row g-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {[
              { icon: BankingIcon, title: 'Banking', desc: 'Transactions & compliance' },
              { icon: InsuranceIcon, title: 'Insurance', desc: 'Claims management' },
              { icon: GovernmentIcon, title: 'Government', desc: 'Citizen services' },
              { icon: EducationIcon, title: 'Education', desc: 'Credentials' },
            ].map((industry, idx) => (
              <motion.div 
                key={idx} 
                className="col-6 col-md-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <motion.div
                  className="p-4 rounded-3 text-center h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '1px solid #fee2e2' }}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: '0 25px 50px rgba(220, 38, 38, 0.15)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <industry.icon size={48} />
                  </div>
                  <h6 className="fw-700 mb-1" style={{ color: '#111827', fontSize: '14px' }}>{industry.title}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{industry.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-8 py-md-10 position-relative" style={{ background: '#fafafa' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="mb-3 lh-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}>
              What Users Say
            </h2>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              }
            }}
          >
            {[
              { name: 'John Smith', role: 'CEO, FinTech Corp', text: 'Signatura transformed our operations. Highly recommended!' },
              { name: 'Maria Garcia', role: 'Head of Compliance', text: 'Full regulatory compliance achieved in weeks. Outstanding!' },
              { name: 'David Lee', role: 'CTO, InsureHub', text: 'Seamless integration and exceeded adoption expectations!' },
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-4 rounded-3 h-100"
                  style={{ background: '#ffffff', border: '1px solid #fee2e2' }}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: '0 25px 50px rgba(220, 38, 38, 0.15)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="d-flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} style={{ color: '#dc2626', fill: '#dc2626' }} />
                    ))}
                  </div>
                  <p className="mb-3" style={{ fontSize: '14px', color: '#374151', fontStyle: 'italic', lineHeight: '1.6' }}>{testimonial.text}</p>
                  <div style={{ borderTop: '1px solid #fee2e2', paddingTop: '12px' }}>
                    <p className="fw-700 mb-0 small">{testimonial.name}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{testimonial.role}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-8 py-md-10" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="mb-3 lh-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px', color: '#111827' }}>
              Simple Pricing
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', fontSize: '15px', margin: '0 auto' }}>
              Choose your plan. Upgrade anytime.
            </p>
          </motion.div>

          <motion.div 
            className="row g-4" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            {[
              { name: 'Starter', price: '$499', features: ['10K verifications', 'Basic API', 'Email support'] },
              { name: 'Pro', price: '$1,999', features: ['100K verifications', 'Full API', 'Priority support'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'Dedicated support', 'Custom integrations'] },
            ].map((plan, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4" 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div 
                  className="p-5 rounded-3 h-100" 
                  style={{ 
                    background: plan.popular ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#fafafa', 
                    border: `1px solid ${plan.popular ? '#dc2626' : '#fee2e2'}`,
                    color: plan.popular ? 'white' : 'black' 
                  }} 
                  whileHover={{ 
                    y: -12,
                    boxShadow: plan.popular ? '0 30px 60px rgba(220, 38, 38, 0.25)' : '0 25px 50px rgba(220, 38, 38, 0.1)',
                    scale: 1.02
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {plan.popular && (
                    <div className="badge bg-white text-danger" style={{ marginBottom: '12px', fontSize: '11px', fontWeight: 700 }}>
                      POPULAR
                    </div>
                  )}
                  <h5 className="fw-700 mb-1" style={{ color: plan.popular ? 'white' : '#111827', fontSize: '18px' }}>{plan.name}</h5>
                  <div className="mb-4"><span style={{ fontSize: '36px', fontWeight: 900, color: plan.popular ? 'white' : '#dc2626' }}>{plan.price}</span></div>
                  <ul className="list-unstyled mb-5">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="mb-2" style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : '#6b7280', fontWeight: 500, fontSize: '13px' }}>
                        <span style={{ color: plan.popular ? 'white' : '#dc2626' }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button 
                    className="btn w-100 fw-700 rounded-pill py-2" 
                    style={{ background: plan.popular ? 'white' : '#dc2626', color: plan.popular ? '#dc2626' : 'white', fontSize: '13px' }} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-8 py-md-10 position-relative text-white overflow-hidden" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="mb-4 lh-1 text-white" style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-1px' }}>
              Ready to Transform?
            </h2>
            <p className="lead text-white opacity-90 mx-auto mb-6" style={{ maxWidth: '700px', fontSize: '16px' }}>
              Join 500+ organizations securing their digital future.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.button 
                className="btn fw-700 text-white rounded-pill px-6 py-2" 
                style={{ background: 'white', color: '#dc2626', fontSize: '14px' }}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                Start Free
              </motion.button>
              <motion.button 
                className="btn fw-700 text-white rounded-pill px-6 py-2" 
                style={{ background: 'transparent', border: '2px solid white', color: 'white', fontSize: '14px' }}
                whileHover={{ scale: 1.05, background: 'white', color: '#dc2626' }} 
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ 
        background: '#1f2937',
        paddingTop: '32px',
        paddingBottom: '24px'
      }}>
        <div className="container-xl">
          <div className="row g-4 mb-4">
            <div className="col-md-4 mb-3 mb-md-0">
              <img 
                src="/logo31.png" 
                alt="Signatura" 
                style={{ height: '40px', width: 'auto', marginBottom: '12px' }}
              />
              <p className="mb-3" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6' }}>
                Enterprise digital identity platform for the modern world.
              </p>
              <div className="d-flex gap-2">
                {[
                  { icon: FiFacebook, link: 'https://www.facebook.com/PHsignatura' },
                  { icon: FiYoutube, link: 'https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg' },
                  { icon: FiTwitter, link: '#' },
                  { icon: FiLinkedin, link: '#' },
                  { icon: FiInstagram, link: '#' }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(220,38,38,0.15)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      color: '#dc2626',
                      textDecoration: 'none'
                    }}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-6 col-md-2">
              <h6 className="fw-700 text-white mb-3" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Product</h6>
              <ul className="list-unstyled">
                {['Features', 'Security', 'Pricing'].map((link) => (
                  <li key={link} className="mb-2">
                    <a href="#" className="text-decoration-none small" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-6 col-md-2">
              <h6 className="fw-700 text-white mb-3" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Company</h6>
              <ul className="list-unstyled">
                {['About', 'Blog', 'Contact'].map((link) => (
                  <li key={link} className="mb-2">
                    <a href="#" className="text-decoration-none small" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-12 col-md-4">
              <h6 className="fw-700 text-white mb-3" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Newsletter</h6>
              <form className="d-flex gap-2">
                <input 
                  type="email" 
                  className="form-control rounded-2" 
                  placeholder="your@email.com"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: '13px', color: 'white' }}
                />
                <button className="btn fw-700 text-white rounded-2 px-3" style={{ background: '#dc2626', fontSize: '13px' }}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }} className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
              © 2025 Signatura | Enterprise Digital Identity
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="small text-decoration-none" style={{ color: 'rgba(255,255,255,0.6)' }}>Privacy</a>
              <a href="#" className="small text-decoration-none" style={{ color: 'rgba(255,255,255,0.6)' }}>Terms</a>
              <a href="#" className="small text-decoration-none" style={{ color: 'rgba(255,255,255,0.6)' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
