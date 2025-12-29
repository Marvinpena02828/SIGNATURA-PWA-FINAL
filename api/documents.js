import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route based on method
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

// ============================================
// GET Handler
// ============================================
async function handleGet(req, res) {
  const { role, endpoint, ownerId, issuerId } = req.query;

  console.log('📥 GET Request:', { role, endpoint, ownerId, issuerId });

  try {
    // Get Issuers - FIXED: Removed organization_type
    if (role === 'issuer') {
      console.log('🔍 Fetching issuers from users table...');
      
      const { data: issuers, error } = await supabase
        .from('users')
        .select('id, email, organization_name, created_at')
        .eq('role', 'issuer')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      console.log(`✅ Found ${issuers?.length || 0} issuers`);
      return res.status(200).json({
        success: true,
        data: issuers || [],
      });
    }

    // Get Document Requests
    if (endpoint === 'document-requests') {
      console.log('📋 Fetching document requests...');
      
      if (!ownerId && !issuerId) {
        return res.status(400).json({
          success: false,
          error: 'Must provide ownerId or issuerId',
        });
      }

      let query = supabase
        .from('document_requests')
        .select(
          `
          *,
          items:document_request_items(
            id,
            document_id,
            document:documents(id, title, document_type)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (ownerId) {
        console.log('🔍 Filtering by ownerId:', ownerId);
        query = query.eq('owner_id', ownerId);
      }
      if (issuerId) {
        console.log('🔍 Filtering by issuerId:', issuerId);
        query = query.eq('issuer_id', issuerId);
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      console.log(`✅ Found ${requests?.length || 0} requests`);
      return res.status(200).json({
        success: true,
        data: requests || [],
      });
    }

    // Get Documents (default)
    console.log('📄 Fetching documents...');
    
    let query = supabase.from('documents').select('*');

    if (issuerId) {
      console.log('🔍 Filtering by issuerId:', issuerId);
      query = query.eq('issuer_id', issuerId);
    }
    if (ownerId) {
      console.log('🔍 Filtering by ownerId:', ownerId);
      query = query.eq('owner_id', ownerId);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('❌ Supabase Error:', error);
      throw error;
    }

    console.log(`✅ Found ${documents?.length || 0} documents`);
    return res.status(200).json({
      success: true,
      data: documents || [],
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// POST Handler
// ============================================
async function handlePost(req, res) {
  const { endpoint, issuerId, title, documentType, ownerId, ownerEmail, ownerName, issuerEmail, documentIds, message } = req.body;

  console.log('📤 POST Request:', { endpoint, issuerId, title });

  try {
    // Create Document Request
    if (endpoint === 'document-requests') {
      console.log('📋 Creating document request...');
      
      // Validate inputs
      if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: ownerId, issuerId, documentIds',
        });
      }

      if (!ownerEmail || !issuerEmail) {
        return res.status(400).json({
          success: false,
          error: 'Missing email fields',
        });
      }

      // Verify issuer exists
      console.log('🔍 Verifying issuer...');
      
      const { data: issuer, error: issuerError } = await supabase
        .from('users')
        .select('id, role, organization_name')
        .eq('id', issuerId)
        .single();

      if (issuerError || !issuer || issuer.role !== 'issuer') {
        console.error('❌ Issuer Error:', issuerError);
        return res.status(404).json({
          success: false,
          error: 'Issuer not found or invalid',
        });
      }

      console.log('✅ Issuer verified:', issuer.organization_name);

      // Create request
      const requestId = uuidv4();

      const { data: docRequest, error: createError } = await supabase
        .from('document_requests')
        .insert({
          id: requestId,
          owner_id: ownerId,
          owner_email: ownerEmail,
          owner_name: ownerName || null,
          issuer_id: issuerId,
          issuer_email: issuerEmail,
          issuer_organization: issuer.organization_name,
          status: 'pending',
          message: message || null,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Create Request Error:', createError);
        throw createError;
      }

      console.log('✅ Request created:', requestId);

      // Create request items
      const items = documentIds.map((docId) => ({
        id: uuidv4(),
        document_request_id: requestId,
        document_id: docId,
      }));

      const { error: itemsError } = await supabase
        .from('document_request_items')
        .insert(items);

      if (itemsError) {
        console.error('❌ Items Error:', itemsError);
        // Rollback
        await supabase
          .from('document_requests')
          .delete()
          .eq('id', requestId);
        throw itemsError;
      }

      console.log(`✅ Created ${documentIds.length} items`);

      return res.status(201).json({
        success: true,
        data: {
          id: requestId,
          status: 'pending',
          document_count: documentIds.length,
          issuer_organization: issuer.organization_name,
        },
      });
    }

    // Create Document
    console.log('📄 Creating document...');
    
    if (!issuerId || !title || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: issuerId, title, documentType',
      });
    }

    const { data: newDoc, error: docError } = await supabase
      .from('documents')
      .insert({
        id: uuidv4(),
        issuer_id: issuerId,
        title,
        document_type: documentType,
        status: 'active',
      })
      .select()
      .single();

    if (docError) throw docError;

    console.log('✅ Document created:', newDoc.id);
    return res.status(201).json({
      success: true,
      data: newDoc,
    });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// PUT Handler
// ============================================
async function handlePut(req, res) {
  const { id, status, issuerMessage } = req.body;

  console.log('📝 PUT Request:', { id, status });

  try {
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing id or status',
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const { data: updated, error } = await supabase
      .from('document_requests')
      .update({
        status,
        issuer_message: issuerMessage || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Request updated:', id);
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// DELETE Handler
// ============================================
async function handleDelete(req, res) {
  const { id } = req.body;

  console.log('🗑️ DELETE Request:', { id });

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing id',
      });
    }

    const { error } = await supabase
      .from('document_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Request deleted:', id);
    return res.status(200).json({
      success: true,
      message: 'Deleted successfully',
    });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
