import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiLoader, FiLock } from 'react-icons/fi';
import logo from '../assets/logo31.png';

const paymongoPublicKey = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || 'pk_test_your_key_here';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Get data from signup
  const { role, email, fullName, organizationName, password, planType = 'professional' } = state;

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState({});

  // Plan pricing
  const plans = {
    free: { name: 'Starter', price: 0, period: 'Free' },
    professional: { name: 'Professional', price: 99, period: 'per month' },
    enterprise: { name: 'Enterprise', price: 499, period: 'per month' },
  };

  const selectedPlan = plans[planType] || plans.professional;

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 13) {
      newErrors.cardNumber = 'Valid card number required';
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      newErrors.expiry = 'Valid expiry date required';
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Valid CVC required';
    }
    if (!cardDetails.cardholderName?.trim()) {
      newErrors.cardholderName = 'Cardholder name required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // For demo/testing: simulate payment
      if (selectedPlan.price === 0) {
        // Free plan - skip payment
        await createUserAndRedirect();
        return;
      }

      // Create payment intent
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlan.price * 100, // in cents
          email,
          planType,
          cardDetails,
          userDetails: {
            email,
            fullName,
            organizationName,
            role,
          },
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Payment failed');
      }

      // If payment successful
      if (paymentData.success) {
        // Create user account
        await createUserAndRedirect();
      }
    } catch (error) {
      toast.error(error.message || 'Payment processing failed');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createUserAndRedirect = async () => {
    try {
      // Create user account after successful payment
      const signupResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          fullName,
          organizationName: organizationName || null,
          role,
          planType,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Account creation failed');
      }

      toast.success('✓ Account created! Welcome to Signatura!');
      
      // Redirect to login with email
      navigate(`/login/${role}?email=${email}`);
    } catch (error) {
      toast.error(error.message || 'Account creation failed');
      console.error('Signup error:', error);
    }
  };

  // Check if coming from valid signup flow
  useEffect(() => {
    if (!email || !role) {
      toast.error('Invalid payment flow. Redirecting...');
      navigate('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 bg-white rounded-full p-4 shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center"
        >
          <img src={logo} alt="Signatura Logo" height="50" />
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-white mb-8 hover:opacity-80 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-400 p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
            <p className="opacity-90 text-sm">Secure checkout powered by PayMongo</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Plan Summary */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">{selectedPlan.name} Plan</span>
                <span className="text-2xl font-bold text-red-600">
                  ₱{selectedPlan.price}
                </span>
              </div>
              <p className="text-xs text-gray-500">{selectedPlan.period}</p>
              
              {/* Plan Features */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <FiCheck size={16} className="text-green-600" />
                  <span>Unlimited documents</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <FiCheck size={16} className="text-green-600" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <FiCheck size={16} className="text-green-600" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>

            {/* User Info Display */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Account:</span> {fullName} ({role})
              </p>
              <p className="text-xs text-blue-700 mt-1">
                <span className="font-semibold">Email:</span> {email}
              </p>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={cardDetails.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.cardholderName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                />
                {errors.cardholderName && (
                  <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4111 1111 1111 1111"
                  maxLength="19"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">💳 Test: 4111 1111 1111 1111</p>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="expiryMonth"
                      value={cardDetails.expiryMonth}
                      onChange={handleInputChange}
                      placeholder="MM"
                      maxLength="2"
                      className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        errors.expiry ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                    />
                    <span className="flex items-center text-gray-400">/</span>
                    <input
                      type="text"
                      name="expiryYear"
                      value={cardDetails.expiryYear}
                      onChange={handleInputChange}
                      placeholder="YY"
                      maxLength="2"
                      className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        errors.expiry ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                    />
                  </div>
                  {errors.expiry && (
                    <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.cvc ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                    }`}
                  />
                  {errors.cvc && (
                    <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>
                  )}
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FiLock size={16} className="text-green-600" />
                <p className="text-xs text-green-700">
                  Your payment is secure and encrypted
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FiLoader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Payment
                  </>
                )}
              </button>

              {/* Test Credentials */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-xs font-semibold text-gray-700 mb-2">📝 Test Card Details:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Card:</span> 4111 1111 1111 1111</p>
                  <p><span className="font-medium">Expiry:</span> 12/25</p>
                  <p><span className="font-medium">CVC:</span> 123</p>
                </div>
              </div>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By completing payment, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
