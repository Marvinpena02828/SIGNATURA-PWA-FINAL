import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiCheck, FiX, FiEye, FiShare2, FiLock, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState(null);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (role !== 'owner') navigate('/');
    else fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    try {
      console.log('📊 Fetching owner data for:', user?.email);

      // Fetch owner's documents
      const docsRes = await fetch(`/api/documents?ownerId=${user?.id}`);
      const docsData = await docsRes.json();
      if (docsData.success) setDocuments(docsData.data || []);

      // Fetch verification requests
      const reqRes = await fetch(`/api/verification-requests?ownerId=${user?.id}`);
      const reqData = await reqRes.json();
      if (reqData.success) setRequests(reqData.data || []);

      // Fetch shares - UPDATED: Pass both ownerId AND ownerEmail
      const sharesRes = await fetch(
        `/api/sharing?ownerId=${user?.id}&ownerEmail=${encodeURIComponent(user?.email)}`
      );
      const sharesData = await sharesRes.json();
      if (sharesData.success) {
        console.log('📋 Shares data received:', sharesData.data);
        console.log('  Created shares:', sharesData.data?.filter(s => s.shareType === 'created').length || 0);
        console.log('  Received shares:', sharesData.data?.filter(s => s.shareType === 'received').length || 0);
        setShares(sharesData.data || []);
      } else {
        console.error('❌ Error fetching shares:', sharesData.error);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
            <h3 className="text-gray-600 text-sm font-medium">Requests</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {requests.filter(r => r.status === 'approved').length}
            </p>
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
                      No documents yet
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

        {/* RECEIVED SHARES - Documents Shared With Me */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From (Issuer)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Security</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receivedShares.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No documents shared with me yet
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
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {share.permissions?.join(', ') || 'view'}
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
                      <td className="px-6 py-4">
                        {share.require_otp ? (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <FiLock size={14} className="mr-1" />
                            OTP Protected
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">No OTP</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isShareExpired(share.expires_at) && (
                          <a
                            href={`/shared/${share.share_token}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Requests */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">Verification Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Verifier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No verification requests
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{req.verifier_email}</td>
                      <td className="px-6 py-4 text-gray-600">{req.document?.title || 'N/A'}</td>
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
                      <td className="px-6 py-4 flex gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                              title="Approve"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                              title="Reject"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATED SHARES - Documents I Shared */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📤 Documents I Shared</h2>
            <p className="text-sm text-gray-500">Shares created by me (if I'm also an issuer)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Security</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {createdShares.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No documents shared by me yet
                    </td>
                  </tr>
                ) : (
                  createdShares.map((share) => (
                    <tr key={share.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{share.document?.title || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{share.recipient_email}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {share.permissions?.join(', ') || 'view'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isShareExpired(share.expires_at) ? (
                          <span className="text-red-600 font-medium">Expired</span>
                        ) : (
                          <span className="flex items-center text-blue-600">
                            <FiClock size={14} className="mr-1" />
                            {getRemainingTime(share.expires_at)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {share.require_otp ? (
                          <span className="flex items-center text-green-600 text-sm font-medium">
                            <FiLock size={14} className="mr-1" />
                            OTP Protected
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">No OTP</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isShareExpired(share.expires_at) && (
                          <button
                            onClick={() => handleRevokeShare(share.id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                            title="Revoke"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
