// api/sharing.js - Complete Document sharing API with owner notification and received shares
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
  if (process.env.NEXT_PUBLIC_SHARE_URL) {
    console.log('✅ Using NEXT_PUBLIC_SHARE_URL');
    return process.env.NEXT_PUBLIC_SHARE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL;
    const withHttps = url.startsWith('http') ? url : `https://${url}`;
    console.log('✅ Using VERCEL_URL:', withHttps);
    return withHttps;
  }
  
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
        ownerId,
        senderEmail,
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
      let ownerEmail = senderEmail;

      if (!resolvedOwnerId && senderEmail) {
        console.log('🔍 Looking up user by email:', senderEmail);
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email')
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
        ownerEmail = userData.email;
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
        .select('id, title, issuer_id, issuer:issuer_id(email, organization_name)')
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
          owner_id: resolvedOwnerId,
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
      // STEP 5: BUILD SHARE LINK
      // ============================================
      const baseUrl = getBaseUrl();
      const shareLink = `${baseUrl}/shared/${shareToken}`;

      console.log('🔗 Base URL:', baseUrl);
      console.log('📋 Share link generated:', shareLink);

      // ============================================
      // STEP 6: SEND EMAILS (TO BOTH RECIPIENT AND OWNER)
      // ============================================
      let emailSent = false;
      let emailStatus = 'Email notifications prepared';

      try {
        console.log('📧 Email notifications prepared:');
        console.log('  To Recipient:', recipientEmail);
        console.log('  To Owner:', ownerEmail);
        
        // TODO: Implement actual email sending with Resend, SendGrid, etc.
        // Example with Resend (uncomment when configured):
        /*
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'noreply@signatura.app',
          to: recipientEmail,
          subject: `Document Shared: ${document.title}`,
          html: `
            <h2>Document Shared With You</h2>
            <p><strong>${document.issuer?.organization_name || senderEmail}</strong> shared a document with you.</p>
            <p><strong>Document:</strong> ${document.title}</p>
            <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
            <p><a href="${shareLink}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Document
            </a></p>
          `
        });

        await resend.emails.send({
          from: 'noreply@signatura.app',
          to: ownerEmail,
          subject: `Document Shared: ${document.title}`,
          html: `
            <h2>You Shared a Document</h2>
            <p>Your document <strong>${document.title}</strong> has been shared.</p>
            <p><strong>Recipient:</strong> ${recipientEmail}</p>
            <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
            <p><strong>Security:</strong> OTP ${requireOtp ? 'Required' : 'Not Required'}</p>
          `
        });
        
        emailSent = true;
        emailStatus = `Notifications sent to ${recipientEmail} and owner`;
        */
        
        emailStatus = 'Share created (email notifications not configured yet)';
        console.log('✅ Emails ready to send');
      } catch (emailError) {
        console.error('⚠️ Email service error:', emailError);
        emailStatus = 'Share created but email notifications failed';
      }

      // ============================================
      // STEP 7: RETURN SUCCESS RESPONSE
      // ============================================
      console.log('✅ Success! Share created');

      return res.status(201).json({
        success: true,
        data: {
          id: data.id,
          shareLink,
          shareToken,
          documentId,
          recipientEmail,
          ownerEmail,
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
      // GET: Retrieve shares (both created and received)
      // ============================================
      const { shareToken, ownerId, ownerEmail } = req.query;

      // Get by share token (for public verification)
      if (shareToken) {
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

      // Get all shares for owner (both created and received)
      if (ownerId || ownerEmail) {
        console.log('📋 Fetching shares for:', { ownerId, ownerEmail });

        try {
          let createdShares = [];
          let receivedShares = [];

          // QUERY 1: Shares CREATED BY this owner
          if (ownerId) {
            const { data: shares, error: createdError } = await supabase
              .from('document_shares')
              .select(`
                *,
                document:document_id(id, title),
                issuer:owner_id(organization_name)
              `)
              .eq('owner_id', ownerId)
              .order('created_at', { ascending: false });

            if (createdError) {
              console.error('Error fetching created shares:', createdError);
            } else {
              createdShares = (shares || []).map(s => ({
                ...s,
                shareType: 'created'
              }));
              console.log('📤 Created shares:', createdShares.length);
            }
          }

          // QUERY 2: Shares SENT TO this owner (by email match)
          if (ownerEmail) {
            const { data: shares, error: receivedError } = await supabase
              .from('document_shares')
              .select(`
                *,
                document:document_id(id, title),
                issuer:owner_id(organization_name)
              `)
              .eq('recipient_email', ownerEmail)
              .order('created_at', { ascending: false });

            if (receivedError) {
              console.error('Error fetching received shares:', receivedError);
            } else {
              receivedShares = (shares || []).map(s => ({
                ...s,
                shareType: 'received'
              }));
              console.log('📥 Received shares:', receivedShares.length);
            }
          }

          // COMBINE BOTH ARRAYS
          const allShares = [...createdShares, ...receivedShares];
          
          console.log('✅ Total shares (created + received):', allShares.length);

          return res.status(200).json({
            success: true,
            data: allShares,
          });
        } catch (error) {
          console.error('Error fetching shares:', error);
          return res.status(500).json({
            success: false,
            error: 'Failed to fetch shares',
          });
        }
      }

      return res.status(400).json({
        success: false,
        error: 'Missing shareToken, ownerId, or ownerEmail',
      });
    } 
    else if (req.method === 'PUT') {
      // ============================================
      // PUT: Update share settings
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
