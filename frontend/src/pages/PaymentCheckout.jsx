// src/pages/PaymentCheckout.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { createPaymentCheckout } from '../services/paymongoService';
import '../styles/PaymentCheckout.css';

export default function PaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: location.state?.role || 'issuer',
    planType: location.state?.planType || 'professional',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine amount based on plan
      const amounts = {
        free: 0,
        professional: 9900, // ₱99 in centavos
        enterprise: 0, // Custom pricing
      };

      const amount = amounts[formData.planType] || 9900;

      // If free plan, create account directly
      if (amount === 0) {
        navigate('/login/issuer', {
          state: {
            email: formData.email,
            message: 'Account created successfully! Please log in.',
          },
        });
        return;
      }

      // Create payment checkout for paid plans
      const result = await createPaymentCheckout({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        planType: formData.planType,
        amount: amount,
        description: `Signatura ${formData.planType} Plan`,
      });

      if (result.success) {
        // Store user data temporarily
        sessionStorage.setItem('pendingUserData', JSON.stringify({
          ...formData,
          sessionId: result.sessionId,
        }));

        // Redirect to PayMongo checkout
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const planPrice = {
    free: 0,
    professional: 99,
    enterprise: 'Custom',
  };

  return (
    <div className="payment-checkout min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.div
              className="checkout-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="checkout-header mb-5">
                <h1 className="display-5 fw-bold mb-3">Create Your Account</h1>
                <p className="lead text-muted">
                  {formData.planType === 'free'
                    ? 'Get started with Signatura for free'
                    : `Start your ${formData.planType} plan for ₱${planPrice[formData.planType]}/month`}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="alert alert-danger d-flex align-items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiAlertCircle size={24} />
                  <div>
                    <strong>Error!</strong>
                    <p className="mb-0">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleCheckout} className="checkout-form">
                {/* Name Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${validationErrors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Juan Dela Cruz"
                    disabled={loading}
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback d-block">{validationErrors.name}</div>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${validationErrors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="juan@example.com"
                    disabled={loading}
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback d-block">{validationErrors.email}</div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {validationErrors.password && (
                    <div className="invalid-feedback d-block">{validationErrors.password}</div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {validationErrors.confirmPassword && (
                    <div className="invalid-feedback d-block">{validationErrors.confirmPassword}</div>
                  )}
                </div>

                {/* Plan Summary */}
                <motion.div
                  className="plan-summary p-4 mb-4 rounded-3 bg-light border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2">
                        <FiCheckCircle className="text-success" size={20} />
                        <span>
                          <strong>Plan:</strong> {formData.planType.charAt(0).toUpperCase() + formData.planType.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <strong>Amount:</strong>{' '}
                      {formData.planType === 'free' ? (
                        <span className="text-success">Free</span>
                      ) : (
                        <span>₱{planPrice[formData.planType]}/month</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Terms Checkbox */}
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms"
                    defaultChecked
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the{' '}
                    <a href="#" className="text-decoration-none">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-decoration-none">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <FiLoader size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {formData.planType === 'free' ? 'Create Free Account' : 'Proceed to Payment'}
                      <FiArrowRight />
                    </>
                  )}
                </motion.button>

                {/* Back Button */}
                <motion.button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="btn btn-outline-secondary w-100 mt-3 py-3"
                >
                  Back
                </motion.button>
              </form>

              {/* Security Note */}
              <motion.div
                className="security-note mt-4 p-3 rounded-2 bg-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-muted small mb-0">
                  🔒 Your payment is secured by PayMongo. We never store your credit card information.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
