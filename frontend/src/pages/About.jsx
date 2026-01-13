import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiTarget, FiEye, FiHeart, FiShield, FiMenu, FiX, FiUsers, FiAward, FiGlobe, FiActivity, FiTrendingUp, FiZap, FiCheckCircle } from 'react-icons/fi';

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

// Main About Component with ACTUAL CONTENT
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
              A Genuine Digital Transformation
            </motion.h1>
            <motion.p
              className="lead mx-auto mb-0 opacity-90"
              style={{ maxWidth: '900px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Signatura, a multi-dimensional digital identity, data security and digital signature platform, aimed to transform customers digital experience and the way industries provide services in a safe and secure way.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Why Signatura Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-4">Why Signatura?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '900px' }}>
              As we desire for a truly transformative experience that will change the way we navigate our everyday lives, we turn to a digital technology which ushers simple solutions to difficulties that come with complex processes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section with Images */}
      <section className="py-8 py-lg-10 bg-light position-relative">
        <div className="container-xl">
          <motion.div
            className="row g-5 align-items-center mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Enhanced Data Collection</h3>
              <p className="lead text-muted lh-lg">
                Signatura helps businesses optimize and analyze data collected to vastly improve customer experience, in terms of making informed and cost-effective decisions to further expand business opportunities.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Data Collection" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiActivity size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiActivity size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Data-Driven Decisions</h4>
                <p className="text-muted lh-lg">Make informed decisions with optimized data collection and analysis for business growth.</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="row g-5 align-items-center mb-8 flex-row-reverse"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Much Improved Customer Experience</h3>
              <p className="lead text-muted lh-lg">
                Signatura provides a more consistent and pleasant customer experience by gaining customers' insights to provide enhanced and practical services, that will more than meet and exceed customers' expectations.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Customer Experience" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiUsers size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiUsers size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Customer Satisfaction</h4>
                <p className="text-muted lh-lg">Exceed expectations with consistent and pleasant customer experiences powered by insights.</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="row g-5 align-items-center mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Makes the Switch to Digital Culture</h3>
              <p className="lead text-muted lh-lg">
                Signatura is a digitized environment which provides any business team with the right tools and propels a sustainable and efficient collaboration to successfully engage in diverse and dynamic business environments.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Digital Culture" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiGlobe size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiGlobe size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Digital Transformation</h4>
                <p className="text-muted lh-lg">Enable sustainable collaboration with the right digital tools and environment.</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="row g-5 align-items-center mb-8 flex-row-reverse"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Increased Profitability</h3>
              <p className="lead text-muted lh-lg">
                Signatura assures a true digital transformation expectedly which leads to increased profitability through enhanced efficiency, reduced costs and an improved customer service experience resulting to a deep brand loyalty base.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Profitability" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiTrendingUp size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiTrendingUp size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Growth & Profitability</h4>
                <p className="text-muted lh-lg">Achieve business growth through efficiency gains, cost reduction, and brand loyalty.</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="row g-5 align-items-center mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Increased Productivity</h3>
              <p className="lead text-muted lh-lg">
                Signatura believes that having the right tools simplifies the workflow and processes, resulting to optimized delivery of services and an empowered and highly motivated work force.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Productivity" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiZap size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiZap size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Team Empowerment</h4>
                <p className="text-muted lh-lg">Simplify workflows and empower your workforce with the right tools.</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="row g-5 align-items-center flex-row-reverse"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-lg-6" variants={itemVariants}>
              <h3 className="display-5 fw-bold mb-4">Environmentally Sensitive</h3>
              <p className="lead text-muted lh-lg">
                Signatura pushes for paperless transactions and the reduction of carbon footprint which supports our advocacy to preserve and conserve our planet's resources for generations to come.
              </p>
              <motion.div
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Environment" 
                  className="img-fluid rounded-4 w-100"
                  style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                />
              </motion.div>
            </motion.div>
            <motion.div className="col-lg-6" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-4 bg-white position-relative overflow-hidden"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiCheckCircle size={200} className="text-red" />
                </motion.div>
                <div className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit">
                  <FiCheckCircle size={40} className="text-red" />
                </div>
                <h4 className="h3 fw-bold mb-3">Sustainability</h4>
                <p className="text-muted lh-lg">Go paperless and reduce carbon footprint for a sustainable future.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Blockchain Section */}
      <section className="py-8 py-lg-10 bg-red text-white position-relative overflow-hidden">
        <motion.div className="blob-1 position-absolute" style={{ top: '-10%', right: '-5%' }} animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="blob-2 position-absolute" style={{ bottom: '-10%', left: '-5%' }} animate={{ x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Blockchain Technology</h2>
            <p className="lead opacity-90">SECURED, TRANSPARENT, TRUSTED</p>
            <p className="lead opacity-90 mx-auto" style={{ maxWidth: '700px' }}>
              We enhanced Signatura with blockchain technology, an innovative new technology.
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
                  <div className="text-5xl mb-3">{feature.icon}</div>
                  <h5 className="fw-bold mb-2">{feature.title}</h5>
                  <p className="small opacity-90">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="text-center mt-8" {...fadeInUp}>
            <p className="lead mb-4 opacity-90" style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
              Signatura, ensures protection from Identity Theft and will not compromise Data Privacy and that's our business.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/solutions" className="btn btn-lg btn-white text-red fw-bold rounded-pill px-6 text-decoration-none">
                Learn More <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partnership CTA Section */}
      <section className="py-8 py-lg-10 position-relative">
        <div className="container-xl">
          <motion.div className="text-center" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-5">Let us work together in bringing the future now.</h2>
            <p className="lead text-muted mx-auto lh-lg mb-6" style={{ maxWidth: '900px' }}>
              It is our great desire to build our future in collaboration and in partnership with institutions such as: insurance, banking and finance, religious, education, government and various organizations in bringing "A Genuine Digital Transformation" that will redefine the way delivery of services are done and help change the way we navigate our lives now.
            </p>
            
            <motion.div
              className="d-flex flex-column flex-sm-row justify-content-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/contact" className="btn btn-lg btn-red fw-bold rounded-pill px-6 text-decoration-none text-white">
                  Let's Talk <FiArrowRight className="ms-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/issuer" className="btn btn-lg btn-outline-red fw-bold rounded-pill px-6 text-decoration-none">
                  Get Started <FiArrowRight className="ms-2" />
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
