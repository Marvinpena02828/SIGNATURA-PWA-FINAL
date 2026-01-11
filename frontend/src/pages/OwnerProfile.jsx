import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiLogOut, FiDownload, FiCopy, FiX, FiCheck, FiTrash2, FiChevronDown, FiChevronUp,
  FiHome, FiBell, FiUser, FiSettings
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OwnerProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [userQRData, setUserQRData] = useState(null);
  const [trustedUsers, setTrustedUsers] = useState(
    JSON.parse(localStorage.getItem('trustedUsers') || '[]')
  );
  const [pastedUserId, setPastedUserId] = useState('');
  const [expandedTrusted, setExpandedTrusted] = useState(null);

  useEffect(() => {
    if (role !== 'owner') {
      navigate('/');
      return;
    }

    // Generate user QR data
    const qrData = {
      userId: user?.id,
      email: user?.email,
      name: user?.full_name || user?.email,
      role: role,
      organization: user?.organization_name,
      timestamp: new Date().toISOString(),
    };
    setUserQRData(qrData);
  }, [user, role, navigate]);

  const handleDownloadQR = () => {
    const qrImage = document.querySelector('#userQRCode');
    if (!qrImage) {
      toast.error('QR code not found');
      return;
    }

    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `${user?.email}-qr-code.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const handleCopyQRData = () => {
    if (!userQRData) return;
    navigator.clipboard.writeText(JSON.stringify(userQRData));
    toast.success('QR data copied to clipboard!');
  };

  const handleAddTrustedUser = () => {
    if (!pastedUserId.trim()) {
      toast.error('Please paste user ID or email');
      return;
    }

    if (trustedUsers.includes(pastedUserId)) {
      toast.error('User already in trusted directory');
      return;
    }

    const updated = [...trustedUsers, pastedUserId];
    setTrustedUsers(updated);
    localStorage.setItem('trustedUsers', JSON.stringify(updated));
    setPastedUserId('');
    toast.success('✓ User added to trusted directory!');
  };

  const handleRemoveTrustedUser = (userEmail) => {
    const updated = trustedUsers.filter((u) => u !== userEmail);
    setTrustedUsers(updated);
    localStorage.setItem('trustedUsers', JSON.stringify(updated));
    toast.success('User removed from trusted directory');
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  if (!userQRData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner')}
              className="text-gray-600 hover:text-gray-900 transition"
              title="Back to Dashboard"
            >
              <FiHome size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-signatura-dark">👤 My Profile</h1>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => navigate('/owner')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition"
          >
            📋 Dashboard
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition"
          >
            🔔 Notifications
          </button>
          <button
            className="px-4 py-2 text-signatura-red border-b-2 border-signatura-red font-medium"
          >
            👤 Profile
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-signatura-red rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.full_name || user?.email}</h2>
                <p className="text-gray-600 text-sm break-all">{user?.email}</p>
              </div>

              <div className="space-y-3 border-t pt-6">
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase">Role</label>
                  <p className="text-gray-900 font-semibold capitalize">{role}</p>
                </div>
                {user?.organization_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Organization</label>
                    <p className="text-gray-900 font-semibold">{user.organization_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase">User ID</label>
                  <p className="text-gray-900 font-mono text-xs break-all">{user?.id}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/settings')}
                className="w-full mt-6 border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                <FiSettings className="inline mr-2" />
                Settings
              </button>
            </div>
          </div>

          {/* Right Column - QR Code & Trust Network */}
          <div className="lg:col-span-2 space-y-8">
            {/* User QR Code Section */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                <h3 className="text-2xl font-bold">🔐 Your Digital Identity</h3>
                <p className="text-green-100 text-sm mt-1">Share this QR code to build trust relationships</p>
              </div>

              <div className="p-8">
                {/* QR Code Display */}
                <div className="flex flex-col items-center mb-8">
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <img
                      id="userQRCode"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                        JSON.stringify(userQRData)
                      )}`}
                      alt="User QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-center text-gray-600 text-sm mt-4 max-w-sm">
                    Other users scan this QR code to add you to their trusted directory
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadQR}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 transition"
                  >
                    <FiDownload size={18} />
                    Download QR
                  </button>
                  <button
                    onClick={handleCopyQRData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition"
                  >
                    <FiCopy size={18} />
                    Copy Data
                  </button>
                </div>

                {/* User Info Display */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm space-y-2">
                  <p>
                    <strong>Name:</strong> {userQRData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {userQRData.email}
                  </p>
                  <p>
                    <strong>Role:</strong> <span className="capitalize">{userQRData.role}</span>
                  </p>
                  <p>
                    <strong>Organization:</strong> {userQRData.organization || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Trusted Directory Section */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h3 className="text-2xl font-bold">🤝 Trusted Directory</h3>
                <p className="text-blue-100 text-sm mt-1">People you trust ({trustedUsers.length})</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Add Trusted User */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Trusted User (Paste User ID or Email)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pastedUserId}
                      onChange={(e) => setPastedUserId(e.target.value)}
                      placeholder="Paste user ID or email..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button
                      onClick={handleAddTrustedUser}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition"
                    >
                      <FiCheck size={18} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Trusted Users List */}
                {trustedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No trusted users yet</p>
                    <p className="text-gray-400 text-sm">
                      Scan other users' QR codes or paste their ID to build your trust network
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trustedUsers.map((trustedUser, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{trustedUser}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <FiCheck size={12} className="text-green-600" />
                            Trusted
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveTrustedUser(trustedUser)}
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-900 mb-4">📖 How Trust Network Works</h4>
              <ol className="space-y-3 text-sm text-purple-800">
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
                  <span>Share your QR code with people you want in your trust network</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
                  <span>They scan your QR code and add you to their trusted directory</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
                  <span>You add them by pasting their user ID/email in your trusted directory</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
                  <span>Now you can verify documents from each other instantly</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
