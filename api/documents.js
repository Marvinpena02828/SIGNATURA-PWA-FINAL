// api/documents.js - Consolidated API for documents, issuers, and document requests
// This file handles Express-style routing (for root /api/ folder, not Next.js pages/api/)

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default function setupDocumentsRouter(app) {
  // ============================================
  // GET /api/documents
  // Handles: documents, issuers, document-requests
  // ============================================
  
  app.get('/api/documents', async (req, res) => {
    try {
      const { role, endpoint, ownerId, issuerId } = req.query;
      
      console.log('📥 GET /api/documents', { role, endpoint, ownerId, issuerId });

      // ROUTE 1: Get Issuers (GET /api/documents?role=issuer)
      if (role === 'issuer') {
        return handleGetIssuers(req, res);
      }

      // ROUTE 2: Get Document Requests (GET /api/documents?endpoint=document-requests&ownerId=xxx)
      if (endpoint === 'document-requests') {
        return handleGetDocumentRequests(req, res);
      }

      // ROUTE 3: Get Documents (GET /api/documents?ownerId=xxx or ?issuerId=xxx)
      return handleGetDocuments(req, res);
    } catch (error) {
      console.error('❌ Error in GET /api/documents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  });

  // ============================================
  // POST /api/documents
  // Handles: create documents, create document requests
  // ============================================
  
  app.post('/api/documents', async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      console.log('📤 POST /api/documents', { endpoint });

      // ROUTE 1: Create Document Request (POST with endpoint: 'document-requests')
      if (endpoint === 'document-requests') {
        return handleCreateDocumentRequest(req, res);
      }

      // ROUTE 2: Create Document (POST without endpoint)
      return handleCreateDocument(req, res);
    } catch (error) {
      console.error('❌ Error in POST /api/documents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  });

  // ============================================
  // PUT /api/documents
  // Handles: update document requests
  // ============================================
  
  app.put('/api/documents', async (req, res) => {
    try {
      const { endpoint } = req.query;
      
      console.log('📝 PUT /api/documents', { endpoint });

      // Update Document Request
      if (endpoint === 'document-requests' || req.body?.id) {
        return handleUpdateDocumentRequest(req, res);
      }

      res.status(400).json({
        success: false,
        error: 'Invalid request',
      });
    } catch (error) {
      console.error('❌ Error in PUT /api/documents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  });

  // ============================================
  // DELETE /api/documents
  // Handles: delete document requests
  // ============================================
  
  app.delete('/api/documents', async (req, res) => {
    try {
      const { endpoint } = req.query;
      
      console.log('🗑️ DELETE /api/documents', { endpoint });

      // Delete Document Request
      if (endpoint === 'document-requests' || req.body?.id) {
        return handleDeleteDocumentRequest(req, res);
      }

      res.status(400).json({
        success: false,
        error: 'Invalid request',
      });
    } catch (error) {
      console.error('❌ Error in DELETE /api/documents:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  });
}

// ============================================
// HANDLER FUNCTIONS
// ============================================

async function handleGetDocuments(req, res) {
  try {
    const { issuerId, ownerId } = req.query;
    console.log('📥 GET /api/documents (documents)', { issuerId, ownerId });

    let query = supabase.from('documents').select('*');

    if (issuerId) query = query.eq('issuer_id', issuerId);
    if (ownerId) query = query.eq('owner_id', ownerId);

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Error in handleGetDocuments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function handleCreateDocument(req, res) {
  try {
    const { issuerId, title, documentType } = req.body;
    console.log('📤 POST /api/documents (create document)', { issuerId, title });

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

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Error in handleCreateDocument:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function handleGetIssuers(req, res) {
  try {
    console.log('📥 GET /api/documents (issuers)');

    const { data: issuers, error } = await supabase
      .from('users')
      .select('id, email, organization_name, organization_type, created_at')
      .eq('role', 'issuer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${issuers.length} issuers`);

    res.status(200).json({
      success: true,
      data: issuers || [],
    });
  } catch (error) {
    console.error('❌ Error in handleGetIssuers:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function handleGetDocumentRequests(req, res) {
  try {
    const { ownerId, issuerId } = req.query;
    console.log('📥 GET /api/documents (document-requests)', { ownerId, issuerId });

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

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: requests || [],
    });
  } catch (error) {
    console.error('❌ Error in handleGetDocumentRequests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

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

    console.log('📤 POST /api/documents (create document-request)', {
      ownerId,
      issuerId,
      documentCount: documentIds?.length,
    });

    // VALIDATION
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

    // VERIFY ISSUER EXISTS
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

    // CREATE REQUEST
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

    // CREATE REQUEST ITEMS
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
      await supabase
        .from('document_requests')
        .delete()
        .eq('id', requestId);
      throw itemsError;
    }

    console.log(`✅ Created ${documentIds.length} request items`);

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
    console.error('❌ Error in handleCreateDocumentRequest:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create request',
    });
  }
}

async function handleUpdateDocumentRequest(req, res) {
  try {
    const { id, status, issuerMessage } = req.body;

    console.log('📝 PUT /api/documents (update document-request)', { id, status });

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
    console.error('❌ Error in handleUpdateDocumentRequest:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update request',
    });
  }
}

async function handleDeleteDocumentRequest(req, res) {
  try {
    const { id } = req.body;

    console.log('🗑️ DELETE /api/documents (delete document-request)', { id });

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing id',
      });
    }

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
    console.error('❌ Error in handleDeleteDocumentRequest:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete request',
    });
  }
}
