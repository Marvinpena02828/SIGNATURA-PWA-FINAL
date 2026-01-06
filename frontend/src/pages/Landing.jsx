import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiUsers, FiCheckCircle, FiLock, FiTrendingUp, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import logo from '../assets/logo31.png'; // Place logo31.png in src/assets/ and rename to logo.png

export default function Landing() {
  const [email, setEmail] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Updated to use actual image */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Signatura Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-signatura-dark transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-signatura-dark transition">How It Works</a>
              <a href="#security" className="text-gray-600 hover:text-signatura-dark transition">Security</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login/issuer"
                className="text-gray-600 hover:text-signatura-dark font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/login/issuer"
                className="bg-signatura-red text-white px-6 py-2 rounded-lg font-medium hover:bg-signatura-accent transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeInUp}>
            <h1 className="text-5xl sm:text-6xl font-bold text-signatura-dark mb-6 leading-tight">
              Verify Credentials with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-signatura-red to-signatura-accent"> Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Issue, store, and verify digital documents with cryptographic signatures. Give your users control over who can access their credentials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/login/issuer"
                className="group bg-signatura-red text-white px-8 py-4 rounded-lg font-semibold hover:bg-signatura-accent transition inline-flex items-center justify-center"
              >
                For Issuers <FiArrowRight className="ml-2 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/login/owner"
                className="group bg-gray-100 text-signatura-dark px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition inline-flex items-center justify-center"
              >
                For Document Owners <FiArrowRight className="ml-2 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div>
                <div className="text-2xl font-bold text-signatura-red">100%</div>
                <p className="text-gray-600">Privacy Control</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-signatura-red">256-bit</div>
                <p className="text-gray-600">Encryption</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-signatura-red">Instant</div>
                <p className="text-gray-600">Verification</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-1 shadow-2xl"
            {...fadeInUp}
          >
            <div className="bg-gray-900 rounded-2xl p-8 grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-center justify-center text-gray-400">
                <FiLock className="text-3xl" />
              </div>
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-center justify-center text-gray-400">
                <FiShield className="text-3xl" />
              </div>
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-center justify-center text-gray-400">
                <FiUsers className="text-3xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to issue, manage, and verify digital credentials securely.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiShield className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Cryptographic Signatures</h3>
              <p className="text-gray-600">
                Every document is digitally signed and can be verified offline. Your credentials are tamper-proof.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Owner-Controlled Access</h3>
              <p className="text-gray-600">
                Document owners have complete control. Grant or revoke verification access anytime.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiLock className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Selective disclosure means sharing only what's necessary. Your data stays private.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiTrendingUp className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Complete Audit Trail</h3>
              <p className="text-gray-600">
                Track every verification event. Know exactly who accessed your documents and when.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiZap className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Instant Issuance</h3>
              <p className="text-gray-600">
                Issue credentials in seconds. No paperwork, no delays. Completely digital.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition" {...fadeInUp}>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiCheckCircle className="text-2xl text-signatura-red" />
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-2">Simple Verification</h3>
              <p className="text-gray-600">
                Verifiers get instant confirmation. No more waiting for credential validation.
              </p>
            </motion.div>
          </div>
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

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div className="relative" {...fadeInUp}>
              <div className="bg-signatura-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-3">Issuance</h3>
              <p className="text-gray-600 mb-4">
                Issuers create and cryptographically sign documents. Recipients receive and store them securely.
              </p>
              <div className="flex items-center text-signatura-red font-medium">
                <FiArrowRight />
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="relative" {...fadeInUp}>
              <div className="bg-signatura-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-3">Request</h3>
              <p className="text-gray-600 mb-4">
                Verifiers request permission to access a document. The owner receives and reviews the request.
              </p>
              <div className="flex items-center text-signatura-red font-medium">
                <FiArrowRight />
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="relative" {...fadeInUp}>
              <div className="bg-signatura-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-signatura-dark mb-3">Verification</h3>
              <p className="text-gray-600 mb-4">
                Owner grants access with fine-grained control. Verifier gets instant cryptographic proof.
              </p>
            </motion.div>
          </div>

          {/* Detailed Steps */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-signatura-dark mb-3 flex items-center">
                  <span className="bg-red-100 text-signatura-red w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Digital Signing
                </h4>
                <p className="text-gray-600 text-sm">Documents are signed with issuer's private key using industry-standard algorithms.</p>
              </div>
              <div>
                <h4 className="font-bold text-signatura-dark mb-3 flex items-center">
                  <span className="bg-red-100 text-signatura-red w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Consent-Based Access
                </h4>
                <p className="text-gray-600 text-sm">Owners explicitly approve each verification request with granular permission controls.</p>
              </div>
              <div>
                <h4 className="font-bold text-signatura-dark mb-3 flex items-center">
                  <span className="bg-red-100 text-signatura-red w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">✓</span>
                  Offline Verification
                </h4>
                <p className="text-gray-600 text-sm">Verifiers can validate credentials offline using the issuer's public key.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 sm:py-32 bg-signatura-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Enterprise Security
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with security best practices from day one.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <h3 className="text-2xl font-bold mb-4">What We Protect</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>End-to-end encryption for all documents</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>SHA-256 hashing for document integrity</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>Ed25519 signatures for authenticity</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>Rate limiting and DDoS protection</span>
                </li>
              </ul>
            </motion.div>

            <motion.div {...fadeInUp}>
              <h3 className="text-2xl font-bold mb-4">Compliance</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>GDPR compliant data handling</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>Local data residency options</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>Complete audit logs</span>
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="mr-3 text-signatura-red" />
                  <span>Right to erasure support</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-signatura-dark mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. Pay only for what you use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <motion.div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition" {...fadeInUp}>
              <h3 className="text-2xl font-bold text-signatura-dark mb-2">Starter</h3>
              <p className="text-gray-600 mb-4">For small teams</p>
              <p className="text-4xl font-bold text-signatura-dark mb-6">Free</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Up to 10 documents/month
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  5 verification requests
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Basic audit logs
                </li>
              </ul>
              <button className="w-full border-2 border-gray-300 text-signatura-dark py-2 rounded-lg font-medium hover:border-gray-400 transition">
                Get Started
              </button>
            </motion.div>

            {/* Professional */}
            <motion.div className="border-2 border-signatura-red rounded-xl p-8 bg-red-50 transform scale-105" {...fadeInUp}>
              <div className="bg-signatura-red text-white w-fit px-3 py-1 rounded-full text-sm font-medium mb-4">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-signatura-dark mb-2">Professional</h3>
              <p className="text-gray-600 mb-4">For growing businesses</p>
              <p className="text-4xl font-bold text-signatura-dark mb-1">₱99</p>
              <p className="text-gray-600 text-sm mb-6">/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Unlimited documents
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Unlimited requests
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Priority support
                </li>
              </ul>
              <button className="w-full bg-signatura-red text-white py-2 rounded-lg font-medium hover:bg-signatura-accent transition">
                Start Free Trial
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition" {...fadeInUp}>
              <h3 className="text-2xl font-bold text-signatura-dark mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-4">For large organizations</p>
              <p className="text-4xl font-bold text-signatura-dark mb-6">Custom</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Custom volume pricing
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-600">
                  <FiCheckCircle className="mr-3 text-green-600" />
                  SLA guarantee
                </li>
              </ul>
              <button className="w-full border-2 border-signatura-red text-signatura-red py-2 rounded-lg font-medium hover:bg-red-50 transition">
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-signatura-red to-signatura-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 className="text-4xl sm:text-5xl font-bold mb-6" {...fadeInUp}>
            Ready to Get Started?
          </motion.h2>
          <motion.p className="text-xl text-red-100 mb-8" {...fadeInUp}>
            Join hundreds of organizations using Signatura to issue and verify credentials securely.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row justify-center gap-4" {...fadeInUp}>
            <Link
              to="/login/issuer"
              className="group bg-white text-signatura-red px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition inline-flex items-center justify-center"
            >
              Start Issuing <FiArrowRight className="ml-2 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/login/owner"
              className="bg-signatura-accent text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Manage Credentials
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-signatura-dark text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#security" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            {/* Footer Logo - Updated to use actual image */}
            <Link to="/" className="flex items-center space-x-2 mb-4 sm:mb-0">
              <img 
                src={logo} 
                alt="Signatura Logo" 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm">&copy; 2025 Signatura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
