// pages/api/payment.js or backend/routes/payment.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    // Validate required fields
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
    // VALIDATE CARD (Basic validation)
    // ============================================

    // Remove spaces from card number
    const cardNum = cardDetails.cardNumber.replace(/\s/g, '');

    // Check card number length
    if (cardNum.length < 13 || cardNum.length > 19) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card number',
      });
    }

    // Check expiry
    const month = parseInt(cardDetails.expiryMonth);
    const year = parseInt(cardDetails.expiryYear);
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Last 2 digits
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry month',
      });
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return res.status(400).json({
        success: false,
        error: 'Card has expired',
      });
    }

    // Check CVC
    if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CVC',
      });
    }

    // ============================================
    // PROCESS PAYMENT
    // ============================================

    console.log('🔄 Processing payment...');

    // TODO: In production, integrate with PayMongo API
    // For testing: accept all valid card details

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create payment record
    const paymentId = `pay_${Date.now()}`;
    const transactionId = `txn_${Date.now()}`;

    console.log('✅ Payment processed:', paymentId);

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
        // Masked card info for security
        cardLast4: cardNum.slice(-4),
        cardBrand: cardNum.startsWith('4') ? 'Visa' : 'Mastercard',
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
