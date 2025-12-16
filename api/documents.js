// api/documents.js - Document CRUD endpoints
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
      const { issuerId, ownerId, status } = req.query;
      let query = supabase.from('documents').select('*');

      if (issuerId) query = query.eq('issuer_id', issuerId);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        data: data || [] 
      });
    } 
    else if (req.method === 'POST') {
      const {
        issuerId,
        ownerId,
        title,
        documentType,
        documentHash,
        issuanceDate,
        expiryDate,
      } = req.body;

      // Ensure required fields
      if (!issuerId || !title || !documentType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required: issuerId, title, documentType',
        });
      }

      const insertData = {
        issuer_id: issuerId,
        owner_id: ownerId === undefined || ownerId === null ? null : ownerId,
        title: title.trim() || 'Untitled',
        document_type: documentType,
        document_hash: documentHash || `HASH_${Date.now()}`,
        issuance_date: issuanceDate || new Date().toISOString(),
        expiry_date: expiryDate === undefined || expiryDate === null ? null : expiryDate,
        status: 'active',
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return res.status(201).json({ 
        success: true, 
        data: data?.[0] || insertData 
      });
    } 
    else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing document id',
        });
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } 
    else if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing document id',
        });
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ 
        success: true, 
        message: 'Document deleted' 
      });
    } 
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Documents API error:', error.message);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to process document',
    });
  }
}
