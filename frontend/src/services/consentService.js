// services/consentService.js
// Consent and sharing management for credentials

const SHARES_KEY = 'signatura_shares';
const SHARE_REQUESTS_KEY = 'signatura_share_requests';

/**
 * Create a share request for a credential
 */
export const createShareRequest = async (
  credentialId,
  issuerPublicKey,
  verifierEmail,
  permissions
) => {
  try {
    // Generate unique share token
    const shareToken = generateShareToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

    const shareRequest = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      credentialId,
      verifierEmail,
      shareToken,
      permissions,
      status: 'pending', // pending, approved, revoked
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      issuerPublicKey,
    };

    // Save to local storage
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    shares.push(shareRequest);
    localStorage.setItem(SHARES_KEY, JSON.stringify(shares));

    // In production: send to backend/issuer for final approval
    const shareLink = `${window.location.origin}/shared/${shareToken}`;

    return {
      success: true,
      share: shareRequest,
      shareLink,
      message: 'Share request created. Awaiting approval.',
    };
  } catch (err) {
    console.error('Error creating share request:', err);
    return {
      success: false,
      error: 'Failed to create share request',
    };
  }
};

/**
 * Get shares for a specific credential
 */
export const getSharesByCredential = (credentialId) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    return shares.filter((s) => s.credentialId === credentialId);
  } catch (err) {
    console.error('Error getting shares:', err);
    return [];
  }
};

/**
 * Get all shares for an owner
 */
export const getAllShares = (ownerId) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    // In production, would filter by owner from backend
    return shares;
  } catch (err) {
    console.error('Error getting shares:', err);
    return [];
  }
};

/**
 * Approve a share request
 */
export const approveShare = (shareId) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.id === shareId);

    if (share) {
      share.status = 'approved';
      share.approvedAt = new Date().toISOString();
      localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
      return { success: true, share };
    }

    return { success: false, error: 'Share not found' };
  } catch (err) {
    console.error('Error approving share:', err);
    return { success: false, error: 'Failed to approve share' };
  }
};

/**
 * Revoke a share
 */
export const revokeShare = (shareId, reason = 'Revoked by owner') => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.id === shareId);

    if (share) {
      share.status = 'revoked';
      share.revokedAt = new Date().toISOString();
      share.revokeReason = reason;
      localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
      return { success: true, share };
    }

    return { success: false, error: 'Share not found' };
  } catch (err) {
    console.error('Error revoking share:', err);
    return { success: false, error: 'Failed to revoke share' };
  }
};

/**
 * Check if verifier has permission to access credential
 */
export const checkPermission = (shareToken, permission) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.shareToken === shareToken);

    if (!share) {
      return { granted: false, reason: 'Share not found' };
    }

    if (share.status !== 'approved') {
      return { granted: false, reason: 'Share not approved' };
    }

    if (new Date(share.expiresAt) < new Date()) {
      return { granted: false, reason: 'Share expired' };
    }

    const hasPermission = share.permissions[permission];
    if (!hasPermission) {
      return { granted: false, reason: `Permission "${permission}" not granted` };
    }

    return { granted: true, share };
  } catch (err) {
    console.error('Error checking permission:', err);
    return { granted: false, reason: 'Error checking permission' };
  }
};

/**
 * Get share statistics
 */
export const getShareStats = () => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const now = new Date();

    const active = shares.filter(
      (s) => s.status === 'approved' && new Date(s.expiresAt) > now
    ).length;

    const pending = shares.filter((s) => s.status === 'pending').length;

    const expired = shares.filter(
      (s) => s.status === 'approved' && new Date(s.expiresAt) <= now
    ).length;

    const revoked = shares.filter((s) => s.status === 'revoked').length;

    return {
      total: shares.length,
      active,
      pending,
      expired,
      revoked,
    };
  } catch (err) {
    console.error('Error getting stats:', err);
    return { total: 0, active: 0, pending: 0, expired: 0, revoked: 0 };
  }
};

/**
 * Get credential by share token
 */
export const getCredentialByShareToken = (shareToken, ownerWallet) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.shareToken === shareToken);

    if (!share) {
      return null;
    }

    const credential = ownerWallet.find((c) => c.credentialId === share.credentialId);
    return credential;
  } catch (err) {
    console.error('Error getting credential:', err);
    return null;
  }
};

/**
 * Generate unique share token
 */
const generateShareToken = () => {
  return 'share_' + Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
};

/**
 * Update share expiry
 */
export const updateShareExpiry = (shareId, daysFromNow) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.id === shareId);

    if (share) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysFromNow);
      share.expiresAt = expiresAt.toISOString();
      localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
      return { success: true, share };
    }

    return { success: false, error: 'Share not found' };
  } catch (err) {
    console.error('Error updating expiry:', err);
    return { success: false, error: 'Failed to update expiry' };
  }
};

/**
 * Get share audit log
 */
export const getShareAuditLog = (shareId) => {
  try {
    const shares = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]');
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      return [];
    }

    const log = [
      { event: 'created', timestamp: share.createdAt },
    ];

    if (share.approvedAt) {
      log.push({ event: 'approved', timestamp: share.approvedAt });
    }

    if (share.revokedAt) {
      log.push({ event: 'revoked', timestamp: share.revokedAt, reason: share.revokeReason });
    }

    return log;
  } catch (err) {
    console.error('Error getting audit log:', err);
    return [];
  }
};
