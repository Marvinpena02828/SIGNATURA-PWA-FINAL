import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiUsers, FiCheckCircle, FiLock, FiTrendingUp, FiZap, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo31.png';
import './Landing.css';

// Ripple Effect Component
const RippleButton = ({ children, onClick, className, to, variant = 'primary', disabled = false }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
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

// Floating Particles Background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
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
            y: window.innerHeight + 20,
            opacity: [0.2, 0.4, 0.2],
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

export default function Landing() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

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

  const handleNavigate = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar sticky-top navbar-expand-md navbar-light bg-white border-bottom">
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-100 d-flex justify-content-between align-items-center"
          >
            <Link to="/" className="navbar-brand">
              <motion.img
                src={logo}
                alt="Signatura Logo"
                height="40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'How It Works', id: 'how-it-works' },
                  { label: 'Security', id: 'security' },
                ].map((item) => (
                  <li className="nav-item" key={item.id}>
                    <motion.button
                      onClick={() => handleNavigate(item.id)}
                      className="nav-link text-decoration-none"
                      whileHover={{ y: -2 }}
                    >
                      {item.label}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="d-flex align-items-center gap-3 ms-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login/issuer" className="text-decoration-none text-dark">
                  Sign In
                </Link>
              </motion.div>
              <RippleButton to="/login/issuer" variant="primary">
                Get Started <FiArrowRight />
              </RippleButton>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section py-5 position-relative">
        <FloatingParticles />
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <motion.h1
              className="display-4 fw-bold mb-4 hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Verify Credentials with
              <motion.span
                className="d-block gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Confidence
              </motion.span>
            </motion.h1>

            <motion.p
              className="lead text-muted mb-5 mx-auto"
              style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Issue, store, and verify digital documents with cryptographic signatures. Give your users control over who can access their credentials.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <RippleButton to="/login/issuer" variant="primary">
                  For Issuers <FiArrowRight />
                </RippleButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                <RippleButton to="/login/owner" variant="secondary">
                  For Document Owners <FiArrowRight />
                </RippleButton>
              </motion.div>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              className="row mx-auto mb-5"
              style={{ maxWidth: '700px' }}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { label: 'Privacy Control', value: '100%' },
                { label: 'Encryption', value: '256-bit' },
                { label: 'Verification', value: 'Instant' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className="col-md-4 mb-3">
                  <motion.div
                    className="stat-value"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-muted small">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="mt-5 position-relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="hero-visual-bg"></div>
            <div className="hero-visual">
              <div className="row g-3">
                {[FiLock, FiShield, FiUsers].map((Icon, idx) => (
                  <motion.div
                    key={idx}
                    className="col-4"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="hero-visual-card">
                      <Icon className="h-100 w-100" size={48} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5 position-relative">
        <div className="container-xl position-relative">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold mb-3">Powerful Features</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Everything you need to issue, manage, and verify digital credentials securely.
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
              { icon: FiShield, title: 'Cryptographic Signatures', desc: 'Every document is digitally signed and can be verified offline. Your credentials are tamper-proof.' },
              { icon: FiUsers, title: 'Owner-Controlled Access', desc: 'Document owners have complete control. Grant or revoke verification access anytime.' },
              { icon: FiLock, title: 'Privacy First', desc: 'Selective disclosure means sharing only what\'s necessary. Your data stays private.' },
              { icon: FiTrendingUp, title: 'Complete Audit Trail', desc: 'Track every verification event. Know exactly who accessed your documents and when.' },
              { icon: FiZap, title: 'Instant Issuance', desc: 'Issue credentials in seconds. No paperwork, no delays. Completely digital.' },
              { icon: FiCheckCircle, title: 'Simple Verification', desc: 'Verifiers get instant confirmation. No more waiting for credential validation.' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="col-md-6 col-lg-4"
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <motion.div
                  className="feature-card"
                  animate={{
                    boxShadow: hoveredFeature === idx
                      ? '0 20px 40px rgba(255, 45, 85, 0.15)'
                      : '0 10px 20px rgba(0, 0, 0, 0.05)',
                  }}
                  whileHover={{ y: -8 }}
                >
                  <motion.div
                    className="feature-icon"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon size={32} />
                  </motion.div>
                  <h3 className="h5 fw-bold mb-2">{feature.title}</h3>
                  <p className="text-muted small">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section py-5">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Simple workflow for issuance, management, and verification.
            </p>
          </motion.div>

          {/* Main Steps */}
          <motion.div
            className="row g-4 mb-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { num: 1, title: 'Issuance', desc: 'Issuers create and cryptographically sign documents. Recipients receive and store them securely.' },
              { num: 2, title: 'Request', desc: 'Verifiers request permission to access a document. The owner receives and reviews the request.' },
              { num: 3, title: 'Verification', desc: 'Owner grants access with fine-grained control. Verifier gets instant cryptographic proof.' },
            ].map((step, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-4">
                <div className="step-card position-relative">
                  <motion.div
                    className="step-number"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    {step.num}
                  </motion.div>
                  <h3 className="h5 fw-bold mb-3">{step.title}</h3>
                  <p className="text-muted small">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Steps */}
          <motion.div
            className="how-it-works-detail p-4 p-md-5 rounded-3"
            {...fadeInUp}
          >
            <div className="row g-4">
              {[
                { title: 'Digital Signing', desc: 'Documents are signed with issuer\'s private key using industry-standard algorithms.' },
                { title: 'Consent-Based Access', desc: 'Owners explicitly approve each verification request with granular permission controls.' },
                { title: 'Offline Verification', desc: 'Verifiers can validate credentials offline using the issuer\'s public key.' },
              ].map((item, idx) => (
                <motion.div key={idx} className="col-md-4" whileHover={{ y: -4 }}>
                  <div className="d-flex gap-2 mb-3">
                    <motion.span
                      className="step-checkmark"
                      whileHover={{ scale: 1.3 }}
                    >
                      ✓
                    </motion.span>
                    <h4 className="fw-bold">{item.title}</h4>
                  </div>
                  <p className="text-muted small ps-5">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security-section py-5 text-white position-relative">
        <div className="security-blob-1"></div>
        <div className="security-blob-2"></div>

        <div className="container-xl position-relative">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold mb-3">Enterprise Security</h2>
            <p className="lead opacity-75 mx-auto" style={{ maxWidth: '600px' }}>
              Built with security best practices from day one.
            </p>
          </motion.div>

          <motion.div
            className="row g-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: 'What We Protect',
                items: [
                  'End-to-end encryption for all documents',
                  'SHA-256 hashing for document integrity',
                  'Ed25519 signatures for authenticity',
                  'Rate limiting and DDoS protection',
                ],
              },
              {
                title: 'Compliance',
                items: [
                  'GDPR compliant data handling',
                  'Local data residency options',
                  'Complete audit logs',
                  'Right to erasure support',
                ],
              },
            ].map((section, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6">
                <h3 className="h4 fw-bold mb-4">{section.title}</h3>
                <ul className="list-unstyled">
                  {section.items.map((item, itemIdx) => (
                    <motion.li
                      key={itemIdx}
                      className="d-flex align-items-start gap-3 mb-3"
                      whileHover={{ x: 8 }}
                    >
                      <motion.div
                        className="security-checkmark"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        ✓
                      </motion.div>
                      <span className="opacity-75">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section py-5 position-relative">
        <div className="container-xl position-relative">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-5 fw-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              No hidden fees. Pay only for what you use.
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
                name: 'Starter',
                price: 'Free',
                desc: 'For small teams',
                features: ['Up to 10 documents/month', '5 verification requests', 'Basic audit logs'],
                variant: 'outline',
              },
              {
                name: 'Professional',
                price: '₱99',
                period: '/month',
                desc: 'For growing businesses',
                features: ['Unlimited documents', 'Unlimited requests', 'Advanced analytics', 'Priority support'],
                variant: 'primary',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large organizations',
                features: ['Custom volume pricing', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
                variant: 'outlineRed',
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="col-md-4"
                whileHover={{ scale: 1.02, y: -8 }}
              >
                <div className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
                  {plan.popular && (
                    <motion.div
                      className="pricing-badge"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      POPULAR
                    </motion.div>
                  )}

                  <h3 className="h4 fw-bold">{plan.name}</h3>
                  <p className="text-muted small mb-3">{plan.desc}</p>

                  <div className="mb-4">
                    <p className="display-6 fw-bold">{plan.price}</p>
                    {plan.period && <p className="text-muted small">{plan.period}</p>}
                  </div>

                  <ul className="list-unstyled mb-4">
                    {plan.features.map((feature, featureIdx) => (
                      <motion.li
                        key={featureIdx}
                        className="d-flex align-items-center gap-2 mb-3 text-muted small"
                        whileHover={{ x: 4 }}
                      >
                        <FiCheckCircle className="text-success flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <RippleButton
                    to={plan.popular ? '/login/issuer' : undefined}
                    onClick={!plan.popular ? () => alert(`${plan.name} plan selected`) : undefined}
                    variant={plan.variant}
                    className="w-100"
                  >
                    {plan.popular ? 'Start Free Trial' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </RippleButton>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-5 text-white position-relative">
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

        <div className="container-lg position-relative" style={{ maxWidth: '600px' }}>
          <motion.h2
            className="h3 fw-bold text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Stay Updated
          </motion.h2>
          <motion.p
            className="text-center opacity-75 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get the latest news on credential verification and digital signatures.
          </motion.p>

          <motion.form
            onSubmit={handleNewsletterSubmit}
            className="d-flex flex-column flex-sm-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-lg newsletter-input"
              disabled={isSubscribing}
            />
            <RippleButton
              variant="ghost"
              onClick={handleNewsletterSubmit}
              disabled={isSubscribing}
              className="newsletter-btn"
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
              className="text-center mt-3 text-success"
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
      <section className="final-cta-section py-5 position-relative">
        <div className="cta-blob"></div>

        <div className="container-lg text-center position-relative" style={{ maxWidth: '900px' }}>
          <motion.h2
            className="display-5 fw-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            className="lead text-muted mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join hundreds of organizations using Signatura to issue and verify credentials securely.
          </motion.p>

          <motion.div
            className="d-flex flex-column flex-sm-row justify-content-center gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <RippleButton to="/login/issuer" variant="primary">
                Start Issuing <FiArrowRight />
              </RippleButton>
            </motion.div>
            <motion.div variants={itemVariants}>
              <RippleButton to="/login/owner" variant="secondary">
                Manage Credentials <FiArrowRight />
              </RippleButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4 border-top">
        <div className="container-xl">
          <div className="row g-4 mb-4">
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', action: () => handleNavigate('features') },
                  { label: 'Pricing', action: () => handleNavigate('pricing') },
                  { label: 'Security', action: () => handleNavigate('security') },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', action: () => alert('About page') },
                  { label: 'Blog', action: () => alert('Blog page') },
                  { label: 'Careers', action: () => alert('Careers page') },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy', action: () => alert('Privacy page') },
                  { label: 'Terms', action: () => alert('Terms page') },
                  { label: 'Contact', action: () => alert('Contact page') },
                ],
              },
              {
                title: 'Follow',
                links: [
                  { label: 'Twitter', action: () => window.open('https://twitter.com') },
                  { label: 'LinkedIn', action: () => window.open('https://linkedin.com') },
                  { label: 'GitHub', action: () => window.open('https://github.com') },
                ],
              },
            ].map((section, idx) => (
              <motion.div key={idx} className="col-md-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <h6 className="fw-bold mb-3">{section.title}</h6>
                <ul className="list-unstyled">
                  {section.links.map((link, linkIdx) => (
                    <motion.li key={linkIdx} whileHover={{ x: 4 }} className="mb-2">
                      <button
                        onClick={link.action}
                        className="btn btn-link p-0 text-decoration-none text-muted text-start"
                      >
                        {link.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="border-top pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3 mb-sm-0">
              <img src={logo} alt="Signatura Logo" height="32" />
            </Link>
            <p className="text-muted small mb-0">&copy; 2025 Signatura. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
