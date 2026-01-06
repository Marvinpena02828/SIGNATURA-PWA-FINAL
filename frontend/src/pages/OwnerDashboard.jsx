// src/pages/OwnerDashboard-Enhanced.jsx
// Owner Dashboard - Wallet, Signature Verification, Consent Flow

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye, FiPlus, FiCopy, FiX,
  FiCheck, FiAlertCircle, FiLock, FiUnlock, FiTrash2, FiBarChart2, FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { 
  getWallet, 
  verifyCredentialSignature, 
  getWalletStats, 
  deleteCredential 
} from '../services/ownerWalletService';
import {
  createShareRequest,
  getSharesByCredential,
  approveShare,
  revokeShare,
  getShareStats,
  checkPermission,
} from '../services/consentService';

const DOCUMENT_TYPES = ['diploma', 'certificate', 'license', 'badge'];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // State
  const [activeTab, setActiveTab] = useState('wallet');
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  
  // Selected items
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [selectedShare, setSelectedShare] = useState(null);
  const [selectedIssuer, setSelectedIssuer] = useState(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);

  // Forms
  const [shareForm, setShareForm] = useState({
    verifierEmail: '',
    canPrint: true,
    canShare: false,
    canDownload: false,
    expiryDays: 7,
  });

  // Stats
  const [stats, setStats] = useState({
    totalCredentials: 0,
    verifiedCredentials: 0,
    totalRequests: 0,
    shareStats: {},
  });

  // Lifecycle
  useEffect(() => {
    if (role !== 'owner') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate, user?.id]);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Get wallet
      const ownerWallet = getWallet(user?.id);
      setWallet(ownerWallet);

      // Fetch from backend
      await Promise.all([
        fetchReceivedDocuments(),
        fetchMyRequests(),
        fetchIssuers(),
      ]);

      // Update stats
      updateStats(ownerWallet);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch received documents
  const fetchReceivedDocuments = async () => {
    try {
      const res = await fetch(`/api/documents?endpoint=document-shares&ownerId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReceivedDocuments(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  // Fetch document requests
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
      console.error('Error fetching requests:', err);
    }
  };

  // Fetch issuers
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
      console.error('Error fetching issuers:', err);
    }
  };

  // Update statistics
  const updateStats = (ownerWallet) => {
    const verified = ownerWallet.filter((c) => c.verificationStatus === 'verified').length;
    const shareStats = getShareStats();

    setStats({
      totalCredentials: ownerWallet.length,
      verifiedCredentials: verified,
      totalRequests: myRequests.length,
      shareStats,
    });
  };

  // ===== WALLET MANAGEMENT =====

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential);
    setShowDocumentModal(true);
  };

  const handleVerifyCredential = (credential) => {
    const result = verifyCredentialSignature(credential);
    setVerificationResult(result);
    setSelectedCredential(credential);
    setShowVerifyModal(true);
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Delete this credential from wallet?')) return;

    try {
      deleteCredential(user?.id, credentialId);
      const updated = getWallet(user?.id);
      setWallet(updated);
      updateStats(updated);
      toast.success('Credential deleted');
    } catch (err) {
      toast.error('Failed to delete credential');
    }
  };

  // ===== SHARING & CONSENT =====

  const handleOpenShareModal = (credential) => {
    setSelectedCredential(credential);
    const shares = getSharesByCredential(credential.credentialId);
    setSelectedShare(shares[0] || null);
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
        selectedCredential.issuer.publicKey,
        shareForm.verifierEmail,
        {
          canView: true,
          canPrint: shareForm.canPrint,
          canShare: shareForm.canShare,
          canDownload: shareForm.canDownload,
        }
      );

      if (result.success) {
        toast.success('✓ Share request created!');
        toast.success(`Link: ${result.shareLink}`);
        setShowShareModal(false);
        setShareForm({
          verifierEmail: '',
          canPrint: true,
          canShare: false,
          canDownload: false,
          expiryDays: 7,
        });
      } else {
        toast.error(result.error || 'Failed to create share');
      }
    } catch (err) {
      toast.error('Error sharing credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeShare = (shareId) => {
    if (!window.confirm('Revoke access for this verifier?')) return;

    const result = revokeShare(shareId, 'Revoked by owner');
    if (result.success) {
      toast.success('✓ Access revoked');
    } else {
      toast.error('Failed to revoke');
    }
  };

  // ===== REQUEST MANAGEMENT =====

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
        toast.success('✓ Request sent!');
        setShowRequestModal(false);
        setSelectedIssuer(null);
        setSelectedDocTypes([]);
        await fetchMyRequests();
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
    navigate('/');
    toast.success('Logged out!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
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
            <h1 className="text-2xl font-bold text-signatura-dark">💼 Owner Wallet</h1>
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
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Total Credentials</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalCredentials}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">✓ Verified</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.verifiedCredentials}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-medium">Active Shares</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.shareStats.active || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto flex-wrap">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap text-sm ${
              activeTab === 'wallet'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎓 Wallet ({wallet.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap text-sm ${
              activeTab === 'requests'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('request-new')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap text-sm ${
              activeTab === 'request-new'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ➕ Request New
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`px-6 py-3 font-medium transition whitespace-nowrap text-sm ${
              activeTab === 'sharing'
                ? 'text-signatura-red border-b-2 border-signatura-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔗 Sharing ({stats.shareStats.active || 0})
          </button>
        </div>

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">🎓 My Credentials</h2>
              <p className="text-sm text-gray-500 mt-1">Cryptographically signed credentials in your wallet</p>
            </div>

            {wallet.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No credentials in wallet yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Recipient</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Signed</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Expires</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wallet.map((cred) => (
                      <tr key={cred.credentialId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium capitalize">{cred.credentialType}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{cred.recipientName}</p>
                            <p className="text-xs text-gray-500">{cred.recipientEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              cred.verificationStatus === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : cred.verificationStatus === 'invalid'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {cred.verificationStatus === 'verified' && <FiCheck size={12} />}
                            {cred.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(cred.signedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {cred.expiresAt ? new Date(cred.expiresAt).toLocaleDateString() : '∞'}
                        </td>
                        <td className="px-6 py-4 flex gap-1 flex-wrap">
                          <button
                            onClick={() => handleVerifyCredential(cred)}
                            className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium"
                            title="Verify signature"
                          >
                            <FiCheck size={14} className="inline" /> Verify
                          </button>
                          <button
                            onClick={() => handleOpenShareModal(cred)}
                            className="text-purple-600 hover:bg-purple-50 px-2 py-1 rounded text-xs font-medium"
                            title="Share with verifier"
                          >
                            <FiShare2 size={14} className="inline" /> Share
                          </button>
                          <button
                            onClick={() => handleDeleteCredential(cred.credentialId)}
                            className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium"
                            title="Delete from wallet"
                          >
                            <FiTrash2 size={14} className="inline" /> Delete
                          </button>
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
                <p className="text-gray-500">No requests sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Issuer</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Requested</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Types</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{req.issuer_organization || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
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
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {req.message?.split('Requesting ')[1]?.split(' documents')[0] || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Request New Tab */}
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
                    <button
                      onClick={() => handleOpenRequestModal(issuer)}
                      className="mt-4 w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent font-medium text-sm"
                    >
                      Request Documents
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sharing Tab */}
        {activeTab === 'sharing' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">🔗 Credential Sharing</h2>
              <p className="text-sm text-gray-500 mt-1">Manage who can access your credentials</p>
            </div>

            {wallet.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No credentials to share</p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {wallet.map((cred) => {
                  const shares = getSharesByCredential(cred.credentialId);
                  return (
                    <div key={cred.credentialId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{cred.credentialType}</h3>
                          <p className="text-sm text-gray-600">{cred.recipientName}</p>
                        </div>
                        <button
                          onClick={() => handleOpenShareModal(cred)}
                          className="text-purple-600 hover:bg-purple-50 px-3 py-1 rounded text-sm font-medium"
                        >
                          + Share
                        </button>
                      </div>

                      {shares.length === 0 ? (
                        <p className="text-xs text-gray-500">Not shared yet</p>
                      ) : (
                        <div className="space-y-2 mt-3 border-t pt-3">
                          {shares.map((share) => (
                            <div key={share.id} className="flex justify-between items-center text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{share.verifierEmail}</p>
                                <p className="text-xs text-gray-500">{share.status}</p>
                              </div>
                              {share.status === 'approved' && (
                                <button
                                  onClick={() => handleRevokeShare(share.id)}
                                  className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium"
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
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}

      {/* Verification Modal */}
      {showVerifyModal && verificationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">🔐 Signature Verification</h2>
            </div>

            <div className="p-6 space-y-6">
              <div
                className={`p-4 rounded-lg border-2 ${
                  verificationResult.isValid
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {verificationResult.isValid ? (
                    <FiCheck className="text-green-600" size={24} />
                  ) : (
                    <FiAlertCircle className="text-red-600" size={24} />
                  )}
                  <h3 className="font-bold text-lg">
                    {verificationResult.isValid ? 'Signature Valid ✓' : 'Signature Invalid ✗'}
                  </h3>
                </div>
                <p
                  className={`text-sm ${
                    verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {verificationResult.message}
                </p>
              </div>

              <div className="bg-gray-50 rounded p-4 text-sm space-y-2">
                <p>
                  <strong>Credential ID:</strong>
                  <code className="text-xs block break-all mt-1">{verificationResult.credentialId}</code>
                </p>
                <p>
                  <strong>Signed:</strong>
                  <span className="block">{new Date(verificationResult.signedAt).toLocaleString()}</span>
                </p>
                <p>
                  <strong>Issuer Key:</strong>
                  <code className="text-xs block break-all mt-1">
                    {verificationResult.issuerPublicKey?.substring(0, 50)}...
                  </code>
                </p>
              </div>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent font-medium"
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">📤 Share Credential</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedCredential.credentialType}</p>
            </div>

            <form onSubmit={handleShareCredential} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verifier Email *
                </label>
                <input
                  type="email"
                  value={shareForm.verifierEmail}
                  onChange={(e) => setShareForm({ ...shareForm, verifierEmail: e.target.value })}
                  placeholder="verifier@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none text-sm"
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
                      checked={shareForm.canShare}
                      onChange={(e) => setShareForm({ ...shareForm, canShare: e.target.checked })}
                      className="w-4 h-4 text-signatura-red rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">Can Share Further</label>
                  </div>
                  <p className="text-xs text-red-600 mt-2">⚠️ Download disabled for security</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={shareForm.expiryDays}
                  onChange={(e) => setShareForm({ ...shareForm, expiryDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium text-sm"
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
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">📋 Request Documents</h2>
              <p className="text-sm text-gray-600 mt-1">From: {selectedIssuer.organization_name}</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select document types *
                </label>
                <div className="space-y-2">
                  {DOCUMENT_TYPES.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={type}
                        checked={selectedDocTypes.includes(type)}
                        onChange={() => handleToggleDocType(type)}
                        className="w-4 h-4 text-signatura-red rounded"
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedDocTypes.length === 0}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium text-sm"
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
