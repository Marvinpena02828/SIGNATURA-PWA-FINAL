import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiArrowRight, FiCheckCircle,
  FiShoppingCart, FiKey, FiZap, FiCloud, FiFile, FiPenTool, FiActivity, FiDollarSign, FiCalendar, FiBell
} from 'react-icons/fi';

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
              src="the/logo31.png"
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

// Main Solutions Component
export default function Solutions() {
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

  const solutions = [
    {
      icon: FiShoppingCart,
      title: 'Marketplace',
      desc: 'Easy navigation through a multitude of custom-fit services.',
      color: 'bg-blue'
    },
    {
      icon: FiKey,
      title: 'Digital ID',
      desc: 'Ensures security and protection of end-users from Identity Theft through the Know-Your-Customer (KYC) or the selfie process.',
      color: 'bg-purple'
    },
    {
      icon: FiZap,
      title: 'Simplified Digital Workflow',
      desc: 'Easy and hassle-free steps and processes.',
      color: 'bg-orange'
    },
    {
      icon: FiCloud,
      title: 'Secured Cloud Storage',
      desc: 'Highly secure cloud storage for important and sensitive corporate and/or personal records which can only be accessed with end-user\'s consent.',
      color: 'bg-cyan'
    },
    {
      icon: FiFile,
      title: 'Digital Document Wallet',
      desc: 'A versatile virtual storage capable of safekeeping any important and highly confidential, for-your-eyes-only documents.',
      color: 'bg-green'
    },
    {
      icon: FiPenTool,
      title: 'Digital Signature',
      desc: 'Affix your signature, anytime, anywhere with Signatura\'s uniquely designed QR code-based digital signature.',
      color: 'bg-red'
    },
    {
      icon: FiActivity,
      title: 'Contact Tracing',
      desc: 'Signatura can be utilized as a tool in tracking and breaking chains of a viral transmission which can be helpful in protecting the business, customers/clients and entire communities.',
      color: 'bg-pink'
    },
    {
      icon: FiDollarSign,
      title: 'Secured Online Payment',
      desc: 'Signatura comes with an integrated payment system through our payment gateway partners.',
      color: 'bg-emerald'
    },
    {
      icon: FiCalendar,
      title: 'Scheduler',
      desc: 'Signatura conveniently offers queueing and scheduling systems, minimizing any delays or waiting periods.',
      color: 'bg-indigo'
    },
    {
      icon: FiBell,
      title: 'Notification System',
      desc: 'Customizable status updates, alerts, announcements, promotions with an integrated GPS service for roadside assistance.',
      color: 'bg-yellow'
    },
  ];

  return (
    <div className="solutions-page">
      <Navigation />

      {/* Hero Section */}
   <section
  className="solutions-hero py-8 py-lg-10 position-relative overflow-hidden text-white"
  style={{
    backgroundImage: "url('/sol.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center'
  }}
>

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
              <span className="badge bg-white text-red fw-bold px-4 py-2">Our Solutions</span>
            </motion.div>
            <motion.h1
              className="display-2 fw-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Going Beyond The Ordinary
            </motion.h1>
            <motion.p
              className="lead mx-auto mb-0 opacity-90"
              style={{ maxWidth: '900px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              As we are committed to provide ONLY the right tools, Signatura went beyond the ordinary or the predictable, and designed tools that simplifies the digital experience, allowing wider accessibility without compromising data security.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Having the Right Tools Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-4">Having the Right Tools</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '900px' }}>
              Signatura simplifies the digital experience, promotes empowerment and efficiency, and assures great service improvement of any dynamic enterprise.
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {solutions.map((solution, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-4">
                <motion.div
                  className="p-6 rounded-4 bg-white h-100 position-relative overflow-hidden shadow-sm"
                  whileHover={{ y: -12, boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Background Icon */}
                  <motion.div
                    className="position-absolute top-0 end-0 w-100 h-100 opacity-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <solution.icon size={200} className="text-red" />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <solution.icon size={32} className="text-red" />
                  </motion.div>
                  
                  <h3 className="h5 fw-bold mb-3">{solution.title}</h3>
                  <p className="text-muted lh-lg mb-4">{solution.desc}</p>
                  
                  <motion.div
                    className="d-flex align-items-center gap-2 text-red fw-bold small"
                    whileHover={{ x: 5 }}
                  >
                    Learn More <FiArrowRight size={16} />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions Image Section */}
      <section className="py-8 py-lg-10 bg-light position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-4">Complete Digital Transformation Platform</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '900px' }}>
              All the tools you need in one powerful platform
            </p>
          </motion.div>

          <motion.div
            className="position-relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img 
              src="/api/placeholder/1200/600" 
              alt="Signatura Platform" 
              className="img-fluid rounded-4 w-100"
              style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Why Signatura Section */}
      <section className="py-8 py-lg-10">
        <div className="container-xl">
          <motion.div className="text-center mb-8" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Why Choose Signatura?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              We deliver what others promise
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
              { title: 'Simplicity', desc: 'Simple solutions to complex problems' },
              { title: 'Security', desc: 'Military-grade encryption and blockchain' },
              { title: 'Scalability', desc: 'Grows with your business needs' },
              { title: 'Accessibility', desc: 'Easy to use for everyone' },
              { title: 'Reliability', desc: '99.99% uptime SLA' },
              { title: 'Innovation', desc: 'Constantly evolving with technology' },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-4">
                <motion.div
                  className="p-5 rounded-4 bg-white h-100"
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(220, 38, 38, 0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="mb-3 p-2 rounded-2 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FiCheckCircle size={28} className="text-red" />
                  </motion.div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
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
            Experience the Difference
          </motion.h2>
          <motion.p
            className="lead mb-6 opacity-90 mx-auto"
            style={{ maxWidth: '700px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Start using Signatura today and transform your digital experience in minutes.
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
                Sign Up as Issuer <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/owner" className="btn btn-lg btn-outline-white fw-bold rounded-pill px-6 text-decoration-none">
                Sign Up as Owner <FiArrowRight className="ms-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
