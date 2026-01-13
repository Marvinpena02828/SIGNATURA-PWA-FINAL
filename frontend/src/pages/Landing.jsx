import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle, FiChevronDown,
  FiKey, FiShield, FiLock, FiUsers, FiTarget, FiEye,
  FiShoppingCart, FiZap, FiCloud, FiFile, FiPenTool, FiActivity, FiDollarSign, FiCalendar, FiBell,
  FiTrendingUp, FiAward, FiGlobeAlt
} from 'react-icons/fi';

// Premium Navigation
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar sticky-top navbar-expand-lg transition-all ${
      scrolled 
        ? 'bg-white shadow-lg' 
        : 'bg-white bg-opacity-50 backdrop-blur'
    }`} style={{ zIndex: 1000, backdropFilter: 'blur(10px)' }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-100 d-flex justify-content-between align-items-center"
        >
          {/* Logo */}
          <Link to="/" className="navbar-brand me-auto fw-900 text-dark" style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
            Signatura
          </Link>

          {/* Desktop Menu */}
          <div className="d-none d-lg-flex align-items-center gap-6">
            {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-dark text-decoration-none fw-600 small"
                whileHover={{ color: '#dc2626' }}
                transition={{ duration: 0.3 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Right Side - Login Dropdown + CTA */}
          <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
            {/* Login Dropdown */}
            <div className="position-relative d-none d-md-block">
              <motion.button
                className="btn btn-sm fw-600 text-dark d-flex align-items-center gap-2"
                style={{ background: 'transparent', border: 'none', padding: '8px 0' }}
                onClick={() => setLoginDropdown(!loginDropdown)}
                whileHover={{ color: '#dc2626' }}
              >
                Login <FiChevronDown size={16} />
              </motion.button>

              <AnimatePresence>
                {loginDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg overflow-hidden"
                    style={{ minWidth: '200px', zIndex: 1001 }}
                  >
                    <Link 
                      to="/login/issuer" 
                      className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0"
                      style={{ borderRadius: 0 }}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <FiKey size={16} className="me-2" /> Login as Issuer
                    </Link>
                    <div style={{ borderTop: '1px solid #e5e7eb' }} />
                    <Link 
                      to="/login/owner" 
                      className="btn btn-link w-100 text-start px-4 py-3 text-dark text-decoration-none fw-500 border-0"
                      style={{ borderRadius: 0 }}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <FiUsers size={16} className="me-2" /> Login as Owner
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/issuer" className="btn btn-sm fw-700 text-white rounded-pill px-5" style={{ background: '#dc2626' }}>
                Get Started
              </Link>
            </motion.div>

            {/* Mobile Menu */}
            <button
              className="btn d-lg-none border-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '8px' }}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-100 mt-3 pb-3"
            >
              {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="border-top my-2" />
              <Link to="/login/issuer" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                <FiKey size={16} className="me-2" /> Login as Issuer
              </Link>
              <Link to="/login/owner" className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500">
                <FiUsers size={16} className="me-2" /> Login as Owner
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Premium Footer
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-10 mt-10">
      <div className="container-xl">
        <div className="row g-6 mb-8">
          <div className="col-lg-4">
            <h4 className="fw-900 mb-4" style={{ letterSpacing: '-0.5px' }}>Signatura</h4>
            <p className="text-muted small mb-4 lh-lg">
              Transform your digital experience with secure identity, data protection, and digital signatures.
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
            <h6 className="fw-700 mb-4 text-white">Solutions</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#solutions" className="text-muted text-decoration-none">Digital ID</a></li>
              <li className="mb-3"><a href="#solutions" className="text-muted text-decoration-none">Cloud Storage</a></li>
              <li className="mb-3"><a href="#solutions" className="text-muted text-decoration-none">Digital Signature</a></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-700 mb-4 text-white">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-3"><a href="#about" className="text-muted text-decoration-none">About</a></li>
              <li className="mb-3"><a href="#partners" className="text-muted text-decoration-none">Partners</a></li>
              <li className="mb-3"><a href="#contact" className="text-muted text-decoration-none">Contact</a></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6 className="fw-700 mb-4 text-white">Newsletter</h6>
            <div className="d-flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="form-control form-control-sm rounded-pill border-0"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              />
              <button className="btn btn-sm btn-red rounded-pill px-4 fw-700">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="border-top border-secondary opacity-25 pt-6">
          <p className="text-muted small mb-0 text-center">&copy; 2025 Signatura | Powered by 1Knight Solutions, Inc.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page
export default function SignaturaLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const solutions = [
    { icon: FiShoppingCart, title: 'Marketplace', desc: 'Custom-fit services at your fingertips' },
    { icon: FiKey, title: 'Digital ID', desc: 'Secure KYC/Selfie verification' },
    { icon: FiZap, title: 'Simplified Workflow', desc: 'Hassle-free digital processes' },
    { icon: FiCloud, title: 'Cloud Storage', desc: 'Secure document storage' },
    { icon: FiFile, title: 'Document Wallet', desc: 'Virtual wallet for documents' },
    { icon: FiPenTool, title: 'Digital Signature', desc: 'QR-protected signatures' },
    { icon: FiActivity, title: 'Contact Tracing', desc: 'Transmission tracking tool' },
    { icon: FiDollarSign, title: 'Secure Payments', desc: 'Integrated payment system' },
    { icon: FiCalendar, title: 'Scheduler', desc: 'Queue & scheduling system' },
    { icon: FiBell, title: 'Notifications', desc: 'Smart alerts & updates' },
  ];

  const benefits = [
    { icon: FiActivity, title: 'Enhanced Data', desc: 'Optimize & analyze data for decisions' },
    { icon: FiUsers, title: 'Better Experience', desc: 'Consistent customer interactions' },
    { icon: '🌍', title: 'Digital Culture', desc: 'Sustainable collaboration tools' },
    { icon: FiTrendingUp, title: 'More Revenue', desc: 'Efficiency & cost reduction' },
    { icon: FiZap, title: 'Higher Productivity', desc: 'Simplified workflows' },
    { icon: FiCheckCircle, title: 'Sustainability', desc: 'Paperless green solutions' },
  ];

  const stats = [
    { number: '500+', label: 'Organizations', icon: FiUsers },
    { number: '10M+', label: 'Credentials', icon: FiAward },
    { number: '99.99%', label: 'Uptime', icon: FiTarget },
    { number: '24/7', label: 'Support', icon: FiZap },
  ];

  return (
    <div className="signatura-landing" style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-12 py-lg-14 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)',
        minHeight: '800px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Animated Background Elements */}
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.03)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="position-absolute" 
          style={{ bottom: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.03)' }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        
        <div className="container-xl position-relative">
          <motion.div 
            className="row align-items-center g-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="col-lg-6">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <motion.span
                  className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small"
                  style={{ background: 'rgba(220, 38, 38, 0.1)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  ✨ Digital Transformation Platform
                </motion.span>
                
                <h1 className="display-2 fw-900 mb-5 lh-1" style={{ 
                  fontSize: '60px',
                  letterSpacing: '-2px',
                  color: '#111827'
                }}>
                  Your Secure Digital Future
                  <span className="text-red"> Starts Here</span>
                </h1>
                
                <p className="lead text-muted mb-6 lh-lg" style={{ fontSize: '18px', maxWidth: '500px' }}>
                  Signatura transforms how you manage digital identity, secure data, and sign documents—all in one powerful platform.
                </p>

                <motion.div 
                  className="d-flex flex-column flex-sm-row gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/issuer" className="btn btn-lg fw-700 text-white rounded-pill px-8" style={{ background: '#dc2626' }}>
                      Start as Issuer <FiArrowRight className="ms-2" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-8 border-2" style={{ borderColor: '#dc2626', color: '#dc2626', background: 'transparent' }}>
                      Start as Owner <FiArrowRight className="ms-2" />
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div className="d-flex gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {[
                    { number: '500+', text: 'Organizations' },
                    { number: '10M+', text: 'Verified' },
                    { number: '99.99%', text: 'Uptime' }
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <p className="fw-900 h5 text-dark mb-1">{stat.number}</p>
                      <p className="text-muted small">{stat.text}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <div className="col-lg-6">
              <motion.div 
                className="position-relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  height: '500px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}
              >
                <img src="/api/placeholder/600/500" alt="Hero" className="w-100 h-100 object-cover" />
                
                {/* Floating Card */}
                <motion.div 
                  className="position-absolute p-4 bg-white rounded-3 shadow-lg"
                  style={{ bottom: '-30px', right: '20px', width: '300px' }}
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="p-2 rounded-2" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
                      <FiKey className="text-red" size={24} />
                    </div>
                    <div>
                      <p className="fw-700 text-dark mb-0 small">Military-Grade Security</p>
                      <p className="text-muted small mb-0">Protected 24/7</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-12 py-lg-14">
        <div className="container-xl">
          <motion.div {...fadeInUp} className="row align-items-center g-6">
            <div className="col-lg-6">
              <div className="rounded-4 overflow-hidden" style={{ height: '500px', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' }}>
                <img src="/api/placeholder/600/500" alt="About" className="w-100 h-100 object-cover" />
              </div>
            </div>
            <div className="col-lg-6">
              <motion.span
                className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small"
                style={{ background: 'rgba(220, 38, 38, 0.1)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Why Choose Us
              </motion.span>
              
              <h2 className="display-4 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
                Transform Your Digital Experience
              </h2>
              <p className="lead text-muted mb-5">
                We believe in making digital transformation simple, secure, and accessible for everyone. Our platform combines cutting-edge technology with user-friendly design.
              </p>

              <div className="d-flex flex-column gap-4 mb-6">
                {[
                  'End-to-end encrypted data protection',
                  'Blockchain-backed security',
                  'Trusted by 500+ organizations',
                  'Compliant with global standards',
                  'Award-winning platform'
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="d-flex align-items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-2 rounded-2" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
                      <FiCheckCircle className="text-red" size={20} />
                    </div>
                    <span className="text-dark fw-500">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#solutions" className="btn btn-lg fw-700 text-white rounded-pill px-8" style={{ background: '#dc2626' }}>
                  Explore Solutions <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-12 py-lg-14 position-relative" style={{ background: '#f9fafb' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
              Our Solutions
            </span>
            <h2 className="display-3 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
              Everything You Need
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              10 powerful solutions designed to transform your digital operations
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
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
                  className="p-6 rounded-4 bg-white h-100 border position-relative overflow-hidden"
                  style={{ border: '1px solid #e5e7eb' }}
                  whileHover={{ 
                    y: -12, 
                    boxShadow: '0 25px 50px rgba(220, 38, 38, 0.1)',
                    borderColor: '#dc2626'
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <sol.icon size={200} />
                  </motion.div>

                  <motion.div
                    className="mb-4 p-3 rounded-3 w-fit"
                    style={{ background: 'rgba(220, 38, 38, 0.1)' }}
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <sol.icon size={28} className="text-red" />
                  </motion.div>
                  
                  <h5 className="fw-700 mb-2">{sol.title}</h5>
                  <p className="text-muted small mb-4">{sol.desc}</p>
                  <a href="#" className="text-red fw-700 small text-decoration-none d-flex align-items-center gap-2 position-relative">
                    Learn More 
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FiArrowRight size={14} />
                    </motion.span>
                  </a>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="py-12 py-lg-14">
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
              Business Benefits
            </span>
            <h2 className="display-3 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
              Why Organizations Choose Signatura
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Proven results across multiple industries
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-6 rounded-4 bg-light h-100"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-5xl mb-4">
                    {typeof benefit.icon === 'string' ? benefit.icon : <benefit.icon size={40} className="text-red" />}
                  </div>
                  <h5 className="fw-700 mb-3">{benefit.title}</h5>
                  <p className="text-muted small">{benefit.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INDUSTRIES SECTION ===== */}
      <section id="industries" className="py-12 py-lg-14 position-relative" style={{ background: '#f9fafb' }}>
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <span className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
              Industries
            </span>
            <h2 className="display-3 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
              Built for Every Industry
            </h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Trusted by organizations worldwide
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {[
              { title: '🏢 Insurance', color: '#3b82f6' },
              { title: '🏛️ Government', color: '#10b981' },
              { title: '🏦 Banking', color: '#f59e0b' },
              { title: '📚 Education', color: '#8b5cf6' },
            ].map((industry, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-8 rounded-4 text-white h-100 d-flex flex-column justify-content-center align-items-center text-center cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${industry.color} 0%, ${industry.color}dd 100%)` }}
                  whileHover={{ scale: 1.1, boxShadow: '0 25px 50px rgba(220, 38, 38, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <h5 className="fw-700 text-white mb-2">{industry.title}</h5>
                  <p className="small opacity-90 mb-0">Industry-specific solutions</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PARTNERSHIP SECTION ===== */}
      <section id="partners" className="py-12 py-lg-14">
        <div className="container-xl">
          <motion.div {...fadeInUp} className="row align-items-center g-6">
            <div className="col-lg-6 order-lg-2">
              <div className="rounded-4 overflow-hidden" style={{ height: '500px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
                <img src="/api/placeholder/600/500" alt="Partners" className="w-100 h-100 object-cover" />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <motion.span
                className="d-inline-block mb-4 px-4 py-2 rounded-full text-red fw-700 small"
                style={{ background: 'rgba(220, 38, 38, 0.1)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Partnership
              </motion.span>
              
              <h2 className="display-4 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
                Partner With Us
              </h2>
              <p className="lead text-muted mb-5">
                As enterprises embrace digital platforms, Signatura brings reliable, secure, and safe solutions. We're committed to delivering cutting-edge solutions that improve engagement.
              </p>

              <motion.div whileHover={{ scale: 1.05 }}>
                <a href="#contact" className="btn btn-lg fw-700 text-white rounded-pill px-8" style={{ background: '#dc2626' }}>
                  Start Partnership <FiArrowRight className="ms-2" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== BLOCKCHAIN SECTION ===== */}
      <section className="py-12 py-lg-14 position-relative text-white" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="display-3 fw-900 mb-4" style={{ letterSpacing: '-1px' }}>
              Blockchain-Secured
            </h2>
            <p className="lead opacity-90" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Military-grade security meets innovation
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {[
              { icon: '🔐', title: 'Multi-Factor Auth' },
              { icon: '👤', title: 'KYC Verification' },
              { icon: '🔒', title: 'Military Encryption' },
              { icon: '📱', title: 'QR Protection' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-6 rounded-4 bg-white bg-opacity-10 text-center border border-white border-opacity-20"
                  whileHover={{ y: -8, background: 'rgba(255, 255, 255, 0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-5xl mb-3">{feature.icon}</div>
                  <h5 className="fw-700">{feature.title}</h5>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section id="contact" className="py-12 py-lg-14">
        <div className="container-xl">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="display-3 fw-900 mb-4 lh-1" style={{ letterSpacing: '-1px' }}>
              Ready to Transform?
            </h2>
            <p className="lead text-muted mx-auto mb-8" style={{ maxWidth: '700px' }}>
              Join 500+ organizations already using Signatura for secure digital transformation. Get started today.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.08 }}>
                <Link to="/issuer" className="btn btn-lg fw-700 text-white rounded-pill px-8" style={{ background: '#dc2626' }}>
                  Start as Issuer <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }}>
                <Link to="/owner" className="btn btn-lg fw-700 rounded-pill px-8 border-2" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                  Start as Owner <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
