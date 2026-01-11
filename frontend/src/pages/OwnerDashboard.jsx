import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiLogOut, FiDownload, FiPrinter, FiShare2, FiEye, FiPlus, FiCopy, FiX,
  FiCheck, FiAlertCircle, FiLock, FiTrash2, FiChevronDown, FiChevronUp, FiBell,
  FiBook, FiBriefcase, FiShield, FiHome, FiUsers, FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getWallet, verifyCredentialSignature, deleteCredential } from '../services/ownerWalletService';
import { createShareRequest, getSharesByCredential, revokeShare, getShareStats } from '../services/consentService';

const ORGANIZATION_CATEGORIES = [
  { id: 'educational', name: 'Educational Institution', icon: '🎓', color: 'from-blue-500 to-blue-600' },
  { id: 'professional', name: 'Professional Organizations', icon: '💼', color: 'from-purple-500 to-purple-600' },
  { id: 'religious', name: 'Religious Institution', icon: '⛪', color: 'from-indigo-500 to-indigo-600' },
  { id: 'government', name: 'Government Agencies', icon: '🏛️', color: 'from-green-500 to-green-600' },
  { id: 'local', name: 'Local Government Unit', icon: '🏢', color: 'from-orange-500 to-orange-600' },
  { id: 'private', name: 'Private Organizations', icon: '🏭', color: 'from-red-500 to-red-600' },
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
  const [activeTab, setActiveTab] = useState('documents');
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
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
      console.error('Error:', err);
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
      <header className="bg-signatura-red text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">🔐 Digital Wallet</h1>
              <p className="text-red-100 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-red-600 rounded-lg p-3 text-sm">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-red-100 text-xs font-medium">TOTAL DOCUMENTS</p>
                <p className="text-2xl font-bold text-white">{stats.totalCredentials}</p>
              </div>
              <div className="border-l border-red-400"></div>
              <div>
                <p className="text-red-100 text-xs font-medium">✓ VERIFIED</p>
                <p className="text-2xl font-bold text-white">{stats.verifiedCredentials}</p>
              </div>
              <div className="border-l border-red-400"></div>
              <div>
                <p className="text-red-100 text-xs font-medium">ACTIVE SHARES</p>
                <p className="text-2xl font-bold text-white">{stats.activeShares}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'documents'
                ? 'bg-signatura-red text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            📋 Digital Documents ({wallet.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'requests'
                ? 'bg-signatura-red text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            📤 My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('request-new')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm transition ${
              activeTab === 'request-new'
                ? 'bg-signatura-red text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            ➕ Request Documents
          </button>
        </div>

        {/* ===== DIGITAL DOCUMENTS TAB ===== */}
        {activeTab === 'documents' && (
          <div>
            {wallet.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg">No documents in wallet yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallet.map((cred) => (
                  <div
                    key={cred.credentialId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                  >
                    {/* Card Header */}
                    <div
                      className={`bg-gradient-to-r ${
                        cred.verificationStatus === 'verified'
                          ? 'from-green-600 to-green-700'
                          : cred.verificationStatus === 'invalid'
                          ? 'from-red-600 to-red-700'
                          : 'from-signatura-red to-red-700'
                      } text-white p-4 cursor-pointer hover:opacity-90 transition`}
                      onClick={() =>
                        setExpandedCard(expandedCard === cred.credentialId ? null : cred.credentialId)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold capitalize">{cred.credentialType}</h3>
                          <p className="text-sm opacity-90">{cred.recipientName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs opacity-75">Status</div>
                            <div className="text-sm font-bold">{cred.verificationStatus}</div>
                          </div>
                          {expandedCard === cred.credentialId ? (
                            <FiChevronUp size={24} />
                          ) : (
                            <FiChevronDown size={24} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCard === cred.credentialId && (
                      <div className="p-4 border-t border-gray-200 space-y-4">
                        {/* Document Details Box */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 text-sm">📋 DOCUMENT DETAIL</h4>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <label className="text-gray-600 text-xs font-medium">FirstName</label>
                              <p className="text-gray-900 font-semibold">
                                {cred.recipientName?.split(' ')[0] || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-xs font-medium">MiddleName</label>
                              <p className="text-gray-900 font-semibold">-</p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-xs font-medium">LastName</label>
                              <p className="text-gray-900 font-semibold">
                                {cred.recipientName?.split(' ').slice(-1)[0] || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-gray-600 text-xs font-medium">Diploma</label>
                              <p className="text-gray-900 font-semibold capitalize">{cred.credentialType}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <label className="text-gray-600 text-xs font-medium">Signed</label>
                                <p className="text-gray-900 font-semibold">
                                  {new Date(cred.signedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <label className="text-gray-600 text-xs font-medium">Expires</label>
                                <p className="text-gray-900 font-semibold">
                                  {cred.expiresAt ? new Date(cred.expiresAt).toLocaleDateString() : '∞'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-3 text-sm">📱 DIGITAL DOCUMENTS</h4>
                          <div className="bg-white p-3 rounded border border-blue-200 text-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                JSON.stringify({
                                  credentialId: cred.credentialId,
                                  type: cred.credentialType,
                                  name: cred.recipientName,
                                })
                              )}`}
                              alt="QR"
                              className="w-32 h-32 mx-auto"
                            />
                            <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== MY REQUESTS TAB ===== */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg">No requests sent yet</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${
                    req.status === 'approved'
                      ? 'from-green-600 to-green-700'
                      : req.status === 'pending'
                      ? 'from-yellow-600 to-yellow-700'
                      : 'from-red-600 to-red-700'
                  } text-white p-4`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold">{req.issuer_organization || 'Unknown'}</h3>
                        <p className="text-sm opacity-90">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-black bg-opacity-20 rounded text-xs font-bold">
                        {req.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 text-sm text-gray-700">
                    <p>
                      <strong>Documents:</strong> {req.message?.split('Requesting ')[1]?.split(' documents')[0] || 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== REQUEST NEW TAB ===== */}
        {activeTab === 'request-new' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Issuer Organization</h2>
            
            {/* Organization Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {ORGANIZATION_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border-2 border-gray-300 overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <div className={`bg-gradient-to-r ${category.color} text-white p-4 text-center`}>
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="font-bold text-sm">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Issuers for Selected Category */}
            {selectedCategory && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {ORGANIZATION_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                </h3>
                <div className="space-y-3">
                  {issuers
                    .filter((issuer) => {
                      // Filter issuers by category (you can customize this logic)
                      return issuer.id !== null; // For now, show all. Customize as needed
                    })
                    .map((issuer) => (
                      <div key={issuer.id} className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm hover:shadow-md transition">
                        <h4 className="font-bold text-gray-900 mb-1">{issuer.organization_name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{issuer.email}</p>
                        <button
                          onClick={() => handleOpenRequestModal(issuer)}
                          className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm transition"
                        >
                          Request Documents
                        </button>
                      </div>
                    ))}
                  {issuers.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>No issuers available in this category</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedCategory && issuers.length > 0 && (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-300">
                <p className="text-gray-500 text-lg">Select an organization category above to request documents</p>
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
                <div className="text-4xl mb-2">
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
              <h2 className="text-2xl font-bold text-signatura-dark">📤 Share Document</h2>
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
                <label className="block text-sm font-bold text-gray-700 mb-3">Permissions</label>
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
