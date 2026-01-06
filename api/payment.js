// api/payment.js - Payment processing endpoint

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { amount, email, planType, cardDetails, userDetails } = req.body;

    console.log('💳 Payment Request:', { email, planType, amount });

    // ============================================
    // VALIDATE INPUTS
    // ============================================
    if (!amount || !email || !planType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment fields',
      });
    }

    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cvc) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card details',
      });
    }

    // ============================================
    // VALIDATE CARD
    // ============================================

    const cardNum = cardDetails.cardNumber.replace(/\s/g, '');

    // Check card number length
    if (cardNum.length < 13 || cardNum.length > 19) {
      console.error('❌ Invalid card number length:', cardNum.length);
      return res.status(400).json({
        success: false,
        error: 'Invalid card number',
      });
    }

    // ✅ FIXED: Better expiry validation
    const month = parseInt(cardDetails.expiryMonth, 10);
    const year = parseInt(cardDetails.expiryYear, 10);

    console.log('📅 Expiry check:', { month, year });

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry date format',
      });
    }

    if (month < 1 || month > 12) {
      console.error('❌ Invalid month:', month);
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry month (must be 01-12)',
      });
    }

    // ✅ FIXED: Accept 2-digit years (00-99) as 2000-2099
    let fullYear = year;
    if (year < 100) {
      fullYear = 2000 + year;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    console.log('📅 Full year calculated:', fullYear, 'Current:', currentYear);

    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      console.error('❌ Card expired:', { fullYear, currentYear, month, currentMonth });
      return res.status(400).json({
        success: false,
        error: 'Card has expired. Please use an unexpired card.',
      });
    }

    // Check CVC
    if (!cardDetails.cvc || cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
      console.error('❌ Invalid CVC:', cardDetails.cvc?.length);
      return res.status(400).json({
        success: false,
        error: 'Invalid CVC (must be 3-4 digits)',
      });
    }

    // Check cardholder name
    if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cardholder name is required',
      });
    }

    // ============================================
    // PROCESS PAYMENT
    // ============================================

    console.log('✅ Card validation passed');
    console.log('🔄 Processing payment...');

    // TODO: In production, integrate with PayMongo or Stripe API
    // For now: simulate payment and record in database

    const paymentId = `pay_${Date.now()}`;
    const transactionId = `txn_${Date.now()}`;

    // Record payment in database (if you have payments table)
    try {
      // Optional: Save payment record
      // await supabase.from('payments').insert({
      //   id: paymentId,
      //   email,
      //   amount,
      //   plan_type: planType,
      //   card_last4: cardNum.slice(-4),
      //   status: 'succeeded',
      //   created_at: new Date().toISOString(),
      // });

      console.log('✅ Payment simulated successfully');
    } catch (dbError) {
      console.error('⚠️ Payment recorded but DB save failed:', dbError);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        transactionId,
        amount,
        currency: 'PHP',
        planType,
        email,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
        cardLast4: cardNum.slice(-4),
        cardBrand: cardNum.startsWith('4') ? 'Visa' : cardNum.startsWith('5') ? 'Mastercard' : 'Card',
      },
    });

  } catch (error) {
    console.error('❌ Payment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed',
    });
  }
}
