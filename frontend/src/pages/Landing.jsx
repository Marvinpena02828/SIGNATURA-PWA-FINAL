import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiUsers, FiCheckCircle, FiLock, FiTrendingUp, FiZap, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo31.png';

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
    primary: 'bg-signatura-red text-white hover:bg-signatura-accent',
    secondary: 'bg-gray-100 text-signatura-dark hover:bg-gray-200',
    outline: 'border-2 border-gray-300 text-signatura-dark hover:border-gray-400',
    outlineRed: 'border-2 border-signatura-red text-signatura-red hover:bg-red-50',
    ghost: 'bg-white text-signatura-red hover:bg-red-50',
  };

  const baseClasses = `relative overflow-hidden px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[variant]} ${className || ''}`;

  const ButtonComponent = to ? Link : 'button';
  const props = to ? { to } : { onClick: handleClick, disabled };

  return (
    <ButtonComponent {...props} className={baseClasses}>
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white rounded-full pointer-events-none"
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
      <span className="relative flex items-center justify-center gap-2">{children}</span>
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
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-red-200 rounded-full opacity-20"
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

// Animated Counter
const Counter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
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
    // Simulate API call
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
    <div className="bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex justify-between items-center h-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <motion.img
                src={logo}
                alt="Signatura Logo"
                className="h-10 w-auto object-contain"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>

            <div className="hidden md:flex space-x-8">
              {[
                { label: 'Features', id: 'features' },
                { label: 'How It Works', id: 'how-it-works' },
                { label: 'Security', id: 'security' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className="text-gray-600 hover:text-signatura-red font-medium transition relative group"
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-signatura-red group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login/issuer"
                  className="text-gray-600 hover:text-signatura-red font-medium transition"
                >
                  Sign In
                </Link>
              </motion.div>
              <RippleButton to="/login/issuer" variant="primary">
                Get Started <FiArrowRight className="group-hover:translate-x-1 transition" />
              </RippleButton>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-br from-white via-red-50/30 to-white">
        <FloatingParticles />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-200 to-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeInUp}>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-signatura-dark mb-6 leading-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Verify Credentials with
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-signatura-red via-pink-500 to-signatura-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Confidence
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Issue, store, and verify digital documents with cryptographic signatures. Give your users control over who can access their credentials.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
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
                <motion.div key={idx} variants={itemVariants} className="group">
                  <motion.div
                    className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-signatura-red to-signatura-accent mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-gray-600 group-hover:text-signatura-dark transition">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-signatura-red/20 to-pink-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-2xl p-8 grid grid-cols-3 gap-4">
                {[FiLock, FiShield, FiUsers].map((Icon, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 h-32 flex items-center justify-center text-gray-400 hover:text-signatura-red transition cursor-pointer group"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Icon className="text-4xl group-hover:scale-125 transition-transform duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to issue, manage, and verify digital credentials securely.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                className="relative group"
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-signatura-red/0 to-pink-500/0 rounded-xl blur-xl transition-all duration-300 group-hover:opacity-100"
                  animate={{
                    opacity: hoveredFeature === idx ? 0.2 : 0,
                  }}
                />
                <motion.div
                  className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100/50"
                  whileHover={{ y: -8 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="text-2xl text-signatura-red" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-signatura-dark mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple workflow for issuance, management, and verification.
            </p>
          </motion.div>

          {/* Main Steps */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
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
              <motion.div key={idx} variants={itemVariants} className="relative">
                <motion.div
                  className="bg-gradient-to-br from-signatura-red to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-bold mb-4 shadow-lg"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {step.num}
                </motion.div>
                {idx < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-7 left-full w-8 h-0.5 bg-gradient-to-r from-signatura-red to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                )}
                <h3 className="text-xl font-bold text-signatura-dark mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Steps */}
          <motion.div
            className="bg-gradient-to-r from-gray-50 to-red-50 rounded-2xl p-8 md:p-12 border border-gray-200/30"
            {...fadeInUp}
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Digital Signing', desc: 'Documents are signed with issuer\'s private key using industry-standard algorithms.' },
                { title: 'Consent-Based Access', desc: 'Owners explicitly approve each verification request with granular permission controls.' },
                { title: 'Offline Verification', desc: 'Verifiers can validate credentials offline using the issuer\'s public key.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <div className="flex items-center mb-3">
                    <motion.span
                      className="bg-gradient-to-br from-signatura-red to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-lg"
                      whileHover={{ scale: 1.3 }}
                    >
                      ✓
                    </motion.span>
                    <h4 className="font-bold text-signatura-dark group-hover:text-signatura-red transition">{item.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm ml-11 group-hover:text-gray-700 transition">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 sm:py-32 bg-gradient-to-br from-signatura-dark via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-signatura-red/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Enterprise Security
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with security best practices from day one.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12"
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
              <motion.div key={idx} variants={itemVariants}>
                <h3 className="text-2xl font-bold mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <motion.li
                      key={itemIdx}
                      className="flex items-start gap-3 group"
                      whileHover={{ x: 8 }}
                    >
                      <motion.div
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-signatura-red to-pink-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-sm">✓</span>
                      </motion.div>
                      <span className="text-gray-300 group-hover:text-white transition">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-100/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. Pay only for what you use.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
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
                whileHover={{ scale: 1.02, y: -8 }}
                className={`relative rounded-xl p-8 border transition-all duration-300 ${
                  plan.popular
                    ? 'border-signatura-red bg-gradient-to-br from-red-50 to-pink-50 shadow-2xl'
                    : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <span className="bg-gradient-to-r from-signatura-red to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      POPULAR
                    </span>
                  </motion.div>
                )}

                <h3 className="text-2xl font-bold text-signatura-dark mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{plan.desc}</p>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-signatura-dark">{plan.price}</p>
                  {plan.period && <p className="text-gray-600 text-sm">{plan.period}</p>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <motion.li
                      key={featureIdx}
                      className="flex items-center text-gray-700 text-sm"
                      whileHover={{ x: 4 }}
                    >
                      <FiCheckCircle className="mr-3 text-green-600 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <RippleButton
                  to={plan.popular ? '/login/issuer' : undefined}
                  onClick={!plan.popular ? () => alert(`${plan.name} plan selected`) : undefined}
                  variant={plan.variant}
                  className="w-full"
                >
                  {plan.popular ? 'Start Free Trial' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </RippleButton>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-signatura-red via-pink-500 to-signatura-accent text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Stay Updated
          </motion.h2>
          <motion.p
            className="text-white/80 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get the latest news on credential verification and digital signatures.
          </motion.p>

          <motion.form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
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
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
              disabled={isSubscribing}
            />
            <RippleButton
              variant="ghost"
              onClick={handleNewsletterSubmit}
              disabled={isSubscribing}
              className="px-6 py-3"
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
              className="mt-4 text-green-100 font-medium"
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
      <section className="py-20 sm:py-32 bg-white relative overflow-hidden">
        <div className="absolute -top-96 right-0 w-96 h-96 bg-red-100/30 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join hundreds of organizations using Signatura to issue and verify credentials securely.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
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
      <footer className="bg-signatura-dark text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
              <motion.div key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <h4 className="text-white font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <motion.li key={linkIdx} whileHover={{ x: 4 }}>
                      <button
                        onClick={link.action}
                        className="hover:text-white transition cursor-pointer"
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
            className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center space-x-2 mb-4 sm:mb-0 hover:opacity-80 transition">
              <img src={logo} alt="Signatura Logo" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm">&copy; 2025 Signatura. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
