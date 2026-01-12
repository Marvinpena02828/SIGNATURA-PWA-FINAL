import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers, FiTrendingUp, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import Navigation from '../components/Navigation.jsx';
import Footer from '../components/Footer.jsx';

export default function Partners() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const partnerTypes = [
    {
      icon: FiUsers,
      title: 'Technology Partners',
      desc: 'Integrate Signatura with your platform',
      benefits: [
        'API & SDK access',
        'Co-marketing opportunities',
        'Revenue sharing model',
        'Technical support team'
      ]
    },
    {
      icon: FiTrendingUp,
      title: 'Reseller Partners',
      desc: 'Sell Signatura to your customers',
      benefits: [
        'Competitive margins',
        'Sales enablement',
        'Training & certification',
        'Dedicated account manager'
      ]
    },
    {
      icon: FiGlobe,
      title: 'Channel Partners',
      desc: 'Expand market reach together',
      benefits: [
        'Multi-tier commission',
        'Marketing support',
        'Territory protection',
        'Priority onboarding'
      ]
    },
    {
      icon: FiCheckCircle,
      title: 'Strategic Partners',
      desc: 'Collaborate on innovation',
      benefits: [
        'Co-development projects',
        'Joint go-to-market',
        'Exclusive features',
        'Board-level engagement'
      ]
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="partners-page">
      <Navigation />

      {/* Hero Section */}
      <section className="partners-hero py-6 py-lg-8 position-relative overflow-hidden bg-gradient-light">
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
              Build the Future <span className="text-red">Together</span>
            </motion.h1>
            <motion.p
              className="lead text-muted mx-auto mb-0"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Partner with Signatura and unlock new revenue streams, markets, and opportunities
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Partnership Opportunities</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Choose the partnership model that works best for your business
            </p>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {partnerTypes.map((partner, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="p-5 rounded-4 bg-light h-100 position-relative overflow-hidden"
                  whileHover={{ y: -12 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <partner.icon size={32} className="text-red" />
                  </motion.div>

                  <h4 className="fw-bold mb-2">{partner.title}</h4>
                  <p className="text-muted mb-4">{partner.desc}</p>

                  <ul className="list-unstyled mb-4">
                    {partner.benefits.map((benefit, bidx) => (
                      <motion.li
                        key={bidx}
                        className="d-flex align-items-start gap-2 mb-2"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-red fw-bold mt-1">✓</span>
                        <span className="text-muted small">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    className="btn btn-sm btn-red text-white w-100 fw-bold rounded-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-6 py-lg-8 bg-light">
        <div className="container-xl">
          <div className="row align-items-center g-5">
            <motion.div className="col-lg-6" {...fadeInUp}>
              <h2 className="display-5 fw-bold mb-4">Why Partner With Signatura?</h2>
              <p className="lead text-muted mb-4">
                Join a growing network of successful partners transforming digital experiences globally.
              </p>

              <ul className="list-unstyled mb-0">
                {[
                  'Proven technology with 5+ years of market success',
                  'Comprehensive support and training programs',
                  'Competitive revenue sharing models',
                  'Global market reach and expansion',
                  'Continuous product innovation',
                  'Marketing and sales enablement',
                  'Dedicated partner success team',
                  'Priority access to new features'
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    className="d-flex align-items-center gap-3 mb-3 py-2"
                    whileHover={{ x: 8 }}
                  >
                    <motion.span className="text-red fw-bold">✓</motion.span>
                    <span className="text-dark fw-500">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="col-lg-6" {...fadeInUp}>
              <motion.div
                className="p-6 rounded-4 bg-white shadow-lg"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-center">
                  <FiUsers size={120} className="text-red mb-4 opacity-30" />
                  <h4 className="fw-bold mb-3">Current Partners</h4>
                  <div className="row g-3 text-center">
                    {[
                      { number: '150+', label: 'Active Partners' },
                      { number: '50+', label: 'Countries' },
                      { number: '$50M+', label: 'Partner Revenue' },
                    ].map((stat, idx) => (
                      <div key={idx} className="col">
                        <h3 className="h5 text-red fw-bold mb-1">{stat.number}</h3>
                        <p className="text-muted small">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner Tiers Section */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Partner Tiers</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Scale your benefits as you grow with us
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
                tier: 'Silver',
                color: 'text-secondary',
                desc: 'Getting Started',
                price: 'Free',
                features: [
                  'API access',
                  'Technical support',
                  'Partner portal',
                  'Monthly updates'
                ]
              },
              {
                tier: 'Gold',
                color: 'text-warning',
                desc: 'Growing Together',
                price: 'Custom',
                features: [
                  'Everything in Silver',
                  'Dedicated support',
                  'Revenue sharing',
                  'Marketing support',
                  'Priority onboarding'
                ],
                highlighted: true
              },
              {
                tier: 'Platinum',
                color: 'text-danger',
                desc: 'Strategic Partnership',
                price: 'Custom',
                features: [
                  'Everything in Gold',
                  'Co-development',
                  'Exclusive features',
                  'Board meetings',
                  'Territory protection'
                ]
              },
            ].map((tier, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-4">
                <motion.div
                  className={`p-5 rounded-4 h-100 position-relative ${
                    tier.highlighted
                      ? 'bg-red text-white shadow-lg'
                      : 'bg-light text-dark'
                  }`}
                  whileHover={{ y: -12 }}
                animate={tier.highlighted ? { y: [-8, 8, -8] } : {}}
transition={tier.highlighted 
  ? { duration: 3, repeat: Infinity } 
  : { type: 'spring', stiffness: 300 }
}
                >
                  <h4 className={`fw-bold mb-2 ${tier.color}`}>{tier.tier}</h4>
                  <p className={`mb-2 ${tier.highlighted ? 'opacity-90' : 'text-muted'}`}>{tier.desc}</p>
                  <h3 className={`display-6 fw-bold mb-4 ${tier.highlighted ? '' : 'text-red'}`}>{tier.price}</h3>

                  <ul className="list-unstyled mb-4">
                    {tier.features.map((feature, fidx) => (
                      <motion.li
                        key={fidx}
                        className="d-flex align-items-center gap-2 mb-3"
                        whileHover={{ x: 4 }}
                      >
                        <span className={tier.highlighted ? 'text-white' : 'text-red'}>✓</span>
                        <span className={tier.highlighted ? 'text-white' : 'text-dark'}>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    className={`btn w-100 fw-bold rounded-pill ${
                      tier.highlighted
                        ? 'btn-white text-red'
                        : 'btn-red text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner Form Section */}
      <section className="py-6 py-lg-8 bg-red text-white position-relative overflow-hidden">
        <motion.div className="blob-1" animate={{ x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} />

        <div className="container-lg position-relative" style={{ maxWidth: '600px' }}>
          <motion.h2
            className="h3 fw-bold text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Let's Talk Partnership
          </motion.h2>
          <motion.p
            className="text-center opacity-90 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Share your details and our partnership team will reach out to explore opportunities.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control form-control-lg rounded-pill partner-input"
            />
            <input
              type="text"
              placeholder="Company name"
              className="form-control form-control-lg rounded-pill partner-input"
            />
            <select className="form-control form-control-lg rounded-pill partner-input">
              <option>Partnership Type</option>
              <option>Technology Partner</option>
              <option>Reseller</option>
              <option>Channel Partner</option>
              <option>Strategic Partner</option>
            </select>

            <motion.button
              type="submit"
              className="btn btn-lg btn-white text-red fw-bold rounded-pill"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Inquiry <FiArrowRight className="ms-2" />
            </motion.button>
          </motion.form>

          {submitted && (
            <motion.div
              className="text-center mt-3 text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✓ Thanks! We'll be in touch soon.
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
