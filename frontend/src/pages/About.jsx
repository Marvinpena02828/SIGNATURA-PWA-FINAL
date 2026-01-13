import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiTarget, FiEye, FiHeart, FiShield, FiMenu, FiX, FiUsers, FiAward, FiGlobe } from 'react-icons/fi';

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
            <h6 className="fw-bold mb-3">Signatura</h6>
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
                { label: 'Features', path: '/solutions' },
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

// Main About Component
export default function About() {
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
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="about-page">
      <Navigation />

      {/* Hero Section with Background */}
      <section className="about-hero py-8 py-lg-10 position-relative overflow-hidden text-white" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%), url("/api/placeholder/1920/600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <motion.div className="blob-1 position-absolute" style={{ top: '-10%', right: '-5%' }} animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="blob-2 position-absolute" style={{ bottom: '-10%', left: '-5%' }} animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 25, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <motion.div
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <span className="badge bg-white text-red fw-bold px-4 py-2">About Signatura</span>
            </motion.div>
            <motion.h1
              className="display-2 fw-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Transforming Digital Identity for a Secure Future
            </motion.h1>
            <motion.p
              className="lead mx-auto mb-0 opacity-90"
              style={{ maxWidth: '800px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Leading the digital transformation revolution with innovative solutions for secure identity, data protection, and digital signatures.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div className="row align-items-center g-5" {...fadeInUp}>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="position-relative rounded-4 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Signatura Company" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
                <motion.div
                  className="position-absolute top-0 start-0 w-100 h-100 bg-red rounded-4"
                  style={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h2 className="display-4 fw-bold mb-4">Our Story</h2>
              <p className="lead text-muted mb-4">
                Founded in 2020, Signatura was born from a vision to revolutionize how organizations handle digital identity and security. What started as a small team of passionate innovators has grown into a market leader trusted by hundreds of organizations worldwide.
              </p>
              <p className="text-muted mb-4 lh-lg">
                Our journey has been defined by a commitment to innovation, security, and customer success. We've continuously evolved our platform to meet the changing needs of the digital landscape, integrating cutting-edge technologies like blockchain and AI-powered verification to stay ahead of emerging threats.
              </p>
              <div className="d-flex flex-column gap-3">
                <motion.div className="d-flex align-items-start gap-3" whileHover={{ x: 10 }}>
                  <div className="p-3 rounded-3 bg-red bg-opacity-10">
                    <FiAward className="text-red" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold">Industry Recognition</h5>
                    <p className="text-muted small mb-0">Recognized as a leader in digital identity solutions</p>
                  </div>
                </motion.div>
                <motion.div className="d-flex align-items-start gap-3" whileHover={{ x: 10 }}>
                  <div className="p-3 rounded-3 bg-red bg-opacity-10">
                    <FiGlobe className="text-red" size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold">Global Presence</h5>
                    <p className="text-muted small mb-0">Serving organizations across multiple countries</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-8 py-lg-10 bg-light position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Our Purpose & Values</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Everything we do is guided by our core mission and values
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
                icon: FiTarget,
                title: 'Our Mission',
                desc: 'To provide secure, innovative digital identity and signature solutions that empower organizations and individuals to transform their digital experience safely and securely.'
              },
              {
                icon: FiEye,
                title: 'Our Vision',
                desc: 'A world where digital identity and security are accessible, trustworthy, and seamless for everyone, everywhere.'
              },
              {
                icon: FiHeart,
                title: 'Our Values',
                desc: 'Security First • Innovation Always • Customer Success • Integrity & Transparency • Continuous Improvement'
              },
              {
                icon: FiShield,
                title: 'Our Commitment',
                desc: 'We are committed to protecting your data with military-grade security while maintaining the highest standards of service excellence.'
              },
            ].map((value, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-6">
                <motion.div
                  className="p-5 rounded-4 bg-white h-100 position-relative overflow-hidden"
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <value.icon size={200} className="text-red" />
                  </motion.div>

                  <motion.div
                    className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon size={32} className="text-red" />
                  </motion.div>
                  <h3 className="h4 fw-bold mb-3">{value.title}</h3>
                  <p className="text-muted lh-lg">{value.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-8 py-lg-10 position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Our Journey Through Time</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              From startup vision to market leader, Signatura has been at the forefront of digital identity innovation
            </p>
          </motion.div>

          <motion.div
            className="position-relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { year: '2020', event: 'Signatura Founded - Launch of Digital Identity Platform', icon: '🚀' },
              { year: '2021', event: 'Integration of Blockchain Technology for Enhanced Security', icon: '⛓️' },
              { year: '2022', event: 'Expansion to Multiple Industries - Insurance, Banking, Education', icon: '🏢' },
              { year: '2023', event: 'Launch of QR Code Protected Digital Signature', icon: '📱' },
              { year: '2024', event: 'Government Sector Partnership & Global Expansion', icon: '🌍' },
              { year: '2025', event: 'AI-Powered Verification & Enhanced Analytics', icon: '🤖' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`row mb-5 align-items-center ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="col-lg-5">
                  <motion.div
                    className="timeline-card p-5 rounded-4 bg-white position-relative"
                    whileHover={{ x: idx % 2 === 0 ? 10 : -10, boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <h3 className="h4 fw-bold text-red mb-2">{item.year}</h3>
                    <p className="text-muted mb-0">{item.event}</p>
                  </motion.div>
                </div>
                <div className="col-lg-2 text-center">
                  <motion.div
                    className="text-4xl"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <div className="col-lg-5"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 py-lg-10 bg-light position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Our Leadership Team</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Experienced leaders driving innovation in digital identity
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
              { name: 'John Smith', role: 'Chief Executive Officer', image: '/api/placeholder/300/300' },
              { name: 'Sarah Johnson', role: 'Chief Technology Officer', image: '/api/placeholder/300/300' },
              { name: 'Michael Chen', role: 'Chief Security Officer', image: '/api/placeholder/300/300' },
              { name: 'Emily Rodriguez', role: 'Chief Operating Officer', image: '/api/placeholder/300/300' },
            ].map((member, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="text-center"
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="position-relative mb-4 mx-auto rounded-4 overflow-hidden"
                    style={{ width: '200px', height: '200px' }}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-100 h-100 object-cover"
                    />
                    <motion.div
                      className="position-absolute top-0 start-0 w-100 h-100 bg-red"
                      style={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <h4 className="fw-bold mb-2">{member.name}</h4>
                  <p className="text-red fw-600 small">{member.role}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: '500+', label: 'Organizations Using Signatura', icon: FiUsers },
              { number: '10M+', label: 'Credentials Verified', icon: FiShield },
              { number: '99.99%', label: 'Uptime Guarantee', icon: FiAward },
              { number: '24/7', label: 'Security Monitoring', icon: FiTarget },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="text-center p-6 rounded-4 bg-gradient-to-br"
                  style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)' }}
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="mb-4 p-4 rounded-3 bg-red bg-opacity-10 w-fit mx-auto"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon size={32} className="text-red" />
                  </motion.div>
                  <motion.h3
                    className="display-5 fw-bold text-red mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-muted fw-500">{stat.label}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 py-lg-10 bg-red text-white position-relative overflow-hidden">
        <motion.div className="blob-1 position-absolute" style={{ top: '-10%', right: '-5%' }} animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="blob-2 position-absolute" style={{ bottom: '-10%', left: '-5%' }} animate={{ x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity }} />

        <div className="container-xl position-relative text-center">
          <motion.h2
            className="display-4 fw-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            className="lead mb-6 opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join hundreds of organizations already using Signatura for secure digital transformation.
          </motion.p>

          <motion.div
            className="d-flex flex-column flex-sm-row justify-content-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/issuer" className="btn btn-lg btn-white text-red fw-bold rounded-pill px-6 text-decoration-none">
                Get Started <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/solutions" className="btn btn-lg btn-outline-white fw-bold rounded-pill px-6 text-decoration-none">
                Learn More Solutions <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
