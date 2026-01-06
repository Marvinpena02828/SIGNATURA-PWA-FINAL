// backend/routes/payments.js
// Example: Express.js Payment Routes with PayMongo Integration

import express from 'express';
import axios from 'axios';
import { nanoid } from 'nanoid';

const router = express.Router();

// PayMongo API Configuration
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Auth header for PayMongo
const paymongoAuth = {
  headers: {
    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`,
  },
};

/**
 * POST /api/payments/create-checkout
 * Create a PayMongo Checkout Session
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { email, name, amount, description, userRole, metadata } = req.body;

    // Validate input
    if (!email || !amount || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment data',
      });
    }

    // If free plan, don't create payment
    if (amount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Free plan selected',
        sessionId: 'free-plan-' + nanoid(),
      });
    }

    // Create PayMongo Checkout Session
    const checkoutData = {
      data: {
        attributes: {
          amount: amount, // Amount in centavos (e.g., 9900 = ₱99)
          currency: 'PHP',
          description: description || 'Signatura Subscription',
          line_items: [
            {
              currency: 'PHP',
              amount: amount,
              description: description || 'Signatura Subscription',
              quantity: 1,
              name: name || 'Signatura User',
            },
          ],
          payment_method_types: ['card', 'gcash', 'paymaya'],
          success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-failed?session_id={CHECKOUT_SESSION_ID}`,
          metadata: {
            userRole,
            userEmail: email,
            userName: name,
            ...metadata,
          },
          receipt_email: email,
          statement_descriptor: 'SIGNATURA',
          reference_number: nanoid(12),
        },
      },
    };

    // Call PayMongo API
    const response = await axios.post(
      `${PAYMONGO_API_URL}/checkout_sessions`,
      checkoutData,
      paymongoAuth
    );

    const session = response.data.data;

    // Save session info to database (optional)
    // await PaymentSession.create({
    //   sessionId: session.id,
    //   email,
    //   amount,
    //   status: 'pending',
    //   userRole,
    //   metadata,
    // });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.attributes.checkout_url,
      amount: amount,
      currency: 'PHP',
    });
  } catch (error) {
    console.error('PayMongo Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/verify
 * Verify payment status
 */
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // If free plan session
    if (sessionId.startsWith('free-plan-')) {
      return res.status(200).json({
        success: true,
        paid: true,
        paymentDetails: {
          id: sessionId,
          type: 'free',
        },
      });
    }

    // Get checkout session from PayMongo
    const sessionResponse = await axios.get(
      `${PAYMONGO_API_URL}/checkout_sessions/${sessionId}`,
      paymongoAuth
    );

    const session = sessionResponse.data.data;
    const paid = session.attributes.payment_intent?.attributes?.status === 'succeeded';

    if (paid) {
      // Get payment details
      const paymentId = session.attributes.payment_intent?.id;

      // Update session in database (optional)
      // await PaymentSession.findOneAndUpdate(
      //   { sessionId },
      //   { status: 'paid', paymentId },
      // );

      return res.status(200).json({
        success: true,
        paid: true,
        paymentDetails: {
          id: paymentId,
          amount: session.attributes.amount,
          currency: session.attributes.currency,
          description: session.attributes.description,
          metadata: session.attributes.metadata,
          createdAt: session.attributes.created_at,
        },
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      message: 'Payment not yet completed',
    });
  } catch (error) {
    console.error('Verify Payment Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/webhook
 * PayMongo Webhook Handler
 * Configure this URL in PayMongo Dashboard: https://dashboard.paymongo.com
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paymongo-signature'];
    const body = req.body.toString('utf8');

    // Verify signature (recommended)
    // const computed = crypto
    //   .createHmac('sha256', PAYMONGO_SECRET_KEY)
    //   .update(body)
    //   .digest('base64');
    // if (signature !== computed) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const event = JSON.parse(body);

    if (event.type === 'payment.success') {
      const paymentData = event.data.attributes;
      console.log('Payment Success:', paymentData);

      // Handle successful payment
      // Update database, send email, etc.
    } else if (event.type === 'payment.failed') {
      const paymentData = event.data.attributes;
      console.log('Payment Failed:', paymentData);

      // Handle failed payment
    } else if (event.type === 'checkout.session.expired') {
      const sessionData = event.data.attributes;
      console.log('Session Expired:', sessionData);

      // Handle expired session
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/payments/status/:sessionId
 * Get payment status by session ID
 */
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // Get session from PayMongo
    const response = await axios.get(
      `${PAYMONGO_API_URL}/checkout_sessions/${sessionId}`,
      paymongoAuth
    );

    const session = response.data.data;

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      status: session.attributes.payment_intent?.attributes?.status || 'pending',
      amount: session.attributes.amount,
      currency: session.attributes.currency,
      createdAt: session.attributes.created_at,
      expiresAt: session.attributes.expires_at,
      metadata: session.attributes.metadata,
    });
  } catch (error) {
    console.error('Get Status Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
    });
  }
});

export default router;

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Install PayMongo: npm install paymongo-js axios
 *
 * 2. Add to your main server file:
 *    import paymentRoutes from './routes/payments.js';
 *    app.use('/api/payments', paymentRoutes);
 *
 * 3. Set environment variables:
 *    PAYMONGO_PUBLIC_KEY=your_public_key
 *    PAYMONGO_SECRET_KEY=your_secret_key
 *    FRONTEND_URL=http://localhost:5173 (or your actual frontend URL)
 *
 * 4. Get your keys from: https://dashboard.paymongo.com/settings/developer
 *
 * 5. PayMongo Payment Methods Available:
 *    - Credit Card (Visa, Mastercard)
 *    - GCash
 *    - PayMaya
 *    - Bank Transfers (via Over-the-Counter)
 */
