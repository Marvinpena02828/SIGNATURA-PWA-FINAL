// api/sharing.js - Document sharing API (COMPLETE VERSION WITH ALL FIXES)
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// HELPER: Get correct base URL for share links
// ============================================
const getBaseUrl = () => {
  // Priority order:
  // 1. Explicit custom domain (recommended)
  if (process.env.NEXT_PUBLIC_SHARE_URL) {
    console.log('✅ Using NEXT_PUBLIC_SHARE_URL');
    return process.env.NEXT_PUBLIC_SHARE_URL;
  }
  
  // 2. Vercel auto-generated URL
  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL;
    const withHttps = url.startsWith('http') ? url : `https://${url}`;
    console.log('✅ Using VERCEL_URL:', withHttps);
    return withHttps;
  }
  
  // 3. Development fallback
  console.log('✅ Using localhost (development)');
  return 'http://localhost:3000';
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // ============================================
      // POST: Create share link
      // ============================================
      const {
        documentId,
        ownerId,           // Optional: if frontend sends it
        senderEmail,       // Frontend sends this
        recipientEmail,
        permissions = ['view', 'download'],
        expiryDays = 7,
        requireOtp = false,
      } = req.body;

      console.log('📧 Share request received:', { 
        documentId, 
        senderEmail, 
        recipientEmail 
      });

      // ============================================
      // STEP 1: RESOLVE OWNER_ID FROM EMAIL
      // ============================================
      let resolvedOwnerId = ownerId;

      if (!resolvedOwnerId && senderEmail) {
        console.log('🔍 Looking up user by email:', senderEmail);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', senderEmail)
          .single();

        if (userError || !userData) {
          console.error('❌ User lookup failed:', userError?.message);
          return res.status(404).json({
            success: false,
            error: 'Sender user not found. Please check your email.',
          });
        }

        resolvedOwnerId = userData.id;
        console.log('✅ Found user ID:', resolvedOwnerId);
      }

      if (!resolvedOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Missing owner ID or sender email',
        });
      }

      // ============================================
      // STEP 2: VALIDATE DOCUMENT OWNERSHIP
      // ============================================
      console.log('🔐 Validating document ownership...');
      
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id, title, issuer_id')
        .eq('id', documentId)
        .eq('issuer_id', resolvedOwnerId)
        .single();

      if (docError || !document) {
        console.error('❌ Document validation failed:', docError?.message);
        return res.status(403).json({
          success: false,
          error: 'Document not found or you do not have permission to share it',
        });
      }

      console.log('✅ Document validated:', document.title);

      // ============================================
      // STEP 3: GENERATE SHARE TOKEN AND EXPIRY
      // ============================================
      const shareToken = crypto.randomBytes(32).toString('hex');
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + expiryDays);
      const expiresAt = expiresAtDate.toISOString();

      console.log('🎟️ Generated share token:', shareToken.substring(0, 10) + '...');

      // ============================================
      // STEP 4: INSERT INTO DATABASE
      // ============================================
      console.log('📝 Inserting into document_shares...');
      
      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          document_id: documentId,
          owner_id: resolvedOwnerId,        // ✅ KEY FIX: Using resolved owner_id
          recipient_email: recipientEmail,
          share_token: shareToken,
          permissions: permissions,
          require_otp: requireOtp,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert failed:', error.message);
        throw error;
      }

      console.log('✅ Share record created:', data.id);

      // ============================================
      // STEP 5: BUILD SHARE LINK (WITH CORRECT URL)
      // ============================================
      const baseUrl = getBaseUrl();
      const shareLink = `${baseUrl}/shared/${shareToken}`;

      console.log('🔗 Base URL:', baseUrl);
      console.log('📋 Share link generated:', shareLink);

      // ============================================
      // STEP 6: SEND EMAIL (OPTIONAL)
      // ============================================
      let emailSent = false;
      let emailStatus = 'Email not configured';

      try {
        emailStatus = 'Email feature coming soon';
        console.log('📧 Email sending skipped (not configured yet)');
      } catch (emailError) {
        console.error('⚠️ Email error (non-blocking):', emailError.message);
        emailStatus = 'Share created but email failed';
      }

      // ============================================
      // STEP 7: RETURN SUCCESS RESPONSE
      // ============================================
      console.log('✅ Success! Share created and ready to send');

      return res.status(201).json({
        success: true,
        data: {
          id: data.id,
          shareLink,        // ✅ CORRECT URL
          shareToken,
          documentId,
          recipientEmail,
          expiresAt: expiresAt,
          permissions,
          requireOtp,
          emailSent,
          emailStatus,
        },
      });
    } 
    else if (req.method === 'GET') {
      // ============================================
      // GET: Retrieve share details and verify validity
      // ============================================
      const { shareToken } = req.query;

      if (!shareToken) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing shareToken' 
        });
      }

      const { data: share, error: shareError } = await supabase
        .from('document_shares')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (shareError || !share) {
        return res.status(404).json({ 
          success: false,
          error: 'Share not found' 
        });
      }

      // Check if expired
      if (new Date(share.expires_at) < new Date()) {
        return res.status(403).json({ 
          success: false,
          error: 'Share link expired' 
        });
      }

      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', share.document_id)
        .single();

      return res.status(200).json({
        success: true,
        data: {
          share,
          document: doc,
          permissions: share.permissions,
        },
      });
    } 
    else if (req.method === 'PUT') {
      // ============================================
      // PUT: Update share settings (revoke, update expiry, etc)
      // ============================================
      const { id, ...updates } = req.body;

      const { data, error } = await supabase
        .from('document_shares')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        data 
      });
    } 
    else if (req.method === 'DELETE') {
      // ============================================
      // DELETE: Revoke share
      // ============================================
      const { id } = req.body;

      const { error } = await supabase
        .from('document_shares')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Share deleted',
      });
    }
    else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Sharing API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Sharing operation failed',
    });
  }
}
