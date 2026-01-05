import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [activeTab, setActiveTab] = useState('received'); // received, requests
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

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
      console.log('📊 Fetching owner data for:', user?.email);

      // Fetch received documents
      try {
        console.log('📥 Fetching received documents for owner:', user?.id);
        const docsRes = await fetch(
          `/api/documents?endpoint=document-shares&ownerId=${user?.id}`
        );

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          console.log('✅ Documents:', docsData);
          if (docsData.data && docsData.data[0]) {
            console.log('📄 First document:', docsData.data[0]);
            console.log('  - file_url:', docsData.data[0].file_url);
            console.log('  - file_name:', docsData.data[0].file_name);
            console.log('  - document_type:', docsData.data[0].document_type);
            console.log('  - created_at:', docsData.data[0].created_at);
          }
          if (docsData.success && Array.isArray(docsData.data)) {
            setReceivedDocuments(docsData.data);
            console.log(`📄 Found ${docsData.data.length} documents`);
          }
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }

      // Fetch my requests
      try {
        console.log('📋 Fetching requests for owner:', user?.id);
        const reqRes = await fetch(
          `/api/documents?endpoint=document-requests&ownerId=${user?.id}`
        );

        if (reqRes.ok) {
          const reqData = await reqRes.json();
          console.log('✅ Requests data:', reqData);
          if (reqData.success && Array.isArray(reqData.data)) {
            setMyRequests(reqData.data);
            console.log(`📋 Found ${reqData.data.length} requests`);
          }
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
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
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'received'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Received Documents ({receivedDocuments.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'requests'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 My Requests ({myRequests.length})
          </button>
        </div>

        {/* Received Documents Tab */}
        {activeTab === 'received' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">📥 My Received Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Documents shared with you by issuers</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Received
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receivedDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {doc.file_name || 'Document'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm capitalize">
                          {doc.document_type || 'document'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {doc.issuer_organization || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {doc.created_at
                            ? new Date(doc.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-1 flex-wrap">
                            {doc.can_view && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                View
                              </span>
                            )}
                            {doc.can_print && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Print
                              </span>
                            )}
                            {doc.can_share && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                Share
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          {doc.file_url && doc.can_view && (
                            <>
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition font-medium text-sm flex items-center gap-1"
                                title="View document"
                              >
                                <FiEye className="w-4 h-4" />
                                View
                              </button>
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:bg-green-50 px-3 py-1 rounded transition font-medium text-sm flex items-center gap-1"
                                title="Open in new tab"
                              >
                                <FiDownload className="w-4 h-4" />
                                Open
                              </a>
                            </>
                          )}
                          {doc.can_print && (
                            <button
                              onClick={() => window.print()}
                              className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition font-medium text-sm flex items-center gap-1"
                              title="Print document"
                            >
                              <FiPrinter className="w-4 h-4" />
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

        {/* Requests Tab */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Issuer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Documents
                      </th>
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
                  <div className="mb-6 bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
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

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Document Info</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">File Name:</span>{' '}
                          <span className="font-medium">{selectedDocument.file_name}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">Type:</span>{' '}
                          <span className="font-medium capitalize">{selectedDocument.document_type}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">Size:</span>{' '}
                          <span className="font-medium">
                            {selectedDocument.file_size
                              ? `${(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB`
                              : 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Permissions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocument.can_view}
                            disabled
                            className="mr-2"
                          />
                          <label className="text-sm text-gray-700">View</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocument.can_print}
                            disabled
                            className="mr-2"
                          />
                          <label className="text-sm text-gray-700">Print</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocument.can_share}
                            disabled
                            className="mr-2"
                          />
                          <label className="text-sm text-gray-700">Share</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={selectedDocument.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <FiDownload />
                      Open in New Tab
                    </a>
                    {selectedDocument.can_print && (
                      <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
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
    </div>
  );
}
