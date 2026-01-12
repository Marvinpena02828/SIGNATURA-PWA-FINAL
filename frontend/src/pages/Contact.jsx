import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiArrowRight, FiMessageCircle, FiClock } from 'react-icons/fi';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactMethods = [
    {
      icon: FiMail,
      title: 'Email',
      content: 'hello@signatura.ph',
      desc: 'Response within 24 hours'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      content: '+63 (2) 1234-5678',
      desc: 'Monday - Friday, 9AM - 6PM'
    },
    {
      icon: FiMapPin,
      title: 'Address',
      content: 'Manila, Philippines',
      desc: 'Regional headquarters'
    },
    {
      icon: FiMessageCircle,
      title: 'Live Chat',
      content: 'Available 24/7',
      desc: 'Instant support'
    }
  ];

  return (
    <div className="contact-page">
      <Navigation />

      {/* Hero Section */}
      <section className="contact-hero py-6 py-lg-8 position-relative overflow-hidden bg-gradient-light">
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
              Get In <span className="text-red">Touch</span>
            </motion.h1>
            <motion.p
              className="lead text-muted mx-auto mb-0"
              style={{ maxWidth: '700px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-6 py-lg-8">
        <div className="container-xl">
          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, idx) => (
              <motion.div key={idx} variants={itemVariants} className="col-md-6 col-lg-3">
                <motion.div
                  className="p-5 rounded-4 bg-light h-100 text-center"
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="mb-4 p-3 rounded-3 bg-red bg-opacity-10 w-fit mx-auto"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <method.icon size={32} className="text-red" />
                  </motion.div>
                  <h5 className="fw-bold mb-2">{method.title}</h5>
                  <p className="text-red fw-bold mb-2">{method.content}</p>
                  <p className="text-muted small">{method.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-6 py-lg-8 bg-light">
        <div className="container-xl">
          <div className="row g-5 align-items-start">
            {/* Form */}
            <motion.div className="col-lg-6" {...fadeInUp}>
              <h2 className="display-5 fw-bold mb-4">Send us a Message</h2>

              <motion.form
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="form-label fw-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control form-control-lg rounded-3"
                    placeholder="Your name"
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg rounded-3"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control form-control-lg rounded-3"
                      placeholder="+63 (2) 1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label fw-bold mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-control form-control-lg rounded-3"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="form-label fw-bold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="form-control form-control-lg rounded-3"
                    placeholder="Tell us about your needs..."
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-lg btn-red text-white fw-bold rounded-pill"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message <FiArrowRight className="ms-2" />
                </motion.button>
              </motion.form>

              {submitted && (
                <motion.div
                  className="mt-3 alert alert-success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✓ Thank you! We'll be in touch soon.
                </motion.div>
              )}
            </motion.div>

            {/* Side Info */}
            <motion.div className="col-lg-6" {...fadeInUp}>
              <h2 className="display-5 fw-bold mb-4">Other Ways to Connect</h2>

              <div className="mb-5">
                <h5 className="fw-bold mb-3">Support Hours</h5>
                <motion.div
                  className="p-4 rounded-4 bg-white"
                  whileHover={{ y: -4 }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <FiClock size={24} className="text-red" />
                    <div>
                      <p className="mb-1 fw-bold">Monday - Friday</p>
                      <p className="text-muted mb-0">9:00 AM - 6:00 PM (PH Time)</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <FiClock size={24} className="text-red" />
                    <div>
                      <p className="mb-1 fw-bold">Saturday - Sunday</p>
                      <p className="text-muted mb-0">Limited support available</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div>
                <h5 className="fw-bold mb-3">Department Specific Contacts</h5>
                <motion.div
                  className="p-4 rounded-4 bg-white mb-3"
                  whileHover={{ y: -4 }}
                >
                  <p className="fw-bold mb-1">Sales & Partnerships</p>
                  <p className="text-muted mb-0">sales@signatura.ph</p>
                </motion.div>
                <motion.div
                  className="p-4 rounded-4 bg-white mb-3"
                  whileHover={{ y: -4 }}
                >
                  <p className="fw-bold mb-1">Technical Support</p>
                  <p className="text-muted mb-0">support@signatura.ph</p>
                </motion.div>
                <motion.div
                  className="p-4 rounded-4 bg-white"
                  whileHover={{ y: -4 }}
                >
                  <p className="fw-bold mb-1">General Inquiries</p>
                  <p className="text-muted mb-0">info@signatura.ph</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-6 py-lg-8">
        <div className="container-lg" style={{ maxWidth: '900px' }}>
          <motion.div className="text-center mb-5" {...fadeInUp}>
            <h2 className="display-4 fw-bold mb-3">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            className="accordion"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                q: 'How long does it take to get started with Signatura?',
                a: 'Most organizations are set up and operational within 2-4 weeks. Our onboarding team provides guided implementation support.'
              },
              {
                q: 'What kind of support do you provide?',
                a: 'We offer 24/7 technical support, dedicated account managers for enterprise clients, and comprehensive documentation and training.'
              },
              {
                q: 'Is Signatura compliant with my country regulations?',
                a: 'Signatura is designed to comply with international standards including GDPR, eIDAS, ESIGN, and various local regulations.'
              },
              {
                q: 'Can I integrate Signatura with my existing systems?',
                a: 'Yes! Our REST APIs and SDKs make integration straightforward. We support most common enterprise systems.'
              },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="accordion-item border-0 mb-3 bg-light rounded-3 overflow-hidden">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed fw-bold text-dark bg-light"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#faq${idx}`}
                  >
                    {item.q}
                  </button>
                </h2>
                <div id={`faq${idx}`} className="accordion-collapse collapse" data-bs-parent=".accordion">
                  <div className="accordion-body text-muted">
                    {item.a}
                  </div>
                </div>
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
            Not sure where to start?
          </motion.h2>
          <motion.p
            className="lead mb-5 opacity-90 mx-auto"
            style={{ maxWidth: '600px' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Schedule a demo with our team and see how Signatura can transform your business.
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
            Schedule Demo <FiArrowRight className="ms-2" />
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
