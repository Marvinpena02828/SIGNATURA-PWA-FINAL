import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

// Navigation Component (Embedded)
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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Solutions', path: '/solutions' },
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
              src="/logo31.png"
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
            <h6 className="fw-bold mb-3">Signatura</h6>
            <p className="text-muted small mb-4">
              A multi-dimensional digital identity, data security and digital signature platform.
            </p>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com/PHsignatura" className="text-muted text-decoration-none" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://www.youtube.com/channel/UC8Id2IMHDOVGu51dIbDqZeg" className="text-muted text-decoration-none" target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </motion.div>

          {[
            {
              title: 'Solutions',
              links: [
                { label: 'Digital Identity', path: '/solutions' },
                { label: 'Data Security', path: '/solutions' },
                { label: 'Digital Signature', path: '/solutions' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About', path: '/about' },
                { label: 'Partners', path: '/partners' },
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
            &copy; 2025 Signatura | Powered by 1Knight Solutions, Inc.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

// Main Partners Component
export default function Partners() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  return (
    <div className="partners-page">
      <Navigation />

      {/* Hero Section */}
      <section className="partners-hero py-8 py-lg-10 position-relative overflow-hidden text-white" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <motion.div className="blob-1 position-absolute" style={{ top: '-10%', right: '-5%' }} animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="blob-2 position-absolute" style={{ bottom: '-10%', left: '-5%' }} animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 25, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <motion.h1
              className="display-2 fw-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Partner With Us
            </motion.h1>
            <motion.p
              className="lead mx-auto mb-6 opacity-90"
              style={{ maxWidth: '900px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              As number of enterprises continue to embrace the growing use of digital platforms, Signatura commits to bring in business solutions that are reliable, secure and safe.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/contact" className="btn btn-lg btn-white text-red fw-bold rounded-pill px-6 text-decoration-none">
                Tell Me More <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div {...fadeInUp}>
            <img 
              src="/api/placeholder/1200/500" 
              alt="Partnership" 
              className="img-fluid rounded-4 w-100"
              style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Making it Securely Simple Section */}
      <section className="py-8 py-lg-10 bg-light position-relative">
        <div className="container-xl">
          <motion.div className="row align-items-center g-5" {...fadeInUp}>
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            >
              <h2 className="display-4 fw-bold mb-4">Making it Securely Simple</h2>
              <p className="lead text-muted lh-lg">
                We deliver cutting-edge business solutions to greatly improve your engagement in a diverse business environment that is significantly convenient, safe and ensuring utmost privacy and security.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/solutions" className="btn btn-lg btn-red text-white fw-bold rounded-pill px-6 text-decoration-none">
                  Tell Me How! <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            >
              <motion.div
                className="position-relative rounded-4 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/500" 
                  alt="Partnership Solutions" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
