import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye, FiPlus, FiCopy, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = ['diploma', 'certificate', 'license', 'badge'];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [activeTab, setActiveTab] = useState('received');
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    recipientEmail: '',
    canPrint: true,
    canDownload: false,
    canShare: true,
    expiryDays: 30,
  });

  useEffect(() => {
    if (role !== 'owner') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate, user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch received documents
      try {
        const docsRes = await fetch(`/api/documents?endpoint=document-shares&ownerId=${user?.id}`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          if (docsData.success && Array.isArray(docsData.data)) {
            setReceivedDocuments(docsData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }

      // Fetch my requests
      try {
        const reqRes = await fetch(`/api/documents?endpoint=document-requests&ownerId=${user?.id}`);
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          if (reqData.success && Array.isArray(reqData.data)) {
            setMyRequests(reqData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
      }

      // Fetch issuers
      try {
        const issuerRes = await fetch('/api/documents?endpoint=get-issuers');
        if (issuerRes.ok) {
          const issuerData = await issuerRes.json();
          if (issuerData.success && Array.isArray(issuerData.data)) {
            setIssuers(issuerData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching issuers:', err);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleOpenShareModal = (doc) => {
    setSelectedDocument(doc);
    setShareForm({
      recipientEmail: '',
      canPrint: true,
      canDownload: false,
      canShare: true,
      expiryDays: 30,
    });
    setShowShareModal(true);
  };

  const handleShareDocument = async (e) => {
    e.preventDefault();

    if (!shareForm.recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'share-document',
          documentId: selectedDocument.document_id,
          ownerId: user?.id,
          recipientEmail: shareForm.recipientEmail,
          canView: true,
          canPrint: shareForm.canPrint,
          canDownload: shareForm.canDownload,
          canShare: shareForm.canShare,
          expiryDays: shareForm.expiryDays,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Document shared successfully!');
        const shareLink = `${window.location.origin}/shared/${data.data.shareToken}`;
        console.log('Share link:', shareLink);
        toast.success(`Share link: ${shareLink}`);
        setShowShareModal(false);
      } else {
        toast.error(data.error || 'Failed to share document');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error sharing document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRequestModal = (issuer) => {
    setSelectedIssuer(issuer);
    setSelectedDocTypes([]);
    setShowRequestModal(true);
  };

  const handleToggleDocType = (type) => {
    setSelectedDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (selectedDocTypes.length === 0) {
      toast.error('Please select at least one document type');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'document-requests',
          ownerId: user?.id,
          ownerEmail: user?.email,
          ownerName: user?.full_name || user?.email,
          issuerId: selectedIssuer.id,
          issuerEmail: selectedIssuer.email,
          documentIds: selectedDocTypes,
          message: `Requesting ${selectedDocTypes.join(', ')} documents`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Request sent to issuer!');
        setShowRequestModal(false);
        setSelectedIssuer(null);
        setSelectedDocTypes([]);
        await fetchData();
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error sending request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');

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

      {/* Stats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Received Documents</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{receivedDocuments.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved Requests</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{approvedRequests.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap ${
              activeTab === 'received'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Received ({receivedDocuments.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap ${
              activeTab === 'requests'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('request-new')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap ${
              activeTab === 'request-new'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ➕ Request Documents
          </button>
        </div>

        {/* Received Documents Tab */}
        {activeTab === 'received' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">📥 My Received Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Documents shared with you by issuers - Can print or share (no download)</p>
            </div>

            {receivedDocuments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No documents received yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Received</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Permissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receivedDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{doc.file_name || 'Document'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm capitalize">{doc.document_type || 'document'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{doc.issuer_organization || 'Unknown'}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-1 flex-wrap">
                            {doc.can_view && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">View</span>}
                            {doc.can_print && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Print ✓</span>}
                            {doc.can_share && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Share ✓</span>}
                            {!doc.can_download && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">No Download</span>}
                          </div>
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
                                // Open document in new window for printing
                                const printWindow = window.open(doc.file_url, 'print_window');
                                if (printWindow) {
                                  printWindow.addEventListener('load', () => {
                                    printWindow.print();
                                  });
                                } else {
                                  toast.error('Failed to open print window. Please check popup blocker.');
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">📋 My Document Requests</h2>
              <p className="text-sm text-gray-500 mt-1">Requests you've sent to issuers</p>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issuer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Documents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {req.issuer_organization || req.issuer_email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              req.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : req.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {req.items && req.items.length > 0
                            ? req.items.map((item) => item.document?.document_type).join(', ')
                            : req.message
                            ? req.message.split('Requesting ')[1]?.split(' documents')[0]
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Request Documents Tab */}
        {activeTab === 'request-new' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">➕ Request Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Request documents from issuers</p>
            </div>

            {issuers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No issuers available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {issuers.map((issuer) => (
                  <div key={issuer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-bold text-gray-900">{issuer.organization_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{issuer.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Joined {new Date(issuer.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleOpenRequestModal(issuer)}
                      className="mt-4 w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent font-medium flex items-center justify-center gap-2"
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
      </main>

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-signatura-dark">📄 Document Viewer</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedDocument.file_name}</p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {selectedDocument.file_url ? (
                <>
                  <div className="mb-6 bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center overflow-auto">
                    {selectedDocument.file_url.includes('.pdf') ? (
                      <iframe
                        src={selectedDocument.file_url}
                        className="w-full h-[600px] rounded"
                        title="PDF Document"
                      />
                    ) : (
                      <img
                        src={selectedDocument.file_url}
                        alt={selectedDocument.file_name}
                        className="max-w-full max-h-[600px] rounded"
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    {selectedDocument.can_print && (
                      <button
                        onClick={() => {
                          // Open document in new window for printing
                          const printWindow = window.open(selectedDocument.file_url, 'print_window');
                          if (printWindow) {
                            printWindow.addEventListener('load', () => {
                              printWindow.print();
                            });
                          } else {
                            toast.error('Failed to open print window. Please check popup blocker.');
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
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No document available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">📤 Share Document</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedDocument.file_name}</p>
            </div>

            <form onSubmit={handleShareDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  value={shareForm.recipientEmail}
                  onChange={(e) => setShareForm({ ...shareForm, recipientEmail: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  required
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareForm.canPrint}
                      onChange={(e) => setShareForm({ ...shareForm, canPrint: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">Can Print</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareForm.canDownload}
                      onChange={(e) => setShareForm({ ...shareForm, canDownload: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                      disabled
                    />
                    <label className="ml-3 text-sm text-gray-400">Can Download (Disabled - Security)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareForm.canShare}
                      onChange={(e) => setShareForm({ ...shareForm, canShare: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">Can Share Further</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={shareForm.expiryDays}
                  onChange={(e) => setShareForm({ ...shareForm, expiryDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  {DOCUMENT_TYPES.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={type}
                        checked={selectedDocTypes.includes(type)}
                        onChange={() => handleToggleDocType(type)}
                        className="w-4 h-4 text-signatura-red rounded focus:ring-2 focus:ring-signatura-red"
                      />
                      <label htmlFor={type} className="ml-3 text-sm text-gray-700 capitalize">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
    </div>
  );
}
