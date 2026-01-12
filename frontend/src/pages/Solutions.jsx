import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiKey, FiShield, FiLock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export default function Solutions() {
  const [activeTab, setActiveTab] = useState('identity');

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

  const solutions = [
    {
      id: 'identity',
      icon: FiKey,
      title: 'Digital Identity',
      shortDesc: 'Manage and protect your identity with advanced security',
      fullDesc: 'Stay in control with your identity details and prevent identity theft and data breach. Our comprehensive identity management system uses multi-factor authentication and KYC verification.',
      features: [
        { icon: '🔐', name: 'Multi-Factor Authentication', desc: 'Multiple verification layers for enhanced security' },
        { icon: '👤', name: 'KYC - Selfie Verification', desc: 'Biometric identity verification with liveness detection' },
        { icon: '🔒', name: 'Secure Identity Storage', desc: 'Encrypted storage with zero-knowledge architecture' },
        { icon: '📊', name: 'Real-time Threat Monitoring', desc: 'Continuous monitoring and threat detection' },
        { icon: '🛡️', name: 'Privacy Control', desc: 'User-controlled data sharing and permissions' },
        { icon: '⚡', name: 'Instant Verification', desc: 'Real-time identity verification across platforms' },
      ],
      benefits: [
        'Reduced identity theft incidents',
        'Compliance with global regulations',
        'Enhanced customer trust',
        'Streamlined onboarding process',
        'Lower fraud rates',
      ]
    },
    {
      id: 'security',
      icon: FiShield,
      title: 'Data Security',
      shortDesc: 'Protect your data with blockchain and encryption',
      fullDesc: 'Keep data safe and protected from data corruption through blockchain technology and added layers of security. Enterprise-grade protection for sensitive information.',
      features: [
        { icon: '⛓️', name: 'Blockchain Technology', desc: 'Immutable record keeping with distributed ledger' },
        { icon: '🔐', name: 'End-to-End Encryption', desc: 'Military-grade encryption for all data in transit' },
        { icon: '🏢', name: 'Secure Data Residency', desc: 'Compliant data storage in your preferred location' },
        { icon: '📡', name: 'Continuous Monitoring', desc: '24/7 security monitoring and anomaly detection' },
        { icon: '🔄', name: 'Automated Backups', desc: 'Regular encrypted backups with disaster recovery' },
        { icon: '📋', name: 'Audit Trail', desc: 'Complete audit logs for compliance and forensics' },
      ],
      benefits: [
        'Zero data breaches',
        'Regulatory compliance',
        'Business continuity',
        'Fraud prevention',
        'Risk mitigation',
      ]
    },
    {
      id: 'signature',
      icon: FiLock,
      title: 'Digital Signature',
      shortDesc: 'Sign securely with QR code protected signatures',
      fullDesc: 'Sign anytime and anywhere with our uniquely designed QR code protected digital signature. Legally binding and instantly verifiable signatures.',
      features: [
        { icon: '🔗', name: 'QR Code Protected Signing', desc: 'Unique QR code for each signature transaction' },
        { icon: '⚖️', name: 'Legal Compliance', desc: 'Meets eIDAS, ESIGN, and global digital signature laws' },
        { icon: '✓', name: 'Instant Verification', desc: 'Real-time verification of signature authenticity' },
        { icon: '📝', name: 'Audit Trail Tracking', desc: 'Complete tracking of signature lifecycle' },
        { icon: '🌍', name: 'Global Recognition', desc: 'Internationally recognized and enforceable' },
        { icon: '📱', name: 'Mobile Signing', desc: 'Sign documents on any device, anytime, anywhere' },
      ],
      benefits: [
        'Legally binding signatures',
        'Reduced document turnaround',
        'Cost savings on printing',
        'Improved customer experience',
        'Environmental sustainability',
      ]
    },
  ];

  const currentSolution = solutions.find(s => s.id === activeTab);

  return (
    <div className="solutions-page">
      <Navigation />

      {/* Hero Section */}
      <section className="solutions-hero py-6 py-lg-8 position-relative overflow-hidden bg-gradient-light">
        <motion.div className="blob-1" animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="blob-2" animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 25, repeat: Infinity }} />

        <div className="container-xl position-relative">
          <motion.div className="text-center" {...fadeInUp}>
            <motion.h1
              className="display-3 fw-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Our <span className="text-red">Solutions</span>
            </motion.h1>
            <motion.p
              className="lead text-muted mx-auto mb-0"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Three powerful pillars for complete digital transformation
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          {/* Tab Navigation */}
          <motion.div
            className="d-flex justify-content-center gap-2 gap-md-3 mb-5 flex-wrap"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {solutions.map((solution) => (
              <motion.button
                key={solution.id}
                onClick={() => setActiveTab(solution.id)}
                className={`btn btn-lg px-4 py-3 rounded-pill fw-bold transition-all ${
                  activeTab === solution.id
                    ? 'btn-red text-white shadow-lg'
                    : 'btn-outline-red text-red'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <solution.icon className="me-2" />
                {solution.title}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {currentSolution && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Main Description */}
                <motion.div className="row align-items-center mb-6" {...fadeInUp}>
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <motion.div
                      className="feature-illustration-box p-5 rounded-4 bg-light"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <motion.div className="text-center">
                        <currentSolution.icon size={150} className="text-red mb-4" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="col-lg-6">
                    <h2 className="display-5 fw-bold mb-4">{currentSolution.title}</h2>
                    <p className="lead text-muted mb-4">{currentSolution.fullDesc}</p>

                    {/* Benefits List */}
                    <div className="mb-4">
                      <h5 className="fw-bold mb-3">Key Benefits</h5>
                      <ul className="list-unstyled">
                        {currentSolution.benefits.map((benefit, idx) => (
                          <motion.li
                            key={idx}
                            className="d-flex align-items-center gap-3 mb-2 py-1"
                            whileHover={{ x: 8 }}
                          >
                            <motion.span className="text-red fw-bold">✓</motion.span>
                            <span className="text-dark fw-500">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <motion.button
                      className="btn btn-lg btn-red text-white fw-bold rounded-pill"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More <FiArrowRight className="ms-2" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Features Grid */}
                <div className="mt-6">
                  <h3 className="h3 fw-bold text-center mb-5">Core Features</h3>
                  <motion.div
                    className="row g-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {currentSolution.features.map((feature, idx) => (
                      <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-4">
                        <motion.div
                          className="p-4 rounded-4 bg-light h-100 position-relative overflow-hidden"
                          whileHover={{ y: -8 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <div className="text-4xl mb-3">{feature.icon}</div>
                          <h5 className="fw-bold mb-2">{feature.name}</h5>
                          <p className="text-muted small mb-0">{feature.desc}</p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-6 py-lg-8 bg-light">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
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
              { title: 'Industry Leading', desc: '5 years of trusted security and compliance' },
              { title: 'Global Scale', desc: 'Supports 50+ countries and regulations' },
              { title: 'Enterprise Grade', desc: '99.99% uptime SLA and 24/7 support' },
              { title: 'Easy Integration', desc: 'REST APIs and SDKs for quick deployment' },
              { title: 'Affordable', desc: 'Flexible pricing for businesses of all sizes' },
              { title: 'Future Ready', desc: 'AI-powered and blockchain-backed solutions' },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-4">
                <motion.div
                  className="p-4 rounded-4 bg-white h-100"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="mb-3 p-2 rounded-2 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FiCheckCircle size={24} className="text-red" />
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
      <section className="py-6 py-lg-8 bg-red text-white position-relative overflow-hidden">
        <motion.div className="blob-1" animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />

        <div className="container-xl position-relative text-center">
          <motion.h2
            className="display-4 fw-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Get Started Today
          </motion.h2>
          <motion.p
            className="lead mb-5 opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Choose your role and start transforming your digital experience in minutes.
          </motion.p>

          <motion.div
            className="d-flex flex-column flex-sm-row justify-content-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="btn btn-lg btn-white text-red fw-bold rounded-pill px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up as Issuer <FiArrowRight className="ms-2" />
            </motion.button>
            <motion.button
              className="btn btn-lg btn-outline-white fw-bold rounded-pill px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up as Owner
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
