// ============================================
// COMPLETE api/index.js - ROUTER VERSION
// ============================================
// This is the COMPLETE file you can copy-paste
// Version: Using router.get(), router.post(), etc.

const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { DataTypes } = require('sequelize');

// ============================================
// YOUR EXISTING ENDPOINTS - KEEP THESE AS-IS
// ============================================

// Example: Add all your existing endpoints here
// (authentication, documents, sharing, verification, etc.)
// Keep everything that's already working

// ============================================
// NEW: MODEL DEFINITIONS
// ============================================

const DocumentRequest = db.sequelize.define('DocumentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  owner_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner_name: DataTypes.STRING,
  issuer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  issuer_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issuer_organization: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  message: DataTypes.TEXT,
  issuer_message: DataTypes.TEXT,
}, {
  tableName: 'document_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

const DocumentRequestItem = db.sequelize.define('DocumentRequestItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  document_request_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'document_request_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Setup associations
DocumentRequest.hasMany(DocumentRequestItem, {
  as: 'items',
  foreignKey: 'document_request_id',
  onDelete: 'CASCADE',
});

DocumentRequestItem.belongsTo(DocumentRequest, {
  foreignKey: 'document_request_id',
});

DocumentRequestItem.belongsTo(db.Document, {
  foreignKey: 'document_id',
});

// ============================================
// NEW: DOCUMENT REQUEST ENDPOINTS
// ============================================

// 1. GET /api/issuers
router.get('/issuers', async (req, res) => {
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
router.post('/document-requests', async (req, res) => {
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

    // Verify issuer exists
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
    const requestId = uuidv4();
    
    const documentRequest = await DocumentRequest.create({
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

    await DocumentRequestItem.bulkCreate(items);

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
router.get('/document-requests', async (req, res) => {
  try {
    const { ownerId, issuerId } = req.query;

    console.log('📥 GET /api/document-requests', { ownerId, issuerId });

    if (!ownerId && !issuerId) {
      return res.status(400).json({
        success: false,
        error: 'Must provide ownerId or issuerId query parameter',
      });
    }

    const where = {};
    if (ownerId) {
      where.owner_id = ownerId;
    } else if (issuerId) {
      where.issuer_id = issuerId;
    }

    const requests = await DocumentRequest.findAll({
      where,
      include: [
        {
          model: DocumentRequestItem,
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
router.put('/document-requests', async (req, res) => {
  try {
    const { id, status, message } = req.body;

    console.log('🔄 PUT /api/document-requests', { id, status });

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

    const documentRequest = await DocumentRequest.findByPk(id);
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Document request not found',
      });
    }

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

// 5. DELETE /api/document-requests/:id (optional)
router.delete('/document-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE /api/document-requests', { id });

    const documentRequest = await DocumentRequest.findByPk(id);
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Document request not found',
      });
    }

    await DocumentRequestItem.destroy({
      where: { document_request_id: id },
    });

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
// EXPORT
// ============================================

module.exports = router;
