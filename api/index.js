const express = require('express');
const router = express.Router();
const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const { DataTypes } = require('sequelize');

// ============================================
// MODELS
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
// TEST ENDPOINT
// ============================================

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// ============================================
// GET /issuers
// ============================================

router.get('/issuers', async (req, res) => {
  try {
    console.log('📥 GET /api/issuers');

    const issuers = await db.User.findAll({
      where: { role: 'issuer' },
      attributes: ['id', 'email', 'organization_name', 'organization_type', 'created_at'],
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

// ============================================
// POST /document-requests
// ============================================

router.post('/document-requests', async (req, res) => {
  try {
    const { ownerId, ownerEmail, issuerId, issuerEmail, documentIds, message } = req.body;

    console.log('📤 POST /api/document-requests', { ownerId, issuerId, documentCount: documentIds?.length });

    if (!ownerId || !issuerId || !documentIds || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const issuer = await db.User.findByPk(issuerId);
    if (!issuer || issuer.role !== 'issuer') {
      return res.status(404).json({
        success: false,
        error: 'Issuer not found or invalid',
      });
    }

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

    const items = documentIds.map(docId => ({
      id: uuidv4(),
      document_request_id: requestId,
      document_id: docId,
    }));

    await DocumentRequestItem.bulkCreate(items);

    console.log(`✅ Created request ${requestId}`);

    res.status(201).json({
      success: true,
      data: {
        id: requestId,
        status: 'pending',
        document_count: documentIds.length,
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

// ============================================
// GET /document-requests
// ============================================

router.get('/document-requests', async (req, res) => {
  try {
    const { ownerId, issuerId } = req.query;

    console.log('📥 GET /api/document-requests', { ownerId, issuerId });

    if (!ownerId && !issuerId) {
      return res.status(400).json({
        success: false,
        error: 'Must provide ownerId or issuerId',
      });
    }

    const where = {};
    if (ownerId) where.owner_id = ownerId;
    if (issuerId) where.issuer_id = issuerId;

    const requests = await DocumentRequest.findAll({
      where,
      include: [
        {
          model: DocumentRequestItem,
          as: 'items',
          include: [{ model: db.Document, attributes: ['id', 'title'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('❌ Error in GET /api/document-requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// PUT /document-requests
// ============================================

router.put('/document-requests', async (req, res) => {
  try {
    const { id, status, message } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing id or status',
      });
    }

    const documentRequest = await DocumentRequest.findByPk(id);
    if (!documentRequest) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    await documentRequest.update({
      status,
      issuer_message: message || null,
    });

    res.json({
      success: true,
      data: documentRequest,
    });
  } catch (error) {
    console.error('❌ Error in PUT /api/document-requests:', error);
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
