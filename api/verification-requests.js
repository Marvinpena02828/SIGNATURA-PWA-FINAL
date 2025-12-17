// api/verification-requests.js - Verification request management
import { createClient } from '@supabase/supabase-js';

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
    if (req.method === 'GET') {
      const { ownerId, status } = req.query;

      let query = supabase.from('verification_requests').select('*');
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } 
    else if (req.method === 'POST') {
      const { documentId, ownerId, verifierEmail } = req.body;

      if (!documentId || !ownerId || !verifierEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          document_id: documentId,
          owner_id: ownerId,
          verifier_email: verifierEmail,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, data });
    } 
    else if (req.method === 'PUT') {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('verification_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } 
    else if (req.method === 'DELETE') {
      const { id } = req.body;

      const { error } = await supabase
        .from('verification_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Request deleted' });
    }
  } catch (error) {
    console.error('Verification requests error:', error);
    return res.status(500).json({
      error: error.message || 'Operation failed',
    });
  }
}
