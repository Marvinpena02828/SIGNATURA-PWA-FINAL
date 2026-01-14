import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown, FiStar, FiTrendingUp, FiUsers, FiAward,
  FiMail, FiPhone, FiMapPin, FiShield, FiGlobe, FiFacebook, FiYoutube, FiTwitter, FiLinkedin, FiInstagram,
  FiSparkles, FiZap, FiLock
} from 'react-icons/fi';

// ===== CUSTOM SVG ICONS (RED & WHITE ONLY) =====

const SecurityIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L85 30 L85 55 Q50 80 15 55 L15 30 Z" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="15" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <path d="M45 48 L48 51 L56 43" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightningIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 10 L30 50 L50 50 L40 90 L70 40 L50 40 Z" fill="#dc2626" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GlobalIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="35" stroke="#dc2626" strokeWidth="3"/>
    <path d="M20 35 Q50 25 80 35" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M20 50 Q50 60 80 50" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M35 20 Q35 50 35 80" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M65 20 Q65 50 65 80" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const IntegrationIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="25" height="25" rx="3" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <rect x="60" y="25" width="25" height="25" rx="3" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <rect x="15" y="50" width="25" height="25" rx="3" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <line x1="40" y1="37.5" x2="60" y2="37.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="40" y1="62.5" x2="60" y2="62.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="27.5" cy="37.5" r="2" fill="#dc2626"/>
    <circle cx="72.5" cy="37.5" r="2" fill="#dc2626"/>
  </svg>
);

const MobileIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="15" width="44" height="70" rx="4" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <rect x="30" y="20" width="40" height="45" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.5"/>
    <circle cx="50" cy="75" r="2.5" fill="#dc2626"/>
  </svg>
);

const SupportIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="35" r="15" stroke="#dc2626" strokeWidth="3" fill="none"/>
    <path d="M35 55 Q35 50 50 50 Q65 50 65 55" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M40 60 L35 85 Q50 80 50 80 Q50 80 65 85 L60 60" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="70" r="1.5" fill="#dc2626"/>
  </svg>
);

const IdentityIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="55" rx="3" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <circle cx="35" cy="40" r="12" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <path d="M22 60 Q35 53 48 60" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="55" y1="30" x2="80" y2="30" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="55" y1="42" x2="80" y2="42" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="55" y1="54" x2="80" y2="54" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const SignatureIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 Q30 35 50 40 T80 45" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 65 L75 65" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="20" y="20" width="60" height="60" rx="3" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.5"/>
  </svg>
);

const DataSecurityIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="25" width="60" height="50" rx="3" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <path d="M20 35 L80 35" stroke="#dc2626" strokeWidth="2"/>
    <circle cx="30" cy="55" r="4" fill="#dc2626"/>
    <circle cx="50" cy="55" r="4" fill="#dc2626"/>
    <circle cx="70" cy="55" r="4" fill="#dc2626"/>
  </svg>
);

const MFAIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="30" width="70" height="45" rx="3" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <circle cx="30" cy="52" r="6" stroke="#dc2626" strokeWidth="2" fill="none"/>
    <path d="M50 40 L60 52 L50 64 L40 52 Z" stroke="#dc2626" strokeWidth="2" fill="none"/>
    <circle cx="75" cy="52" r="6" stroke="#dc2626" strokeWidth="2" fill="none"/>
  </svg>
);

const BiometricIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="40" r="18" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <path d="M50 20 L50 10" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M65 30 L72 20" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M70 50 L80 50" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M45 75 Q50 60 55 75" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
);

const EncryptionIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="45" width="60" height="35" rx="3" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <path d="M35 45 L35 30 Q35 20 50 20 Q65 20 65 30 L65 45" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="50" cy="62" r="4" fill="#dc2626"/>
  </svg>
);

const MonitoringIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="50" rx="3" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <path d="M35 70 L65 70" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M45 70 L45 80" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M55 70 L55 80" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M30 40 L50 35 L70 40" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const LedgerIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20 L30 80 M50 20 L50 80 M70 20 L70 80" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
    <path d="M20 30 L80 30 M20 45 L80 45 M20 60 L80 60 M20 75 L80 75" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
    <circle cx="30" cy="30" r="3" fill="#dc2626"/>
    <circle cx="50" cy="45" r="3" fill="#dc2626"/>
    <circle cx="70" cy="60" r="3" fill="#dc2626"/>
  </svg>
);

const ZeroTrustIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="30" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <circle cx="50" cy="50" r="20" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="50" cy="50" r="10" stroke="#dc2626" strokeWidth="2" fill="none"/>
    <circle cx="50" cy="50" r="3" fill="#dc2626"/>
  </svg>
);

const BankingIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 50 L50 25 L80 50" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="15" y="50" width="70" height="30" rx="2" stroke="#dc2626" strokeWidth="2.5" fill="none"/>
    <line x1="15" y1="60" x2="85" y2="60" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="50" x2="30" y2="80" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
    <line x1="50" y1="50" x2="50" y2="80" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
    <line x1="70" y1="50" x2="70" y2="80" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

const InsuranceIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L30 25 L30 50 Q30 70 50 85 Q70 70 70 50 L70 25 Z" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 50 L48 58 L62 42" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GovernmentIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L70 30 L70 80 L30 80 L30 30 Z" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 15 L50 5 L45 10 M50 15 L55 10" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="30" y1="40" x2="70" y2="40" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="55" x2="70" y2="55" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
    <line x1="30" y1="70" x2="70" y2="70" stroke="#dc2626" strokeWidth="1.5" opacity="0.6"/>
  </svg>
);

const EducationIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 50 L50 30 L85 50 L80 50 L80 75 L20 75 L20 50 Z" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50 L35 70 M50 50 L50 70 M65 50 L65 70" stroke="#dc2626" strokeWidth="2" opacity="0.6"/>
    <circle cx="50" cy="40" r="3" fill="#dc2626"/>
  </svg>
);

// ===== ENHANCED FLOATING SHIELD WITH PARALLAX =====

const FloatingShield = () => {
  const shieldRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <motion.div ref={shieldRef} style={{ y }} className="w-100 h-100">
      <motion.svg 
        viewBox="0 0 300 300" 
        className="w-100 h-100" 
        animate={{ 
          y: [0, -50, 0],
          rotateZ: [0, 8, -8, 0]
        }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="shield1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="shadow1">
            <feDropShadow dx="0" dy="20" stdDeviation="15" floodOpacity="0.35" />
          </filter>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <motion.g 
          animate={{ filter: ['url(#shadow1)', 'url(#glow1)', 'url(#shadow1)'] }} 
          transition={{ duration: 3, repeat: Infinity }}
        >
          <path d="M 150 40 L 220 90 L 220 180 Q 150 240 80 180 L 80 90 Z" fill="url(#shield1)" />
          <path d="M 150 60 L 200 100 L 200 180 Q 150 220 100 180 L 100 100 Z" fill="white" opacity="0.95" />
          <motion.circle cx="150" cy="140" r="30" fill="url(#shield1)" animate={{ r: [30, 36, 30] }} transition={{ duration: 2.5, repeat: Infinity }} />
          <motion.path 
            d="M 135 140 L 148 153 L 170 130" 
            stroke="white" 
            strokeWidth="5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

// ===== ENHANCED ANIMATED GRADIENT BLOB WITH PARALLAX =====

const AnimatedBlob = ({ top, right, size, duration, delay = 0, color }) => {
  const blobRef = useRef(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <motion.div 
      ref={blobRef}
      className="position-absolute" 
      style={{ 
        top, 
        right, 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        background: color,
        filter: 'blur(120px)',
        y: parallaxY
      }}
      animate={{ 
        scale: [1, 1.4, 1],
        rotate: [0, 240, 360],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    />
  );
};

// ===== ENHANCED NAVIGATION =====

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
        background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.8)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container-xl py-3">
        <div className="d-flex justify-content-between align-items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="fw-900 text-dark" style={{ fontSize: '28px', textDecoration: 'none', letterSpacing: '-1px' }}>
              <span style={{ color: '#dc2626' }}>Sign</span>atura
            </Link>
          </motion.div>

          <div className="d-none d-lg-flex align-items-center gap-8">
            {['Features', 'Solutions', 'Industries', 'Security', 'Pricing'].map((item, idx) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-dark text-decoration-none fw-500 small"
                style={{ fontSize: '14px', letterSpacing: '0.5px' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ 
                  color: '#dc2626', 
                  y: -3,
                  textShadow: "0 10px 20px rgba(220, 38, 38, 0.2)"
                }}
                transition={{ duration: 0.3 }}
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
                style={{ padding: '8px 0', fontSize: '14px' }}
                whileHover={{ scale: 1.08, color: '#dc2626' }}
                whileTap={{ scale: 0.95 }}
              >
                Login <motion.div animate={{ rotate: loginDropdown ? 180 : 0 }}><FiChevronDown size={16} /></motion.div>
              </motion.button>

              <AnimatePresence>
                {loginDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.9 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="position-absolute end-0 mt-3 bg-white rounded-3 shadow-xl overflow-hidden"
                    style={{ minWidth: '240px', zIndex: 1001, backdropFilter: 'blur(20px)' }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link to="/login/issuer" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => { e.target.style.background = '#fef2f2'; e.target.style.transform = 'translateX(8px)'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateX(0)'; }}>
                        🔑 Issuer Portal
                      </Link>
                    </motion.div>
                    <div style={{ borderTop: '1px solid #fee2e2' }} />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Link to="/login/owner" className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0" onMouseEnter={(e) => { e.target.style.background = '#fef2f2'; e.target.style.transform = 'translateX(8px)'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateX(0)'; }}>
                        👥 Owner Portal
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}>
              <Link to="/issuer" className="btn fw-700 text-white rounded-pill px-6 py-2" style={{ background: '#dc2626', boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)', fontSize: '14px' }}>
                Start Free
              </Link>
            </motion.div>

            <button className="btn d-lg-none border-0 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }}>
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
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
              transition={{ duration: 0.3 }}
              className="w-100 pb-4 overflow-hidden"
            >
              {['Features', 'Solutions', 'Industries', 'Security', 'Pricing'].map((item, idx) => (
                <motion.a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500" 
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 10, color: '#dc2626' }}
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

// ===== ENHANCED FOOTER =====

const PremiumFooter = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput) {
      setSubscribed(true);
      setTimeout(() => {
        setEmailInput('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="position-relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
      paddingTop: '80px',
      paddingBottom: '60px'
    }}>
      <AnimatedBlob 
        top="-20%" 
        right="-10%" 
        size="600px" 
        duration={30} 
        delay={0}
        color="radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)"
      />

      <div className="container-xl position-relative">
        {/* TOP SECTION - Stats */}
        <motion.div 
          className="row g-8 mb-12 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 }
            }
          }}
        >
          {[
            { num: '500', suffix: '+', label: 'Organizations' },
            { num: '10', suffix: 'M+', label: 'Verified Identities' },
            { num: '99.99', suffix: '%', label: 'Uptime' },
            { num: '50', suffix: '+', label: 'Countries' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              className="col-md-6 col-lg-3 text-center"
              variants={{
                hidden: { opacity: 0, scale: 0.5, y: 30 },
                visible: { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { duration: 0.6, type: "spring" }
                }
              }}
            >
              <motion.div
                className="p-6 rounded-3"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
                whileHover={{ 
                  scale: 1.12,
                  background: 'rgba(220,38,38,0.2)',
                  borderColor: '#dc2626',
                  boxShadow: '0 20px 40px rgba(220,38,38,0.2)'
                }}
              >
                <motion.div
                  className="fw-900 h3 mb-2 text-white"
                  style={{ fontSize: '42px' }}
                >
                  <span style={{ color: '#dc2626' }}>{stat.num}</span>{stat.suffix}
                </motion.div>
                <p className="small fw-600" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {stat.label}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* MIDDLE SECTION - Brand + Newsletter */}
        <motion.div 
          className="row align-items-center g-10 mb-12 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
        >
          <motion.div 
            className="col-lg-4"
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 }
            }}
          >
            <h4 className="fw-900 mb-4 text-white" style={{ fontSize: '28px', letterSpacing: '-1px' }}>
              <span style={{ color: '#dc2626' }}>Sign</span>atura
            </h4>
            <p className="mb-5" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>
              Enterprise digital identity platform for the modern world.
            </p>

            <motion.div 
              className="d-flex gap-3"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {['GDPR', 'ISO 27001', 'eIDAS'].map((badge, idx) => (
                <motion.div
                  key={idx}
                  className="small fw-600 px-3 py-2 rounded-2"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}
                  variants={{
                    hidden: { opacity: 0, scale: 0, rotate: -180 },
                    visible: { opacity: 1, scale: 1, rotate: 0 }
                  }}
                  whileHover={{ scale: 1.15, rotate: 8, y: -5 }}
                >
                  ✓ {badge}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="col-lg-8"
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0 }
            }}
          >
            <motion.div
              className="p-8 rounded-4"
              style={{ 
                background: 'rgba(220,38,38,0.08)', 
                border: '2px solid rgba(220,38,38,0.3)',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{
                borderColor: '#dc2626',
                background: 'rgba(220,38,38,0.12)',
                boxShadow: '0 20px 50px rgba(220,38,38,0.2)'
              }}
            >
              <h5 className="fw-700 mb-2 text-white">Get Updates</h5>
              <p className="small mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Subscribe for latest security features and announcements
              </p>
              
              <form onSubmit={handleSubscribe}>
                <motion.div 
                  className="input-group input-group-lg"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  <motion.input 
                    type="email" 
                    className="form-control rounded-start-pill border-0" 
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.95)', paddingLeft: '24px', fontWeight: 500 }}
                    whileFocus={{ scale: 1.03, boxShadow: '0 0 0 3px rgba(220,38,38,0.2)' }}
                    required
                  />
                  <motion.button
                    className="btn fw-700 rounded-end-pill text-white px-8"
                    style={{ background: '#dc2626' }}
                    whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(220,38,38,0.4)' }}
                    whileTap={{ scale: 0.92 }}
                    type="submit"
                  >
                    {subscribed ? '✓ Subscribed' : 'Subscribe'}
                  </motion.button>
                </motion.div>
              </form>

              <p className="small mt-3 mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
                No spam • Unsubscribe anytime
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Links Section - 3 columns */}
        <motion.div 
          className="row g-8 mb-12 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          {[
            { title: 'Product', links: ['Solutions', 'Features', 'Security', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance', 'Cookies'] }
          ].map((column, colIdx) => (
            <motion.div 
              key={colIdx} 
              className="col-md-6 col-lg-4"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h6 className="fw-700 text-white mb-4" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {column.title}
              </h6>
              <ul className="list-unstyled">
                {column.links.map((link, idx) => (
                  <motion.li 
                    key={idx} 
                    className="mb-3"
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: colIdx * 0.1 + idx * 0.08 }}
                  >
                    <motion.a 
                      href="#" 
                      className="text-decoration-none small fw-500"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      whileHover={{ 
                        color: '#dc2626',
                        x: 12
                      }}
                    >
                      → {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom - Social + Copyright */}
        <motion.div 
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
            &copy; 2025 Signatura | Enterprise Digital Identity
          </p>

          <motion.div 
            className="d-flex gap-3"
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
              { icon: FiFacebook, link: 'https://www.facebook.com/PHsignatura' },
              { icon: FiYoutube, link: 'https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg' },
              { icon: FiTwitter, link: '#' },
              { icon: FiLinkedin, link: '#' },
              { icon: FiInstagram, link: '#' }
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(220,38,38,0.15)',
                  border: '2px solid rgba(220,38,38,0.3)',
                  color: '#dc2626',
                  textDecoration: 'none'
                }}
                variants={{
                  hidden: { opacity: 0, scale: 0, rotate: -180 },
                  visible: { opacity: 1, scale: 1, rotate: 0 }
                }}
                whileHover={{
                  background: '#dc2626',
                  color: 'white',
                  scale: 1.25,
                  y: -15,
                  boxShadow: '0 20px 50px rgba(220,38,38,0.5)',
                  rotate: 360
                }}
                transition={{ duration: 0.4 }}
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

// ===== FEATURE CARD WITH ENHANCED ANIMATION =====

const FeatureCard = ({ feature, idx }) => {
  const IconComponent = feature.icon;
  return (
    <motion.div 
      className="col-md-6 col-lg-4"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="p-8 rounded-4 h-100 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
        whileHover={{ 
          y: -28, 
          boxShadow: '0 60px 120px rgba(220, 38, 38, 0.25)', 
          borderColor: '#dc2626',
          rotateY: 5,
          rotateX: -5
        }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="mb-4"
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: idx * 0.2 }}
        >
          <IconComponent size={64} />
        </motion.div>
        <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '20px' }}>{feature.title}</h5>
        <p className="text-muted" style={{ fontSize: '15px' }}>{feature.desc}</p>
      </motion.div>
    </motion.div>
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
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)',
        minHeight: '900px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <AnimatedBlob 
          top="-10%" 
          right="-5%" 
          size="600px" 
          duration={20} 
          delay={0}
          color="radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)"
        />
        
        <div className="container-xl position-relative">
          <div className="row align-items-center g-8">
            <motion.div 
              className="col-lg-6" 
              initial={{ opacity: 0, y: 60 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <motion.h1 
                className="mb-5 lh-1" 
                style={{ fontSize: '80px', fontWeight: 900, letterSpacing: '-3px', color: '#111827', lineHeight: '1.05' }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your Digital <motion.span 
                  style={{ color: '#dc2626', display: 'inline-block' }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  Identity,
                </motion.span> Secured
              </motion.h1>
              
              <motion.p 
                className="mb-8" 
                style={{ fontSize: '18px', color: '#6b7280', maxWidth: '550px', lineHeight: '1.8' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Enterprise-grade digital identity with military-grade security and legally-binding digital signatures. Trusted by 500+ organizations worldwide.
              </motion.p>

              <motion.div 
                className="d-flex flex-column flex-sm-row gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                variants={containerVariants}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, y: -6 }} 
                  whileTap={{ scale: 0.92 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Link to="/issuer" className="btn btn-lg fw-700 text-white rounded-pill px-10 py-3" style={{ background: '#dc2626', fontSize: '16px', boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)' }}>
                    🔑 Issuer Portal <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -6 }} 
                  whileTap={{ scale: 0.92 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-10 py-3 border-3" style={{ borderColor: '#dc2626', color: '#dc2626', fontSize: '16px' }}>
                    👥 Owner Portal <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                className="d-flex gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                variants={containerVariants}
              >
                {[{ num: '500+', text: 'Organizations' }, { num: '10M+', text: 'Verified' }, { num: '99.99%', text: 'Uptime' }].map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                  >
                    <p className="fw-900 h5 mb-1" style={{ color: '#dc2626' }}>{stat.num}</p>
                    <p className="text-muted small">{stat.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="col-lg-6" 
              initial={{ opacity: 0, scale: 0.7, rotateY: 30 }} 
              animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
              transition={{ duration: 0.9, delay: 0.2, type: "spring" }}
            >
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
            <motion.h2 
              className="mb-5 lh-1" 
              style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Everything You Need
            </motion.h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Comprehensive digital identity and security solutions
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: SecurityIcon, title: 'Military-Grade Security', desc: 'End-to-end encrypted protection' },
              { icon: LightningIcon, title: 'Lightning Fast', desc: 'Real-time verification in milliseconds' },
              { icon: GlobalIcon, title: 'Global Compliance', desc: 'GDPR, eIDAS, international standards' },
              { icon: IntegrationIcon, title: 'Easy Integration', desc: 'RESTful APIs and SDKs' },
              { icon: MobileIcon, title: 'Mobile-First', desc: 'Native iOS & Android apps' },
              { icon: SupportIcon, title: '24/7 Support', desc: 'Dedicated enterprise support' },
            ].map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} idx={idx} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-14 py-lg-16 position-relative" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fafafa 100%)' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Comprehensive Solutions
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Complete digital transformation suite for your organization
            </p>
          </motion.div>

          <motion.div 
            className="row g-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: IdentityIcon, title: 'Digital Identity', desc: 'KYC verification, biometric authentication, multi-factor security', features: ['Selfie verification', 'Liveness detection', 'Real-time KYC', 'Secure storage'] },
              { icon: SignatureIcon, title: 'Digital Signatures', desc: 'Legally binding signatures with QR protection and audit trails', features: ['Legal compliance', 'QR codes', 'Audit logs', 'Global recognition'] },
              { icon: DataSecurityIcon, title: 'Data Security', desc: 'Military-grade encryption for sensitive documents and data', features: ['AES-256 encryption', 'TLS 1.3', 'Zero knowledge', 'Compliance ready'] },
            ].map((solution, idx) => (
              <motion.div 
                key={idx} 
                className="col-lg-4"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100"
                  style={{ background: '#ffffff', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -24, 
                    boxShadow: '0 50px 100px rgba(220, 38, 38, 0.2)', 
                    borderColor: '#dc2626',
                    scale: 1.02
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                  >
                    <solution.icon size={80} />
                  </motion.div>
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '22px' }}>{solution.title}</h5>
                  <p className="text-muted mb-5" style={{ fontSize: '15px' }}>{solution.desc}</p>
                  <motion.ul 
                    className="list-unstyled small"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                      }
                    }}
                  >
                    {solution.features.map((feature, fidx) => (
                      <motion.li 
                        key={fidx} 
                        className="mb-2"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>✓</span> {feature}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SECURITY SECTION ===== */}
      <section id="security" className="py-14 py-lg-16 position-relative text-white" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <AnimatedBlob 
          top="-10%" 
          right="-10%" 
          size="700px" 
          duration={20} 
          delay={2}
          color="rgba(255, 255, 255, 0.05)"
        />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <h2 className="mb-5 lh-1 text-white" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>
              Enterprise-Grade Security
            </h2>
            <p className="lead text-white opacity-90" style={{ maxWidth: '700px', fontSize: '18px', margin: '0 auto' }}>
              Military-grade encryption, advanced monitoring, and continuous threat detection
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: MFAIcon, title: 'Multi-Factor Auth', desc: 'Multiple verification layers' },
              { icon: BiometricIcon, title: 'Biometric Verification', desc: 'Liveness detection & KYC' },
              { icon: EncryptionIcon, title: 'Military Encryption', desc: 'AES-256 & TLS 1.3' },
              { icon: MonitoringIcon, title: '24/7 Monitoring', desc: 'Real-time threat detection' },
              { icon: LedgerIcon, title: 'Immutable Ledger', desc: 'Blockchain-backed records' },
              { icon: ZeroTrustIcon, title: 'Zero Trust', desc: 'Verify every transaction' },
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
                    y: -20, 
                    background: 'rgba(255, 255, 255, 0.18)', 
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 20px 50px rgba(255, 255, 255, 0.15)'
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div 
                    className="mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.15 }}
                  >
                    <feature.icon size={64} />
                  </motion.div>
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
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Trusted Across Industries
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Serving 500+ organizations across banking, insurance, government, and education
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: BankingIcon, title: 'Banking & Finance', desc: 'Secure transactions and compliance' },
              { icon: InsuranceIcon, title: 'Insurance', desc: 'Policy management and claims' },
              { icon: GovernmentIcon, title: 'Government', desc: 'Citizen services and digital ID' },
              { icon: EducationIcon, title: 'Education', desc: 'Credential verification and transcripts' },
            ].map((industry, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                variants={{
                  hidden: { opacity: 0, scale: 0.7 },
                  visible: { opacity: 1, scale: 1 }
                }}
              >
                <motion.div
                  className="p-10 rounded-4 text-center h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -24, 
                    boxShadow: '0 50px 100px rgba(220, 38, 38, 0.25)', 
                    borderColor: '#dc2626',
                    scale: 1.05
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div 
                    className="mb-4"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, delay: idx * 0.3 }}
                  >
                    <industry.icon size={80} />
                  </motion.div>
                  <h5 className="fw-700 mb-2" style={{ color: '#111827', fontSize: '22px' }}>{industry.title}</h5>
                  <p className="text-muted small">{industry.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-14 py-lg-16 position-relative" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%)' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Trusted by Leaders
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Hear from organizations using Signatura
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { name: 'John Smith', role: 'CEO, FinTech Corp', text: 'Signatura transformed our digital operations completely. The security and ease of use are unmatched. Highly recommended!' },
              { name: 'Maria Garcia', role: 'Head of Compliance', text: 'We achieved full regulatory compliance in weeks. The platform is enterprise-ready out of the box. Outstanding support!' },
              { name: 'David Lee', role: 'CTO, InsureHub', text: 'The API integration was seamless. Customer adoption rates exceeded our expectations by 300%. Best investment ever!' },
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
                  style={{ background: '#ffffff', border: '2px solid #fee2e2' }}
                  whileHover={{ 
                    y: -20, 
                    boxShadow: '0 40px 80px rgba(220, 38, 38, 0.2)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <motion.div 
                    className="d-flex gap-1 mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <FiStar size={18} style={{ color: '#dc2626', fill: '#dc2626' }} />
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="mb-5" style={{ fontSize: '15px', color: '#374151', fontStyle: 'italic', lineHeight: '1.7' }}>"{testimonial.text}"</p>
                  <div className="pt-4" style={{ borderTop: '1px solid #fee2e2' }}>
                    <p className="fw-700 mb-0" style={{ color: '#111827' }}>{testimonial.name}</p>
                    <p className="text-muted small mb-0">{testimonial.role}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-14 py-lg-16" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeInUp}>
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Choose the plan that fits your organization. No hidden fees. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <motion.div 
            className="row g-6" 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { name: 'Starter', price: '$499', features: ['10,000 verifications', 'Basic API', 'Email support', 'Dashboard', 'Single admin'] },
              { name: 'Professional', price: '$1,999', features: ['100,000 verifications', 'Full API', 'Priority support', 'Team management', 'Custom branding'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'Dedicated support', 'Custom integrations', 'SLA guarantees', 'Multi-region'] },
            ].map((plan, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4" 
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <motion.div 
                  className="p-10 rounded-4 h-100" 
                  style={{ 
                    background: plan.popular ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#ffffff', 
                    border: `2px solid ${plan.popular ? '#dc2626' : '#fee2e2'}`, 
                    color: plan.popular ? 'white' : 'black' 
                  }} 
                  whileHover={{ 
                    y: -20,
                    boxShadow: plan.popular ? '0 40px 100px rgba(220, 38, 38, 0.4)' : '0 40px 100px rgba(220, 38, 38, 0.15)',
                    scale: 1.03
                  }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  {plan.popular && (
                    <motion.div 
                      className="badge bg-white text-danger" 
                      style={{ marginBottom: '15px', fontSize: '12px', fontWeight: 700 }}
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      Most Popular
                    </motion.div>
                  )}
                  <h5 className="fw-700 mb-2" style={{ color: plan.popular ? 'white' : '#111827', fontSize: '24px' }}>{plan.name}</h5>
                  <div className="mb-6"><span style={{ fontSize: '42px', fontWeight: 900, color: plan.popular ? 'white' : '#dc2626' }}>{plan.price}</span></div>
                  <motion.ul 
                    className="list-unstyled mb-8"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                      }
                    }}
                  >
                    {plan.features.map((feature, fidx) => (
                      <motion.li 
                        key={fidx} 
                        className="mb-3" 
                        style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : '#6b7280', fontWeight: 500, fontSize: '15px' }}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <span style={{ color: plan.popular ? 'white' : '#dc2626' }}>✓</span> {feature}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.button 
                    className="btn w-100 fw-700 rounded-pill py-3" 
                    style={{ background: plan.popular ? 'white' : '#dc2626', color: plan.popular ? '#dc2626' : 'white', fontSize: '15px' }} 
                    whileHover={{ scale: 1.08, y: -3 }} 
                    whileTap={{ scale: 0.92 }}
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
      <section className="py-14 py-lg-16 position-relative text-white overflow-hidden" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
        <AnimatedBlob 
          top="-20%" 
          right="-5%" 
          size="800px" 
          duration={25} 
          delay={3}
          color="rgba(255, 255, 255, 0.08)"
        />
        
        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="mb-5 lh-1 text-white" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>
              Ready to Transform?
            </h2>
            <p className="lead text-white opacity-90 mx-auto mb-10" style={{ maxWidth: '800px', fontSize: '20px' }}>
              Join 500+ organizations securing their digital future. Get started today.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.div 
                whileHover={{ scale: 1.12, y: -6 }} 
                whileTap={{ scale: 0.92 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link to="/issuer" className="btn btn-lg fw-700 text-danger rounded-pill px-12 py-4" style={{ background: 'white', fontSize: '18px', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
                  🔑 Issuer Portal <FiArrowRight className="ms-3" size={24} />
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.12, y: -6 }} 
                whileTap={{ scale: 0.92 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-12 py-4 border-3" style={{ borderColor: 'white', color: 'white', fontSize: '18px' }}>
                  👥 Owner Portal <FiArrowRight className="ms-3" size={24} />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PremiumFooter />
    </div>
  );
}
