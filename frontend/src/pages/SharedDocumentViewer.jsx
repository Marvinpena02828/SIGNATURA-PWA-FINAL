import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SharedDocumentViewer() {
  const { shareToken } = useParams();
  const [document, setDocument] = useState(null);
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedDocument();
  }, [shareToken]);

  const fetchSharedDocument = async () => {
    try {
      setLoading(true);
      console.log('🔐 Verifying share token:', shareToken);

      // Check share access
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'check-share-access',
          shareToken,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Access denied');
      }

      const data = await res.json();
      console.log('✅ Access granted:', data);

      if (data.success) {
        setShareInfo(data.data);
        // Fetch document details
        // You'll need to add an endpoint to fetch document details by share token
        toast.success('✅ Document access authorized');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error(err.message || 'Access denied or document not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Verifying document access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-signatura-red mb-4">❌ Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">This document link is either invalid, expired, or you don't have permission to access it.</p>
        </div>
      </div>
    );
  }

  if (!shareInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-signatura-dark">📄 Shared Document</h1>
          <p className="text-gray-600 text-sm">This document has been shared with you</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Document Information</h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-gray-600">Document ID:</span>
                  <span className="font-medium text-gray-900 ml-2">{shareInfo.document_id}</span>
                </p>
                <p>
                  <span className="text-gray-600">Expires At:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {shareInfo.expires_at ? new Date(shareInfo.expires_at).toLocaleDateString() : 'Never'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Permissions</h3>
              <div className="space-y-2">
                {shareInfo.permissions?.includes('view') && (
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">View Document</span>
                  </div>
                )}
                {shareInfo.permissions?.includes('print') && (
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">Print Document</span>
                  </div>
                )}
                {shareInfo.permissions?.includes('download') && (
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">Download Document</span>
                  </div>
                )}
                {!shareInfo.permissions?.includes('download') && (
                  <div className="flex items-center text-sm">
                    <span className="text-red-600 font-bold mr-2">✗</span>
                    <span className="text-gray-700">Download (Not Allowed)</span>
                  </div>
                )}
                {shareInfo.permissions?.includes('share') && (
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">Share with Others</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📖 Document Preview</h2>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Document viewer loading...</p>
                <p className="text-sm text-gray-400">
                  Integration with document storage in progress
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4 flex-wrap">
              {shareInfo.permissions?.includes('print') && (
                <button
                  onClick={() => {
                    // Open document in new window for printing
                    const printWindow = window.open(shareInfo.document_id, 'print_window');
                    if (printWindow) {
                      printWindow.addEventListener('load', () => {
                        printWindow.print();
                      });
                    } else {
                      toast.error('Failed to open print window. Please check popup blocker.');
                    }
                  }}
                  className="flex-1 min-w-[200px] bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  <FiPrinter className="w-5 h-5" />
                  Print Document
                </button>
              )}
              {shareInfo.permissions?.includes('share') && (
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast.success('Share link copied!');
                  }}
                  className="flex-1 min-w-[200px] bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-5 h-5" />
                  Copy Share Link
                </button>
              )}
            </div>
            {shareInfo.permissions && (
              <p className="text-sm text-gray-500 mt-4">
                💡 Tip: Only actions you have permission for are available above
              </p>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-bold text-blue-900 mb-3">🔒 Security Notice</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ This document is protected with a share token</li>
            <li>✓ Only authorized users with the link can access it</li>
            <li>✓ Document owner controls all permissions (view, print, share)</li>
            <li>✓ Downloads are disabled for security protection</li>
            <li>✓ Access can be revoked by document owner at any time</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
