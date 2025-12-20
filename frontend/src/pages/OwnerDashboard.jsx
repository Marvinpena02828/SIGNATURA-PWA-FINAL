import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiCheck, FiX, FiEye, FiShare2, FiLock, FiClock, FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Existing states
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for requesting documents
  const [issuers, setIssuers] = useState([]);
  const [showIssuerModal, setShowIssuerModal] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [issuerDocuments, setIssuerDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [searchIssuer, setSearchIssuer] = useState('');

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

      // CRITICAL: Check if user ID exists before making API calls
      if (!user || !user.id) {
        console.warn('⚠️ User ID not available yet, waiting...');
        setLoading(false);
        return;
      }

      // Fetch owner's documents
      try {
        console.log('📄 Fetching documents...');
        const docsRes = await fetch(`/api/documents?ownerId=${user.id}`);
        console.log('📄 Documents response status:', docsRes.status);
        
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          console.log('✅ Documents data:', docsData);
          if (docsData.success) setDocuments(docsData.data || []);
        } else {
          console.error('⚠️ Documents fetch returned:', docsRes.status);
        }
      } catch (err) {
        console.error('⚠️ Error fetching documents:', err);
      }

      // Fetch verification requests
      try {
        console.log('🔍 Fetching verification requests...');
        const reqRes = await fetch(`/api/verification-requests?ownerId=${user.id}`);
        console.log('🔍 Requests response status:', reqRes.status);
        
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          console.log('✅ Requests data:', reqData);
          if (reqData.success) setRequests(reqData.data || []);
        } else {
          console.error('⚠️ Requests fetch returned:', reqRes.status);
        }
      } catch (err) {
        console.error('⚠️ Error fetching requests:', err);
      }

      // Fetch shares
      try {
        console.log('📋 Fetching shares...');
        const sharesRes = await fetch(
          `/api/sharing?ownerId=${user.id}&ownerEmail=${encodeURIComponent(user.email || '')}`
        );
        console.log('📋 Shares response status:', sharesRes.status);
        
        if (sharesRes.ok) {
          const sharesData = await sharesRes.json();
          console.log('✅ Shares data:', sharesData);
          if (sharesData.success) {
            setShares(sharesData.data || []);
          }
        } else {
          console.error('⚠️ Shares fetch returned:', sharesRes.status);
        }
      } catch (err) {
        console.error('⚠️ Error fetching shares:', err);
      }

      // Fetch all issuers
      try {
        console.log('🏢 Fetching issuers from /api/documents?role=issuer...');
        const issuersRes = await fetch('/api/documents?role=issuer');
        console.log('🏢 Issuers response status:', issuersRes.status);
        
        if (!issuersRes.ok) {
          console.error(`❌ Issuers endpoint returned ${issuersRes.status}`);
          // Try to get error details
          const errorText = await issuersRes.text();
          console.error('Error response:', errorText);
          setIssuers([]);
        } else {
          const issuersData = await issuersRes.json();
          console.log('✅ Issuers data:', issuersData);
          
          if (issuersData.success) {
            setIssuers(issuersData.data || []);
          } else {
            console.warn('⚠️ Issuers endpoint error:', issuersData.error);
            setIssuers([]);
          }
        }
      } catch (issuerError) {
        console.error('❌ Error fetching issuers:', issuerError);
        setIssuers([]);
      }

    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setError(err.message || 'Failed to load data');
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch issuer's documents when issuer is selected
  const handleSelectIssuer = async (issuer) => {
    setSelectedIssuer(issuer);
    setIssuerDocuments([]);
    setSelectedDocuments([]);

    try {
      console.log('📄 Fetching documents for issuer:', issuer.id);
      const res = await fetch(`/api/documents?issuerId=${issuer.id}`);
      console.log('📄 Issuer documents response status:', res.status);
      
      if (!res.ok) throw new Error(`Failed to load documents: ${res.status}`);
      
      const data = await res.json();
      console.log('✅ Issuer documents loaded:', data);
      
      if (data.success) {
        setIssuerDocuments(data.data || []);
      }
    } catch (err) {
      console.error('❌ Error fetching issuer documents:', err);
      toast.error('Failed to load issuer documents');
    }
  };

  // Toggle document selection for request
  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Submit document request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (selectedDocuments.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    if (!selectedIssuer || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    setLoadingRequest(true);

    try {
      console.log('📤 Creating document request...');
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'document-requests',
          ownerId: user.id,
          ownerEmail: user.email,
          issuerId: selectedIssuer.id,
          issuerEmail: selectedIssuer.email,
          documentIds: selectedDocuments,
          message: requestMessage,
        }),
      });

      console.log('📤 Request response status:', res.status);
      const data = await res.json();
      console.log('📤 Request response data:', data);

      if (data.success) {
        toast.success('Request sent to issuer!');
        setShowIssuerModal(false);
        setSelectedIssuer(null);
        setSelectedDocuments([]);
        setRequestMessage('');
        setIssuerDocuments([]);
        
        // Refresh requests
        try {
          console.log('🔄 Refreshing requests...');
          const reqRes = await fetch(`/api/documents?endpoint=document-requests&ownerId=${user.id}`);
          console.log('🔄 Refresh response status:', reqRes.status);
          
          if (reqRes.ok) {
            const reqData = await reqRes.json();
            console.log('🔄 Refreshed requests:', reqData);
            if (reqData.success) setRequests(reqData.data || []);
          }
        } catch (refreshErr) {
          console.error('⚠️ Error refreshing requests:', refreshErr);
        }
      } else {
        throw new Error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('❌ Error submitting request:', err);
      toast.error(err.message || 'Error submitting request');
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch('/api/verification-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: 'approved' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Request approved!');
        setRequests(requests.map(r => r.id === requestId ? {...r, status: 'approved'} : r));
      }
    } catch (err) {
      toast.error('Error approving request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch('/api/verification-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status: 'rejected' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Request rejected!');
        setRequests(requests.map(r => r.id === requestId ? {...r, status: 'rejected'} : r));
      }
    } catch (err) {
      toast.error('Error rejecting request');
    }
  };

  const handleRevokeShare = async (shareId) => {
    if (!window.confirm('Revoke this share? The recipient will lose access.')) return;

    try {
      const res = await fetch('/api/sharing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shareId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Share revoked!');
        setShares(shares.filter(s => s.id !== shareId));
      }
    } catch (err) {
      toast.error('Error revoking share');
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  const isShareExpired = (expiresAt) => new Date(expiresAt) < new Date();
  const getRemainingTime = (expiresAt) => {
    const remaining = new Date(expiresAt) - new Date();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d remaining`;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  // Separate shares into created and received
  const createdShares = shares.filter(s => s.shareType === 'created');
  const receivedShares = shares.filter(s => s.shareType === 'received');

  // Filter issuers by search
  const filteredIssuers = issuers.filter(issuer =>
    issuer.organization_name?.toLowerCase().includes(searchIssuer.toLowerCase())
  );

  // Get pending requests count
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

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
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-signatura-red">
            <h3 className="text-gray-600 text-sm font-medium">My Documents</h3>
            <p className="text-3xl font-bold text-signatura-dark mt-2">{documents.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Shared With Me</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {receivedShares.filter(s => !isShareExpired(s.expires_at)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-medium">Outgoing Requests</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {pendingRequestsCount}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
            <h3 className="text-gray-600 text-sm font-medium">Available Issuers</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{issuers.length}</p>
          </div>
        </div>

        {/* My Documents */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">My Documents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issuer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No documents yet. Request from an issuer!
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-signatura-dark">{doc.title}</td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{doc.document_type}</td>
                      <td className="px-6 py-4 text-gray-600">{doc.issuer?.organization_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REQUEST DOCUMENTS FROM ISSUERS */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-signatura-dark">📋 Request Documents from Issuers</h2>
              <p className="text-sm text-gray-500 mt-1">Browse available issuers and request their documents</p>
            </div>
            <button
              onClick={() => setShowIssuerModal(true)}
              className="flex items-center bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition"
            >
              <FiPlus className="mr-2" />
              Request Documents
            </button>
          </div>

          {/* Issuers List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issuers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No issuers available yet
                    </td>
                  </tr>
                ) : (
                  issuers.map((issuer) => (
                    <tr key={issuer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-signatura-dark">{issuer.organization_name}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm capitalize">{issuer.organization_type || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{issuer.email}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            handleSelectIssuer(issuer);
                            setShowIssuerModal(true);
                          }}
                          className="text-signatura-red hover:bg-red-50 px-3 py-1 rounded transition font-medium text-sm"
                        >
                          Request →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECEIVED SHARES */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📥 Documents Shared With Me</h2>
            <p className="text-sm text-gray-500">Documents shared by issuers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receivedShares.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No documents shared with you yet
                    </td>
                  </tr>
                ) : (
                  receivedShares.map((share) => (
                    <tr key={share.id} className="hover:bg-gray-50 bg-blue-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {share.document?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {share.issuer_organization || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isShareExpired(share.expires_at) ? (
                          <span className="text-red-600 font-medium">Expired</span>
                        ) : (
                          <span className="flex items-center text-green-600">
                            <FiClock size={14} className="mr-1" />
                            {getRemainingTime(share.expires_at)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MY OUTGOING REQUESTS */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📤 My Outgoing Document Requests</h2>
            <p className="text-sm text-gray-500">Requests I sent to issuers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issuer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No requests sent yet
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{req.issuer_organization || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ISSUER SELECTION & DOCUMENT REQUEST MODAL */}
      {showIssuerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-signatura-dark">
                {selectedIssuer ? '📄 Select Documents' : '🏢 Select Issuer'}
              </h2>
              {selectedIssuer && (
                <p className="text-sm text-gray-600 mt-2">{selectedIssuer.organization_name}</p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {!selectedIssuer ? (
                /* Issuer Selection */
                <>
                  <div className="mb-4">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search issuers..."
                        value={searchIssuer}
                        onChange={(e) => setSearchIssuer(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredIssuers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No issuers found</p>
                      </div>
                    ) : (
                      filteredIssuers.map((issuer) => (
                        <button
                          key={issuer.id}
                          onClick={() => handleSelectIssuer(issuer)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-signatura-red transition"
                        >
                          <p className="font-medium text-gray-900">{issuer.organization_name}</p>
                          <p className="text-sm text-gray-600">{issuer.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Type: {issuer.organization_type}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* Document Selection */
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Available Documents */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Available Documents
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {issuerDocuments.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">
                          This issuer has no documents available
                        </p>
                      ) : (
                        issuerDocuments.map((doc) => (
                          <label key={doc.id} className="flex items-start p-3 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={() => toggleDocumentSelection(doc.id)}
                              className="mt-1 mr-3"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-600 capitalize">{doc.document_type}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedDocuments.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        ✓ {selectedDocuments.length} document(s) selected
                      </p>
                    )}
                  </div>

                  {/* Request Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Add any additional message for the issuer..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none resize-none"
                    />
                  </div>

                  {/* Buttons */}
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
                        setShowIssuerModal(false);
                        setSelectedIssuer(null);
                        setIssuerDocuments([]);
                        setSelectedDocuments([]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingRequest || selectedDocuments.length === 0}
                      className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50"
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
    </div>
  );
}
