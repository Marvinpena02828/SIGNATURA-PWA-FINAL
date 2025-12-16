// api/sharing.js - Document sharing with time limits and permissions
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
      // Create share link
      const {
        documentId,
        ownerId,
        recipientEmail,
        permissions = ['view'],
        expiresIn = 7 * 24 * 60 * 60 * 1000, // 7 days
        requireOTP = false,
      } = req.body;

      const shareToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + expiresIn).toISOString();

      const { data, error } = await supabase
        .from('document_shares')
        .insert({
          document_id: documentId,
          owner_id: ownerId,
          recipient_email: recipientEmail,
          share_token: shareToken,
          permissions,
          require_otp: requireOTP,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: {
          ...data,
          shareLink: `${process.env.VERCEL_URL || 'http://localhost:3000'}/shared/${shareToken}`,
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
    console.error('Sharing API error:', error);
    return res.status(500).json({
      error: error.message || 'Sharing operation failed',
    });
  }
}
