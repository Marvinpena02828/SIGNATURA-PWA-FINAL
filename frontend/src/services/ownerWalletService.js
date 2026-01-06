// src/services/ownerWalletService.js
// Owner Wallet Management - Store, organize, and verify credentials

import { verifySignature, validateSignedDocument } from './signatureEngine';

/**
 * Add credential to owner's wallet
 */
export const addCredentialToWallet = async (credential, ownerId) => {
  try {
    const walletEntry = {
      id: credential.id || generateId(),
      credentialId: credential.id,
      ownerId,
      recipientName: credential.recipientName,
      recipientEmail: credential.recipientEmail,
      credentialType: credential.credentialType,
      data: credential.data,
      issuer: {
        publicKey: credential.issuer.publicKey,
        signature: credential.issuer.signature,
      },
      documentHash: credential.documentHash,
      signedAt: credential.signedAt,
      expiresAt: credential.expiresAt,
      isValid: credential.isValid,
      addedToWallet: new Date().toISOString(),
      permissions: {
        canView: true,
        canPrint: true,
        canShare: true,
        canDownload: false,
      },
      visibility: 'private', // 'private', 'shared', 'public'
      sharedWith: [],
      verificationStatus: 'pending', // 'pending', 'verified', 'invalid'
    };

    // Verify signature immediately
    const isValid = verifySignature(
      {
        id: credential.id,
        credentialType: credential.credentialType,
        recipientEmail: credential.recipientEmail,
        recipientName: credential.recipientName,
        data: credential.data,
        issuedAt: credential.signedAt,
      },
      credential.issuer.signature,
      credential.issuer.publicKey
    );

    walletEntry.verificationStatus = isValid ? 'verified' : 'invalid';

    // Store in localStorage for now (will be synced to backend)
    const wallet = getWallet(ownerId);
    wallet.push(walletEntry);
    localStorage.setItem(`wallet_${ownerId}`, JSON.stringify(wallet));

    return {
      success: true,
      credential: walletEntry,
    };
  } catch (error) {
    console.error('Add credential error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get owner's complete wallet
 */
export const getWallet = (ownerId) => {
  try {
    const stored = localStorage.getItem(`wallet_${ownerId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get wallet error:', error);
    return [];
  }
};

/**
 * Get credential from wallet
 */
export const getCredential = (ownerId, credentialId) => {
  const wallet = getWallet(ownerId);
  return wallet.find((c) => c.credentialId === credentialId);
};

/**
 * Verify credential signature
 */
export const verifyCredentialSignature = (credential) => {
  try {
    const credentialData = {
      id: credential.credentialId,
      credentialType: credential.credentialType,
      recipientEmail: credential.recipientEmail,
      recipientName: credential.recipientName,
      data: credential.data,
      issuedAt: credential.signedAt,
    };

    const isValid = verifySignature(
      credentialData,
      credential.issuer.signature,
      credential.issuer.publicKey
    );

    return {
      isValid,
      credentialId: credential.credentialId,
      issuerPublicKey: credential.issuer.publicKey,
      signedAt: credential.signedAt,
      message: isValid ? 'Credential is authentic and unmodified' : 'Credential signature is invalid',
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

/**
 * Update credential permissions
 */
export const updateCredentialPermissions = (ownerId, credentialId, permissions) => {
  try {
    const wallet = getWallet(ownerId);
    const credential = wallet.find((c) => c.credentialId === credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    credential.permissions = { ...credential.permissions, ...permissions };
    localStorage.setItem(`wallet_${ownerId}`, JSON.stringify(wallet));

    return {
      success: true,
      credential,
    };
  } catch (error) {
    console.error('Update permissions error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Set credential visibility
 */
export const setCredentialVisibility = (ownerId, credentialId, visibility) => {
  try {
    const wallet = getWallet(ownerId);
    const credential = wallet.find((c) => c.credentialId === credentialId);

    if (!credential) {
      return { success: false, error: 'Credential not found' };
    }

    credential.visibility = visibility; // 'private', 'shared', 'public'
    localStorage.setItem(`wallet_${ownerId}`, JSON.stringify(wallet));

    return {
      success: true,
      credential,
    };
  } catch (error) {
    console.error('Set visibility error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get credentials by type
 */
export const getCredentialsByType = (ownerId, credentialType) => {
  const wallet = getWallet(ownerId);
  return wallet.filter((c) => c.credentialType === credentialType);
};

/**
 * Get verified credentials only
 */
export const getVerifiedCredentials = (ownerId) => {
  const wallet = getWallet(ownerId);
  return wallet.filter((c) => c.verificationStatus === 'verified');
};

/**
 * Search credentials
 */
export const searchCredentials = (ownerId, query) => {
  const wallet = getWallet(ownerId);
  const lowerQuery = query.toLowerCase();

  return wallet.filter(
    (c) =>
      c.recipientName.toLowerCase().includes(lowerQuery) ||
      c.credentialType.toLowerCase().includes(lowerQuery) ||
      c.data.toString().toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get wallet statistics
 */
export const getWalletStats = (ownerId) => {
  const wallet = getWallet(ownerId);
  const verified = wallet.filter((c) => c.verificationStatus === 'verified').length;
  const byType = {};

  wallet.forEach((c) => {
    byType[c.credentialType] = (byType[c.credentialType] || 0) + 1;
  });

  return {
    total: wallet.length,
    verified,
    invalid: wallet.length - verified,
    byType,
    expiringIn30Days: wallet.filter(
      (c) =>
        c.expiresAt && new Date(c.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length,
  };
};

/**
 * Export credential as JSON
 */
export const exportCredential = (credential) => {
  try {
    const json = JSON.stringify(credential, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', `${credential.credentialId}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import credential from JSON
 */
export const importCredential = (ownerId, jsonData) => {
  try {
    const credential = JSON.parse(jsonData);

    // Validate credential structure
    if (!credential.credentialId || !credential.issuer) {
      return { success: false, error: 'Invalid credential format' };
    }

    return addCredentialToWallet(credential, ownerId);
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete credential from wallet
 */
export const deleteCredential = (ownerId, credentialId) => {
  try {
    const wallet = getWallet(ownerId);
    const filtered = wallet.filter((c) => c.credentialId !== credentialId);
    localStorage.setItem(`wallet_${ownerId}`, JSON.stringify(filtered));

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear entire wallet (careful!)
 */
export const clearWallet = (ownerId) => {
  try {
    localStorage.removeItem(`wallet_${ownerId}`);
    return { success: true };
  } catch (error) {
    console.error('Clear error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper: Generate unique ID
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  addCredentialToWallet,
  getWallet,
  getCredential,
  verifyCredentialSignature,
  updateCredentialPermissions,
  setCredentialVisibility,
  getCredentialsByType,
  getVerifiedCredentials,
  searchCredentials,
  getWalletStats,
  exportCredential,
  importCredential,
  deleteCredential,
  clearWallet,
};
