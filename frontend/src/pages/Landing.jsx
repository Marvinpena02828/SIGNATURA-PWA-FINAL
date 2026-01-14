import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown, FiStar, FiTrendingUp, FiUsers, FiAward,
  FiMail, FiPhone, FiMapPin, FiShield, FiGlobe, FiFacebook, FiYoutube, FiTwitter, FiLinkedin, FiInstagram 
} from 'react-icons/fi';

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
      className={`sticky-top transition-all ${scrolled ? 'shadow-lg' : ''}`} 
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// ===== SIMPLE FOOTER WITH SCROLL ANIMATIONS =====

const SimpleFooter = () => {
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
    <footer className="text-white position-relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
      paddingTop: '80px',
      paddingBottom: '60px'
    }}>
      {/* Animated Background Blobs */}
      <motion.div 
        className="position-absolute" 
        style={{ 
          top: '-20%', 
          right: '-10%', 
          width: '600px', 
          height: '600px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)'
        }}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
        transition={{ duration: 30, repeat: Infinity }}
      />

      <div className="container-xl position-relative">
        {/* TOP SECTION - Stats with Counter Animation */}
        <motion.div 
          className="row g-8 mb-12 pb-10 text-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        >
          {[
            { num: '500', suffix: '+', label: 'Organizations' },
            { num: '10', suffix: 'M+', label: 'Verified Identities' },
            { num: '99.99', suffix: '%', label: 'Uptime' },
            { num: '50', suffix: '+', label: 'Countries' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="p-6 rounded-3"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(220,38,38,0.2)',
                  borderColor: '#dc2626'
                }}
              >
                <motion.div
                  className="fw-900 h3 mb-2 text-white"
                  style={{ fontSize: '42px' }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <span style={{ color: '#dc2626' }}>{stat.num}</span>{stat.suffix}
                </motion.div>
                <motion.p 
                  className="text-muted small fw-600"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.label}
                </motion.p>
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
        >
          {/* Left - Brand */}
          <motion.div 
            className="col-lg-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.h4 
              className="fw-900 mb-4" 
              style={{ fontSize: '28px', letterSpacing: '-1px' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span style={{ color: '#dc2626' }}>Sign</span>atura
            </motion.h4>
            <motion.p 
              className="text-muted mb-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Enterprise digital identity platform for the modern world.
            </motion.p>

            {/* Trust Badges */}
            <motion.div className="d-flex gap-3">
              {['GDPR', 'ISO 27001', 'eIDAS'].map((badge, idx) => (
                <motion.div
                  key={idx}
                  className="small fw-600 px-3 py-2 rounded-2"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  ✓ {badge}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Newsletter */}
          <motion.div 
            className="col-lg-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="p-8 rounded-4"
              style={{ 
                background: 'rgba(220,38,38,0.08)', 
                border: '2px solid rgba(220,38,38,0.3)',
                backdropFilter: 'blur(10px)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{
                borderColor: '#dc2626',
                background: 'rgba(220,38,38,0.12)'
              }}
            >
              <motion.h5 
                className="fw-700 mb-2 text-white"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Get Updates
              </motion.h5>
              <motion.p 
                className="text-muted small mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                Subscribe for latest security features and announcements
              </motion.p>
              
              <form onSubmit={handleSubscribe}>
                <div className="input-group input-group-lg">
                  <motion.input 
                    type="email" 
                    className="form-control rounded-start-pill border-0" 
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.95)', paddingLeft: '24px', fontWeight: 500 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.button
                    className="btn fw-700 rounded-end-pill text-white px-8"
                    style={{ background: '#dc2626' }}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(220,38,38,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45 }}
                  >
                    {subscribed ? '✓ Subscribed' : 'Subscribe'}
                  </motion.button>
                </div>
              </form>

              <motion.p 
                className="text-muted small mt-3 mb-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                No spam • Unsubscribe anytime
              </motion.p>
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
        >
          {[
            { title: 'Product', links: ['Solutions', 'Features', 'Security', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance', 'Cookies'] }
          ].map((column, colIdx) => (
            <motion.div 
              key={colIdx} 
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: colIdx * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.h6 
                className="fw-700 text-white mb-4"
                style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: colIdx * 0.1 }}
              >
                {column.title}
              </motion.h6>
              <ul className="list-unstyled">
                {column.links.map((link, idx) => (
                  <motion.li key={idx} className="mb-3">
                    <motion.a 
                      href="#" 
                      className="text-muted text-decoration-none small fw-500"
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: colIdx * 0.1 + idx * 0.08 }}
                      whileHover={{ 
                        color: '#dc2626',
                        x: 8
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -50px 0px' }}
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-muted small mb-0">
              &copy; 2025 Signatura | Enterprise Digital Identity
            </p>
          </motion.div>

          {/* Right - Social Icons */}
          <motion.div 
            className="d-flex gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
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
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{
                  background: '#dc2626',
                  color: 'white',
                  scale: 1.15,
                  y: -10,
                  boxShadow: '0 15px 40px rgba(220,38,38,0.4)'
                }}
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

// ===== MAIN COMPONENT =====

export default function SignaturaLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
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
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        <div className="container-xl position-relative">
          <div className="row align-items-center g-8">
            <motion.div className="col-lg-6" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.h1 
                className="mb-5 lh-1" 
                style={{ fontSize: '80px', fontWeight: 900, letterSpacing: '-3px', color: '#111827', lineHeight: '1.05' }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Your Digital <span style={{ color: '#dc2626' }}>Identity,</span> Secured
              </motion.h1>
              
              <motion.p 
                className="mb-8" 
                style={{ fontSize: '18px', color: '#6b7280', maxWidth: '550px', lineHeight: '1.8' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Enterprise-grade digital identity, blockchain-backed security, and legally-binding digital signatures. Trusted by 500+ organizations worldwide.
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
                {[{ num: '500+', text: 'Organizations' }, { num: '10M+', text: 'Verified' }, { num: '99.99%', text: 'Uptime' }].map((stat, idx) => (
                  <div key={idx}>
                    <p className="fw-900 h5 mb-1" style={{ color: '#dc2626' }}>{stat.num}</p>
                    <p className="text-muted small">{stat.text}</p>
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
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Everything You Need
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Comprehensive digital identity and security solutions
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🛡️', title: 'Military-Grade Security', desc: 'End-to-end encrypted protection' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Real-time verification in milliseconds' },
              { icon: '🌍', title: 'Global Compliance', desc: 'GDPR, eIDAS, international standards' },
              { icon: '🔗', title: 'Easy Integration', desc: 'RESTful APIs and SDKs' },
              { icon: '📱', title: 'Mobile-First', desc: 'Native iOS & Android apps' },
              { icon: '👥', title: '24/7 Support', desc: 'Dedicated enterprise support' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ y: -20, boxShadow: '0 50px 100px rgba(220, 38, 38, 0.2)', borderColor: '#dc2626' }}
                >
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '20px' }}>{feature.title}</h5>
                  <p className="text-muted">{feature.desc}</p>
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
          >
            {[
              { emoji: '🆔', title: 'Digital Identity', desc: 'KYC verification, biometric authentication, multi-factor security', features: ['Selfie verification', 'Liveness detection', 'Real-time KYC', 'Secure storage'] },
              { emoji: '✍️', title: 'Digital Signatures', desc: 'Legally binding signatures with QR protection and audit trails', features: ['Legal compliance', 'QR codes', 'Audit logs', 'Global recognition'] },
              { emoji: '🔐', title: 'Data Security', desc: 'Military-grade encryption for sensitive documents and data', features: ['AES-256 encryption', 'TLS 1.3', 'Zero knowledge', 'Compliance ready'] },
            ].map((solution, idx) => (
              <motion.div 
                key={idx} 
                className="col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100"
                  style={{ background: '#ffffff', border: '2px solid #fee2e2' }}
                  whileHover={{ y: -16, boxShadow: '0 40px 80px rgba(220, 38, 38, 0.15)', borderColor: '#dc2626' }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>{solution.emoji}</div>
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '22px' }}>{solution.title}</h5>
                  <p className="text-muted mb-5">{solution.desc}</p>
                  <ul className="list-unstyled small">
                    {solution.features.map((feature, fidx) => (
                      <li key={fidx} className="mb-2">
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
            <h2 className="mb-5 lh-1 text-white" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px' }}>
              Enterprise-Grade Security
            </h2>
            <p className="lead text-white opacity-90" style={{ maxWidth: '700px', fontSize: '18px', margin: '0 auto' }}>
              Military-grade encryption, blockchain technology, and continuous monitoring
            </p>
          </motion.div>

          <motion.div 
            className="row g-6"
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
              { icon: '🛡️', title: 'Zero Trust', desc: 'Verify every transaction' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 text-center h-100"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: '2px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                  whileHover={{ y: -12, background: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.5)' }}
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
          >
            {[
              { icon: '🏦', title: 'Banking & Finance', desc: 'Secure transactions and compliance' },
              { icon: '🏢', title: 'Insurance', desc: 'Policy management and claims' },
              { icon: '🏛️', title: 'Government', desc: 'Citizen services and digital ID' },
              { icon: '📚', title: 'Education', desc: 'Credential verification and transcripts' },
            ].map((industry, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.12 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-10 rounded-4 text-center h-100"
                  style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }}
                  whileHover={{ y: -16, boxShadow: '0 40px 80px rgba(220, 38, 38, 0.2)', borderColor: '#dc2626' }}
                >
                  <p className="text-6xl mb-4">{industry.icon}</p>
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
          >
            {[
              { name: 'John Smith', role: 'CEO, FinTech Corp', text: 'Signatura transformed our digital operations completely. The security and ease of use are unmatched. Highly recommended!' },
              { name: 'Maria Garcia', role: 'Head of Compliance', text: 'We achieved full regulatory compliance in weeks. The platform is enterprise-ready out of the box. Outstanding support!' },
              { name: 'David Lee', role: 'CTO, InsureHub', text: 'The API integration was seamless. Customer adoption rates exceeded our expectations by 300%. Best investment ever!' },
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 h-100"
                  style={{ background: '#ffffff', border: '2px solid #fee2e2' }}
                  whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(220, 38, 38, 0.15)' }}
                >
                  <div className="d-flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={18} style={{ color: '#dc2626', fill: '#dc2626' }} />
                    ))}
                  </div>
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
          <motion.div className="text-center mb-14">
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Choose the plan that fits your organization. No hidden fees. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <motion.div className="row g-6" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { name: 'Starter', price: '$499', features: ['10,000 verifications', 'Basic API', 'Email support', 'Dashboard', 'Single admin'] },
              { name: 'Professional', price: '$1,999', features: ['100,000 verifications', 'Full API', 'Priority support', 'Team management', 'Custom branding'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'Dedicated support', 'Custom integrations', 'SLA guarantees', 'Multi-region'] },
            ].map((plan, idx) => (
              <motion.div key={idx} className="col-md-6 col-lg-4" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }} viewport={{ once: true }}>
                <motion.div className="p-10 rounded-4 h-100" style={{ background: plan.popular ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#ffffff', border: `2px solid ${plan.popular ? '#dc2626' : '#fee2e2'}`, color: plan.popular ? 'white' : 'black' }} whileHover={{ y: -12 }}>
                  {plan.popular && <div className="badge bg-white text-danger" style={{ marginBottom: '15px' }}>Most Popular</div>}
                  <h5 className="fw-700 mb-2" style={{ color: plan.popular ? 'white' : '#111827', fontSize: '24px' }}>{plan.name}</h5>
                  <div className="mb-6"><span style={{ fontSize: '42px', fontWeight: 900, color: plan.popular ? 'white' : '#dc2626' }}>{plan.price}</span></div>
                  <ul className="list-unstyled mb-8">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="mb-3" style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : '#6b7280', fontWeight: 500 }}>
                        <span style={{ color: '#dc2626' }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.button className="btn w-100 fw-700 rounded-pill py-3" style={{ background: plan.popular ? 'white' : '#dc2626', color: plan.popular ? '#dc2626' : 'white' }} whileHover={{ scale: 1.05 }}>
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== DEVELOPERS ===== */}
      <section id="developers" className="py-14 py-lg-16" style={{ background: '#ffffff' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-14">
            <h2 className="mb-5 lh-1" style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-2px', color: '#111827' }}>
              Developer-Friendly
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '18px' }}>
              Complete API documentation, SDKs, and tools for seamless integration. Everything developers need to build quickly.
            </p>
          </motion.div>

          <motion.div className="row g-8" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { emoji: '📚', title: 'Complete Documentation', desc: 'Comprehensive API reference with code examples in multiple languages. Clear tutorials and best practices.' },
              { emoji: '🔧', title: 'SDKs & Libraries', desc: 'Official SDKs for JavaScript, Python, Java, Go. Pre-built libraries for common use cases.' },
              { emoji: '🧪', title: 'Sandbox Environment', desc: 'Full-featured sandbox for testing. Realistic test scenarios. Free unlimited testing.' },
              { emoji: '🔌', title: 'Webhooks & Events', desc: 'Real-time webhooks for updates. Customizable subscriptions. Reliable delivery with retries.' },
            ].map((dev, idx) => (
              <motion.div key={idx} className="col-md-6 col-lg-3" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.12 }} viewport={{ once: true }}>
                <motion.div className="p-8 rounded-4 h-100" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', border: '2px solid #fee2e2' }} whileHover={{ y: -20, boxShadow: '0 40px 80px rgba(220, 38, 38, 0.15)', borderColor: '#dc2626' }}>
                  <p style={{ fontSize: '48px', marginBottom: '20px' }}>{dev.emoji}</p>
                  <h5 className="fw-700 mb-3" style={{ color: '#111827', fontSize: '22px' }}>{dev.title}</h5>
                  <p className="text-muted" style={{ lineHeight: '1.7' }}>{dev.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-14 py-lg-16 position-relative text-white overflow-hidden" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
      }}>
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
          </motion.div>
        </div>
      </section>

      <SimpleFooter />
    </div>
  );
}
