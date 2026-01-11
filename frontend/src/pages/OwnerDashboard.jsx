import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye, FiPlus, FiCopy, FiX,
  FiCheck, FiAlertCircle, FiLock, FiUnlock, FiTrash2, FiChevronDown, FiChevronUp, FiBell
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getWallet, verifyCredentialSignature, deleteCredential } from '../services/ownerWalletService';
import { createShareRequest, getSharesByCredential, revokeShare, getShareStats } from '../services/consentService';

const ORGANIZATION_TYPES = [
  'Educational Institution',
  'Professional Organizations',
  'Religious Institution',
  'Government Agencies',
  'Local Government Unit',
  'Private Organizations',
];

const DOCUMENT_TYPES = ['Diploma', 'Certificate', 'License', 'Badge', 'Transcript', 'Transcript of Records'];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // State
  const [wallet, setWallet] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState('wallet');
  const [expandedCredential, setExpandedCredential] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);
  
  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);

  // Forms
  const [shareForm, setShareForm] = useState({
    verifierEmail: '',
    canPrint: true,
    canShare: false,
    canDownload: false,
    expiryDays: 7,
  });

  const [stats, setStats] = useState({
    totalCredentials: 0,
    verifiedCredentials: 0,
    activeShares: 0,
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
      const ownerWallet = getWallet(user?.id);
      setWallet(ownerWallet);

      const verified = ownerWallet.filter((c) => c.verificationStatus === 'verified').length;
      const shareStats = getShareStats();
      
      setStats({
        totalCredentials: ownerWallet.length,
        verifiedCredentials: verified,
        activeShares: shareStats.active || 0,
      });

      await Promise.all([
        fetchMyRequests(),
        fetchIssuers(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`/api/documents?endpoint=document-requests&ownerId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMyRequests(data.data);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchIssuers = async () => {
    try {
      const res = await fetch('/api/documents?endpoint=get-issuers');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setIssuers(data.data);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleVerifyCredential = (credential) => {
    const result = verifyCredentialSignature(credential);
    setVerificationResult(result);
    setSelectedCredential(credential);
    setShowVerifyModal(true);
  };

  const handleOpenShareModal = (credential) => {
    setSelectedCredential(credential);
    setShareForm({
      verifierEmail: '',
      canPrint: true,
      canShare: false,
      canDownload: false,
      expiryDays: 7,
    });
    setShowShareModal(true);
  };

  const handleShareCredential = async (e) => {
    e.preventDefault();
    if (!shareForm.verifierEmail) {
      toast.error('Please enter verifier email');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createShareRequest(
        selectedCredential.credentialId,
        selectedCredential.issuer?.publicKey,
        shareForm.verifierEmail,
        {
          canView: true,
          canPrint: shareForm.canPrint,
          canShare: shareForm.canShare,
          canDownload: shareForm.canDownload,
        }
      );

      if (result.success) {
        toast.success('✓ Credential shared!');
        setShowShareModal(false);
      } else {
        toast.error(result.error || 'Failed to share');
      }
    } catch (err) {
      toast.error('Error sharing credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Delete this credential?')) return;
    try {
      deleteCredential(user?.id, credentialId);
      const updated = getWallet(user?.id);
      setWallet(updated);
      toast.success('Credential deleted');
    } catch (err) {
      toast.error('Failed to delete');
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
      toast.error('Please select at least one document');
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
          message: `Requesting ${selectedDocTypes.join(', ')}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('✓ Request sent!');
        setShowRequestModal(false);
        setSelectedIssuer(null);
        setSelectedDocTypes([]);
        await fetchMyRequests();
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      toast.error('Error sending request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-300">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-signatura-red text-white sticky top-0 z-40 shadow-md">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">💼 Digital Wallet</h1>
              <p className="text-red-100 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <FiLogOut className="inline mr-1" />
              Logout
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-red-600 rounded p-3 text-center">
              <p className="text-red-100">Credentials</p>
              <p className="text-2xl font-bold">{stats.totalCredentials}</p>
            </div>
            <div className="bg-red-600 rounded p-3 text-center">
              <p className="text-red-100">✓ Verified</p>
              <p className="text-2xl font-bold">{stats.verifiedCredentials}</p>
            </div>
            <div className="bg-red-600 rounded p-3 text-center">
              <p className="text-red-100">Active Shares</p>
              <p className="text-2xl font-bold">{stats.activeShares}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'wallet'
                ? 'bg-signatura-red text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            🎓 Wallet ({wallet.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'requests'
                ? 'bg-signatura-red text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            📋 Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('request-new')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'request-new'
                ? 'bg-signatura-red text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            ➕ Request New
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'sharing'
                ? 'bg-signatura-red text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            🔗 Sharing
          </button>
        </div>

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            {wallet.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-500 text-lg">No credentials in wallet yet</p>
              </div>
            ) : (
              wallet.map((cred) => (
                <div key={cred.credentialId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  {/* Credential Header */}
                  <div
                    className="bg-gradient-to-r from-signatura-red to-red-600 text-white p-4 cursor-pointer hover:opacity-90 transition"
                    onClick={() =>
                      setExpandedCredential(
                        expandedCredential === cred.credentialId ? null : cred.credentialId
                      )
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold capitalize">{cred.credentialType}</h3>
                        <p className="text-red-100 text-sm">{cred.recipientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            cred.verificationStatus === 'verified'
                              ? 'bg-green-500'
                              : cred.verificationStatus === 'invalid'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                        >
                          {cred.verificationStatus}
                        </span>
                        {expandedCredential === cred.credentialId ? (
                          <FiChevronUp size={20} />
                        ) : (
                          <FiChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCredential === cred.credentialId && (
                    <div className="p-4 border-t border-gray-200 space-y-4">
                      {/* Credential Details */}
                      <div className="bg-gray-50 rounded p-4 space-y-3">
                        <h4 className="font-bold text-gray-900">📋 Credential Details</h4>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <label className="text-gray-600 font-medium">First Name</label>
                            <p className="text-gray-900 font-semibold">
                              {cred.recipientName?.split(' ')[0] || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600 font-medium">Last Name</label>
                            <p className="text-gray-900 font-semibold">
                              {cred.recipientName?.split(' ').slice(-1)[0] || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600 font-medium">Type</label>
                            <p className="text-gray-900 font-semibold capitalize">{cred.credentialType}</p>
                          </div>
                          <div>
                            <label className="text-gray-600 font-medium">Issuer</label>
                            <p className="text-gray-900 font-semibold text-xs truncate">
                              {cred.issuer?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <label className="text-gray-600 font-medium">Signed</label>
                            <p className="text-gray-900 font-semibold">
                              {new Date(cred.signedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600 font-medium">Expires</label>
                            <p className="text-gray-900 font-semibold">
                              {cred.expiresAt ? new Date(cred.expiresAt).toLocaleDateString() : '∞'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className="border-t pt-4">
                        <button
                          onClick={() =>
                            setShowQRCode(showQRCode === cred.credentialId ? null : cred.credentialId)
                          }
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                        >
                          {showQRCode === cred.credentialId ? '🔒 Hide QR Code' : '📱 Show Digital ID'}
                        </button>

                        {showQRCode === cred.credentialId && (
                          <div className="mt-4 p-4 bg-gray-50 rounded border-2 border-blue-200 text-center">
                            <p className="text-sm text-gray-600 mb-3">Digital ID QR Code</p>
                            <div className="w-48 h-48 mx-auto bg-white p-2 rounded border border-gray-300">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                  JSON.stringify({
                                    credentialId: cred.credentialId,
                                    type: cred.credentialType,
                                    name: cred.recipientName,
                                    issuer: cred.issuer?.name,
                                    signedAt: cred.signedAt,
                                  })
                                )}`}
                                alt="QR Code"
                                className="w-full h-full"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Scan to verify credential</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="border-t pt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleVerifyCredential(cred)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition text-xs"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => handleOpenShareModal(cred)}
                          className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition text-xs"
                        >
                          📤 Share
                        </button>
                        <button
                          onClick={() => handleDeleteCredential(cred.credentialId)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition text-xs"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-500 text-lg">No requests sent yet</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                >
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 cursor-pointer hover:opacity-90 transition"
                    onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{req.issuer_organization || 'Unknown'}</h3>
                        <p className="text-blue-100 text-sm">
                          {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            req.status === 'pending'
                              ? 'bg-yellow-400 text-yellow-900'
                              : req.status === 'approved'
                              ? 'bg-green-400 text-green-900'
                              : 'bg-red-400 text-red-900'
                          }`}
                        >
                          {req.status?.toUpperCase()}
                        </span>
                        {expandedRequest === req.id ? (
                          <FiChevronUp size={20} />
                        ) : (
                          <FiChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedRequest === req.id && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                        <p>
                          <strong>Documents Requested:</strong>{' '}
                          {req.message?.split('Requesting ')[1]?.split(' documents')[0] || 'N/A'}
                        </p>
                        <p>
                          <strong>Issuer Email:</strong> {req.issuer_email || 'N/A'}
                        </p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className="font-semibold">{req.status?.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Request New Tab */}
        {activeTab === 'request-new' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">Select an issuer to request documents</p>
            {issuers.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-500">No issuers available</p>
              </div>
            ) : (
              issuers.map((issuer) => (
                <div
                  key={issuer.id}
                  className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-bold text-gray-900 mb-1">{issuer.organization_name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{issuer.email}</p>
                  <button
                    onClick={() => handleOpenRequestModal(issuer)}
                    className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm transition"
                  >
                    Request Documents
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sharing Tab */}
        {activeTab === 'sharing' && (
          <div className="space-y-4">
            {wallet.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-500">No credentials to share</p>
              </div>
            ) : (
              wallet.map((cred) => {
                const shares = getSharesByCredential(cred.credentialId);
                return (
                  <div key={cred.credentialId} className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{cred.credentialType}</h3>
                        <p className="text-gray-600 text-sm">{cred.recipientName}</p>
                      </div>
                      <button
                        onClick={() => handleOpenShareModal(cred)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-purple-700 transition"
                      >
                        + Share
                      </button>
                    </div>
                    {shares.length === 0 ? (
                      <p className="text-xs text-gray-500">Not shared yet</p>
                    ) : (
                      <div className="space-y-2 mt-3 border-t pt-3">
                        {shares.map((share) => (
                          <div
                            key={share.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{share.verifierEmail}</p>
                              <p className="text-xs text-gray-500">{share.status}</p>
                            </div>
                            {share.status === 'approved' && (
                              <button
                                onClick={() => revokeShare(share.id)}
                                className="text-red-600 text-xs font-medium hover:underline"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}

      {/* Verification Modal */}
      {showVerifyModal && verificationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b-4 border-signatura-red">
              <h2 className="text-2xl font-bold text-signatura-dark">🔐 Signature Verification</h2>
            </div>

            <div className="p-6 space-y-4">
              <div
                className={`p-4 rounded-lg border-2 text-center ${
                  verificationResult.isValid
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="text-3xl mb-2">
                  {verificationResult.isValid ? '✓' : '✗'}
                </div>
                <h3 className="font-bold text-lg">
                  {verificationResult.isValid ? 'Signature Valid' : 'Signature Invalid'}
                </h3>
                <p
                  className={`text-sm mt-2 ${
                    verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {verificationResult.message}
                </p>
              </div>

              <div className="bg-gray-50 rounded p-4 text-sm space-y-2 max-h-48 overflow-y-auto">
                <p>
                  <strong>ID:</strong>
                  <code className="text-xs block break-all">{verificationResult.credentialId}</code>
                </p>
                <p>
                  <strong>Signed:</strong>
                  <span>{new Date(verificationResult.signedAt).toLocaleString()}</span>
                </p>
              </div>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b-4 border-signatura-red">
              <h2 className="text-2xl font-bold text-signatura-dark">📤 Share Credential</h2>
              <p className="text-gray-600 text-sm mt-1">{selectedCredential.credentialType}</p>
            </div>

            <form onSubmit={handleShareCredential} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Verifier Email *
                </label>
                <input
                  type="email"
                  value={shareForm.verifierEmail}
                  onChange={(e) => setShareForm({ ...shareForm, verifierEmail: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-signatura-red outline-none text-sm"
                  required
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareForm.canPrint}
                      onChange={(e) => setShareForm({ ...shareForm, canPrint: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <span className="text-sm text-gray-700">Can Print ✓</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareForm.canShare}
                      onChange={(e) => setShareForm({ ...shareForm, canShare: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <span className="text-sm text-gray-700">Can Share Further</span>
                  </label>
                  <p className="text-xs text-red-600 mt-2">⚠️ Download blocked for security</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  {submitting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedIssuer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b-4 border-signatura-red sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-signatura-dark">📋 Request Documents</h2>
              <p className="text-gray-600 text-sm mt-1">From: {selectedIssuer.organization_name}</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Select documents *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {DOCUMENT_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDocTypes.includes(type)}
                        onChange={() => handleToggleDocType(type)}
                        className="w-4 h-4 text-signatura-red rounded"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedDocTypes.length === 0}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  {submitting ? 'Sending...' : 'Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
