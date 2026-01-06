// src/pages/PaymentResult.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { verifyPayment, createAccountAfterPayment } from '../services/paymongoService';
import '../styles/PaymentCheckout.css';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const paymentStatus = searchParams.get('status');

      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid payment session');
        return;
      }

      try {
        // Verify payment with backend
        const verifyResult = await verifyPayment(sessionId);

        if (!verifyResult.success) {
          setStatus('error');
          setMessage('Failed to verify payment. Please contact support.');
          return;
        }

        // Get pending user data from session storage
        const pendingUserData = JSON.parse(
          sessionStorage.getItem('pendingUserData') || '{}'
        );

        if (verifyResult.paid) {
          // Payment successful - create account
          const accountResult = await createAccountAfterPayment(
            pendingUserData,
            verifyResult.paymentDetails?.id
          );

          if (accountResult.success) {
            setStatus('success');
            setMessage('Payment successful! Your account has been created.');
            setDetails({
              email: pendingUserData.email,
              plan: pendingUserData.planType,
            });

            // Clear session storage
            sessionStorage.removeItem('pendingUserData');

            // Redirect to login after 3 seconds
            setTimeout(() => {
              navigate('/login/issuer', {
                state: {
                  email: pendingUserData.email,
                  message: 'Account created! Please log in with your credentials.',
                },
              });
            }, 3000);
          } else {
            setStatus('error');
            setMessage(
              accountResult.error || 'Failed to create account after payment'
            );
            setDetails({
              hint: 'Your payment was successful. Please contact support to activate your account.',
            });
          }
        } else {
          setStatus('failed');
          setMessage('Payment was not completed');
          setDetails({
            hint: 'Please try again or contact support if you have any issues.',
          });
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support.');
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="payment-result min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <motion.div
              className="result-container text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Loading State */}
              {status === 'loading' && (
                <>
                  <motion.div
                    className="result-icon mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FiLoader size={64} className="text-primary" />
                  </motion.div>
                  <h2 className="h3 fw-bold mb-3">Processing Payment</h2>
                  <p className="text-muted">Please wait while we verify your payment...</p>
                </>
              )}

              {/* Success State */}
              {status === 'success' && (
                <>
                  <motion.div
                    className="result-icon mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <FiCheckCircle size={64} className="text-success" />
                  </motion.div>
                  <h2 className="h3 fw-bold mb-3">✓ Payment Successful!</h2>
                  <p className="text-muted mb-4">{message}</p>

                  <motion.div
                    className="alert alert-success p-4 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="mb-2">
                      <strong>Account Details:</strong>
                    </p>
                    <p className="mb-1">Email: <code>{details?.email}</code></p>
                    <p className="mb-0">Plan: <strong>{details?.plan}</strong></p>
                  </motion.div>

                  <p className="text-muted small mb-4">
                    Redirecting to login in a few seconds...
                  </p>

                  <motion.button
                    onClick={() => navigate('/login/issuer')}
                    className="btn btn-primary btn-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Go to Login <FiArrowLeft className="ms-2" style={{ transform: 'scaleX(-1)' }} />
                  </motion.button>
                </>
              )}

              {/* Failed State */}
              {status === 'failed' && (
                <>
                  <motion.div
                    className="result-icon mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <FiXCircle size={64} className="text-warning" />
                  </motion.div>
                  <h2 className="h3 fw-bold mb-3">Payment Incomplete</h2>
                  <p className="text-muted mb-4">{message}</p>
                  <p className="text-muted small mb-4">{details?.hint}</p>

                  <div className="d-flex gap-2 justify-content-center">
                    <motion.button
                      onClick={() => navigate(-1)}
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/')}
                      className="btn btn-outline-secondary"
                      whileHover={{ scale: 1.05 }}
                    >
                      Back Home
                    </motion.button>
                  </div>
                </>
              )}

              {/* Error State */}
              {status === 'error' && (
                <>
                  <motion.div
                    className="result-icon mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <FiXCircle size={64} className="text-danger" />
                  </motion.div>
                  <h2 className="h3 fw-bold mb-3">⚠️ Error</h2>
                  <p className="text-muted mb-4">{message}</p>
                  <p className="text-muted small mb-4">{details?.hint}</p>

                  <p className="alert alert-info">
                    <strong>Need Help?</strong> Contact our support team at support@signatura.ph
                  </p>

                  <div className="d-flex gap-2 justify-content-center">
                    <motion.button
                      onClick={() => navigate('/')}
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                    >
                      Back Home
                    </motion.button>
                    <motion.button
                      onClick={() => window.location.href = 'mailto:support@signatura.ph'}
                      className="btn btn-outline-secondary"
                      whileHover={{ scale: 1.05 }}
                    >
                      Contact Support
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
