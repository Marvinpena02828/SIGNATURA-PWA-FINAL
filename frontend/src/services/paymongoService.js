// src/services/paymongoService.js

const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Create a PayMongo Checkout Session
 * This creates a payment link that users can visit to complete payment
 */
export const createPaymentCheckout = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/payments/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        amount: userData.amount || 9900, // Default ₱99 in centavos
        description: userData.description || 'Signatura Professional Plan',
        userRole: userData.role, // 'issuer' or 'owner'
        metadata: {
          userId: userData.userId,
          planType: userData.planType || 'professional',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      checkoutUrl: data.checkoutUrl,
      sessionId: data.sessionId,
    };
  } catch (error) {
    console.error('Create Payment Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Payment Status
 * Check if a payment was successful
 */
export const verifyPayment = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return {
      success: true,
      paid: data.paid,
      paymentDetails: data.paymentDetails,
    };
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create User Account After Payment
 * This should be called after successful payment
 */
export const createAccountAfterPayment = async (userData, paymentId) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        paymentId: paymentId, // Link payment to account
        planType: userData.planType || 'professional',
      }),
    });

    if (!response.ok) {
      throw new Error('Account creation failed');
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error('Create Account Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get Payment Status from URL params
 * Useful for return pages after payment
 */
export const getPaymentStatusFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionId: params.get('session_id'),
    status: params.get('status'), // 'success', 'failed', or 'cancelled'
  };
};
