import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Supabase API initialized');

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
    console.log(`\n📍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

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
  const { role, endpoint, ownerId, issuerId, shareToken, userId } = req.query;

  console.log('📥 GET Request:', { endpoint, ownerId, issuerId });

  try {
    // Check Document Access
    if (endpoint === 'check-access') {
      return await checkDocumentAccess(req, res);
    }

    // Get Issuers
    if (endpoint === 'get-issuers') {
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

    // ===== CRITICAL: Get Document Shares (documents shared WITH this owner) =====
    if (endpoint === 'document-shares') {
      console.log('📋 [CRITICAL] Fetching document shares for owner:', ownerId);
      
      if (!ownerId) {
        console.error('❌ ownerId missing');
        return res.status(400).json({
          success: false,
          error: 'Must provide ownerId',
        });
      }

      try {
        // Step 1: Get all shares where this user is the owner (recipient)
        console.log('📍 Step 1: Fetching document_shares...');
        
        const { data: shares, error } = await supabase
          .from('document_shares')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Supabase Error:', error);
          throw error;
        }

        console.log(`✅ Found ${shares?.length || 0} shares`);

        if (!shares || shares.length === 0) {
          console.log('⚠️ No shares found');
          return res.status(200).json({
            success: true,
            data: [],
          });
        }

        // Step 2: Enrich each share with document data
        console.log('📍 Step 2: Enriching shares with document data...');
        
        let enrichedShares = [];
        
        for (const share of shares) {
          try {
            console.log(`  📄 Processing share ${share.id}:`, {
              document_id: share.document_id,
            });

            // FIRST: Try to get from issued_documents (has file_url)
            const { data: issuedDoc, error: issuedError } = await supabase
              .from('issued_documents')
              .select('*')
              .eq('document_id', share.document_id)
              .single();

            if (issuedDoc && !issuedError) {
              console.log(`  ✅ Found in issued_documents:`, {
                file_name: issuedDoc.file_name,
                file_url: issuedDoc.file_url?.substring(0, 50) + '...',
              });

              // Get issuer info
              const { data: issuer } = await supabase
                .from('users')
                .select('id, email, organization_name')
                .eq('id', issuedDoc.issuer_id)
                .single();

              enrichedShares.push({
                id: share.id,
                document_id: share.document_id,
                owner_id: share.owner_id,
                file_name: issuedDoc.file_name || 'Document',
                file_url: issuedDoc.file_url, // ✅ CRITICAL: File URL from issued_documents
                file_size: issuedDoc.file_size || 0,
                document_type: issuedDoc.document_type || 'document',
                issuer_organization: issuer?.organization_name || 'Unknown',
                created_at: issuedDoc.created_at || share.created_at,
                status: 'approved',
                can_view: share.permissions?.includes('view') || true,
                can_print: share.permissions?.includes('print') || true,
                can_download: share.permissions?.includes('download') || false,
                can_share: share.permissions?.includes('share') || true,
              });
              continue;
            }

            // FALLBACK: Try documents table
            console.log(`  🔍 Not in issued_documents, checking documents table...`);
            
            const { data: doc, error: docError } = await supabase
              .from('documents')
              .select('*')
              .eq('id', share.document_id)
              .single();

            if (doc && !docError) {
              console.log(`  ✅ Found in documents:`, {
                title: doc.title,
                file_url: doc.file_url?.substring(0, 50) + '...',
              });

              const { data: issuer } = await supabase
                .from('users')
                .select('organization_name')
                .eq('id', doc.issuer_id)
                .single();

              enrichedShares.push({
                id: share.id,
                document_id: share.document_id,
                owner_id: share.owner_id,
                file_name: doc.title || 'Document',
                file_url: doc.file_url, // ✅ File URL from documents
                file_size: doc.file_size || 0,
                document_type: doc.document_type || 'document',
                issuer_organization: issuer?.organization_name || 'Unknown',
                created_at: doc.created_at || share.created_at,
                status: 'approved',
                can_view: share.permissions?.includes('view') || true,
                can_print: share.permissions?.includes('print') || true,
                can_download: share.permissions?.includes('download') || false,
                can_share: share.permissions?.includes('share') || true,
              });
              continue;
            }

            // Neither found
            console.warn(`  ⚠️ Document not found in any table`);
            enrichedShares.push({
              ...share,
              file_name: 'Missing Document',
              file_url: null,
              file_size: 0,
              document_type: 'unknown',
            });

          } catch (err) {
            console.error(`  ⚠️ Error enriching share:`, err);
            // Continue with next share
          }
        }

        console.log(`✅ Enriched ${enrichedShares.length} shares`);
        if (enrichedShares.length > 0) {
          console.log('📋 Sample data:', JSON.stringify(enrichedShares[0], null, 2));
        }

        return res.status(200).json({
          success: true,
          data: enrichedShares,
        });

      } catch (err) {
        console.error('❌ Document shares error:', err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    }

    // Get Access Requests
    if (endpoint === 'access-requests') {
      return await getAccessRequests(req, res);
    }

    // ===== UPDATED: Get Document Requests with owner details =====
    if (endpoint === 'document-requests') {
      console.log('📋 Fetching document requests...');
      console.log('🔍 Query params:', { ownerId, issuerId });
      
      if (!ownerId && !issuerId) {
        return res.status(400).json({
          success: false,
          error: 'Must provide ownerId or issuerId',
        });
      }

      try {
        let query = supabase
          .from('document_requests')
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

        const { data: requests, error } = await query;

        if (error) {
          console.error('❌ Supabase Error:', error);
          throw error;
        }

        console.log(`✅ Found ${requests?.length || 0} requests`);
        
        // Log sample data to verify owner fields are being returned
        if (requests && requests.length > 0) {
          console.log('📋 Sample request data:');
          console.log('   Owner:', {
            firstName: requests[0].owner_first_name,
            middleName: requests[0].owner_middle_name,
            lastName: requests[0].owner_last_name,
            email: requests[0].owner_email,
          });
        }

        // Map data to include both snake_case (database) and camelCase (frontend) for compatibility
        const mappedRequests = requests.map(req => ({
          ...req,
          // Add camelCase versions for frontend
          ownerFirstName: req.owner_first_name,
          ownerMiddleName: req.owner_middle_name,
          ownerLastName: req.owner_last_name,
          ownerFullName: req.owner_full_name,
        }));

        return res.status(200).json({
          success: true,
          data: mappedRequests || [],
        });
      } catch (err) {
        console.error('❌ Document requests error:', err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
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
  const { endpoint } = req.body;

  console.log('📤 POST Request:', { endpoint });

  try {
    // Share Document
    if (endpoint === 'share-document') {
      return await shareDocument(req, res);
    }

    // Request Access
    if (endpoint === 'request-access') {
      return await requestDocumentAccess(req, res);
    }

    // Check Share Access (for 3rd party viewing)
    if (endpoint === 'check-share-access') {
      const { shareToken } = req.body;

      console.log('🔑 Checking share token:', shareToken);

      if (!shareToken) {
        return res.status(400).json({
          success: false,
          error: 'Share token required',
        });
      }

      try {
        const { data: share, error } = await supabase
          .from('document_shares')
          .select('*')
          .eq('share_token', shareToken)
          .single();

        if (error || !share) {
          console.log('❌ Share not found');
          return res.status(403).json({
            success: false,
            error: 'Invalid share token',
          });
        }

        // Check if expired
        if (share.expires_at && new Date(share.expires_at) < new Date()) {
          console.log('❌ Share expired');
          return res.status(403).json({
            success: false,
            error: 'Share link has expired',
          });
        }

        console.log('✅ Share access verified');

        return res.status(200).json({
          success: true,
          data: {
            shareToken: share.share_token,
            document_id: share.document_id,
            owner_id: share.owner_id,
            permissions: share.permissions || ['view'],
            expires_at: share.expires_at,
          },
        });
      } catch (err) {
        console.error('❌ Share access error:', err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    }

    // Create Document
    if (endpoint === 'create-document') {
      const { title, document_type, issuerId } = req.body;

      console.log('📄 Creating document:', { title, document_type });

      if (!title || !document_type || !issuerId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      try {
        const { data: doc, error } = await supabase
          .from('documents')
          .insert({
            id: uuidv4(),
            title,
            document_type,
            issuer_id: issuerId,
            status: 'active',
            document_hash: `hash-${Date.now()}`,
            issuance_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Document created:', doc.id);

        return res.status(200).json({
          success: true,
          data: doc,
        });
      } catch (err) {
        console.error('❌ Error creating document:', err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    }

    // Request Document Creation (legacy support)
    if (endpoint === 'document-requests') {
      return await createDocumentRequest(req, res);
    }

    // Create Document (default)
    return await createDocument(req, res);

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
  const { endpoint } = req.body;

  console.log('📝 PUT Request:', { endpoint });

  try {
    // Revoke Share
    if (endpoint === 'revoke-share') {
      return await revokeShare(req, res);
    }

    // Approve Access
    if (endpoint === 'approve-access') {
      return await approveAccessRequest(req, res);
    }

    // Reject Access
    if (endpoint === 'reject-access') {
      return await rejectAccessRequest(req, res);
    }

    // Update Document Request (default)
    return await updateDocumentRequest(req, res);

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
  const { id, endpoint } = req.body;

  console.log('🗑️ DELETE Request:', { id, endpoint });

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing id',
      });
    }

    // Delete Document
    if (endpoint === 'delete-document') {
      console.log('📄 Deleting document:', id);
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Document deleted:', id);
      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    }

    // Default: Delete Document Request
    console.log('📋 Deleting document request:', id);
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

// ============================================
// HELPER FUNCTIONS
// ============================================

// ===== UPDATED: createDocumentRequest with owner details =====
async function createDocumentRequest(req, res) {
  const { 
    ownerId, 
    ownerEmail, 
    ownerFirstName,       // NEW
    ownerMiddleName,      // NEW
    ownerLastName,        // NEW
    ownerFullName,        // NEW
    issuerId, 
    issuerEmail, 
    issuerOrganization, 
    documentIds, 
    message 
  } = req.body;

  console.log('📋 Creating document request...');
  console.log('   Owner:', { ownerFirstName, ownerMiddleName, ownerLastName, ownerEmail });
  
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

  try {
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
        owner_first_name: ownerFirstName || null,      // SAVE THESE ✅
        owner_middle_name: ownerMiddleName || null,    // SAVE THESE ✅
        owner_last_name: ownerLastName || null,        // SAVE THESE ✅
        owner_full_name: ownerFullName || ownerFirstName || null,  // SAVE THIS ✅
        issuer_id: issuerId,
        issuer_email: issuerEmail,
        issuer_organization: issuer.organization_name,
        status: 'pending',
        message: message || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Create Request Error:', createError);
      throw createError;
    }

    console.log('✅ Request created:', requestId);
    console.log('   Saved owner name:', { ownerFirstName, ownerMiddleName, ownerLastName });

    return res.status(201).json({
      success: true,
      data: {
        id: requestId,
        status: 'pending',
        issuer_organization: issuer.organization_name,
      },
    });

  } catch (error) {
    console.error('❌ Create Request Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function createDocument(req, res) {
  const { issuerId, title, documentType } = req.body;

  console.log('📄 Creating document...');
  
  if (!issuerId || !title || !documentType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: issuerId, title, documentType',
    });
  }

  try {
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
    console.error('❌ Create Document Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateDocumentRequest(req, res) {
  const { id, status, issuerMessage, signatureId, documentId, processedBy, approvedBy, fileBase64, fileName, fileSize, ownerId, issuerId, issuerOrganization } = req.body;

  console.log('📝 Updating document request:', id);
  console.log('   Status:', status, 'File:', fileName);

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
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Request updated:', id);

    // If approved with file, create issued document
    if (status === 'approved' && fileBase64 && fileName) {
      console.log('📄 Creating issued document...');
      console.log('   File:', fileName, 'Size:', fileSize);
      
      try {
        // Sanitize filename
        const sanitizedFileName = fileName
          .replace(/[^\w\s.-]/g, '_')
          .replace(/\s+/g, '_')
          .substring(0, 100);

        console.log('   Sanitized:', sanitizedFileName);

        // Upload file to Supabase Storage using SERVICE_ROLE_KEY
        const filePath = `documents/${issuerId}/${id}/${sanitizedFileName}`;
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        console.log('   Uploading to:', filePath);
        console.log('   Buffer size:', fileBuffer.length);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issued-documents')
          .upload(filePath, fileBuffer, {
            contentType: 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ Upload Error:', uploadError);
          throw uploadError;
        }

        console.log('✅ File uploaded successfully');

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('issued-documents')
          .getPublicUrl(filePath);

        console.log('✅ Public URL:', publicUrl.substring(0, 50) + '...');

        // Create a document record for this issued document
        const { data: newDocument, error: newDocError } = await supabase
          .from('documents')
          .insert({
            id: uuidv4(),
            issuer_id: issuerId,
            owner_id: ownerId,
            title: fileName || 'Issued Document',
            document_type: 'certificate',
            status: 'active',
            file_url: publicUrl, // ✅ STORE PUBLIC URL
            file_size: fileSize || 0,
            document_hash: `hash-${Date.now()}`,
            issuance_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (newDocError) {
          console.error('❌ Document creation error:', newDocError);
          throw newDocError;
        }

        console.log('✅ Document created:', newDocument.id);

        // Create issued document record
        const { data: issuedDoc, error: docError } = await supabase
          .from('issued_documents')
          .insert({
            id: uuidv4(),
            document_request_id: id,
            owner_id: ownerId,
            issuer_id: issuerId,
            signatura_id: signatureId || null,
            document_id: newDocument.id,
            document_type: 'issued_document',
            file_url: publicUrl, // ✅ STORE PUBLIC URL HERE TOO
            file_name: sanitizedFileName,
            file_size: fileSize || 0,
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

        // Create automatic share with owner (view + print, NO download)
        console.log('   Creating document_shares...');
        
        // Set expiry to 90 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        const { data: createdShare, error: shareError } = await supabase
          .from('document_shares')
          .insert({
            id: uuidv4(),
            document_id: newDocument.id, // ✅ Reference the created document
            owner_id: ownerId,
            recipient_email: updated.owner_email || 'unknown@example.com',
            share_token: crypto.randomBytes(32).toString('hex'),
            permissions: ['view', 'print', 'share'], // NO download for security
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (shareError) {
          console.error('❌ Share ERROR:', shareError);
          throw shareError;
        }

        console.log('✅ Document shared with owner');

        return res.status(200).json({
          success: true,
          data: {
            request: updated,
            issuedDocument: issuedDoc,
            document: newDocument,
            share: createdShare,
          },
        });

      } catch (err) {
        console.error('⚠️ Document creation error:', err);
        // Still return success for request approval
        return res.status(200).json({
          success: true,
          data: { request: updated },
          warning: 'Request approved but document creation failed: ' + err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (error) {
    console.error('❌ Update Request Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================
// DOCUMENT SHARING FUNCTIONS
// ============================================

async function shareDocument(req, res) {
  const { documentId, ownerId, recipientId, recipientEmail, canView = true, canPrint = true, canDownload = false, canShare = false, expiresAt = null } = req.body;

  console.log('📤 Sharing document:', { documentId, recipientEmail });

  try {
    if (!documentId || !ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing documentId or ownerId',
      });
    }

    const shareToken = uuidv4();
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        owner_id: ownerId,
        recipient_id: recipientId || null,
        recipient_email: recipientEmail || null,
        share_type: recipientId ? 'email' : 'link',
        share_token: shareToken,
        can_view: canView,
        can_print: canPrint,
        can_download: canDownload,
        can_share: canShare,
        is_approved: !recipientId,
        approval_date: !recipientId ? new Date() : null,
        approved_by: ownerId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) throw shareError;

    console.log('✅ Document shared:', share.id);

    return res.status(201).json({
      success: true,
      data: {
        shareId: share.id,
        shareToken: share.share_token,
        shareLink: `/shared/${share.share_token}`,
        permissions: { view: canView, print: canPrint, download: canDownload, share: canShare },
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

    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (shareError || !share) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found or expired',
      });
    }

    if (share.is_revoked) {
      return res.status(403).json({
        success: false,
        error: 'This share has been revoked',
      });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        error: 'Share link has expired',
      });
    }

    if (!share.is_approved) {
      return res.status(403).json({
        success: false,
        error: 'Access pending owner approval',
      });
    }

    console.log('✅ Access granted');

    return res.status(200).json({
      success: true,
      data: {
        shareToken: share.share_token,
        permissions: {
          view: share.can_view,
          print: share.can_print,
          download: share.can_download,
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

    const token = uuidv4();
    const { data: request, error: requestError } = await supabase
      .from('document_access_requests')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        owner_id: ownerId,
        requester_email: requesterEmail,
        requester_name: requesterName || null,
        reason: reason || null,
        request_token: token,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .select()
      .single();

    if (requestError) throw requestError;

    console.log('✅ Access request created');

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

async function getAccessRequests(req, res) {
  const { ownerId } = req.query;

  console.log('📋 Getting access requests for owner:', ownerId);

  try {
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing ownerId',
      });
    }

    const { data: requests, error } = await supabase
      .from('document_access_requests')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${requests?.length || 0} access requests`);

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

async function approveAccessRequest(req, res) {
  const { requestId, ownerId, canPrint = true, canDownload = false, expiresAt = null } = req.body;

  console.log('✅ Approving access request:', requestId);

  try {
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

    const shareToken = uuidv4();
    const { data: share, error: shareError } = await supabase
      .from('document_shares')
      .insert({
        id: uuidv4(),
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

    await supabase
      .from('document_access_requests')
      .update({
        status: 'approved',
        approved_at: new Date(),
        approved_by: ownerId,
      })
      .eq('id', requestId);

    console.log('✅ Access approved');

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

async function rejectAccessRequest(req, res) {
  const { requestId, ownerId } = req.body;

  console.log('❌ Rejecting access request:', requestId);

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

    console.log('✅ Access rejected');

    return res.status(200).json({
      success: true,
      message: 'Access request rejected',
    });

  } catch (error) {
    console.error('❌ Rejection error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
