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
    // Get Issuers
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
          ),
          issued_document:issued_documents(
            id,
            file_url,
            file_name,
            signatura_id,
            document_id,
            approved_by
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

    // Get Issued Documents
    if (endpoint === 'issued-documents') {
      console.log('📄 Fetching issued documents...');
      
      if (!ownerId && !issuerId) {
        return res.status(400).json({
          success: false,
          error: 'Must provide ownerId or issuerId',
        });
      }

      let query = supabase
        .from('issued_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (ownerId) {
        console.log('🔍 Filtering by ownerId:', ownerId);
        query = query.eq('owner_id', ownerId);
      }
      if (issuerId) {
        console.log('🔍 Filtering by issuerId:', issuerId);
        query = query.eq('issuer_id', issuerId);
      }

      const { data: docs, error } = await query;

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      console.log(`✅ Found ${docs?.length || 0} issued documents`);
      return res.status(200).json({
        success: true,
        data: docs || [],
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
// PUT Handler - Issue Document with File
// ============================================
async function handlePut(req, res) {
  const { id, status, issuerMessage, signatureId, documentId, processedBy, approvedBy, fileBase64, fileName } = req.body;

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

    // Update document request status
    const { data: updated, error } = await supabase
      .from('document_requests')
      .update({
        status,
        issuer_message: issuerMessage || null,
      })
      .eq('id', id)
      .select(
        `
        *,
        owner:users!owner_id(id, email, full_name),
        issuer:users!issuer_id(id, email, organization_name)
      `
      )
      .single();

    if (error) throw error;

    console.log('✅ Request updated:', id);

    // If approved, create issued document
    if (status === 'approved' && fileBase64 && fileName) {
      console.log('📄 Creating issued document with file...');
      
      try {
        // Upload file to Supabase Storage
        const filePath = `${updated.issuer_id}/${id}/${fileName}`;
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('issued-documents')
          .upload(filePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ Upload Error:', uploadError);
          throw uploadError;
        }

        console.log('✅ File uploaded:', filePath);

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('issued-documents')
          .getPublicUrl(filePath);

        console.log('✅ Public URL:', publicUrl);

        // Create issued document record
        const { data: issuedDoc, error: docError } = await supabase
          .from('issued_documents')
          .insert({
            id: uuidv4(),
            document_request_id: id,
            owner_id: updated.owner_id,
            issuer_id: updated.issuer_id,
            signatura_id: signatureId || null,
            document_id: documentId || null,
            document_type: updated.items?.[0]?.document?.document_type || null,
            file_url: publicUrl,
            file_name: fileName,
            file_size: fileBuffer.length,
            processed_by: processedBy || null,
            approved_by: approvedBy || null,
            status: 'active',
          })
          .select()
          .single();

        if (docError) {
          console.error('❌ Issued Document Error:', docError);
          throw docError;
        }

        console.log('✅ Issued document created:', issuedDoc.id);

        return res.status(200).json({
          success: true,
          data: {
            request: updated,
            issuedDocument: issuedDoc,
          },
        });
      } catch (err) {
        console.error('⚠️ File handling error (non-critical):', err);
        // Still return success since request was updated
        return res.status(200).json({
          success: true,
          data: { request: updated },
          warning: 'Request approved but file upload failed',
        });
      }
    }

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


// api/documents.js - ADD THESE ENDPOINTS

// ============================================
// DOCUMENT SHARING ENDPOINTS
// ============================================

/**
 * POST /api/documents (add to existing POST handler)
 * endpoint: 'share-document'
 * 
 * Share document with specific person/email
 */
async function shareDocument(req, res) {
  const {
    documentId,
    ownerId,
    recipientId,
    recipientEmail,
    canView = true,
    canPrint = true,
    canDownload = false, // Default: NO download
    canShare = false,
    expiresAt = null,
  } = req.body;

  console.log('📤 Sharing document:', { documentId, recipientEmail });

  try {
    if (!documentId || !ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing documentId or ownerId',
      });
    }

    // Verify owner owns this document
    const { data: doc, error: docError } = await supabase
      .from('issued_documents')
      .select('id, owner_id')
      .eq('id', documentId)
      .single();

    if (docError || doc.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to share this document',
      });
    }

    // Create share record
    const shareToken = require('uuid').v4();
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .insert({
        id: require('uuid').v4(),
        document_id: documentId,
        owner_id: ownerId,
        recipient_id: recipientId || null,
        recipient_email: recipientEmail || null,
        share_type: recipientId ? 'email' : 'link',
        share_token: shareToken,
        can_view: canView,
        can_print: canPrint,
        can_download: canDownload, // Owner decides
        can_share: canShare,
        is_approved: !recipientId, // Auto-approve if owner sharing directly
        approval_date: !recipientId ? new Date() : null,
        approved_by: ownerId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) throw shareError;

    console.log('✅ Document shared:', share.id);

    // TODO: Send email to recipient if recipientEmail provided
    // sendShareEmail(recipientEmail, documentId, shareToken);

    return res.status(201).json({
      success: true,
      data: {
        shareId: share.id,
        shareToken: share.share_token,
        shareLink: `/shared/${share.share_token}`,
        permissions: {
          view: canView,
          print: canPrint,
          download: canDownload,
          share: canShare,
        },
      },
    });
  } catch (error) {
    console.error('❌ Share error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/documents?endpoint=check-access&shareToken=...
 * 
 * Check if user has access to shared document
 */
async function checkDocumentAccess(req, res) {
  const { shareToken, userId } = req.query;

  console.log('🔐 Checking access:', { shareToken, userId });

  try {
    if (!shareToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing shareToken',
      });
    }

    // Get share record
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .select(`
        *,
        document:issued_documents(
          id,
          file_url,
          file_name,
          owner:users!owner_id(id, email, full_name),
          status,
          expires_at
        )
      `)
      .eq('share_token', shareToken)
      .single();

    if (shareError || !share) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found or expired',
      });
    }

    // Check if share is revoked
    if (share.is_revoked) {
      return res.status(403).json({
        success: false,
        error: 'This share has been revoked',
      });
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Share link has expired',
      });
    }

    // Check if approved
    if (!share.is_approved) {
      return res.status(403).json({
        success: false,
        error: 'Access pending owner approval',
      });
    }

    // Log access
    await supabase.from('document_access_logs').insert({
      id: require('uuid').v4(),
      document_id: share.document_id,
      share_id: share.id,
      user_id: userId || null,
      action: 'view',
      ip_address: req.ip || 'unknown',
      user_agent: req.get('user-agent'),
    });

    console.log('✅ Access granted');

    return res.status(200).json({
      success: true,
      data: {
        document: share.document,
        permissions: {
          view: share.can_view,
          print: share.can_print,
          download: share.can_download, // Key: download controlled by owner
          share: share.can_share,
        },
        expiresAt: share.expires_at,
      },
    });
  } catch (error) {
    console.error('❌ Access check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/documents?endpoint=document-shares&ownerId=...
 * 
 * Get all shares created by owner
 */
async function getDocumentShares(req, res) {
  const { ownerId } = req.query;

  console.log('📋 Getting shares for owner:', ownerId);

  try {
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing ownerId',
      });
    }

    const { data: shares, error } = await supabase
      .from('document_shares')
      .select(`
        *,
        document:issued_documents(
          id,
          file_name,
          document_type
        ),
        recipient:users!recipient_id(email, full_name)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${shares?.length || 0} shares`);

    return res.status(200).json({
      success: true,
      data: shares || [],
    });
  } catch (error) {
    console.error('❌ Error getting shares:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/documents
 * endpoint: 'revoke-share'
 * 
 * Revoke access to shared document
 */
async function revokeShare(req, res) {
  const { shareId, ownerId } = req.body;

  console.log('🚫 Revoking share:', shareId);

  try {
    if (!shareId || !ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing shareId or ownerId',
      });
    }

    // Verify owner
    const { data: share, error: getError } = await supabase
      .from('document_shares')
      .select('owner_id')
      .eq('id', shareId)
      .single();

    if (getError || share.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Revoke
    const { data: revoked, error: revokeError } = await supabase
      .from('document_shares')
      .update({
        is_revoked: true,
        revoked_at: new Date(),
        revoked_by: ownerId,
      })
      .eq('id', shareId)
      .select()
      .single();

    if (revokeError) throw revokeError;

    console.log('✅ Share revoked');

    return res.status(200).json({
      success: true,
      message: 'Share revoked successfully',
    });
  } catch (error) {
    console.error('❌ Revoke error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/documents
 * endpoint: 'request-access'
 * 
 * 3rd party requests access to document
 */
async function requestDocumentAccess(req, res) {
  const { documentId, ownerId, requesterEmail, requesterName, reason } = req.body;

  console.log('📨 Access request:', { documentId, requesterEmail });

  try {
    if (!documentId || !ownerId || !requesterEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Create access request
    const token = require('uuid').v4();
    const { data: request, error: requestError } = await supabase
      .from('document_access_requests')
      .insert({
        id: require('uuid').v4(),
        document_id: documentId,
        owner_id: ownerId,
        requester_email: requesterEmail,
        requester_name: requesterName || null,
        reason: reason || null,
        request_token: token,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .select()
      .single();

    if (requestError) throw requestError;

    console.log('✅ Access request created');

    // TODO: Notify owner of access request
    // sendAccessRequestEmail(ownerId, documentId, requesterEmail, reason);

    return res.status(201).json({
      success: true,
      data: {
        requestId: request.id,
        message: 'Access request sent to document owner',
      },
    });
  } catch (error) {
    console.error('❌ Request error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/documents?endpoint=access-requests&ownerId=...
 * 
 * Get pending access requests for owner
 */
async function getAccessRequests(req, res) {
  const { ownerId } = req.query;

  try {
    const { data: requests, error } = await supabase
      .from('document_access_requests')
      .select(`
        *,
        document:issued_documents(id, file_name)
      `)
      .eq('owner_id', ownerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: requests || [],
    });
  } catch (error) {
    console.error('❌ Error getting requests:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/documents
 * endpoint: 'approve-access'
 * 
 * Owner approves access request
 */
async function approveAccessRequest(req, res) {
  const {
    requestId,
    ownerId,
    canPrint = true,
    canDownload = false,
    expiresAt = null,
  } = req.body;

  console.log('✅ Approving access request:', requestId);

  try {
    // Get request
    const { data: request, error: getError } = await supabase
      .from('document_access_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (getError || request.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Create share for requester
    const shareToken = require('uuid').v4();
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .insert({
        id: require('uuid').v4(),
        document_id: request.document_id,
        owner_id: ownerId,
        recipient_email: request.requester_email,
        share_type: 'email',
        share_token: shareToken,
        can_view: true,
        can_print: canPrint,
        can_download: canDownload,
        can_share: false,
        is_approved: true,
        approval_date: new Date(),
        approved_by: ownerId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) throw shareError;

    // Update request status
    await supabase
      .from('document_access_requests')
      .update({
        status: 'approved',
        approved_at: new Date(),
        approved_by: ownerId,
      })
      .eq('id', requestId);

    console.log('✅ Access approved');

    // TODO: Send approval email to requester
    // sendAccessApprovedEmail(request.requester_email, shareToken);

    return res.status(200).json({
      success: true,
      data: {
        shareToken: share.share_token,
        shareLink: `/shared/${share.share_token}`,
      },
    });
  } catch (error) {
    console.error('❌ Approval error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * PUT /api/documents
 * endpoint: 'reject-access'
 * 
 * Owner rejects access request
 */
async function rejectAccessRequest(req, res) {
  const { requestId, ownerId } = req.body;

  try {
    const { data: request } = await supabase
      .from('document_access_requests')
      .select('owner_id')
      .eq('id', requestId)
      .single();

    if (request.owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await supabase
      .from('document_access_requests')
      .update({
        status: 'rejected',
        approved_at: new Date(),
        approved_by: ownerId,
      })
      .eq('id', requestId);

    return res.status(200).json({
      success: true,
      message: 'Access request rejected',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
