import React, { useState, useEffect } from 'react';
import { FiShare2, FiLock, FiEye, FiPrinter, FiDownload, FiTrash2, FiCheck, FiX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Document Viewer Component
 * - Print-only by default
 * - No system download
 * - Owner controls permissions
 */
export function DocumentViewer({ document, sharePermissions }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{document.file_name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Issued by: {document.issuer_name || 'Unknown'}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2">
          {/* Print Button */}
          {sharePermissions?.print && (
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              title="Print this document"
            >
              <FiPrinter className="mr-2" />
              Print
            </button>
          )}

          {/* Download Button (only if owner allows) */}
          {sharePermissions?.download ? (
            <a
              href={document.file_url}
              download
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              title="Download document"
            >
              <FiDownload className="mr-2" />
              Download
            </a>
          ) : (
            <button
              disabled
              title="Download not allowed by owner"
              className="flex items-center bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              <FiDownload className="mr-2" />
              <span className="line-through">Download</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="p-6 bg-gray-50 min-h-[600px]">
        {document.file_url ? (
          <iframe
            src={document.file_url}
            title="Document"
            className="w-full h-[600px] border border-gray-200 rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center h-[600px] text-gray-500">
            <p>Document not available</p>
          </div>
        )}
      </div>

      {/* Permissions Info */}
      <div className="p-6 bg-yellow-50 border-t border-gray-200">
        <p className="text-sm text-yellow-700 flex items-center">
          <FiLock className="mr-2" />
          This document is protected. Permissions set by owner:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-yellow-600 ml-6">
          <li>✓ View: Allowed</li>
          <li>{sharePermissions?.print ? '✓ Print: Allowed' : '✗ Print: Not allowed'}</li>
          <li>{sharePermissions?.download ? '✓ Download: Allowed' : '✗ Download: Not allowed'}</li>
          <li>{sharePermissions?.share ? '✓ Share: Allowed' : '✗ Share: Not allowed'}</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Share Document Modal
 * - Owner shares with specific people
 * - Controls permissions (print, download, share)
 */
export function ShareDocumentModal({ document, isOpen, onClose, onShare }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [canPrint, setCanPrint] = useState(true);
  const [canDownload, setCanDownload] = useState(false); // Default: NO
  const [canShare, setCanShare] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    setIsSubmitting(true);

    try {
      await onShare({
        documentId: document.id,
        recipientEmail,
        canPrint,
        canDownload,
        canShare,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      setRecipientEmail('');
      setCanPrint(true);
      setCanDownload(false);
      setCanShare(false);
      setExpiresAt('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FiShare2 className="mr-2" />
          Share Document
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 text-sm">Permissions</h3>

            {/* Print */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={canPrint}
                onChange={(e) => setCanPrint(e.target.checked)}
                className="mr-3"
              />
              <FiPrinter className="mr-2 text-gray-600" size={16} />
              <span className="text-sm text-gray-700">Allow Printing</span>
            </label>

            {/* Download - Clearly marked as restricted */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={canDownload}
                onChange={(e) => setCanDownload(e.target.checked)}
                className="mr-3"
              />
              <FiDownload className="mr-2 text-gray-600" size={16} />
              <span className="text-sm text-gray-700">
                Allow Download
                <span className="text-red-600 font-medium ml-1">(Restricted)</span>
              </span>
            </label>

            {/* Share */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={canShare}
                onChange={(e) => setCanShare(e.target.checked)}
                className="mr-3"
              />
              <FiShare2 className="mr-2 text-gray-600" size={16} />
              <span className="text-sm text-gray-700">Allow Re-sharing</span>
            </label>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiClock className="mr-1" size={16} />
              Expires (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 By default, downloads are not allowed. Recipient can only view and print.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Access Control Panel
 * - Show all shares
 * - Show pending access requests
 * - Manage permissions
 */
export function DocumentAccessControl({ document, ownerId }) {
  const [shares, setShares] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessData();
  }, [document.id]);

  const fetchAccessData = async () => {
    try {
      // Fetch shares
      const sharesRes = await fetch(
        `/api/documents?endpoint=document-shares&ownerId=${ownerId}`
      );
      if (sharesRes.ok) {
        const data = await sharesRes.json();
        setShares(data.data || []);
      }

      // Fetch access requests
      const requestsRes = await fetch(
        `/api/documents?endpoint=access-requests&ownerId=${ownerId}`
      );
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setAccessRequests(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching access data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (shareId) => {
    if (!window.confirm('Revoke access for this recipient?')) return;

    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'revoke-share',
          shareId,
          ownerId,
        }),
      });

      if (res.ok) {
        toast.success('Access revoked');
        fetchAccessData();
      }
    } catch (err) {
      toast.error('Error revoking access');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'approve-access',
          requestId,
          ownerId,
          canDownload: false, // Default: NO download
        }),
      });

      if (res.ok) {
        toast.success('Access approved');
        fetchAccessData();
      }
    } catch (err) {
      toast.error('Error approving access');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'reject-access',
          requestId,
          ownerId,
        }),
      });

      if (res.ok) {
        toast.success('Access request rejected');
        fetchAccessData();
      }
    } catch (err) {
      toast.error('Error rejecting request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Shares */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Shares</h3>

        {shares.filter(s => !s.is_revoked).length === 0 ? (
          <p className="text-gray-500 text-sm">No active shares</p>
        ) : (
          <div className="space-y-3">
            {shares
              .filter(s => !s.is_revoked)
              .map(share => (
                <div key={share.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{share.recipient_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Print: {share.can_print ? '✓' : '✗'} | Download: {share.can_download ? '✓' : '✗'} | Share: {share.can_share ? '✓' : '✗'}
                      </p>
                      {share.expires_at && (
                        <p className="text-xs text-orange-600 mt-1">
                          Expires: {new Date(share.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRevokeShare(share.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                      title="Revoke access"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Access Requests */}
      {accessRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Access Requests ({accessRequests.length})
          </h3>

          <div className="space-y-3">
            {accessRequests.map(request => (
              <div key={request.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{request.requester_email}</p>
                    {request.requester_name && (
                      <p className="text-sm text-gray-600">{request.requester_name}</p>
                    )}
                  </div>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    Pending
                  </span>
                </div>

                {request.reason && (
                  <p className="text-sm text-gray-600 mb-3 p-2 bg-white rounded italic">
                    "{request.reason}"
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="flex items-center text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm"
                  >
                    <FiCheck className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex items-center text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm"
                  >
                    <FiX className="mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
