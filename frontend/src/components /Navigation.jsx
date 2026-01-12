import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiChevronDown, FiArrowRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo31.png';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [industriesDropdown, setIndustriesDropdown] = useState(false);
  const location = useLocation();

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
    { 
      label: 'Industries', 
      path: '#',
      submenu: [
        { label: 'Insurance', path: '/industries/insurance' },
        { label: 'Government', path: '/industries/government' },
        { label: 'Banking & Finance', path: '/industries/banking' },
        { label: 'Education', path: '/industries/education' },
      ]
    },
    { label: 'Partners', path: '/partners' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

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
          {/* Logo */}
          <Link to="/" className="navbar-brand me-auto">
            <motion.img
              src={logo}
              alt="Signatura Logo"
              height="45"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="d-none d-lg-flex align-items-center gap-1">
            {navItems.map((item) => (
              item.submenu ? (
                <div key={item.label} className="position-relative">
                  <motion.button
                    onClick={() => setIndustriesDropdown(!industriesDropdown)}
                    className="btn btn-link nav-link text-dark text-decoration-none fw-500 position-relative d-flex align-items-center gap-1"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    <motion.span
                      animate={{ rotate: industriesDropdown ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown size={16} />
                    </motion.span>
                    <motion.span
                      className="position-absolute bottom-0 start-0 bg-red"
                      style={{ height: '2px', width: '0%' }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {industriesDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="position-absolute top-100 start-0 mt-2 bg-white rounded-3 shadow-lg p-2 z-1000"
                        style={{ minWidth: '200px' }}
                        onMouseLeave={() => setIndustriesDropdown(false)}
                      >
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.path}
                            to={subitem.path}
                            className="dropdown-item d-block px-3 py-2 text-dark text-decoration-none rounded-2 fw-500 transition-all hover-bg-light"
                            onClick={() => setIndustriesDropdown(false)}
                          >
                            <motion.span
                              whileHover={{ x: 4 }}
                              className="d-flex align-items-center gap-2"
                            >
                              {subitem.label}
                              <FiArrowRight size={14} className="opacity-50" />
                            </motion.span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div key={item.path}>
                  <Link
                    to={item.path}
                    className={`btn btn-link nav-link text-decoration-none fw-500 position-relative ${
                      isActive(item.path) ? 'text-red' : 'text-dark'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    <motion.span
                      className="position-absolute bottom-0 start-0 bg-red"
                      style={{ height: '2px', width: isActive(item.path) ? '100%' : '0%' }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              )
            ))}
          </div>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2 gap-lg-3 ms-auto ms-lg-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="d-none d-md-flex align-items-center gap-2">
              <Link to="/login/owner" className="btn btn-sm btn-outline-red fw-500">
                Owner Login
              </Link>
              <Link to="/login/issuer" className="btn btn-sm btn-red text-white fw-500">
                Issuer Login
              </Link>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <button
              className="btn d-lg-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
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
                <div key={item.label}>
                  {item.submenu ? (
                    <motion.div>
                      <button
                        onClick={() => setIndustriesDropdown(!industriesDropdown)}
                        className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500 d-flex justify-content-between align-items-center"
                        whileHover={{ x: 10 }}
                      >
                        {item.label}
                        <FiChevronDown size={16} />
                      </button>
                      <AnimatePresence>
                        {industriesDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-light rounded-2 ms-3 mb-2"
                          >
                            {item.submenu.map((subitem) => (
                              <Link
                                key={subitem.path}
                                to={subitem.path}
                                className="d-block px-3 py-2 text-dark text-decoration-none fw-500 text-sm"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setIndustriesDropdown(false);
                                }}
                              >
                                {subitem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <Link
                      to={item.path}
                      className="btn btn-link w-100 text-start text-dark text-decoration-none py-2 fw-500"
                      whileHover={{ x: 10 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="d-flex gap-2 mt-3">
                <Link to="/login/owner" className="btn btn-sm btn-outline-red w-100">
                  Owner
                </Link>
                <Link to="/login/issuer" className="btn btn-sm btn-red text-white w-100">
                  Issuer
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
