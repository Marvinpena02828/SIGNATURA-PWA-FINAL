import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiEye, FiPrinter, FiShare2, FiDownload, FiX, FiClock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReceivedDocuments() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    if (role !== 'owner') {
      navigate('/');
      return;
    }
    fetchReceivedDocuments();
  }, [role, navigate, user?.id]);

  const fetchReceivedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching received documents for owner:', user?.id);

      if (!user || !user.id) {
        console.warn('⚠️ User ID not available');
        setLoading(false);
        return;
      }

      // Fetch documents shared with this owner
      const res = await fetch(`/api/documents?endpoint=document-shares&ownerId=${user.id}`);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Documents fetched:', data.data);
        if (data.success) {
          setReceivedDocuments(data.data || []);
        }
      } else {
        console.error(`❌ Fetch failed: ${res.status}`);
        setReceivedDocuments([]);
      }
    } catch (err) {
      console.error('⚠️ Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc) => {
    if (!doc.can_view) {
      toast.error('You do not have permission to view this document');
      return;
    }
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handlePrint = () => {
    if (!selectedDocument.can_print) {
      toast.error('You do not have permission to print this document');
      return;
    }
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleShare = async () => {
    if (!selectedDocument.can_share) {
      toast.error('You do not have permission to share this document');
      return;
    }

    // Copy share link to clipboard
    const shareLink = `${window.location.origin}/shared/${selectedDocument.share_token}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  const isDocumentExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return 'No expiry';
    const remaining = new Date(expiresAt) - new Date();
    if (remaining < 0) return 'Expired';
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d remaining`;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.')?.pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return '🖼️';
    }
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">📥 Received Documents</h1>
            <p className="text-gray-600 text-sm">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Total Documents</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{receivedDocuments.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Active</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {receivedDocuments.filter(d => !isDocumentExpired(d.expires_at)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-600 text-sm font-medium">Expired</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {receivedDocuments.filter(d => isDocumentExpired(d.expires_at)).length}
            </p>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">Documents Shared With You</h2>
            <p className="text-sm text-gray-500 mt-1">Click on a document to view, print, or share</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receivedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No documents shared with you yet
                    </td>
                  </tr>
                ) : (
                  receivedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(doc.file_name)}</span>
                          <span>{doc.file_name || 'Document'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {doc.issuer_organization || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isDocumentExpired(doc.expires_at) ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <FiX size={14} />
                            Expired
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <FiClock size={14} />
                            {getRemainingTime(doc.expires_at)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {doc.can_view && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">View</span>}
                          {doc.can_print && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Print</span>}
                          {doc.can_download && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Download</span>}
                          {doc.can_share && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Share</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleViewDocument(doc)}
                          disabled={!doc.can_view || isDocumentExpired(doc.expires_at)}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!doc.can_view ? 'No permission' : ''}
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={handlePrint}
                          disabled={!doc.can_print || !selectedDocument || selectedDocument.id !== doc.id}
                          className="text-green-600 hover:bg-green-50 px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!doc.can_print ? 'No permission' : 'Print'}
                        >
                          <FiPrinter size={16} />
                        </button>
                        {doc.can_share && (
                          <button
                            onClick={handleShare}
                            disabled={!selectedDocument || selectedDocument.id !== doc.id}
                            className="text-orange-600 hover:bg-orange-50 px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Share"
                          >
                            <FiShare2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* VIEW DOCUMENT MODAL */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-signatura-dark">
                  {getFileIcon(selectedDocument.file_name)} {selectedDocument.file_name}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  From: {selectedDocument.issuer_organization || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Document Preview */}
            <div className="p-6">
              {selectedDocument.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // Image Preview
                <div className="flex justify-center">
                  <img
                    src={selectedDocument.file_url}
                    alt={selectedDocument.file_name}
                    className="max-w-full h-auto rounded-lg"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toast.error('Right-click is disabled for security');
                      return false;
                    }}
                  />
                </div>
              ) : (
                // PDF Preview (using iframe)
                <div className="flex justify-center">
                  <iframe
                    src={selectedDocument.file_url}
                    className="w-full h-[600px] rounded-lg border border-gray-200"
                    title={selectedDocument.file_name}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toast.error('Right-click is disabled for security');
                      return false;
                    }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-lg font-medium text-gray-900">
                    {(selectedDocument.file_size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Received</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(selectedDocument.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handlePrint}
                  disabled={!selectedDocument.can_print}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPrinter />
                  Print
                </button>
                {selectedDocument.can_share && (
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <FiShare2 />
                    Share Link
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              {/* Notice */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">📋 Security Notice:</span> This document cannot be downloaded to your computer for security purposes. You can view and print it here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
