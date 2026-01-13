import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle,
  FiKey, FiShield, FiLock, FiUsers, FiTarget, FiEye, FiHeart,
  FiShoppingCart, FiZap, FiCloud, FiFile, FiPenTool, FiActivity, FiDollarSign, FiCalendar, FiBell
} from 'react-icons/fi';

// Navigation Component
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      scrolled ? 'bg-white shadow-sm' : 'bg-white'
    }`} style={{ zIndex: 1000 }}>
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-100 d-flex justify-content-between align-items-center"
        >
          <Link to="/" className="navbar-brand me-auto fw-bold text-red" style={{ fontSize: '24px' }}>
            Signatura
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-4">
            {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-dark text-decoration-none fw-500 small"
                whileHover={{ color: '#dc2626' }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-none d-md-flex">
              <Link to="/" className="btn btn-sm btn-outline-secondary fw-500">
                Login
              </Link>
            </motion.div>

            <button
              className="btn d-lg-none border-0"
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
              className="w-100 mt-3 pb-3"
            >
              {['About', 'Solutions', 'Industries', 'Partners'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-dark text-white py-8 mt-8">
      <div className="container-xl">
        <div className="row g-5 mb-6">
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">Signatura</h5>
            <p className="text-muted small mb-4">
              A multi-dimensional digital identity, data security and digital signature platform transforming businesses worldwide.
            </p>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com/PHsignatura" className="text-muted text-decoration-none small" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg" className="text-muted text-decoration-none small" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-bold mb-3">Solutions</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#solutions" className="text-muted text-decoration-none">Digital Identity</a></li>
              <li className="mb-2"><a href="#solutions" className="text-muted text-decoration-none">Data Security</a></li>
              <li className="mb-2"><a href="#solutions" className="text-muted text-decoration-none">Digital Signature</a></li>
            </ul>
          </div>
          <div className="col-lg-2">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#about" className="text-muted text-decoration-none">About</a></li>
              <li className="mb-2"><a href="#partners" className="text-muted text-decoration-none">Partners</a></li>
              <li className="mb-2"><a href="#contact" className="text-muted text-decoration-none">Contact</a></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3">Legal</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="border-top border-secondary opacity-25 pt-4">
          <p className="text-muted small mb-0">&copy; 2025 Signatura | Powered by 1Knight Solutions, Inc.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Component
export default function SignaturaLanding() {
  const [activeTab, setActiveTab] = useState('marketplace');

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const solutions = [
    { icon: FiShoppingCart, title: 'Marketplace', desc: 'Easy navigation through custom-fit services' },
    { icon: FiKey, title: 'Digital ID', desc: 'KYC/Selfie verification for identity protection' },
    { icon: FiZap, title: 'Simplified Workflow', desc: 'Easy and hassle-free processes' },
    { icon: FiCloud, title: 'Cloud Storage', desc: 'Secure storage with consent-based access' },
    { icon: FiFile, title: 'Document Wallet', desc: 'Virtual storage for confidential documents' },
    { icon: FiPenTool, title: 'Digital Signature', desc: 'QR code-based signature solution' },
    { icon: FiActivity, title: 'Contact Tracing', desc: 'Viral transmission tracking tool' },
    { icon: FiDollarSign, title: 'Secure Payments', desc: 'Integrated payment gateway system' },
    { icon: FiCalendar, title: 'Scheduler', desc: 'Queueing and scheduling systems' },
    { icon: FiBell, title: 'Notifications', desc: 'Customizable alerts with GPS service' },
  ];

  const industries = [
    { title: 'Insurance', icon: FiBell, color: 'bg-info' },
    { title: 'Government', icon: FiShield, color: 'bg-success' },
    { title: 'Banking & Finance', icon: FiDollarSign, color: 'bg-warning' },
    { title: 'Education', icon: FiTarget, color: 'bg-primary' },
  ];

  const benefits = [
    { icon: FiActivity, title: 'Enhanced Data Collection', desc: 'Optimize and analyze data for better decisions' },
    { icon: FiUsers, title: 'Improved Customer Experience', desc: 'Consistent and pleasant customer interactions' },
    { icon: '🌍', title: 'Digital Culture', desc: 'Sustainable team collaboration tools' },
    { icon: FiTrendingUp, title: 'Increased Profitability', desc: 'Efficiency gains and cost reduction' },
    { icon: FiZap, title: 'Productivity Growth', desc: 'Simplified workflows and empowered teams' },
    { icon: FiCheckCircle, title: 'Sustainability', desc: 'Paperless transactions, green solutions' },
  ];

  return (
    <div className="signatura-landing" style={{ overflow: 'hidden' }}>
      <Navigation />

      {/* ===== HERO SECTION ===== */}
      <section className="py-10 py-lg-12 position-relative overflow-hidden" style={{
        backgroundImage: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <motion.div 
          className="position-absolute" 
          style={{ top: '-5%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.05)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        <div className="container-xl position-relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <span className="badge bg-red text-white fw-bold px-4 py-2">Digital Transformation</span>
            </motion.div>
            
            <h1 className="display-3 fw-900 mb-4 lh-1" style={{ color: '#111827' }}>
              A Genuine Digital <span className="text-red">Transformation</span>
            </h1>
            
            <p className="lead text-muted mx-auto mb-6" style={{ maxWidth: '700px' }}>
              Signatura is a multi-dimensional digital identity, data security and digital signature platform designed to transform your digital experience and the way industries provide services safely and securely.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/issuer" className="btn btn-lg btn-red text-white fw-bold rounded-pill px-6 text-decoration-none">
                  Get Started <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#solutions" className="btn btn-lg btn-outline-red text-red fw-bold rounded-pill px-6 text-decoration-none">
                  Learn More
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-10 py-lg-12">
        <div className="container-xl">
          <motion.div {...fadeInUp}>
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="rounded-4 overflow-hidden" style={{ height: '500px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                  <img src="/api/placeholder/600/500" alt="About" className="w-100 h-100 object-cover" />
                </div>
              </div>
              <div className="col-lg-6">
                <h2 className="display-5 fw-bold mb-4">Why Signatura?</h2>
                <p className="lead text-muted mb-4">
                  As we desire for a truly transformative experience that will change the way we navigate our everyday lives, we turn to digital technology which ushers simple solutions to complex process difficulties.
                </p>

                <div className="d-flex flex-column gap-3 mb-5">
                  {[
                    'Secure identity and data protection',
                    'Easy to implement and use',
                    'Industry-leading technology',
                    'Trusted by 500+ organizations',
                    '24/7 monitoring and support'
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      className="d-flex align-items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="p-2 rounded-2 bg-red bg-opacity-10">
                        <FiCheckCircle className="text-red" size={20} />
                      </div>
                      <span className="text-dark fw-500">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="#" className="btn btn-lg btn-red text-white fw-bold rounded-pill px-6">
                    Read Our Story <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SOLUTIONS SECTION ===== */}
      <section id="solutions" className="py-10 py-lg-12 bg-light">
        <div className="container-xl">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Our Solutions</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Comprehensive tools designed to simplify your digital operations
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
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-5 rounded-4 bg-white h-100 position-relative overflow-hidden"
                  whileHover={{ y: -12, boxShadow: '0 25px 50px rgba(220, 38, 38, 0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <sol.icon size={200} className="text-red" />
                  </motion.div>

                  <motion.div
                    className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <sol.icon size={28} className="text-red" />
                  </motion.div>
                  
                  <h5 className="fw-bold mb-2">{sol.title}</h5>
                  <p className="text-muted small mb-3">{sol.desc}</p>
                  <a href="#" className="text-red fw-bold small text-decoration-none d-flex align-items-center gap-2">
                    Learn More <FiArrowRight size={14} />
                  </a>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="py-10 py-lg-12">
        <div className="container-xl">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Why Choose Signatura?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Transform your business with genuine digital solutions that matter
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
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-5 rounded-4 bg-light h-100"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-4xl mb-4">
                    {typeof benefit.icon === 'string' ? benefit.icon : <benefit.icon size={40} className="text-red" />}
                  </div>
                  <h5 className="fw-bold mb-3">{benefit.title}</h5>
                  <p className="text-muted small mb-0">{benefit.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INDUSTRIES SECTION ===== */}
      <section id="industries" className="py-10 py-lg-12 bg-light">
        <div className="container-xl">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Industries We Serve</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Trusted by organizations across multiple sectors
            </p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {industries.map((industry, idx) => (
              <motion.div 
                key={idx} 
                className="col-md-6 col-lg-3"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="p-6 rounded-4 bg-red text-white h-100 d-flex flex-column justify-content-center align-items-center text-center cursor-pointer"
                  whileHover={{ scale: 1.08, boxShadow: '0 25px 50px rgba(220, 38, 38, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-5xl mb-3">
                    <industry.icon size={50} />
                  </div>
                  <h5 className="fw-bold">{industry.title}</h5>
                  <p className="small opacity-90 mt-2 mb-0">Specialized solutions for your industry</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PARTNERS SECTION ===== */}
      <section id="partners" className="py-10 py-lg-12">
        <div className="container-xl">
          <motion.div {...fadeInUp}>
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="display-5 fw-bold mb-4">Partner With Us</h2>
                <p className="lead text-muted mb-4">
                  As the number of enterprises continue to embrace digital platforms, Signatura commits to bring in business solutions that are reliable, secure and safe.
                </p>
                <p className="text-muted mb-5">
                  We deliver cutting-edge business solutions to greatly improve your engagement in a diverse business environment that is significantly convenient, safe and ensuring utmost privacy and security.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/contact" className="btn btn-lg btn-red text-white fw-bold rounded-pill px-6">
                    Start Partnership <FiArrowRight className="ms-2" />
                  </Link>
                </motion.div>
              </div>
              <div className="col-lg-6">
                <div className="rounded-4 overflow-hidden" style={{ height: '500px', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                  <img src="/api/placeholder/600/500" alt="Partners" className="w-100 h-100 object-cover" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== BLOCKCHAIN SECTION ===== */}
      <section className="py-10 py-lg-12 bg-red text-white position-relative overflow-hidden">
        <motion.div 
          className="position-absolute" 
          style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Blockchain Technology</h2>
            <p className="lead opacity-90">SECURED, TRANSPARENT, TRUSTED</p>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {[
              { icon: '🔐', title: 'Multi-Factor Authentication' },
              { icon: '👤', title: 'KYC - Selfie Verification' },
              { icon: '🔒', title: 'Military Grade Encryption' },
              { icon: '📱', title: 'QR Code Protection' },
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
                  className="p-5 rounded-4 bg-white bg-opacity-10 text-center border border-white border-opacity-20"
                  whileHover={{ y: -8, borderColor: 'rgba(255, 255, 255, 0.5)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-5xl mb-3">{feature.icon}</div>
                  <h5 className="fw-bold">{feature.title}</h5>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center mt-10" {...fadeInUp}>
            <p className="lead opacity-90 mb-5">
              Signatura ensures protection from Identity Theft and will not compromise Data Privacy
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="btn btn-lg btn-white text-red fw-bold rounded-pill px-6">
                Learn More <FiArrowRight className="ms-2" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section id="contact" className="py-10 py-lg-12">
        <div className="container-xl">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-4">Ready to Transform?</h2>
            <p className="lead text-muted mx-auto mb-6" style={{ maxWidth: '700px' }}>
              Let us work together in bringing the future now. Join hundreds of organizations already using Signatura for secure digital transformation.
            </p>

            <motion.div 
              className="d-flex flex-column flex-sm-row justify-content-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/issuer" className="btn btn-lg btn-red text-white fw-bold rounded-pill px-6 text-decoration-none">
                  Get Started <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="#" className="btn btn-lg btn-outline-red text-red fw-bold rounded-pill px-6 text-decoration-none">
                  Schedule Demo
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
