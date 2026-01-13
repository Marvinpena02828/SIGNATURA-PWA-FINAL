import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiShield, FiUsers, FiCheckCircle, FiLock, FiTrendingUp, 
  FiZap, FiMail, FiMenu, FiX, FiActivity, FiKey, FiGlobe, FiCode, FiBarChart2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../Landing.css';

// Enhanced Ripple Button
const RippleButton = ({ children, onClick, className, to, variant = 'primary', disabled = false }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.();
  };

  const buttonClasses = {
    primary: 'btn-ripple btn-primary-custom',
    secondary: 'btn-ripple btn-secondary-custom',
    outline: 'btn-ripple btn-outline-custom',
    outlineRed: 'btn-ripple btn-outline-red-custom',
    ghost: 'btn-ripple btn-ghost-custom',
  };

  const baseClasses = `btn btn-lg position-relative overflow-hidden ${buttonClasses[variant]} ${className || ''}`;

  const ButtonComponent = to ? Link : 'button';
  const props = to ? { to } : { onClick: handleClick, disabled };

  return (
    <ButtonComponent {...props} className={baseClasses}>
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="ripple-effect"
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.6 }}
            style={{
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </AnimatePresence>
      <span className="d-flex align-items-center justify-content-center gap-2 position-relative">{children}</span>
    </ButtonComponent>
  );
};

// Animated Background Particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: 4 + Math.random() * 2,
    size: 2 + Math.random() * 4,
    left: Math.random() * 100,
  }));

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: '-10px',
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 600,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Navigation Component (Embedded)
const Navigation = ({ logo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Solutions', path: '/solutions' },
    { label: 'Industries', path: '/industries' },
    { label: 'Partners', path: '/partners' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`navbar sticky-top navbar-expand-lg navbar-light transition-all ${
      scrolled ? 'bg-white shadow-md border-bottom border-light' : 'bg-white bg-opacity-95'
    }`}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-100 d-flex justify-content-between align-items-center"
        >
          <Link to="/" className="navbar-brand me-auto">
            <motion.img
              src={logo}
              alt="Signatura Logo"
              height="45"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-1">
            {navItems.map((item) => (
              <motion.div key={item.path}>
                <Link
                  to={item.path}
                  className="btn btn-link nav-link text-decoration-none fw-500 position-relative text-dark"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  <motion.span
                    className="position-absolute bottom-0 start-0 bg-red"
                    style={{ height: '2px', width: '0%' }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 gap-lg-3 ms-auto ms-lg-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-none d-md-flex align-items-center gap-2">
              <Link to="/" className="btn btn-sm btn-outline-secondary fw-500">
                Login
              </Link>
            </motion.div>

            <button
              className="btn d-lg-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-100 mt-3"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Footer Component (Embedded)
const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-6">
      <div className="container-xl">
        <div className="row g-4 mb-6">
          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-muted small mb-4">
              Digital identity, data security, and digital signature solutions for the modern world.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted text-decoration-none" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="#" className="text-muted text-decoration-none" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
          </motion.div>

          {[
            {
              title: 'Product',
              links: [
                { label: 'Features', path: '/' },
                { label: 'Security', path: '/' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ],
            },
          ].map((section, idx) => (
            <motion.div
              key={idx}
              className="col-lg-2 col-md-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h6 className="fw-bold mb-4">{section.title}</h6>
              <ul className="list-unstyled">
                {section.links.map((link) => (
                  <li key={link.path} className="mb-2">
                    <Link
                      to={link.path}
                      className="text-muted text-decoration-none transition-all"
                    >
                      <small>{link.label}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.hr
          className="border-secondary opacity-25 my-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.25 }}
          viewport={{ once: true }}
        />

        <motion.div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted small mb-0">
            &copy; 2025 Signatura. All rights reserved. | Powered by 1Knight Solutions, Inc.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

// Main Landing Component
export default function Landing() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [logo] = useState('./assets/logo31.png');

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Tab data with all content
  const tabs = [
    {
      id: 'identity',
      label: 'Digital Identity',
      icon: FiKey,
      title: 'Digital Identity',
      description: 'Stay in control with your identity details and prevent identity theft and data breach.',
      features: [
        'Multi-Factor Authentication',
        'KYC - Selfie Verification',
        'Secure Identity Storage',
        'Real-time Threat Monitoring',
      ]
    },
    {
      id: 'security',
      label: 'Data Security',
      icon: FiShield,
      title: 'Data Security',
      description: 'Keep data safe and protected from data corruption through blockchain technology and added layers of security.',
      features: [
        'Blockchain Technology',
        'End-to-End Encryption',
        'Secure Data Residency',
        'Continuous Monitoring',
      ]
    },
    {
      id: 'signature',
      label: 'Digital Signature',
      icon: FiLock,
      title: 'Digital Signature',
      description: 'Sign anytime and anywhere with our uniquely designed QR code protected digital signature.',
      features: [
        'QR Code Protected Signing',
        'Legal Compliance',
        'Instant Verification',
        'Audit Trail Tracking',
      ]
    },
    {
      id: 'api',
      label: 'API Integration',
      icon: FiCode,
      title: 'API Integration',
      description: 'Seamlessly integrate Signatura with your existing systems using our comprehensive REST API.',
      features: [
        'RESTful API',
        'SDK for Multiple Languages',
        'Webhook Support',
        'Rate Limiting & Throttling',
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: FiCheckCircle,
      title: 'Compliance & Regulations',
      description: 'Meet global compliance standards and regulatory requirements with Signatura.',
      features: [
        'GDPR Compliant',
        'ISO 27001 Certified',
        'eIDAS Regulation Support',
        'SOC 2 Type II',
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reporting',
      icon: FiBarChart2,
      title: 'Analytics & Reporting',
      description: 'Gain insights into your digital identity and security operations with comprehensive analytics.',
      features: [
        'Real-time Dashboards',
        'Custom Reports',
        'User Activity Tracking',
        'Security Metrics',
      ]
    },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribeSuccess(true);
      setEmail('');
      setTimeout(() => setSubscribeSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="landing-page">
      <Navigation logo={logo} />

      {/* Hero Section */}
      <section className="hero-section py-5 py-lg-6 position-relative overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="hero-video"
        >
          <source src="/videos/A_multi-dimensional_digital_identity,_data_security_and_digital_signature_platform._Transform_your_d_seed637194896.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="hero-overlay"></div>

        <FloatingParticles />
        <motion.div className="hero-blob-1" animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="hero-blob-2" animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 25, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <motion.h1
              className="display-3 fw-900 mb-4 hero-title lh-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Signatura
              <motion.br />
              <motion.span
                className="gradient-text-red"
                initial={{ opacity: 0, backgroundPosition: '0% 50%' }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Digitally Transforming Lives
              </motion.span>
            </motion.h1>

            <motion.p
              className="lead text-muted mb-5 mx-auto hero-lead"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              A multi-dimensional digital identity, data security and digital signature platform. Transform your digital experience and the way you provide services safely and securely.
            </motion.p>

            <motion.div
              className="d-flex flex-column flex-sm-row justify-content-center gap-3 gap-lg-4 mb-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <RippleButton to="/issuer" variant="primary">
                  Get Started as Issuer <FiArrowRight />
                </RippleButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                <RippleButton to="/owner" variant="outline">
                  Access as Owner <FiArrowRight />
                </RippleButton>
              </motion.div>
            </motion.div>

            <motion.div
              className="row mx-auto mb-5"
              style={{ maxWidth: '800px' }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: 'Security Level', value: 'Military Grade' },
                { label: 'Encryption', value: 'End-to-End' },
                { label: 'Verification', value: 'Instant' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className="col-md-4 mb-4">
                  <motion.div
                    className="stat-card p-4 rounded-4"
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <p className="text-muted small text-uppercase fw-bold mb-2 letter-spacing">{stat.label}</p>
                    <p className="h5 fw-bold text-red">{stat.value}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solutions / Features Section with TABS */}
      <section id="solutions" className="solutions-section py-6 position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Core Solutions</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Complete platform for digital transformation with multiple features and capabilities
            </p>
          </motion.div>

          {/* TAB BUTTONS */}
          <motion.div
            className="d-flex justify-content-center gap-2 gap-md-3 mb-5 flex-wrap"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-lg px-4 py-3 rounded-pill fw-bold transition-all ${
                  activeTab === tab.id
                    ? 'btn-red text-white shadow-lg'
                    : 'btn-outline-red text-red'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <tab.icon className="me-2" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* TAB CONTENT */}
          {currentTab && (
            <motion.div
              className="row align-items-center g-4 g-lg-5"
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="col-lg-6" variants={itemVariants}>
                <div className="feature-illustration-box p-5 rounded-4 bg-light">
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-center"
                  >
                    <currentTab.icon size={120} className="text-red mb-4" />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div className="col-lg-6" variants={itemVariants}>
                <h3 className="h2 fw-bold mb-4">{currentTab.title}</h3>
                <p className="lead text-muted mb-4">
                  {currentTab.description}
                </p>
                <ul className="list-unstyled mb-4">
                  {currentTab.features.map((item, idx) => (
                    <motion.li
                      key={idx}
                      className="d-flex align-items-center gap-3 mb-3 py-2"
                      whileHover={{ x: 8 }}
                    >
                      <motion.span className="text-red fw-bold text-xl">✓</motion.span>
                      <span className="text-dark">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="benefits-section py-6 position-relative bg-light">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Why Signatura?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Transform your business with genuine digital solutions that matter
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: FiActivity,
                title: 'Enhanced Data Collection',
                desc: 'Optimize and analyze data collected to vastly improve customer experience with informed decisions.'
              },
              {
                icon: FiUsers,
                title: 'Improved Customer Experience',
                desc: 'Consistent and pleasant experience by providing enhanced services that exceed expectations.'
              },
              {
                icon: FiGlobe,
                title: 'Digital Culture Transformation',
                desc: 'Digitized environment providing teams with right tools for sustainable collaboration.'
              },
              {
                icon: FiTrendingUp,
                title: 'Increased Profitability',
                desc: 'True digital transformation leading to efficiency gains, reduced costs, and brand loyalty.'
              },
              {
                icon: FiZap,
                title: 'Productivity Growth',
                desc: 'Simplified workflows with right tools, optimized service delivery, and empowered workforce.'
              },
              {
                icon: FiCheckCircle,
                title: 'Environmentally Conscious',
                desc: 'Paperless transactions reducing carbon footprint and supporting sustainability advocacy.'
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="col-md-6 col-lg-4"
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <motion.div
                  className="benefit-card p-5 rounded-4 h-100 bg-white position-relative"
                  animate={{
                    boxShadow: hoveredFeature === idx
                      ? '0 20px 60px rgba(220, 38, 38, 0.15)'
                      : '0 10px 30px rgba(0, 0, 0, 0.05)',
                    y: hoveredFeature === idx ? -12 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="benefit-icon mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <benefit.icon size={32} className="text-red" />
                  </motion.div>
                  <h3 className="h5 fw-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted small lh-lg">{benefit.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="industries-section py-6">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Industries We Serve</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Trusted by leading organizations across multiple sectors
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🏥', title: 'Insurance', desc: 'Secure policy management and claim verification' },
              { icon: '🏛️', title: 'Government', desc: 'Digital document verification and citizen services' },
              { icon: '🏦', title: 'Banking & Finance', desc: 'Secure transactions and regulatory compliance' },
              { icon: '📚', title: 'Education', desc: 'Credential verification and degree authentication' },
            ].map((industry, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="industry-card p-5 rounded-4 bg-gradient-red text-white text-center h-100 cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div className="text-5xl mb-3">{industry.icon}</motion.div>
                  <h3 className="h5 fw-bold mb-2">{industry.title}</h3>
                  <p className="small opacity-90">{industry.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className="blockchain-section py-6 position-relative bg-red text-white">
        <motion.div className="blockchain-blob-1" animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="blockchain-blob-2" animate={{ x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Blockchain Technology</h2>
            <p className="lead opacity-90 mx-auto" style={{ maxWidth: '700px' }}>
              SECURED, TRANSPARENT, TRUSTED
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: '🔐', title: 'Multi-Factor Authentication', desc: 'Enhanced security with multiple verification layers' },
              { icon: '👤', title: 'KYC - Selfie', desc: 'Identity verification through biometric authentication' },
              { icon: '🔒', title: 'Encryption', desc: 'Military-grade encryption for all data' },
              { icon: '📱', title: 'QR-Code', desc: 'Secure QR code protected transactions' },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="blockchain-feature p-4 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20 text-center"
                  whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.4)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="fw-bold mb-2">{feature.title}</h4>
                  <p className="small opacity-90">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center mt-5" {...fadeInUp}>
            <p className="lead mb-4 opacity-90">Signatura ensures protection from Identity Theft and will not compromise Data Privacy</p>
            <RippleButton variant="ghost" className="text-white">
              Learn More About Security <FiArrowRight />
            </RippleButton>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-6 text-white position-relative bg-red">
        <motion.div
          className="newsletter-blob-1"
          animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="newsletter-blob-2"
          animate={{ x: [0, -50, 0], y: [0, -50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="container-lg position-relative" style={{ maxWidth: '700px' }}>
          <motion.h2
            className="h3 fw-bold text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Stay Updated
          </motion.h2>
          <motion.p
            className="text-center opacity-90 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Get the latest news on digital identity, data security, and digital transformation.
          </motion.p>

          <motion.form
            onSubmit={handleNewsletterSubmit}
            className="d-flex flex-column flex-sm-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-lg rounded-pill newsletter-input"
              disabled={isSubscribing}
            />
            <RippleButton
              variant="ghost"
              onClick={handleNewsletterSubmit}
              disabled={isSubscribing}
              className="newsletter-btn rounded-pill"
            >
              {isSubscribing ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  ⏳
                </motion.span>
              ) : (
                <>
                  Subscribe <FiMail />
                </>
              )}
            </RippleButton>
          </motion.form>

          {subscribeSuccess && (
            <motion.div
              className="text-center mt-3 text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✓ Thanks for subscribing!
            </motion.div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section py-6 position-relative">
        <div className="cta-blob"></div>

        <div className="container-lg text-center position-relative" style={{ maxWidth: '900px' }}>
          <motion.h2
            className="display-4 fw-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready for Digital Transformation?
          </motion.h2>
          <motion.p
            className="lead text-muted mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join hundreds of organizations using Signatura for secure digital identity, data security, and digital signatures.
          </motion.p>

          <motion.div
            className="d-flex flex-column flex-sm-row justify-content-center gap-3 gap-lg-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <RippleButton to="/issuer" variant="primary">
                Sign In as Issuer <FiArrowRight />
              </RippleButton>
            </motion.div>
            <motion.div variants={itemVariants}>
              <RippleButton to="/owner" variant="outline">
                Sign In as Owner <FiArrowRight />
              </RippleButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
