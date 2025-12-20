// ============================================
// ADD THESE ENDPOINTS TO YOUR api/index.js
// ============================================
// Just copy this entire section and paste it at the end of your api/index.js file
// BEFORE the final export or module.exports

// ============================================
// DOCUMENT REQUEST ENDPOINTS
// ============================================

// 1. GET /api/issuers
// Get all available issuers (users with role='issuer')
app.get('/api/issuers', async (req, res) => {
  try {
    console.log('📥 GET /api/issuers');

    const issuers = await db.User.findAll({
      where: { role: 'issuer' },
      attributes: [
        'id',
        'email',
        'organization_name',
        'organization_type',
        'created_at'
      ],
      raw: true,
    });

    console.log(`✅ Found ${issuers.length} issuers`);

    res.json({
      success: true,
      data: issuers,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/issuers:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 2. POST /api/document-requests
// Owner creates a document request
app.post('/api/document-requests', async (req, res) => {
  try {
    const {
      ownerId,
      ownerEmail,
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

    // Validation
    if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ownerId, issuerId, documentIds',
      });
    }

    // Verify issuer exists and has role='issuer'
    const issuer = await db.User.findByPk(issuerId);
    if (!issuer) {
      return res.status(404).json({
        success: false,
        error: 'Issuer not found',
      });
    }

    if (issuer.role !== 'issuer') {
      return res.status(400).json({
        success: false,
        error: 'User is not an issuer',
      });
    }

    // Create the request record
    const { v4: uuidv4 } = require('uuid');
    const requestId = uuidv4();

    const documentRequest = await db.DocumentRequest.create({
      id: requestId,
      owner_id: ownerId,
      owner_email: ownerEmail,
      issuer_id: issuerId,
      issuer_email: issuerEmail,
      issuer_organization: issuer.organization_name,
      status: 'pending',
      message: message || null,
    });

    // Create document request items
    const items = documentIds.map(docId => ({
      id: uuidv4(),
      document_request_id: requestId,
      document_id: docId,
    }));

    await db.DocumentRequestItem.bulkCreate(items);

    console.log(`✅ Created request ${requestId} with ${documentIds.length} documents`);

    res.status(201).json({
      success: true,
      data: {
        id: requestId,
        owner_id: ownerId,
        issuer_id: issuerId,
        status: 'pending',
        message: message || null,
        document_count: documentIds.length,
        created_at: documentRequest.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Error in POST /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 3. GET /api/document-requests
// Get document requests (filtered by ownerId OR issuerId)
app.get('/api/document-requests', async (req, res) => {
  try {
    const { ownerId, issuerId } = req.query;

    console.log('📥 GET /api/document-requests', { ownerId, issuerId });

    // Must provide one filter
    if (!ownerId && !issuerId) {
      return res.status(400).json({
        success: false,
        error: 'Must provide ownerId or issuerId query parameter',
      });
    }

    // Build where clause
    const where = {};
    if (ownerId) {
      where.owner_id = ownerId;
    } else if (issuerId) {
      where.issuer_id = issuerId;
    }

    // Fetch requests with associated documents
    const requests = await db.DocumentRequest.findAll({
      where,
      include: [
        {
          model: db.DocumentRequestItem,
          as: 'items',
          attributes: ['id'],
          include: [
            {
              model: db.Document,
              attributes: ['id', 'title', 'document_type'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Transform response to match expected format
    const transformedRequests = requests.map(req => ({
      id: req.id,
      owner_id: req.owner_id,
      ownerEmail: req.owner_email,
      owner_name: req.owner_name,
      issuer_id: req.issuer_id,
      issuerEmail: req.issuer_email,
      issuer_organization: req.issuer_organization,
      status: req.status,
      message: req.message,
      issuer_message: req.issuer_message,
      documents: (req.items || []).map(item => item.Document),
      created_at: req.created_at,
      updated_at: req.updated_at,
    }));

    console.log(`✅ Found ${transformedRequests.length} requests`);

    res.json({
      success: true,
      data: transformedRequests,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 4. PUT /api/document-requests
// Issuer updates request status (approve/reject)
app.put('/api/document-requests', async (req, res) => {
  try {
    const { id, status, message } = req.body;

    console.log('🔄 PUT /api/document-requests', { id, status });

    // Validation
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, status',
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    // Find request
    const documentRequest = await db.DocumentRequest.findByPk(id);
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Document request not found',
      });
    }

    // Update request
    await documentRequest.update({
      status,
      issuer_message: message || null,
      updated_at: new Date(),
    });

    console.log(`✅ Updated request ${id} to ${status}`);

    res.json({
      success: true,
      data: {
        id: documentRequest.id,
        status: documentRequest.status,
        issuer_message: documentRequest.issuer_message,
        updated_at: documentRequest.updated_at,
      },
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 5. DELETE /api/document-requests (optional bonus)
app.delete('/api/document-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /api/document-requests', { id });

    const documentRequest = await db.DocumentRequest.findByPk(id);
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Document request not found',
      });
    }

    // Delete associated items first
    await db.DocumentRequestItem.destroy({
      where: { document_request_id: id },
    });

    // Delete request
    await documentRequest.destroy();

    console.log(`✅ Deleted request ${id}`);

    res.json({
      success: true,
      message: 'Request deleted',
    });
  } catch (error) {
    console.error('❌ Error in DELETE /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// END OF DOCUMENT REQUEST ENDPOINTS
// ============================================
