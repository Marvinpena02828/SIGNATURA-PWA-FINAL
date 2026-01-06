// src/services/consentService.js
// Consent Flow Management - Control who sees your credentials

import { createVerificationToken, verifyToken } from './signatureEngine';

/**
 * Create a share/consent request
 */
export const createShareRequest = async (credentialId, ownerPublicKey, verifierEmail, permissions = {}) => {
  try {
    const shareRequest = {
      id: generateId(),
      credentialId,
      ownerPublicKey,
      verifierEmail,
      status: 'pending', // 'pending', 'approved', 'denied', 'revoked'
      permissions: {
        canView: permissions.canView !== false,
        canPrint: permissions.canPrint || false,
        canShare: permissions.canShare || false,
        canDownload: permissions.canDownload || false,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
      verificationToken: createVerificationToken(credentialId, ownerPublicKey, verifierEmail, 7),
      accessLog: [],
    };

    // Store in localStorage
    const shares = getShares();
    shares.push(shareRequest);
    localStorage.setItem('credential_shares', JSON.stringify(shares));

    return {
      success: true,
      shareRequest,
      shareLink: `${window.location.origin}/verify?token=${shareRequest.verificationToken.token}`,
    };
  } catch (error) {
    console.error('Create share error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all share requests
 */
export const getShares = () => {
  try {
    const stored = localStorage.getItem('credential_shares');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Get shares error:', error);
    return [];
  }
};

/**
 * Get share requests by credential
 */
export const getSharesByCredential = (credentialId) => {
  const shares = getShares();
  return shares.filter((s) => s.credentialId === credentialId);
};

/**
 * Approve a share request
 */
export const approveShare = (shareId) => {
  try {
    const shares = getShares();
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      return { success: false, error: 'Share request not found' };
    }

    share.status = 'approved';
    share.approvedAt = new Date().toISOString();
    share.accessLog.push({
      action: 'approved',
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem('credential_shares', JSON.stringify(shares));

    return {
      success: true,
      share,
      message: `Share approved for ${share.verifierEmail}`,
    };
  } catch (error) {
    console.error('Approve error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Deny a share request
 */
export const denyShare = (shareId, reason = '') => {
  try {
    const shares = getShares();
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      return { success: false, error: 'Share request not found' };
    }

    share.status = 'denied';
    share.deniedAt = new Date().toISOString();
    share.denialReason = reason;
    share.accessLog.push({
      action: 'denied',
      reason,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem('credential_shares', JSON.stringify(shares));

    return {
      success: true,
      share,
      message: `Share denied for ${share.verifierEmail}`,
    };
  } catch (error) {
    console.error('Deny error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Revoke a share/consent
 */
export const revokeShare = (shareId, reason = '') => {
  try {
    const shares = getShares();
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      return { success: false, error: 'Share request not found' };
    }

    share.status = 'revoked';
    share.revokedAt = new Date().toISOString();
    share.revocationReason = reason;
    share.accessLog.push({
      action: 'revoked',
      reason,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem('credential_shares', JSON.stringify(shares));

    return {
      success: true,
      share,
      message: `Access revoked for ${share.verifierEmail}`,
    };
  } catch (error) {
    console.error('Revoke error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if share is valid/active
 */
export const isShareValid = (share) => {
  if (share.status !== 'approved') {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(share.expiresAt);

  if (now > expiresAt) {
    return false;
  }

  const tokenValidity = verifyToken(share.verificationToken);
  return tokenValidity.isValid;
};

/**
 * Log credential access
 */
export const logCredentialAccess = (shareId, action = 'viewed') => {
  try {
    const shares = getShares();
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      return { success: false, error: 'Share not found' };
    }

    share.accessLog.push({
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    // Keep log to 100 entries
    if (share.accessLog.length > 100) {
      share.accessLog = share.accessLog.slice(-100);
    }

    localStorage.setItem('credential_shares', JSON.stringify(shares));

    return { success: true };
  } catch (error) {
    console.error('Log access error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get access logs for a share
 */
export const getAccessLogs = (shareId) => {
  const shares = getShares();
  const share = shares.find((s) => s.id === shareId);
  return share?.accessLog || [];
};

/**
 * Check verifier has permission for action
 */
export const checkPermission = (share, action) => {
  if (!isShareValid(share)) {
    return false;
  }

  switch (action) {
    case 'view':
      return share.permissions.canView;
    case 'print':
      return share.permissions.canPrint;
    case 'download':
      return share.permissions.canDownload;
    case 'share':
      return share.permissions.canShare;
    default:
      return false;
  }
};

/**
 * Get all pending shares (awaiting approval)
 */
export const getPendingShares = () => {
  const shares = getShares();
  return shares.filter((s) => s.status === 'pending');
};

/**
 * Get active/approved shares
 */
export const getActiveShares = () => {
  const shares = getShares();
  return shares.filter((s) => isShareValid(s));
};

/**
 * Get expired shares
 */
export const getExpiredShares = () => {
  const shares = getShares();
  const now = new Date();
  return shares.filter((s) => new Date(s.expiresAt) < now);
};

/**
 * Export consent audit trail
 */
export const exportAuditTrail = (credentialId) => {
  try {
    const shares = getSharesByCredential(credentialId);
    const auditData = {
      credentialId,
      exportedAt: new Date().toISOString(),
      shares: shares.map((s) => ({
        verifierEmail: s.verifierEmail,
        status: s.status,
        createdAt: s.createdAt,
        approvedAt: s.approvedAt,
        expiresAt: s.expiresAt,
        permissions: s.permissions,
        accessCount: s.accessLog.length,
        lastAccess: s.accessLog[s.accessLog.length - 1]?.timestamp,
      })),
    };

    const json = JSON.stringify(auditData, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', `audit-trail-${credentialId}.json`);
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
 * Get share statistics
 */
export const getShareStats = () => {
  const shares = getShares();
  const now = new Date();

  return {
    total: shares.length,
    pending: shares.filter((s) => s.status === 'pending').length,
    approved: shares.filter((s) => s.status === 'approved').length,
    denied: shares.filter((s) => s.status === 'denied').length,
    revoked: shares.filter((s) => s.status === 'revoked').length,
    expired: shares.filter((s) => new Date(s.expiresAt) < now).length,
    active: shares.filter((s) => isShareValid(s)).length,
  };
};

/**
 * Helper: Generate unique ID
 */
const generateId = () => {
  return `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  createShareRequest,
  getShares,
  getSharesByCredential,
  approveShare,
  denyShare,
  revokeShare,
  isShareValid,
  logCredentialAccess,
  getAccessLogs,
  checkPermission,
  getPendingShares,
  getActiveShares,
  getExpiredShares,
  exportAuditTrail,
  getShareStats,
};
