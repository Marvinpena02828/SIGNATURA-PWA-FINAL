import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiEye, FiPrinter, FiShare2, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SharedDocumentPage() {
  const { shareToken } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [document, setDocument] = useState(null);
  const [permissions, setPermissions] = useState({
    canView: false,
    canPrint: false,
    canShare: false,
  });

  useEffect(() => {
    verifyAccess();
  }, [shareToken]);

  const verifyAccess = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verifying share token:', shareToken);

      // Check if share token is valid and get permissions
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'check-share-access',
          shareToken,
        }),
      });

      const data = await res.json();
      console.log('✅ Share access response:', data);

      if (data.success) {
        setShareData(data.data);
        setPermissions({
          canView: data.data.permissions?.includes('view'),
          canPrint: data.data.permissions?.includes('print'),
          canShare: data.data.permissions?.includes('share'),
        });

        // Fetch document details
        const docRes = await fetch(`/api/documents?id=${data.data.document_id}`);
        if (docRes.ok) {
          const docData = await docRes.json();
          if (docData.success) {
            setDocument(docData.data);
          }
        }
      } else {
        setError(data.error || 'Access denied');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Failed to verify access');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!permissions.canPrint) {
      toast.error('You do not have permission to print this document');
      return;
    }
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleRequestAccess = async () => {
    try {
      console.log('📝 Requesting access from owner...');
      
      const email = prompt('Your email address:');
      if (!email) return;

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'request-share-access',
          shareToken,
          requesterEmail: email,
          purpose: 'Access request for shared document',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('✅ Access request sent to owner!');
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error requesting access:', err);
      toast.error('Error requesting access');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <FiAlertCircle className="text-red-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Denied</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRequestAccess}
            className="w-full px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent font-medium"
          >
            📝 Request Access from Owner
          </button>
        </div>
      </div>
    );
  }

  if (!permissions.canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <FiAlertCircle className="text-yellow-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Access Pending</h2>
          <p className="text-center text-gray-600 mb-6">
            The document owner has not yet granted you permission to view this document.
          </p>
          <button
            onClick={handleRequestAccess}
            className="w-full px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent font-medium"
          >
            📝 Request Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-signatura-dark">
                {document?.file_name || 'Shared Document'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Shared by: {shareData?.owner_name || shareData?.owner_email || 'Unknown'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              📋 Expires: {new Date(shareData?.expires_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>

      {/* Permissions Info */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-blue-700">
          <FiAlertCircle size={18} />
          <p className="text-sm">
            This is a shared document. You can{' '}
            {permissions.canPrint && 'print, '}
            {permissions.canShare && 'share, '}
            and view it. You cannot download it to protect the owner's privacy.
          </p>
        </div>
      </div>

      {/* Document Viewer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {document ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Document Preview */}
            <div className="p-6 bg-gray-100 min-h-[600px] flex items-center justify-center">
              {document.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // Image
                <img
                  src={document.file_url}
                  alt={document.file_name}
                  className="max-w-full h-auto max-h-[600px] rounded-lg"
                />
              ) : (
                // PDF
                <iframe
                  src={document.file_url}
                  className="w-full h-[600px] rounded-lg border border-gray-200"
                  title={document.file_name}
                />
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-2">
              {permissions.canPrint && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <FiPrinter size={18} />
                  Print
                </button>
              )}
              {permissions.canShare && (
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast.success('Share link copied!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  <FiShare2 size={18} />
                  Share Link
                </button>
              )}
              <div className="flex-1" />
              <p className="text-sm text-gray-600 py-2">
                🔒 Download disabled to protect document privacy
              </p>
            </div>

            {/* Document Info */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase">Document Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {document.document_type || 'Document'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">File Size</p>
                <p className="font-medium text-gray-900">
                  {document.file_size ? `${(document.file_size / 1024).toFixed(2)} KB` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Issued Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Your Permissions</p>
                <div className="flex gap-1 mt-1">
                  {permissions.canView && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      View
                    </span>
                  )}
                  {permissions.canPrint && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Print
                    </span>
                  )}
                  {permissions.canShare && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      Share
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load document</p>
          </div>
        )}
      </main>
    </div>
  );
}
