import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DocumentViewer } from '../components/DocumentSharing';

/**
 * Shared Document Page
 * - Public page (no authentication required)
 * - Validates share token
 * - Shows document with owner's permissions
 */
export default function SharedDocumentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    checkAccess();
  }, [token]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      setAccessDenied(false);

      console.log('🔐 Checking access for share token:', token);

      const res = await fetch(
        `/api/documents?endpoint=check-access&shareToken=${token}`
      );

      const data = await res.json();

      console.log('📋 Access check response:', data);

      if (!res.ok) {
        console.error('❌ Access denied:', data.error);
        setError(data.error);
        setAccessDenied(true);
        toast.error(data.error);
        return;
      }

      if (!data.success) {
        console.error('❌ Access failed:', data.error);
        setError(data.error);
        setAccessDenied(true);
        toast.error(data.error);
        return;
      }

      console.log('✅ Access granted');
      setDocument(data.data.document);
      setPermissions(data.data.permissions);
    } catch (err) {
      console.error('❌ Error checking access:', err);
      setError(err.message || 'Failed to load document');
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <FiAlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {error || 'You do not have access to this document'}
          </p>

          {error && error.includes('expired') && (
            <p className="text-sm text-orange-600 mb-4 p-3 bg-orange-50 rounded">
              📅 This share link has expired. Please contact the document owner to request a new link.
            </p>
          )}

          {error && error.includes('revoked') && (
            <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded">
              🚫 This share has been revoked by the document owner.
            </p>
          )}

          {error && error.includes('approval') && (
            <p className="text-sm text-yellow-600 mb-4 p-3 bg-yellow-50 rounded">
              ⏳ Your access request is pending the owner's approval. Please try again later.
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No document state (shouldn't happen, but just in case)
  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <FiAlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-6">
            The document you're looking for could not be found.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Success - show document
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Shared Document</h1>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentViewer 
          document={document} 
          sharePermissions={permissions}
        />

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Document Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium">Document Type</p>
              <p className="text-blue-700 mt-1">{document.document_type || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Issued Date</p>
              <p className="text-blue-700 mt-1">
                {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {document.expires_at && (
              <div>
                <p className="font-medium">Expires</p>
                <p className="text-blue-700 mt-1">
                  {new Date(document.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 How to Use This Document</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3">✓</span>
              <span><strong>View:</strong> You can view the document in the viewer above</span>
            </li>
            {permissions?.print && (
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Print:</strong> Click the "Print" button to print the document</span>
              </li>
            )}
            {permissions?.download && (
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">✓</span>
                <span><strong>Download:</strong> Click the "Download" button to save the document to your device</span>
              </li>
            )}
            {!permissions?.print && (
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✗</span>
                <span className="text-gray-500"><strong>Print:</strong> Not allowed by document owner</span>
              </li>
            )}
            {!permissions?.download && (
              <li className="flex items-start">
                <span className="text-gray-400 mr-3">✗</span>
                <span className="text-gray-500"><strong>Download:</strong> Not allowed by document owner</span>
              </li>
            )}
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-6 bg-gray-100 border border-gray-300 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">🔒 Privacy & Security</h2>
          <p className="text-gray-700 text-sm mb-3">
            This document is shared under specific terms set by its owner:
          </p>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• Your access to this document is being tracked for security purposes</li>
            <li>• The document owner can revoke your access at any time</li>
            <li>• Do not share this link with others unless explicitly allowed by the owner</li>
            <li>• If you need to request extended access, contact the document owner</li>
          </ul>
        </div>

        {/* Contact Information */}
        {document.owner && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">📧 Need Help?</h2>
            <p className="text-green-800 text-sm">
              If you have questions about this document or need to request additional permissions, 
              please contact the document owner.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Signatura - Secure Document Sharing Platform</p>
        </div>
      </footer>
    </div>
  );
}
