// api/documents.js - Simple Express router for documents, issuers, and document-requests
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// GET /api/documents
// ============================================
router.get('/documents', async (req, res) => {
  try {
    const { role, endpoint, ownerId, issuerId } = req.query;
    
    console.log('📥 GET /api/documents', { role, endpoint, ownerId, issuerId });

    // Get issuers
    if (role === 'issuer') {
      const { data: issuers, error } = await supabase
        .from('users')
        .select('id, email, organization_name, organization_type, created_at')
        .eq('role', 'issuer')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ Found ${issuers.length} issuers`);
      return res.json({
        success: true,
        data: issuers || [],
      });
    }

    // Get document requests
    if (endpoint === 'document-requests') {
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

      console.log(`✅ Found ${requests.length} requests`);
      return res.json({
        success: true,
        data: requests || [],
      });
    }

    // Get documents
    let query = supabase.from('documents').select('*');

    if (issuerId) query = query.eq('issuer_id', issuerId);
    if (ownerId) query = query.eq('owner_id', ownerId);

    const { data, error } = await query;
    if (error) throw error;

    console.log(`✅ Found ${data.length} documents`);
    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Error in GET /api/documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch documents',
    });
  }
});

// ============================================
// POST /api/documents
// ============================================
router.post('/documents', async (req, res) => {
  try {
    const { endpoint, issuerId, title, documentType, ownerId, ownerEmail, ownerName, issuerEmail, documentIds, message } = req.body;
    
    console.log('📤 POST /api/documents', { endpoint, issuerId, title });

    // Create document request
    if (endpoint === 'document-requests') {
      if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      // Verify issuer
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

      const requestId = uuidv4();

      // Create request
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

      if (createError) throw createError;

      // Create items
      const items = documentIds.map((docId) => ({
        id: uuidv4(),
        document_request_id: requestId,
        document_id: docId,
      }));

      const { error: itemsError } = await supabase
        .from('document_request_items')
        .insert(items);

      if (itemsError) {
        await supabase
          .from('document_requests')
          .delete()
          .eq('id', requestId);
        throw itemsError;
      }

      console.log('✅ Document request created:', requestId);
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

    // Create document
    if (!issuerId || !title || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
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

    console.log('✅ Document created:', data.id);
    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Error in POST /api/documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create',
    });
  }
});

// ============================================
// PUT /api/documents
// ============================================
router.put('/documents', async (req, res) => {
  try {
    const { id, status, issuerMessage } = req.body;

    console.log('📝 PUT /api/documents', { id, status });

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing id or status',
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
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update',
    });
  }
});

// ============================================
// DELETE /api/documents
// ============================================
router.delete('/documents', async (req, res) => {
  try {
    const { id } = req.body;

    console.log('🗑️ DELETE /api/documents', { id });

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
    res.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete',
    });
  }
});

export default router;
