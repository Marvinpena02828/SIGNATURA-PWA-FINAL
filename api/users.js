// api/users.js - User management endpoints

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
    if (req.method === 'GET') {
      // Get user profile
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { userId, ...updateData } = req.body;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } else if (req.method === 'POST') {
      // Get all users (admin only)
      const { role } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase.from('users').select('*');

      if (error) throw error;
      return res.status(200).json({ success: true, data });
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
