import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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
  const { role, endpoint, ownerId, issuerId, shareToken, userId } = req.query;

  console.log('📥 GET Request:', { role, endpoint, ownerId, issuerId });

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

    // Get Document Shares (documents shared WITH this owner)
    if (endpoint === 'document-shares') {
      console.log('📋 Fetching document shares for owner:', ownerId);
      
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          error: 'Must provide ownerId',
        });
      }

      // Get all shares where this user is the owner (recipient)
      const { data: shares, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      // Enrich with document details
      let enrichedShares = [];
      if (shares && shares.length > 0) {
        enrichedShares = await Promise.all(
          shares.map(async (share) => {
            try {
              console.log(`📍 Processing share ${share.id}:`, { document_id: share.document_id });
              
              // Get the issued document by matching document_id
              const { data: doc, error: docError } = await supabase
                .from('issued_documents')
                .select('*')
                .eq('document_id', share.document_id)
                .single();

              console.log(`  ✅ Issued document found:`, { 
                id: doc?.id,
                file_name: doc?.file_name,
                file_url: doc?.file_url,
                document_id: doc?.document_id
              });

              if (!doc) {
                console.warn(`  ⚠️ No issued_document found for document_id: ${share.document_id}`);
              }

              // Get issuer info
              const { data: issuer } = await supabase
                .from('users')
                .select('id, email, organization_name')
                .eq('id', doc?.issuer_id)
                .single();

              console.log(`  👤 Issuer:`, issuer?.organization_name);

              return {
                ...share,
                file_name: doc?.file_name,
                file_url: doc?.file_url,
                file_size: doc?.file_size,
                document_type: doc?.document_type,
                issuer_organization: issuer?.organization_name,
                created_at: doc?.created_at,
                // Parse permissions
                can_view: share.permissions?.includes('view'),
                can_print: share.permissions?.includes('print'),
                can_download: share.permissions?.includes('download'),
                can_share: share.permissions?.includes('share'),
              };
            } catch (err) {
              console.error('⚠️ Error enriching share:', err);
              return share;
            }
          })
        );
      }

      console.log(`✅ Found ${enrichedShares?.length || 0} shares`);
      console.log('📋 Enriched data:', enrichedShares);
      return res.status(200).json({
        success: true,
        data: enrichedShares || [],
      });
    }

    // Get Access Requests
    if (endpoint === 'access-requests') {
      return await getAccessRequests(req, res);
    }

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
        
        // Enrich with document items
        let enrichedRequests = [];
        if (requests && requests.length > 0) {
          enrichedRequests = await Promise.all(
            requests.map(async (req) => {
              try {
                // Fetch items and related documents
                const { data: items } = await supabase
                  .from('document_request_items')
                  .select(`
                    id,
                    document_id,
                    document:documents(id, title, document_type)
                  `)
                  .eq('document_request_id', req.id);

                return {
                  ...req,
                  items: items || [],
                };
              } catch (err) {
                console.error('⚠️ Error fetching items:', err);
                return {
                  ...req,
                  items: [],
                };
              }
            })
          );
        }
        
        return res.status(200).json({
          success: true,
          data: enrichedRequests || [],
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

// Create Document Request
async function createDocumentRequest(req, res) {
  const { ownerId, ownerEmail, ownerName, issuerId, issuerEmail, documentIds, message } = req.body;

  console.log('📋 Creating document request...');
  
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
  } catch (error) {
    console.error('❌ Create Request Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Create Document
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

// Update Document Request
async function updateDocumentRequest(req, res) {
  const { id, status, issuerMessage, signatureId, documentId, processedBy, approvedBy, fileBase64, fileName, fileSize, ownerId, issuerId } = req.body;

  console.log('📝 Updating document request:', id);
  console.log('🔍 Params:', { status, ownerId, issuerId, fileName });

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
      console.log('📤 File:', fileName, 'Size:', fileSize);
      
      try {
        // Sanitize filename - remove special characters
        const sanitizedFileName = fileName
          .replace(/[^\w\s.-]/g, '_') // Replace special chars with underscore
          .replace(/\s+/g, '_') // Replace spaces with underscore
          .substring(0, 100); // Limit length

        console.log('🔧 Original filename:', fileName);
        console.log('🔧 Sanitized filename:', sanitizedFileName);

        // Upload file to Supabase Storage using SERVICE_ROLE_KEY
        const filePath = `documents/${issuerId}/${id}/${sanitizedFileName}`;
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        console.log('📤 Uploading to:', filePath);
        console.log('👤 Owner ID:', ownerId, 'Issuer ID:', issuerId);
        console.log('📦 File buffer size:', fileBuffer.length);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issued-documents')
          .upload(filePath, fileBuffer, {
            contentType: 'application/octet-stream', // Use generic type
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ Upload Error:', uploadError);
          console.error('Error details:', JSON.stringify(uploadError));
          console.error('Status:', uploadError.statusCode);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log('✅ File uploaded successfully');
        console.log('📦 Upload data:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('issued-documents')
          .getPublicUrl(filePath);

        console.log('✅ Public URL:', publicUrl);

        // Create a document record for this issued document
        const { data: newDocument, error: newDocError } = await supabase
          .from('documents')
          .insert({
            id: uuidv4(),
            issuer_id: issuerId,
            owner_id: ownerId,
            title: fileName || 'Issued Document',
            document_type: 'certificate', // Use valid type
            status: 'active',
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
            document_id: newDocument.id, // Reference the created document
            document_type: 'issued_document',
            file_url: publicUrl,
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
        console.log('📤 Creating document_shares...');
        
        // Set expiry to 90 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        const shareData = {
          id: uuidv4(),
          document_id: newDocument.id, // Reference the created document
          owner_id: ownerId,
          recipient_email: updated.owner_email || 'unknown@example.com',
          share_token: crypto.randomBytes(32).toString('hex'),
          permissions: ['view', 'print', 'share'], // text array
          expires_at: expiresAt.toISOString(),
        };

        console.log('📋 Share INSERT data:', shareData);

        const { data: createdShare, error: shareError } = await supabase
          .from('document_shares')
          .insert(shareData)
          .select()
          .single();

        if (shareError) {
          console.error('❌ SHARE ERROR:', shareError);
          console.error('Error code:', shareError.code);
          console.error('Error message:', shareError.message);
          throw shareError;
        }

        console.log('✅ Document shared successfully:', createdShare);

        return res.status(200).json({
          success: true,
          data: {
            request: updated,
            issuedDocument: issuedDoc,
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
      .select('*')
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

  try {
    const { data: requests, error } = await supabase
      .from('document_access_requests')
      .select('*')
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
