import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiEye, FiPrinter, FiShare2, FiX, FiClock, FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // States
  const [activeTab, setActiveTab] = useState('received'); // received, requests, request-new
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [issuerDocuments, setIssuerDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [searchIssuer, setSearchIssuer] = useState('');

  // View document modal states
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
      setError(null);
      console.log('📊 Fetching owner data for:', user?.email);

      if (!user?.id) {
        throw new Error('User ID not found');
      }

      // Fetch received documents
      try {
        console.log('📥 Fetching received documents for owner:', user.id);
        const docsRes = await fetch(`/api/documents?endpoint=document-shares&ownerId=${user.id}`);
        console.log('📥 Response status:', docsRes.status);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          console.log('✅ RECEIVED DOCUMENTS DATA:', docsData);
          console.log('📋 Document count:', docsData.data?.length || 0);
          if (docsData.success) {
            setReceivedDocuments(docsData.data || []);
          }
        } else {
          const errorText = await docsRes.text();
          console.error('❌ Error response:', errorText);
        }
      } catch (err) {
        console.error('⚠️ Error fetching received documents:', err);
      }

      // Fetch document requests
      try {
        console.log('📋 Fetching requests for owner:', user.id);
        const reqRes = await fetch(`/api/documents?endpoint=document-requests&ownerId=${user.id}`);
        console.log('📋 Requests fetch status:', reqRes.status);
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          console.log('✅ Requests data:', reqData);
          console.log('📋 Request count:', reqData.data?.length || 0);
          if (reqData.success) {
            setRequests(reqData.data || []);
          }
        } else {
          console.error('❌ Requests fetch failed:', reqRes.status);
          const text = await reqRes.text();
          console.error('Response:', text);
        }
      } catch (err) {
        console.error('⚠️ Error fetching requests:', err);
      }

      // Fetch issuers
      try {
        const issRes = await fetch('/api/documents?role=issuer');
        if (issRes.ok) {
          const issData = await issRes.json();
          if (issData.success) {
            setIssuers(issData.data || []);
          }
        }
      } catch (err) {
        console.error('⚠️ Error fetching issuers:', err);
      }
    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIssuer = async (issuer) => {
    try {
      setSelectedIssuer(issuer);
      setIssuerDocuments([]);
      setSelectedDocuments([]);

      const res = await fetch(`/api/documents?issuerId=${issuer.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIssuerDocuments(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching issuer documents:', err);
      toast.error('Failed to load issuer documents');
    }
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (selectedDocuments.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    if (!selectedIssuer) {
      toast.error('Please select an issuer');
      return;
    }

    setLoadingRequest(true);

    try {
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
          documentIds: selectedDocuments,
          message: requestMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send request');
      }

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Request sent to issuer!');
        setShowRequestModal(false);
        setSelectedIssuer(null);
        setSelectedDocuments([]);
        setRequestMessage('');
        setIssuerDocuments([]);
        setSearchIssuer('');
        
        await fetchData();
        setActiveTab('requests');
      } else {
        throw new Error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error(err.message || 'Error submitting request');
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handlePrintDocument = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  const handleShareDocument = () => {
    if (!selectedDocument) return;
    const shareLink = `${window.location.origin}/shared/${selectedDocument.share_token}`;
    navigator.clipboard.writeText(shareLink);
    toast.success('✅ Share link copied to clipboard!');
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  const isDocumentExpired = (expiresAt) => new Date(expiresAt) < new Date();

  const getRemainingTime = (expiresAt) => {
    const remaining = new Date(expiresAt) - new Date();
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

  const filteredIssuers = issuers.filter(issuer =>
    issuer.organization_name?.toLowerCase().includes(searchIssuer.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h3 className="text-gray-600 text-sm font-medium">Received Documents</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {receivedDocuments.filter(d => !isDocumentExpired(d.expires_at)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved Requests</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'received'
                  ? 'bg-signatura-red text-white border-b-2 border-signatura-red'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📥 Received Documents ({receivedDocuments.filter(d => !isDocumentExpired(d.expires_at)).length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'requests'
                  ? 'bg-signatura-red text-white border-b-2 border-signatura-red'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📤 My Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('request-new')}
              className={`flex-1 py-4 px-6 font-medium text-center transition ${
                activeTab === 'request-new'
                  ? 'bg-signatura-red text-white border-b-2 border-signatura-red'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ➕ Request Documents
            </button>
          </div>

          {/* TAB 1: RECEIVED DOCUMENTS */}
          {activeTab === 'received' && (
            <div className="p-6">
              {receivedDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No documents shared with you yet</p>
                  <p className="text-gray-400 text-sm mt-2">Request documents from issuers to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-3xl">{getFileIcon(doc.file_name)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.file_name}</h3>
                            <p className="text-sm text-gray-500">From: {doc.issuer_organization || 'Unknown'}</p>
                            <div className="flex gap-2 mt-2">
                              {doc.can_view && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">View</span>}
                              {doc.can_print && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Print</span>}
                              {doc.can_share && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Share</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-3">
                            {isDocumentExpired(doc.expires_at) ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1 justify-end">
                                <FiClock size={14} />
                                {getRemainingTime(doc.expires_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              disabled={!doc.can_view || isDocumentExpired(doc.expires_at)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <FiEye size={14} />
                              View
                            </button>
                            {doc.can_share && (
                              <button
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  handleShareDocument();
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                              >
                                <FiShare2 size={14} />
                                Share
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REQUESTS */}
          {activeTab === 'requests' && (
            <div className="p-6">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No requests sent yet</p>
                  <p className="text-gray-400 text-sm mt-2">Go to "Request Documents" tab to send a request</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{req.issuer_organization || 'Unknown Issuer'}</h3>
                          <p className="text-sm text-gray-500 mt-1">{req.items?.length || 0} document(s) requested</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Requested: {new Date(req.created_at).toLocaleDateString()}
                          </p>
                          {req.items && req.items.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              Documents: {req.items.map(i => i.document?.document_type).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUEST NEW DOCUMENTS */}
          {activeTab === 'request-new' && (
            <div className="p-6">
              <button
                onClick={() => setShowRequestModal(true)}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent"
              >
                <FiPlus size={18} />
                New Request
              </button>

              {issuers.length === 0 ? (
                <p className="text-center text-gray-500">No issuers available</p>
              ) : (
                <div className="space-y-3">
                  {issuers.map((issuer) => (
                    <div
                      key={issuer.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{issuer.organization_name}</h3>
                          <p className="text-sm text-gray-500">{issuer.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            handleSelectIssuer(issuer);
                            setShowRequestModal(true);
                          }}
                          className="px-4 py-2 bg-signatura-red text-white rounded hover:bg-signatura-accent text-sm font-medium"
                        >
                          Request →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-signatura-dark">
                  {selectedIssuer ? '📄 Select Documents' : '🏢 Select an Issuer'}
                </h2>
                {selectedIssuer && (
                  <p className="text-sm text-gray-600 mt-2">{selectedIssuer.organization_name}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedIssuer(null);
                  setSelectedDocuments([]);
                  setIssuerDocuments([]);
                  setRequestMessage('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {!selectedIssuer ? (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search issuers..."
                      value={searchIssuer}
                      onChange={(e) => setSearchIssuer(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    />
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredIssuers.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No issuers found</p>
                    ) : (
                      filteredIssuers.map((issuer) => (
                        <button
                          key={issuer.id}
                          onClick={() => handleSelectIssuer(issuer)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <p className="font-medium text-gray-900">{issuer.organization_name}</p>
                          <p className="text-sm text-gray-600">{issuer.email}</p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Documents</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {issuerDocuments.length === 0 ? (
                        <p className="text-center text-gray-500">No documents available</p>
                      ) : (
                        issuerDocuments.map((doc) => (
                          <label key={doc.id} className="flex items-start p-3 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={() => toggleDocumentSelection(doc.id)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-600 capitalize">{doc.document_type}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Add a message to the issuer..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIssuer(null);
                        setIssuerDocuments([]);
                        setSelectedDocuments([]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestModal(false);
                        setSelectedIssuer(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRequest || selectedDocuments.length === 0}
                      className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium"
                    >
                      {loadingRequest ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-signatura-dark">
                  {getFileIcon(selectedDocument.file_name)} {selectedDocument.file_name}
                </h2>
                <p className="text-sm text-gray-600 mt-2">From: {selectedDocument.issuer_organization || 'Unknown'}</p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {selectedDocument.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="flex justify-center">
                  <img
                    src={selectedDocument.file_url}
                    alt={selectedDocument.file_name}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <iframe
                    src={selectedDocument.file_url}
                    className="w-full h-[600px] rounded-lg border border-gray-200"
                    title={selectedDocument.file_name}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handlePrintDocument}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <FiPrinter />
                  Print
                </button>
                {selectedDocument.can_share && (
                  <button
                    onClick={handleShareDocument}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                  >
                    <FiShare2 />
                    Share
                  </button>
                )}
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">🔒 Security:</span> This document cannot be downloaded to protect your privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
