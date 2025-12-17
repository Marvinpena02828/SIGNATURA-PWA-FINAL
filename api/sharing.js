// api/sharing.js - Document sharing with time limits and permissions (FIXED FOR SUPABASE)
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      // Create share link
      // ============================================
      const {
        documentId,
        ownerId, // May come from frontend
        senderEmail, // NEW: Frontend sends email instead of ID
        recipientEmail,
        permissions = ['view', 'download'],
        expiryDays = 7,
        requireOtp = false,
      } = req.body;

      // ============================================
      // STEP 1: Resolve owner_id from email if needed
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
          console.error('❌ User not found:', userError);
          return res.status(404).json({
            success: false,
            error: 'Sender user not found',
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
      // STEP 2: Validate document ownership
      // ============================================
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('issuer_id', resolvedOwnerId)
        .single();

      if (docError || !document) {
        console.error('❌ Document not found or not owned:', docError);
        return res.status(403).json({
          success: false,
          error: 'Document not found or you do not have permission to share it',
        });
      }

      // ============================================
      // STEP 3: Generate share link
      // ============================================
      const shareToken = crypto.randomBytes(32).toString('hex');
      const expiresAtDate = new Date();
      expiresAtDate.setDate(expiresAtDate.getDate() + expiryDays);
      const expiresAt = expiresAtDate.toISOString();

      console.log('📝 Creating share:', {
        documentId,
        ownerId: resolvedOwnerId,
        recipientEmail,
        expiresAt,
        requireOtp,
      });

      // ============================================
      // STEP 4: Insert into database
      // ============================================
      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          document_id: documentId,
          owner_id: resolvedOwnerId, // ✅ THE KEY FIX
          recipient_email: recipientEmail,
          share_token: shareToken,
          permissions,
          require_otp: requireOtp,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      // ============================================
      // STEP 5: Send email (optional)
      // ============================================
      let emailSent = false;
      let emailStatus = 'Email not configured';

      try {
        emailSent = await sendShareEmail({
          recipientEmail,
          senderEmail: senderEmail || 'noreply@signatura.app',
          documentTitle: document.title,
          shareLink: `${process.env.VERCEL_URL || 'http://localhost:3000'}/shared/${shareToken}`,
          expiresAt,
          requireOtp,
        });

        emailStatus = emailSent 
          ? `Email sent to ${recipientEmail}` 
          : 'Email could not be sent';
      } catch (emailError) {
        console.error('⚠️ Email error (non-blocking):', emailError);
        emailStatus = 'Share created but email failed';
        // Don't fail - the share is still created
      }

      // ============================================
      // STEP 6: Return success
      // ============================================
      console.log('✅ Share created successfully');

      return res.status(201).json({
        success: true,
        data: {
          ...data,
          shareLink: `${process.env.VERCEL_URL || 'http://localhost:3000'}/shared/${shareToken}`,
          emailSent,
          emailStatus,
        },
      });
    } 
    else if (req.method === 'GET') {
      const { shareToken } = req.query;

      if (!shareToken) {
        return res.status(400).json({ error: 'Missing shareToken' });
      }

      const { data: share, error: shareError } = await supabase
        .from('document_shares')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (shareError || !share) {
        return res.status(404).json({ error: 'Share not found' });
      }

      if (new Date(share.expires_at) < new Date()) {
        return res.status(403).json({ error: 'Share link expired' });
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
      const { id, ...updates } = req.body;

      const { data, error } = await supabase
        .from('document_shares')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } 
    else if (req.method === 'DELETE') {
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
  } catch (error) {
    console.error('❌ Sharing API error:', error);
    return res.status(500).json({
      error: error.message || 'Sharing operation failed',
    });
  }
}

// ============================================
// Helper: Send email via your provider
// ============================================
async function sendShareEmail({
  recipientEmail,
  senderEmail,
  documentTitle,
  shareLink,
  expiresAt,
  requireOtp,
}) {
  try {
    // Example with Resend (adjust to your email provider)
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    
    // await resend.emails.send({
    //   from: 'noreply@signatura.app',
    //   to: recipientEmail,
    //   subject: `${senderEmail} shared a document with you`,
    //   html: `
    //     <h2>Document Shared</h2>
    //     <p>${senderEmail} shared <strong>${documentTitle}</strong> with you.</p>
    //     <p><a href="${shareLink}">View Document</a></p>
    //     <p>Expires: ${new Date(expiresAt).toLocaleDateString()}</p>
    //   `,
    // });

    console.log('📧 Share email details:', {
      to: recipientEmail,
      from: senderEmail,
      document: documentTitle,
      requireOtp,
      expiresAt,
    });

    return true; // Simulate success for now
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}
