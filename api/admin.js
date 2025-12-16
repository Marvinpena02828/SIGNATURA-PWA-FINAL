// api/admin.js - Admin endpoints

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function corsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

export default async function handler(req, res) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { action, role } = req.body;

    // Check if admin
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get dashboard stats
      const { data: usersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      const { data: documentsCount } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true });

      const { data: verificationCount } = await supabase
        .from('verification_requests')
        .select('id', { count: 'exact', head: true });

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: usersCount?.length || 0,
          totalDocuments: documentsCount?.length || 0,
          pendingVerifications: verificationCount?.length || 0,
        },
      });
    } else if (req.method === 'POST') {
      if (action === 'revoke-document') {
        const { documentId, reason } = req.body;

        const { error } = await supabase
          .from('documents')
          .update({ status: 'revoked' })
          .eq('id', documentId);

        if (error) throw error;

        // Log revocation
        await supabase.from('revocations').insert({
          document_id: documentId,
          revoked_by_id: req.body.adminId,
          reason,
        });

        return res.status(200).json({
          success: true,
          message: 'Document revoked',
        });
      } else if (action === 'get-audit-logs') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return res.status(200).json({ success: true, data });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Operation failed',
    });
  }
}
