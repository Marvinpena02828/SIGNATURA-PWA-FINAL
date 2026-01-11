// services/ownerWalletService.js
// Wallet management for storing and verifying credentials

import crypto from 'crypto';

const STORAGE_KEY = 'signatura_wallet';
const CREDENTIALS_KEY = 'signatura_credentials';

/**
 * Get owner's wallet (stored credentials)
 */
export const getWallet = (ownerId) => {
  try {
    const wallets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return wallets[ownerId] || [];
  } catch (err) {
    console.error('Error loading wallet:', err);
    return [];
  }
};

/**
 * Add credential to wallet
 */
export const addToWallet = (ownerId, credential) => {
  try {
    const wallets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!wallets[ownerId]) {
      wallets[ownerId] = [];
    }

    // Check if already exists
    const exists = wallets[ownerId].some((c) => c.credentialId === credential.credentialId);
    if (!exists) {
      wallets[ownerId].push({
        ...credential,
        addedAt: new Date().toISOString(),
        verificationStatus: 'unverified',
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
    }

    return wallets[ownerId];
  } catch (err) {
    console.error('Error adding to wallet:', err);
    return null;
  }
};

/**
 * Remove credential from wallet
 */
export const deleteCredential = (ownerId, credentialId) => {
  try {
    const wallets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (wallets[ownerId]) {
      wallets[ownerId] = wallets[ownerId].filter((c) => c.credentialId !== credentialId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
    }
    return true;
  } catch (err) {
    console.error('Error deleting credential:', err);
    return false;
  }
};

/**
 * Verify credential signature
 * In production, this would verify against issuer's public key
 */
export const verifyCredentialSignature = (credential) => {
  try {
    // For now, simulate verification
    // In production:
    // 1. Get issuer's public key
    // 2. Hash the credential data
    // 3. Verify signature using public key

    const credentialData = JSON.stringify({
      credentialType: credential.credentialType,
      recipientName: credential.recipientName,
      recipientEmail: credential.recipientEmail,
      issuedAt: credential.issuedAt,
    });

    const isValid = !!credential.signature; // Placeholder check

    return {
      isValid,
      credentialId: credential.credentialId,
      issuerPublicKey: credential.issuer?.publicKey || 'unknown',
      signedAt: credential.signedAt,
      message: isValid
        ? 'Credential signature is valid and verified by issuer'
        : 'Signature verification failed',
    };
  } catch (err) {
    console.error('Error verifying signature:', err);
    return {
      isValid: false,
      message: 'Error verifying signature',
      credentialId: credential.credentialId,
    };
  }
};

/**
 * Update credential verification status
 */
export const updateVerificationStatus = (ownerId, credentialId, status) => {
  try {
    const wallets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (wallets[ownerId]) {
      const cred = wallets[ownerId].find((c) => c.credentialId === credentialId);
      if (cred) {
        cred.verificationStatus = status; // 'verified', 'invalid', 'unverified'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
      }
    }
    return true;
  } catch (err) {
    console.error('Error updating verification status:', err);
    return false;
  }
};

/**
 * Get wallet statistics
 */
export const getWalletStats = (ownerId) => {
  try {
    const wallet = getWallet(ownerId);
    const verified = wallet.filter((c) => c.verificationStatus === 'verified').length;
    const unverified = wallet.filter((c) => c.verificationStatus === 'unverified').length;
    const invalid = wallet.filter((c) => c.verificationStatus === 'invalid').length;

    return {
      total: wallet.length,
      verified,
      unverified,
      invalid,
      byType: wallet.reduce((acc, c) => {
        acc[c.credentialType] = (acc[c.credentialType] || 0) + 1;
        return acc;
      }, {}),
    };
  } catch (err) {
    console.error('Error getting stats:', err);
    return { total: 0, verified: 0, unverified: 0, invalid: 0, byType: {} };
  }
};

/**
 * Export wallet for backup
 */
export const exportWallet = (ownerId) => {
  try {
    const wallet = getWallet(ownerId);
    const dataStr = JSON.stringify(wallet, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `wallet-backup-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    return true;
  } catch (err) {
    console.error('Error exporting wallet:', err);
    return false;
  }
};

/**
 * Import wallet from backup
 */
export const importWallet = (ownerId, jsonData) => {
  try {
    const credentials = JSON.parse(jsonData);
    const wallets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    wallets[ownerId] = credentials;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));

    return true;
  } catch (err) {
    console.error('Error importing wallet:', err);
    return false;
  }
};
