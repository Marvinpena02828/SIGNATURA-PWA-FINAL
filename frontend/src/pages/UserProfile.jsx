import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiCopy, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [trustedUsers, setTrustedUsers] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [scannedUserId, setScannedUserId] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const userQRData = {
    userId: user?.id,
    email: user?.email,
    name: user?.full_name || user?.email,
    role: role,
    organization: user?.organization_name,
    timestamp: new Date().toISOString(),
  };

  const userQRString = JSON.stringify(userQRData);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(userQRString)}`;

  const handleAddTrustedUser = async () => {
    if (!scannedUserId.trim()) {
      toast.error('Please enter or scan a user ID');
      return;
    }

    // In real app, this would verify the user exists and add to trusted list
    setTrustedUsers((prev) => [...new Set([...prev, scannedUserId])]);
    setScannedUserId('');
    toast.success('✅ User added to trusted directory!');
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">User Profile</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: User Details */}
            <div>
              <h2 className="text-2xl font-bold text-signatura-dark mb-6">👤 Your Identity</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{user?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="text-lg font-medium text-signatura-red capitalize">{role}</p>
                </div>
                {user?.organization_name && (
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="text-lg font-medium text-gray-900">{user.organization_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{user?.id}</p>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-signatura-dark mb-4">📱 Your QR Code</h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Others can scan this to add you to their trusted directory
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 border-2 border-signatura-red">
                <img
                  src={qrUrl}
                  alt="User QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userQRString);
                    toast.success('QR data copied!');
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <FiCopy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.download = `${user?.email}-qr.png`;
                    link.click();
                    toast.success('QR code downloaded!');
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Directory */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">🤝 Trusted Directory</h2>
            <p className="text-sm text-gray-500 mt-1">Users you trust for document verification</p>
          </div>

          <div className="p-6">
            {/* Add User */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Add Trusted User</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedUserId}
                  onChange={(e) => setScannedUserId(e.target.value)}
                  placeholder="Scan QR code or paste user ID..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTrustedUser();
                    }
                  }}
                />
                <button
                  onClick={handleAddTrustedUser}
                  className="bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Use your phone camera to scan another user's QR code and paste their ID here
              </p>
            </div>

            {/* Trusted Users List */}
            {trustedUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No trusted users yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trustedUsers.map((userId) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">User</p>
                      <p className="text-sm font-mono text-gray-600">{userId}</p>
                    </div>
                    <button
                      onClick={() => {
                        setTrustedUsers((prev) => prev.filter((id) => id !== userId));
                        toast.success('User removed');
                      }}
                      className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-3">🔐 How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Your QR code encodes your user identity and contact information</li>
            <li>✓ Other Signatura users can scan your QR to verify you</li>
            <li>✓ Trusted users can then verify documents you've issued</li>
            <li>✓ Build a network of trusted issuers for document verification</li>
            <li>✓ Each document has its own QR code for validity verification</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
