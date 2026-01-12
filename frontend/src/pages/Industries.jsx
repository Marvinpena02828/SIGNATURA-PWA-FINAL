import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Industries() {
  const [expandedIndustry, setExpandedIndustry] = useState(0);

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

  const industries = [
    {
      id: 'insurance',
      icon: '🏥',
      title: 'Insurance',
      shortDesc: 'Secure policy management and claim verification',
      fullDesc: 'Revolutionize your insurance operations with secure digital identity verification, policy management, and fraud prevention. Streamline claims processing with immutable blockchain records.',
      challenges: [
        'Identity verification of new customers',
        'Fraud prevention in claims',
        'Efficient policy management',
        'Regulatory compliance'
      ],
      solutions: [
        'KYC Verification with biometric authentication',
        'Digital signatures for policy agreements',
        'Blockchain-based claim tracking',
        'Instant credential verification'
      ],
      benefits: [
        '40% reduction in claims processing time',
        '95% fraud detection rate',
        'Improved customer onboarding',
        'Full regulatory compliance'
      ]
    },
    {
      id: 'government',
      icon: '🏛️',
      title: 'Government',
      shortDesc: 'Digital document verification and citizen services',
      fullDesc: 'Transform government services with secure digital identity, document verification, and citizen authentication. Improve service delivery while maintaining highest security standards.',
      challenges: [
        'Citizens identity verification',
        'Document authenticity verification',
        'Service delivery efficiency',
        'Data privacy and security'
      ],
      solutions: [
        'Government-grade digital identity platform',
        'Secure document verification system',
        'Citizen authentication portal',
        'Encrypted data storage with compliance'
      ],
      benefits: [
        'Citizen satisfaction increase of 60%',
        'Zero forged document incidents',
        '80% reduction in processing time',
        'GDPR and local compliance'
      ]
    },
    {
      id: 'banking',
      icon: '🏦',
      title: 'Banking & Finance',
      shortDesc: 'Secure transactions and regulatory compliance',
      fullDesc: 'Enable secure financial transactions and maintain compliance with regulations. Protect customer data with military-grade encryption and blockchain verification.',
      challenges: [
        'Regulatory compliance (AML, KYC)',
        'Transaction security',
        'Customer authentication',
        'Fraud prevention'
      ],
      solutions: [
        'Enhanced KYC with biometric verification',
        'Blockchain-based transaction recording',
        'Multi-factor authentication',
        'Real-time fraud detection'
      ],
      benefits: [
        'Full PCI-DSS compliance',
        '99% transaction security rate',
        'AML/KYC automation',
        'Reduced operational costs by 35%'
      ]
    },
    {
      id: 'education',
      icon: '📚',
      title: 'Education',
      shortDesc: 'Credential verification and degree authentication',
      fullDesc: 'Secure academic credentials and prevent diploma fraud. Provide instant verification of educational achievements with tamper-proof digital certificates.',
      challenges: [
        'Diploma fraud prevention',
        'Credential verification',
        'Student identification',
        'Transcript authenticity'
      ],
      solutions: [
        'Digital degree certificates',
        'Secure transcript management',
        'Instant credential verification',
        'Student digital identity'
      ],
      benefits: [
        'Zero diploma fraud incidents',
        'Instant employer verification',
        'Reduced verification time to seconds',
        'Global credential recognition'
      ]
    }
  ];

  const currentIndustry = industries[expandedIndustry];

  return (
    <div className="industries-page">
      <Navigation />

      {/* Hero Section */}
      <section className="industries-hero py-6 py-lg-8 position-relative overflow-hidden bg-gradient-light">
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
              Industries We <span className="text-red">Serve</span>
            </motion.h1>
            <motion.p
              className="lead text-muted mx-auto mb-0"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tailored solutions for specific industry needs and compliance requirements
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Industry Cards with Expand */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div
            className="row g-4 mb-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {industries.map((industry, idx) => (
              <motion.div key={industry.id} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.button
                  onClick={() => setExpandedIndustry(idx)}
                  className="btn btn-block p-5 rounded-4 bg-gradient-card text-start h-100 border-0 position-relative overflow-hidden"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="position-absolute top-0 end-0 opacity-10">
                    <span className="text-5xl">{industry.icon}</span>
                  </div>

                  <motion.div className="mb-3 text-5xl">{industry.icon}</motion.div>
                  <h5 className="fw-bold mb-2 text-dark">{industry.title}</h5>
                  <p className="text-muted small mb-3 text-dark">{industry.shortDesc}</p>

                  <motion.div
                    className="d-flex align-items-center gap-2 text-red fw-bold"
                    animate={{ x: expandedIndustry === idx ? 8 : 0 }}
                  >
                    View Details <FiArrowRight size={16} />
                  </motion.div>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          {/* Expanded Industry Details */}
          <AnimatePresence mode="wait">
            {currentIndustry && (
              <motion.div
                key={currentIndustry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-6 pt-6 border-top"
              >
                <div className="row align-items-center g-5 mb-6">
                  <div className="col-lg-6">
                    <motion.div
                      className="p-5 rounded-4 bg-light text-center"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <span className="display-3">{currentIndustry.icon}</span>
                    </motion.div>
                  </div>

                  <div className="col-lg-6">
                    <motion.h2
                      className="display-5 fw-bold mb-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {currentIndustry.title}
                    </motion.h2>
                    <motion.p
                      className="lead text-muted mb-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {currentIndustry.fullDesc}
                    </motion.p>

                    <motion.button
                      className="btn btn-lg btn-red text-white fw-bold rounded-pill"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Request Demo <FiArrowRight className="ms-2" />
                    </motion.button>
                  </div>
                </div>

                {/* Challenges, Solutions, Benefits */}
                <div className="row g-4 mb-6">
                  <motion.div
                    className="col-lg-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="p-4 rounded-4 bg-light h-100">
                      <h5 className="fw-bold mb-4 text-red">Challenges</h5>
                      <ul className="list-unstyled">
                        {currentIndustry.challenges.map((challenge, idx) => (
                          <li key={idx} className="mb-3 pb-3 border-bottom">
                            <p className="text-muted small mb-0">• {challenge}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div
                    className="col-lg-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="p-4 rounded-4 bg-light h-100">
                      <h5 className="fw-bold mb-4 text-red">Our Solutions</h5>
                      <ul className="list-unstyled">
                        {currentIndustry.solutions.map((solution, idx) => (
                          <li key={idx} className="mb-3 pb-3 border-bottom">
                            <p className="text-muted small mb-0">✓ {solution}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div
                    className="col-lg-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="p-4 rounded-4 bg-light h-100">
                      <h5 className="fw-bold mb-4 text-red">Benefits Achieved</h5>
                      <ul className="list-unstyled">
                        {currentIndustry.benefits.map((benefit, idx) => (
                          <li key={idx} className="mb-3 pb-3 border-bottom">
                            <p className="text-muted small mb-0">⭐ {benefit}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-6 py-lg-8 bg-light">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Real-World Use Cases</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              See how organizations are transforming with Signatura
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
                title: 'Insurance Company',
                company: 'Premium Insurance Co.',
                result: '45% faster claims processing',
                desc: 'Implemented digital signatures and blockchain verification for claim management'
              },
              {
                title: 'Government Agency',
                company: 'National Services',
                result: 'Served 1M+ citizens',
                desc: 'Deployed digital identity platform for secure citizen services'
              },
              {
                title: 'Bank',
                company: 'Global Finance Bank',
                result: '99.99% transaction security',
                desc: 'Integrated KYC and AML compliance with blockchain records'
              },
              {
                title: 'University',
                company: 'National University',
                result: 'Zero diploma fraud cases',
                desc: 'Issued secure digital degrees with instant verification'
              },
            ].map((useCase, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="p-4 rounded-4 bg-white h-100"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <h5 className="fw-bold mb-2">{useCase.title}</h5>
                  <p className="text-muted text-sm mb-3">{useCase.company}</p>
                  <div className="p-3 rounded-3 bg-red bg-opacity-10 mb-3">
                    <p className="text-red fw-bold mb-0">{useCase.result}</p>
                  </div>
                  <p className="text-muted small">{useCase.desc}</p>
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
            Ready to Transform Your Industry?
          </motion.h2>
          <motion.p
            className="lead mb-5 opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Let's discuss how Signatura can be tailored for your specific industry needs.
          </motion.p>

          <motion.button
            className="btn btn-lg btn-white text-red fw-bold rounded-pill px-5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Schedule Consultation <FiArrowRight className="ms-2" />
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
