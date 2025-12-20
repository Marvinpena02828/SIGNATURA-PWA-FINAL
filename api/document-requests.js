// pages/api/document-requests.js - Handle document requests (GET, POST, PUT, DELETE)
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
      // ============================================
      // GET /api/document-requests
      // ============================================
      return handleGetRequests(req, res);
    } 
    else if (req.method === 'POST') {
      // ============================================
      // POST /api/document-requests
      // ============================================
      return handleCreateRequest(req, res);
    } 
    else if (req.method === 'PUT') {
      // ============================================
      // PUT /api/document-requests
      // ============================================
      return handleUpdateRequest(req, res);
    } 
    else if (req.method === 'DELETE') {
      // ============================================
      // DELETE /api/document-requests
      // ============================================
      return handleDeleteRequest(req, res);
    }
    else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

// ============================================
// GET: Fetch document requests
// ============================================
async function handleGetRequests(req, res) {
  try {
    const { ownerId, issuerId } = req.query;

    console.log('📥 GET /api/document-requests', { ownerId, issuerId });

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

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }
    if (issuerId) {
      query = query.eq('issuer_id', issuerId);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${requests.length} requests`);

    res.status(200).json({
      success: true,
      data: requests || [],
    });
  } catch (error) {
    console.error('❌ Error in GET /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch requests',
    });
  }
}

// ============================================
// POST: Create document request
// ============================================
async function handleCreateRequest(req, res) {
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

    console.log('📤 POST /api/document-requests', {
      ownerId,
      issuerId,
      documentCount: documentIds?.length,
    });

    // ============================================
    // VALIDATION
    // ============================================
    if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ownerId, issuerId, documentIds',
      });
    }

    if (!ownerEmail || !issuerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ownerEmail, issuerEmail',
      });
    }

    // ============================================
    // VERIFY ISSUER EXISTS
    // ============================================
    const { data: issuer, error: issuerError } = await supabase
      .from('users')
      .select('id, role, organization_name')
      .eq('id', issuerId)
      .single();

    if (issuerError || !issuer || issuer.role !== 'issuer') {
      console.error('❌ Issuer validation failed:', issuerError);
      return res.status(404).json({
        success: false,
        error: 'Issuer not found or invalid',
      });
    }

    console.log('✅ Issuer verified:', issuer.organization_name);

    // ============================================
    // CREATE REQUEST
    // ============================================
    const requestId = uuidv4();

    const { data: documentRequest, error: createError } = await supabase
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
      console.error('❌ Failed to create request:', createError);
      throw createError;
    }

    console.log('✅ Request created:', requestId);

    // ============================================
    // CREATE REQUEST ITEMS
    // ============================================
    const items = documentIds.map((docId) => ({
      id: uuidv4(),
      document_request_id: requestId,
      document_id: docId,
    }));

    const { error: itemsError } = await supabase
      .from('document_request_items')
      .insert(items);

    if (itemsError) {
      console.error('❌ Failed to create request items:', itemsError);
      // Delete request if items creation fails
      await supabase
        .from('document_requests')
        .delete()
        .eq('id', requestId);
      throw itemsError;
    }

    console.log(`✅ Created ${documentIds.length} request items`);

    // ============================================
    // RETURN SUCCESS
    // ============================================
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
    console.error('❌ Error in POST /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create request',
    });
  }
}

// ============================================
// PUT: Update document request status
// ============================================
async function handleUpdateRequest(req, res) {
  try {
    const { id, status, issuerMessage } = req.body;

    console.log('📝 PUT /api/document-requests', { id, status });

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing id or status',
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    // ============================================
    // VERIFY REQUEST EXISTS
    // ============================================
    const { data: request, error: fetchError } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      console.error('❌ Request not found:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    // ============================================
    // UPDATE REQUEST
    // ============================================
    const { data: updated, error: updateError } = await supabase
      .from('document_requests')
      .update({
        status,
        issuer_message: issuerMessage || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update request:', updateError);
      throw updateError;
    }

    console.log('✅ Request updated:', id);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update request',
    });
  }
}

// ============================================
// DELETE: Delete document request
// ============================================
async function handleDeleteRequest(req, res) {
  try {
    const { id } = req.body;

    console.log('🗑️ DELETE /api/document-requests', { id });

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing id',
      });
    }

    // Cascade delete will handle items due to ON DELETE CASCADE
    const { error: deleteError } = await supabase
      .from('document_requests')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Failed to delete request:', deleteError);
      throw deleteError;
    }

    console.log('✅ Request deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete request',
    });
  }
}
