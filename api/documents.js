// api/documents.js - Vercel Serverless Function Handler
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// Main Handler - Vercel Serverless Function
// ============================================
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { role, endpoint, ownerId, issuerId } = req.query;
    
    console.log('📨 API Handler:', { method: req.method, role, endpoint, ownerId, issuerId });

    // ============================================
    // GET - Route based on query params
    // ============================================
    if (req.method === 'GET') {
      // GET issuers
      if (role === 'issuer') {
        return handleGetIssuers(req, res);
      }

      // GET document requests
      if (endpoint === 'document-requests') {
        return handleGetDocumentRequests(req, res);
      }

      // GET documents (default)
      return handleGetDocuments(req, res);
    }

    // ============================================
    // POST - Route based on body endpoint
    // ============================================
    if (req.method === 'POST') {
      const { endpoint: bodyEndpoint } = req.body;

      // POST document request
      if (bodyEndpoint === 'document-requests') {
        return handleCreateDocumentRequest(req, res);
      }

      // POST document (default)
      return handleCreateDocument(req, res);
    }

    // ============================================
    // PUT - Update document request
    // ============================================
    if (req.method === 'PUT') {
      return handleUpdateDocumentRequest(req, res);
    }

    // ============================================
    // DELETE - Delete document request
    // ============================================
    if (req.method === 'DELETE') {
      return handleDeleteDocumentRequest(req, res);
    }

    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error) {
    console.error('❌ Handler error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

// ============================================
// GET DOCUMENTS
// ============================================
async function handleGetDocuments(req, res) {
  try {
    const { issuerId, ownerId } = req.query;
    console.log('📄 GET documents:', { issuerId, ownerId });

    let query = supabase.from('documents').select('*');

    if (issuerId) query = query.eq('issuer_id', issuerId);
    if (ownerId) query = query.eq('owner_id', ownerId);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} documents`);
    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ handleGetDocuments error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// GET ISSUERS
// ============================================
async function handleGetIssuers(req, res) {
  try {
    console.log('🏢 GET issuers');

    const { data: issuers, error } = await supabase
      .from('users')
      .select('id, email, organization_name, organization_type, created_at')
      .eq('role', 'issuer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${issuers?.length || 0} issuers`);
    res.status(200).json({
      success: true,
      data: issuers || [],
    });
  } catch (error) {
    console.error('❌ handleGetIssuers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// GET DOCUMENT REQUESTS
// ============================================
async function handleGetDocumentRequests(req, res) {
  try {
    const { ownerId, issuerId } = req.query;
    console.log('📋 GET document requests:', { ownerId, issuerId });

    if (!ownerId && !issuerId) {
      return res.status(400).json({
        success: false,
        error: 'Must provide ownerId or issuerId',
      });
    }

    let query = supabase
      .from('document_requests')
      .select(`
        *,
        items:document_request_items(
          id,
          document_id,
          document:documents(id, title, document_type)
        )
      `)
      .order('created_at', { ascending: false });

    if (ownerId) query = query.eq('owner_id', ownerId);
    if (issuerId) query = query.eq('issuer_id', issuerId);

    const { data: requests, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${requests?.length || 0} requests`);
    res.status(200).json({
      success: true,
      data: requests || [],
    });
  } catch (error) {
    console.error('❌ handleGetDocumentRequests error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// CREATE DOCUMENT
// ============================================
async function handleCreateDocument(req, res) {
  try {
    const { issuerId, title, documentType } = req.body;
    console.log('📤 POST document:', { issuerId, title });

    if (!issuerId || !title || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: issuerId, title, documentType',
      });
    }

    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Document created:', data.id);
    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ handleCreateDocument error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// CREATE DOCUMENT REQUEST
// ============================================
async function handleCreateDocumentRequest(req, res) {
  try {
    const {
      ownerId,
      ownerEmail,
      ownerName,
      issuerId,
      issuerEmail,
      documentIds,
      message,
    } = req.body;

    console.log('📤 POST document request:', {
      ownerId,
      issuerId,
      documentCount: documentIds?.length,
    });

    // Validation
    if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (!ownerEmail || !issuerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing email fields',
      });
    }

    // Verify issuer exists
    const { data: issuer, error: issuerError } = await supabase
      .from('users')
      .select('id, role, organization_name')
      .eq('id', issuerId)
      .single();

    if (issuerError || !issuer || issuer.role !== 'issuer') {
      console.error('❌ Issuer error:', issuerError);
      return res.status(404).json({
        success: false,
        error: 'Issuer not found',
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
      console.error('❌ Create request error:', createError);
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
      console.error('❌ Items error:', itemsError);
      // Rollback
      await supabase
        .from('document_requests')
        .delete()
        .eq('id', requestId);
      throw itemsError;
    }

    console.log(`✅ Created ${documentIds.length} items`);

    res.status(201).json({
      success: true,
      data: {
        id: requestId,
        status: 'pending',
        document_count: documentIds.length,
        issuer_organization: issuer.organization_name,
      },
    });
  } catch (error) {
    console.error('❌ handleCreateDocumentRequest error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// UPDATE DOCUMENT REQUEST
// ============================================
async function handleUpdateDocumentRequest(req, res) {
  try {
    const { id, status, issuerMessage } = req.body;
    console.log('📝 PUT document request:', { id, status });

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

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Request updated:', id);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('❌ handleUpdateDocumentRequest error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// DELETE DOCUMENT REQUEST
// ============================================
async function handleDeleteDocumentRequest(req, res) {
  try {
    const { id } = req.body;
    console.log('🗑️ DELETE document request:', { id });

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

    if (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }

    console.log('✅ Request deleted:', id);
    res.json({
      success: true,
      message: 'Deleted successfully',
    });
  } catch (error) {
    console.error('❌ handleDeleteDocumentRequest error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
