import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTarget, FiEye, FiHeart, FiShield } from 'react-icons/fi';
import Navigation from './components/Navigation';
import Footer from './Footer';

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

  const values = [
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
      desc: 'Security First, Innovation Always, Customer Success, Integrity & Transparency, Continuous Improvement'
    },
    {
      icon: FiShield,
      title: 'Our Commitment',
      desc: 'We are committed to protecting your data with military-grade security while maintaining the highest standards of service excellence.'
    },
  ];

  const timeline = [
    { year: '2020', event: 'Signatura Founded - Launch of Digital Identity Platform' },
    { year: '2021', event: 'Integration of Blockchain Technology for Enhanced Security' },
    { year: '2022', event: 'Expansion to Multiple Industries - Insurance, Banking, Education' },
    { year: '2023', event: 'Launch of QR Code Protected Digital Signature' },
    { year: '2024', event: 'Government Sector Partnership & Global Expansion' },
    { year: '2025', event: 'AI-Powered Verification & Enhanced Analytics' },
  ];

  return (
    <div className="about-page">
      <Navigation />

      {/* Hero Section */}
      <section className="about-hero py-6 py-lg-8 position-relative overflow-hidden bg-gradient-light">
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
              About <span className="text-red">Signatura</span>
            </motion.h1>
            <motion.p
              className="lead text-muted mx-auto mb-0"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Leading the digital transformation revolution with innovative solutions for secure identity, data protection, and digital signatures.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-6">
                <motion.div
                  className="p-5 rounded-4 bg-gradient-card h-100 position-relative overflow-hidden"
                  whileHover={{ y: -8 }}
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

      {/* Company Story Section */}
      <section className="py-6 py-lg-8 bg-light position-relative">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Our Journey</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              From startup vision to market leader, Signatura has been at the forefront of digital identity innovation
            </p>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="position-relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {timeline.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`row mb-4 align-items-center ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="col-lg-5">
                  <motion.div
                    className="timeline-card p-4 rounded-4 bg-white"
                    whileHover={{ x: idx % 2 === 0 ? 10 : -10 }}
                  >
                    <h3 className="h5 fw-bold text-red mb-2">{item.year}</h3>
                    <p className="text-muted mb-0">{item.event}</p>
                  </motion.div>
                </div>
                <div className="col-lg-2 text-center">
                  <motion.div
                    className="timeline-dot mx-auto bg-red rounded-circle"
                    style={{ width: '16px', height: '16px' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                  />
                </div>
                <div className="col-lg-5"></div>
              </motion.div>
            ))}

            {/* Timeline Line */}
            <motion.div
              className="timeline-line"
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: '500+', label: 'Organizations Using Signatura' },
              { number: '10M+', label: 'Credentials Verified' },
              { number: '99.99%', label: 'Uptime Guarantee' },
              { number: '24/7', label: 'Security Monitoring' },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="text-center p-5 rounded-4 bg-gradient-card"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
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
      <section className="py-6 py-lg-8 bg-red text-white position-relative overflow-hidden">
        <motion.div className="blob-1" animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />
        <motion.div className="blob-2" animate={{ x: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity }} />

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
            className="lead mb-5 opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join hundreds of organizations already using Signatura for secure digital transformation.
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
              Get Started <FiArrowRight className="ms-2" />
            </motion.button>
            <motion.button
              className="btn btn-lg btn-outline-white fw-bold rounded-pill px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
