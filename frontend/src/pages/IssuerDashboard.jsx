import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiPlus, FiEye, FiShare2, FiCopy, FiCheck, FiDownload, FiMail, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [documents, setDocuments] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('degree');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [requireOtp, setRequireOtp] = useState(true);
  const [expiryDays, setExpiryDays] = useState(7);
  const [permissions, setPermissions] = useState(['view', 'download']);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareStep, setShareStep] = useState(1);
  const [shareData, setShareData] = useState(null);
  const [emailStatus, setEmailStatus] = useState('');

  // Document request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestAction, setRequestAction] = useState(null); // 'approve' or 'reject'
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (role !== 'issuer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    try {
      // Fetch issuer's documents
      const docsRes = await fetch(`/api/documents?issuerId=${user?.id}`);
      const docsData = await docsRes.json();
      if (docsData.success) {
        setDocuments(docsData.data || []);
      }

      // Fetch incoming document requests
      const reqRes = await fetch(`/api/document-requests?issuerId=${user?.id}`);
      const reqData = await reqRes.json();
      if (reqData.success) {
        console.log('📥 Incoming document requests:', reqData.data);
        setDocumentRequests(reqData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuerId: user?.id,
          title: title.trim(),
          documentType: docType,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Document created!');
        setDocuments([...documents, result.data]);
        setTitle('');
        setDocType('degree');
      } else {
        toast.error(result.error || 'Failed to create document');
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (doc) => {
    try {
      setSelectedDoc(doc);
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          documentHash: doc.document_hash,
          issuerEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQrCode(data.qrCode);
        toast.success('QR Code generated!');
      }
    } catch (err) {
      toast.error('Failed to generate QR code');
    }
  };

  const openShareModal = (doc) => {
    setShareModalDoc(doc);
    setShowShareModal(true);
    setShareStep(1);
    setRecipientEmail('');
    setRequireOtp(true);
    setExpiryDays(7);
    setPermissions(['view', 'download']);
    setShareData(null);
    setEmailStatus('');
  };

  const handleCreateShareWithEmail = async (e) => {
    e.preventDefault();

    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    if (!recipientEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter valid email address');
      return;
    }

    setShareLoading(true);
    setShareStep(2);
    setEmailStatus('Preparing share link...');

    try {
      const requestPayload = {
        documentId: shareModalDoc.id,
        recipientEmail: recipientEmail,
        permissions: permissions,
        requireOtp: requireOtp,
        expiryDays: Number(expiryDays),
        senderEmail: user?.email,
      };

      setEmailStatus('📝 Creating share link...');

      const res = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create share');
      }

      setEmailStatus('📧 Sending email to recipient...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (result.data.emailSent) {
        setEmailStatus(`✅ Email sent to ${recipientEmail}!`);
        toast.success(`Email sent to ${recipientEmail}!`);
      } else {
        setEmailStatus(`⚠️ Share created. Link is ready.`);
        toast.success('Share created. Link is ready to use.');
      }

      setShareData(result.data);
      setShareLink(result.data.shareLink);
      setShareStep(3);
      setShareLoading(false);

    } catch (error) {
      console.error('❌ Share error:', error);
      setEmailStatus(`❌ Error: ${error.message}`);
      toast.error(error.message);
      setShareStep(1);
      setShareLoading(false);
    }
  };

  const generateShareLink = async (doc) => {
    openShareModal(doc);
  };

  // Handle incoming document request action
  const handleRequestAction = async () => {
    if (!selectedRequest || !requestAction) {
      toast.error('Please select an action');
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch('/api/document-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: requestAction,
          message: actionMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Request ${requestAction}!`);
        
        // Update the request in the list
        setDocumentRequests(documentRequests.map(r =>
          r.id === selectedRequest.id
            ? { ...r, status: requestAction, issuer_message: actionMessage }
            : r
        ));

        // Close modal
        setShowRequestModal(false);
        setSelectedRequest(null);
        setRequestAction(null);
        setActionMessage('');
      } else {
        toast.error(data.error || 'Failed to update request');
      }
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    try {
      clearAuth();
      setTimeout(() => {
        navigate('/');
        toast.success('Logged out successfully!');
      }, 100);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed');
    }
  };

  // Get statistics
  const pendingRequests = documentRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = documentRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = documentRequests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Issuer Dashboard</h1>
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-signatura-red">
            <h3 className="text-gray-600 text-sm font-medium">Total Documents</h3>
            <p className="text-3xl font-bold text-signatura-dark mt-2">{documents.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Active</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {documents.filter((d) => d.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved Requests</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{approvedRequests}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-600 text-sm font-medium">Rejected Requests</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{rejectedRequests}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-gray-400">
            <h3 className="text-gray-600 text-sm font-medium">Organization</h3>
            <p className="text-lg font-bold text-signatura-dark mt-2">{user?.organization_name || 'N/A'}</p>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-signatura-red mb-8">
          <h2 className="text-xl font-bold text-signatura-dark mb-4">Issue New Document</h2>
          <form onSubmit={handleCreateDocument} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bachelor of Science in Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
              >
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="license">License</option>
                <option value="government-id">Government ID</option>
                <option value="school-id">School ID</option>
                <option value="marriage-certificate">Marriage Certificate</option>
                <option value="baptismal-certificate">Baptismal Certificate</option>
                <option value="insurance-id">Insurance ID</option>
                <option value="professional-certification">Professional Certification</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent transition disabled:opacity-50"
            >
              <FiPlus className="mr-2" />
              {loading ? 'Creating...' : 'Create Document'}
            </button>
          </form>
        </div>

        {/* INCOMING DOCUMENT REQUESTS */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📥 Document Requests from Owners</h2>
            <p className="text-sm text-gray-500">Owners requesting documents from you</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Documents Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No document requests yet
                    </td>
                  </tr>
                ) : (
                  documentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-signatura-dark">
                        {req.owner_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{req.owner_email}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="space-y-1">
                          {req.documents?.map((doc, idx) => (
                            <div key={idx} className="text-xs bg-blue-50 px-2 py-1 rounded w-fit">
                              {doc.title}
                            </div>
                          )) || <span>—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'pending' && <FiAlertCircle className="mr-1" size={14} />}
                          {req.status === 'approved' && <FiCheckCircle className="mr-1" size={14} />}
                          {req.status === 'rejected' && <FiXCircle className="mr-1" size={14} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' ? (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowRequestModal(true);
                              setRequestAction(null);
                              setActionMessage('');
                            }}
                            className="text-signatura-red hover:bg-red-50 px-3 py-1 rounded transition font-medium text-sm"
                          >
                            Respond →
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {req.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
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

        {/* My Documents Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">My Documents</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No documents yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-signatura-dark">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{doc.document_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => generateQRCode(doc)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                        title="Generate QR Code"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => generateShareLink(doc)}
                        className="text-signatura-red hover:bg-red-50 p-2 rounded transition"
                        title="Share with Email"
                      >
                        <FiMail size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="text-purple-600 hover:bg-purple-50 p-2 rounded transition"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* QR Code Modal */}
        {qrCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-bold text-signatura-dark mb-4">Document QR Code</h3>
              <img src={qrCode} alt="QR Code" className="w-full mb-4 border border-gray-200 rounded" />
              <p className="text-sm text-gray-600 mb-4">
                Share this QR code for instant verification
              </p>
              <button
                onClick={() => setQrCode(null)}
                className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* SHARE MODAL - STEP 1: FORM */}
        {showShareModal && shareStep === 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-signatura-dark mb-6">
                📤 Share Document
              </h2>

              <form onSubmit={handleCreateShareWithEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-2" />
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={permissions.includes('view')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, 'view']);
                          } else {
                            setPermissions(permissions.filter(p => p !== 'view'));
                          }
                        }}
                        className="mr-2"
                      />
                      👁️ View
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={permissions.includes('download')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, 'download']);
                          } else {
                            setPermissions(permissions.filter(p => p !== 'download'));
                          }
                        }}
                        className="mr-2"
                      />
                      ⬇️ Download
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={requireOtp}
                      onChange={(e) => setRequireOtp(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🔒 Require OTP Verification
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⏰ Expires In
                  </label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  >
                    <option value={1}>1 day</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shareLoading}
                    className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50"
                  >
                    {shareLoading ? 'Creating...' : 'Create & Share'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SHARE MODAL - STEP 2: LOADING */}
        {showShareModal && shareStep === 2 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl text-center">
              <div className="animate-spin mb-4">
                <FiMail className="w-8 h-8 text-signatura-red mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-signatura-dark mb-4">
                Setting up share...
              </h2>
              <p className="text-gray-600 mb-4">{emailStatus}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-signatura-red h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* SHARE MODAL - STEP 3: SUCCESS */}
        {showShareModal && shareStep === 3 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <FiCheck className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-green-600">Share Created!</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    📧 Recipient Email
                  </p>
                  <p className="text-lg font-bold text-blue-700 mt-1">
                    {recipientEmail}
                  </p>
                </div>

                {shareLink && (
                  <div className="border-2 border-signatura-red rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      📋 Share Link
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 
                                    border border-gray-200 overflow-x-auto whitespace-nowrap">
                      {shareLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(shareLink, 'share-success')}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 
                                 bg-signatura-red text-white rounded hover:bg-signatura-accent transition"
                    >
                      {copiedId === 'share-success' ? (
                        <>
                          <FiCheck />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShareStep(1);
                    setRecipientEmail('');
                    setShareLink(null);
                    setShareData(null);
                  }}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded hover:bg-signatura-accent"
                >
                  Share Again
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-signatura-red text-signatura-red rounded hover:bg-red-50"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT REQUEST RESPONSE MODAL */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-signatura-dark mb-4">
                Respond to Request
              </h2>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Owner</p>
                  <p className="text-lg font-bold text-gray-900">{selectedRequest.owner_email}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Requested Documents:</p>
                  <div className="space-y-1">
                    {selectedRequest.documents?.map((doc, idx) => (
                      <p key={idx} className="text-sm text-blue-800">• {doc.title}</p>
                    ))}
                  </div>
                </div>

                {selectedRequest.message && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-1">Their Message:</p>
                    <p className="text-sm text-yellow-800">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleRequestAction();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={requestAction === 'approved'}
                        onChange={() => setRequestAction('approved')}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-green-700">
                        ✓ Approve Request
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={requestAction === 'rejected'}
                        onChange={() => setRequestAction('rejected')}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-red-700">
                        ✗ Reject Request
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    placeholder="e.g., Documents will be sent within 3 business days..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedRequest(null);
                      setRequestAction(null);
                      setActionMessage('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!requestAction || actionLoading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
                      requestAction === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : requestAction === 'rejected'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-400'
                    }`}
                  >
                    {actionLoading ? 'Sending...' : 'Send Response'}
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
