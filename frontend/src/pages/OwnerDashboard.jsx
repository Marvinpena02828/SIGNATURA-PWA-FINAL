import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye, FiPlus, FiCopy, FiX } from 'react-icons/fi';
import DocumentQRModal from './DocumentQRModal';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = ['diploma', 'certificate', 'license', 'badge'];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [activeTab, setActiveTab] = useState('received');
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [shareForm, setShareForm] = useState({
    recipientEmail: '',
    canPrint: true,
    canDownload: false,
    canShare: true,
    expiryDays: 30,
  });
  const [shareLink, setShareLink] = useState(null);
  const [showDocQRModal, setShowDocQRModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      loadReceivedDocuments();
      loadMyRequests();
      loadIssuers();
    }
  }, [user, navigate]);

  const loadReceivedDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: 'document-shares',
          ownerId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReceivedDocuments(data.data || []);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const loadMyRequests = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: 'document-requests',
          ownerId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMyRequests(data.data || []);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const loadIssuers = async () => {
    try {
      const res = await fetch('/api/documents?endpoint=get-issuers');
      const data = await res.json();
      if (data.success) {
        setIssuers(data.data || []);
      }
    } catch (err) {
      console.error('Error loading issuers:', err);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleOpenShareModal = (doc) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

  const handleToggleDocType = (type) => {
    setSelectedDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: 'document-requests',
          ownerId: user?.id,
          ownerEmail: user?.email,
          issuerEmail: selectedIssuer?.email,
          issuerOrganization: selectedIssuer?.organization_name,
          documentIds: selectedDocTypes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('✅ Request sent successfully!');
        setSelectedDocTypes([]);
        setShowRequestModal(false);
        setSelectedIssuer(null);
        loadMyRequests();
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareDocument = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: 'share-document',
          documentId: selectedDocument.document_id,
          ownerId: user?.id,
          recipientEmail: shareForm.recipientEmail,
          canView: true,
          canPrint: shareForm.canPrint,
          canDownload: false,
          canShare: shareForm.canShare,
          expiryDays: shareForm.expiryDays,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const shareLink = `${window.location.origin}/shared/${data.data.shareToken}`;
        setShareLink(shareLink);
        setShowShareModal(false);
        toast.success('✅ Document shared successfully!');
      } else {
        toast.error(data.error || 'Failed to share document');
      }
    } catch (err) {
      console.error('Error sharing document:', err);
      toast.error('Error sharing document');
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Owner Dashboard</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'received'
                ? 'text-signatura-red border-signatura-red'
                : 'text-gray-600 border-transparent'
            }`}
          >
            📥 Received Documents
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'requests'
                ? 'text-signatura-red border-signatura-red'
                : 'text-gray-600 border-transparent'
            }`}
          >
            📋 My Requests
          </button>
          <button
            onClick={() => setActiveTab('request-new')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'request-new'
                ? 'text-signatura-red border-signatura-red'
                : 'text-gray-600 border-transparent'
            }`}
          >
            ➕ Request Documents
          </button>
        </div>

        {/* Received Documents Tab */}
        {activeTab === 'received' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">Received Documents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receivedDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No documents received yet
                      </td>
                    </tr>
                  ) : (
                    receivedDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{doc.file_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">{doc.document_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doc.issuer_organization}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          {doc.file_url && doc.can_view && (
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <FiEye className="w-4 h-4" /> View
                            </button>
                          )}
                          {doc.can_print && (
                            <button
                              onClick={() => {
                                const printWindow = window.open(doc.file_url, 'print_window');
                                if (printWindow) {
                                  printWindow.addEventListener('load', () => {
                                    printWindow.print();
                                  });
                                } else {
                                  toast.error('Failed to open print window. Check popup blocker.');
                                }
                              }}
                              className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <FiPrinter className="w-4 h-4" /> Print
                            </button>
                          )}
                          {doc.can_share && (
                            <button
                              onClick={() => handleOpenShareModal(doc)}
                              className="text-purple-600 hover:bg-purple-50 px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                              <FiShare2 className="w-4 h-4" /> Share
                            </button>
                          )}
                          <button
                            onClick={() => setShowDocQRModal(doc)}
                            className="text-orange-600 hover:bg-orange-50 px-3 py-1 rounded text-sm flex items-center gap-1 font-medium"
                            title="Show verification QR code"
                          >
                            ✓ Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">My Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issuer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No requests made yet
                      </td>
                    </tr>
                  ) : (
                    myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.issuer_organization}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {req.items && req.items.length > 0
                            ? req.items.map((item) => item.document?.document_type).join(', ')
                            : 'Multiple'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              req.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : req.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {req.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Documents Tab */}
        {activeTab === 'request-new' && (
          <div className="space-y-6">
            {issuers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                <p>No issuers available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {issuers.map((issuer) => (
                  <div
                    key={issuer.id}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-signatura-red transition"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {issuer.organization_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{issuer.email}</p>
                    <button
                      onClick={() => {
                        setSelectedIssuer(issuer);
                        setShowRequestModal(true);
                      }}
                      className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent font-medium flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Request Documents
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Viewer Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-signatura-dark">
                  {selectedDocument?.file_name}
                </h2>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-auto bg-gray-50">
                {selectedDocument?.file_url ? (
                  <img
                    src={selectedDocument.file_url}
                    alt="Document"
                    className="w-full h-auto rounded"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No document available</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-2">
                {selectedDocument?.can_print && (
                  <button
                    onClick={() => {
                      const printWindow = window.open(
                        selectedDocument.file_url,
                        'print_window'
                      );
                      if (printWindow) {
                        printWindow.addEventListener('load', () => {
                          printWindow.print();
                        });
                      }
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                  >
                    <FiPrinter />
                    Print
                  </button>
                )}
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-signatura-dark">Share Document</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleShareDocument} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={shareForm.recipientEmail}
                    onChange={(e) =>
                      setShareForm({ ...shareForm, recipientEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareForm.canPrint}
                      onChange={(e) =>
                        setShareForm({ ...shareForm, canPrint: e.target.checked })
                      }
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Print</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareForm.canShare}
                      onChange={(e) =>
                        setShareForm({ ...shareForm, canShare: e.target.checked })
                      }
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Share</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Download is always disabled for security
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry (days) *
                  </label>
                  <select
                    value={shareForm.expiryDays}
                    onChange={(e) =>
                      setShareForm({
                        ...shareForm,
                        expiryDays: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent font-medium"
                >
                  Generate Share Link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Document QR Modal */}
        <DocumentQRModal
          document={showDocQRModal}
          onClose={() => setShowDocQRModal(null)}
        />

        {/* Request Modal */}
        {showRequestModal && selectedIssuer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-signatura-dark">📋 Request Documents</h2>
                <p className="text-sm text-gray-600 mt-1">From: {selectedIssuer.organization_name}</p>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select document types you need *
                  </label>
                  <div className="space-y-2">
                    {['diploma', 'certificate', 'license', 'badge'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={type}
                          checked={selectedDocTypes.includes(type)}
                          onChange={() => handleToggleDocType(type)}
                          className="w-4 h-4 text-signatura-red rounded focus:ring-2 focus:ring-signatura-red"
                        />
                        <label
                          htmlFor={type}
                          className="ml-3 text-sm text-gray-700 capitalize cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedDocTypes([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedDocTypes.length === 0}
                    className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
