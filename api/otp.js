// api/otp.js - OTP generation and verification
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { action, email, documentId, otp } = req.body;

      if (action === 'send') {
        // Generate OTP
        const newOTP = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await supabase.from('otp_tokens').insert({
          email,
          document_id: documentId,
          code: newOTP,
          expires_at: expiresAt.toISOString(),
          used: false,
        });

        // TODO: Send OTP via email service
        console.log(`OTP for ${email}: ${newOTP}`);

        return res.status(200).json({
          success: true,
          message: 'OTP sent to email',
          // For testing: otp: newOTP
        });
      } 
      else if (action === 'verify') {
        // Verify OTP
        const { data: otpRecord } = await supabase
          .from('otp_tokens')
          .select('*')
          .eq('code', otp)
          .eq('email', email)
          .eq('document_id', documentId)
          .eq('used', false)
          .single();

        if (!otpRecord) {
          return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
          return res.status(400).json({ error: 'OTP expired' });
        }

        // Mark as used
        await supabase
          .from('otp_tokens')
          .update({ used: true })
          .eq('id', otpRecord.id);

        // Generate access token
        const accessToken = crypto.randomBytes(32).toString('hex');
        await supabase.from('access_tokens').insert({
          token: accessToken,
          document_id: documentId,
          email,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

        return res.status(200).json({
          success: true,
          accessToken,
          expiresIn: 86400,
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('OTP error:', error);
    return res.status(500).json({
      error: error.message || 'OTP operation failed',
    });
  }
}
