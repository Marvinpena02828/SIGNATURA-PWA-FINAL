import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiLinkedin, FiYoutube, FiTwitter } from 'react-icons/fi';
import logo from '../assets/logo31.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', path: '/solutions' },
        { label: 'Industries', path: '/industries' },
        { label: 'Security', path: '/solutions' },
        { label: 'Pricing', path: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', path: '/about' },
        { label: 'Partners', path: '/partners' },
        { label: 'Contact', path: '/contact' },
        { label: 'Blog', path: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '#' },
        { label: 'Terms & Conditions', path: '#' },
        { label: 'Cookie Policy', path: '#' },
        { label: 'Security', path: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '#' },
        { label: 'API Reference', path: '#' },
        { label: 'Support Center', path: '#' },
        { label: 'Community', path: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FiFacebook, url: 'https://facebook.com/signatureph', label: 'Facebook' },
    { icon: FiLinkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiYoutube, url: 'https://youtube.com/@signatura', label: 'YouTube' },
    { icon: FiTwitter, url: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <footer className="footer bg-dark text-white py-6">
      <div className="container-xl">
        {/* Footer Content */}
        <div className="row g-4 mb-6">
          {/* Brand Section */}
          <motion.div
            className="col-lg-3 col-md-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
              <img src={logo} alt="Signatura Logo" height="35" />
              <span className="fw-bold text-white">Signatura</span>
            </Link>
            <p className="text-muted small mb-4">
              Digital identity, data security, and digital signature solutions for the modern world.
            </p>
            <div className="d-flex gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted text-decoration-none"
                  whileHover={{ scale: 1.2, color: '#dc2626' }}
                  transition={{ duration: 0.3 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, idx) => (
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
                {section.links.map((link, linkIdx) => (
                  <motion.li key={linkIdx} whileHover={{ x: 4 }}>
                    <Link
                      to={link.path}
                      className="text-muted text-decoration-none transition-all"
                    >
                      <small>{link.label}</small>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.hr
          className="border-secondary opacity-25 my-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.25 }}
          viewport={{ once: true }}
        />

        {/* Footer Bottom */}
        <motion.div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted small mb-0">
            &copy; {currentYear} Signatura. All rights reserved. | Powered by 1Knight Solutions, Inc.
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted text-decoration-none transition-all">
              <small>Status</small>
            </a>
            <a href="#" className="text-muted text-decoration-none transition-all">
              <small>System Status</small>
            </a>
            <a href="#" className="text-muted text-decoration-none transition-all">
              <small>Accessibility</small>
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
