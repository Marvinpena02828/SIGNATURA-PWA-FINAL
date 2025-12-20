// pages/api/issuers.js - Get all issuers
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    console.log('📥 GET /api/issuers');

    const { data: issuers, error } = await supabase
      .from('users')
      .select('id, email, organization_name, organization_type, created_at')
      .eq('role', 'issuer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${issuers.length} issuers`);

    res.status(200).json({
      success: true,
      data: issuers || [],
    });
  } catch (error) {
    console.error('❌ Error in GET /api/issuers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch issuers',
    });
  }
}
