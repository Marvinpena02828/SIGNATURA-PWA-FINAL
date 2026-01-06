// src/services/issuerService.js
// Issuer Module Service - Handles credential creation and management

import { signDocument, createSignedDocument } from './signatureEngine';

/**
 * Create a new credential template
 */
export const createCredentialTemplate = async (issuerData) => {
  try {
    const {
      issuerEmail,
      issuerId,
      issuerPublicKey,
      templateName,
      templateDescription,
      fields,
    } = issuerData;

    const template = {
      id: generateId(),
      issuerEmail,
      issuerId,
      issuerPublicKey,
      templateName,
      templateDescription,
      fields: fields || [], // Custom fields for this credential type
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error('Template creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Issue a credential to a recipient
 */
export const issueCredential = async (credentialData, issuerSecretKey, issuerPublicKey) => {
  try {
    const {
      recipientEmail,
      recipientName,
      templateId,
      credentialType, // 'diploma', 'certificate', 'license', etc.
      data, // Custom data for the credential
      expiresAt,
    } = credentialData;

    // Create credential object
    const credential = {
      id: generateId(),
      credentialType,
      recipientEmail,
      recipientName,
      templateId,
      data,
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      status: 'issued',
    };

    // Sign the credential
    const signedCredential = createSignedDocument(
      credential,
      issuerSecretKey,
      issuerPublicKey
    );

    return {
      success: true,
      credential: signedCredential,
      credentialId: credential.id,
    };
  } catch (error) {
    console.error('Credential issuance error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Revoke a credential
 */
export const revokeCredential = async (credentialId, issuerData) => {
  try {
    const {
      revocationReason,
      revokedAt = new Date().toISOString(),
    } = issuerData;

    const revocation = {
      credentialId,
      revocationReason,
      revokedAt,
      status: 'revoked',
    };

    return {
      success: true,
      revocation,
    };
  } catch (error) {
    console.error('Revocation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all credentials issued by issuer
 */
export const getIssuedCredentials = async (issuerId) => {
  try {
    // This would call backend endpoint
    const response = await fetch(`/api/issuer/${issuerId}/credentials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch credentials');
    }

    return {
      success: true,
      credentials: data.credentials,
      total: data.total,
    };
  } catch (error) {
    console.error('Fetch credentials error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get credential details
 */
export const getCredentialDetails = async (credentialId) => {
  try {
    const response = await fetch(`/api/credentials/${credentialId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch credential');
    }

    return {
      success: true,
      credential: data.credential,
    };
  } catch (error) {
    console.error('Fetch credential error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Batch issue credentials
 */
export const batchIssueCredentials = async (credentialsData, issuerSecretKey, issuerPublicKey) => {
  try {
    const issuedCredentials = [];
    const errors = [];

    for (let i = 0; i < credentialsData.length; i++) {
      const credData = credentialsData[i];
      const result = await issueCredential(credData, issuerSecretKey, issuerPublicKey);

      if (result.success) {
        issuedCredentials.push({
          ...result.credential,
          recipientEmail: credData.recipientEmail,
        });
      } else {
        errors.push({
          index: i,
          email: credData.recipientEmail,
          error: result.error,
        });
      }
    }

    return {
      success: errors.length === 0,
      issued: issuedCredentials,
      failed: errors,
      summary: {
        total: credentialsData.length,
        successful: issuedCredentials.length,
        failed: errors.length,
      },
    };
  } catch (error) {
    console.error('Batch issuance error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get issuer statistics
 */
export const getIssuerStats = async (issuerId) => {
  try {
    const response = await fetch(`/api/issuer/${issuerId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stats');
    }

    return {
      success: true,
      stats: data.stats,
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate credential QR code
 */
export const generateCredentialQR = (credentialId, verificationUrl) => {
  try {
    const qrData = {
      credentialId,
      verificationUrl: `${verificationUrl}?cred=${credentialId}`,
      timestamp: new Date().toISOString(),
    };

    // In real implementation, use qrcode library
    // For now, return the data
    return {
      success: true,
      qrData,
    };
  } catch (error) {
    console.error('QR generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Helper: Generate unique ID
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Helper: Get auth token from storage
 */
const getToken = () => {
  return localStorage.getItem('authToken') || '';
};

export default {
  createCredentialTemplate,
  issueCredential,
  revokeCredential,
  getIssuedCredentials,
  getCredentialDetails,
  batchIssueCredentials,
  getIssuerStats,
  generateCredentialQR,
};
