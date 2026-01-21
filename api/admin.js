// api/admin.js - Admin operations
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { action } = req.query;

      if (action === 'stats') {
        const [usersRes, docsRes, reqRes, verRes, sharesRes, encRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('document_shares').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_encrypted', true),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            totalUsers: usersRes.count || 0,
            totalDocuments: docsRes.count || 0,
            totalRequests: reqRes.count || 0,
            activeVerifications: verRes.count || 0,
            activeShares: sharesRes.count || 0,
            encryptedDocuments: encRes.count || 0,
          },
        });
      } 
      else if (action === 'audit-logs') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return res.status(200).json({ success: true, data: data || [] });
      }
      else if (action === 'security-events') {
        // Placeholder for security events - implement based on your needs
        return res.status(200).json({ success: true, data: [] });
      }
    } 
    else if (req.method === 'POST') {
      const { action, userId } = req.body;

      if (action === 'delete-user') {
        // Delete user's documents first
        await supabase.from('documents').delete().eq('issuer_id', userId);

        // Delete user
        const { error } = await supabase.from('users').delete().eq('id', userId);

        if (error) throw error;

        // Log action
        await supabase.from('audit_logs').insert({
          actor_id: userId,
          action: 'user_deleted',
          resource_type: 'user',
          resource_id: userId,
        });

        return res.status(200).json({ success: true, message: 'User deleted' });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({
      error: error.message || 'Operation failed',
    });
  }
}
