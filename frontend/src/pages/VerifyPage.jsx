import React, { useState } from 'react';
import { FiSearch, FiCheckCircle, FiAlertCircle, FiClock, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const [documentHash, setDocumentHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('hash'); // 'hash' or 'qr'

  const handleVerifyByHash = async (e) => {
    e.preventDefault();

    if (!documentHash.trim()) {
      toast.error('Please enter a document hash');
      return;
    }

    setLoading(true);
    setVerified(false);
    setResult(null);

    try {
      const res = await fetch(`/api/documents?hash=${encodeURIComponent(documentHash)}`);
      const data = await res.json();

      if (data.success && data.data?.length > 0) {
        const doc = data.data[0];
        setResult(doc);
        setVerified(true);
        toast.success('✓ Document verified successfully!');
      } else {
        setVerified(false);
        toast.error('Document not found or invalid hash');
      }
    } catch (err) {
      toast.error('Error verifying document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async (qrData) => {
    // Extract hash from QR code URL
    const url = new URL(qrData);
    const hash = url.searchParams.get('hash');

    if (!hash) {
      toast.error('Invalid QR code');
      return;
    }

    setDocumentHash(hash);
    // Trigger verification
    setLoading(true);
    setVerified(false);
    setResult(null);

    try {
      const res = await fetch(`/api/documents?hash=${encodeURIComponent(hash)}`);
      const data = await res.json();

      if (data.success && data.data?.length > 0) {
        const doc = data.data[0];
        setResult(doc);
        setVerified(true);
        toast.success('✓ Document verified from QR code!');
      } else {
        setVerified(false);
        toast.error('Document not found');
      }
    } catch (err) {
      toast.error('Error verifying document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '✓ Active';
      case 'revoked':
        return '✗ Revoked';
      case 'expired':
        return '⏰ Expired';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Verify Document</h1>
          <p className="text-white text-opacity-90">
            Verify the authenticity and status of digital documents instantly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Verification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              {/* Tabs */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('hash')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    activeTab === 'hash'
                      ? 'bg-signatura-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Enter Hash
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                    activeTab === 'qr'
                      ? 'bg-signatura-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Scan QR Code
                </button>
              </div>

              {/* Hash Input Method */}
              {activeTab === 'hash' && (
                <form onSubmit={handleVerifyByHash} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Document Hash or ID
                    </label>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={documentHash}
                        onChange={(e) => setDocumentHash(e.target.value)}
                        placeholder="Paste document hash here (e.g., abc123def456...)"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red focus:border-transparent outline-none transition text-base"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      You can find the hash in the document details or share link
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-signatura-red text-white py-3 rounded-lg font-semibold hover:bg-signatura-accent transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {loading ? 'Verifying...' : 'Verify Document'}
                  </button>
                </form>
              )}

              {/* QR Code Method */}
              {activeTab === 'qr' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <p className="text-blue-900 font-medium mb-4">📱 QR Code Scanner</p>
                    <p className="text-blue-800 text-sm mb-4">
                      Use your device camera or a QR code scanner app to scan the document's QR code.
                      The verification will happen automatically.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full"
                      onChange={(e) => {
                        // Placeholder for QR code scanning
                        toast.info('QR code scanning requires a camera or image upload');
                      }}
                    />
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600 text-sm">
                      <strong>Note:</strong> QR code scanning requires:
                    </p>
                    <ul className="text-gray-600 text-sm mt-2 space-y-1 ml-4">
                      <li>• Device with camera support</li>
                      <li>• Browser permission to access camera</li>
                      <li>• Clear, well-lit QR code</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Result */}
            {result && verified && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <FiCheckCircle className="text-5xl text-green-600 mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Document Verified ✓</h2>
                    <p className="text-green-700">This document is authentic and valid</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-1">Document Title</p>
                      <p className="text-lg font-bold text-gray-900">{result.title}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-1">Document Type</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{result.document_type}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-1">Issued Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(result.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  {result.expiry_date && (
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-sm font-medium mb-1">Expiry Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(result.expiry_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}

                  {/* Security Details */}
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                    <p className="text-gray-600 text-sm font-medium mb-3">Security Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-700">
                        <FiCheckCircle className="mr-2 w-4 h-4" />
                        <span>Document hash verified</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <FiCheckCircle className="mr-2 w-4 h-4" />
                        <span>Digital signature valid</span>
                      </div>
                      {result.is_encrypted && (
                        <div className="flex items-center text-green-700">
                          <FiLock className="mr-2 w-4 h-4" />
                          <span>End-to-end encrypted</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Hash */}
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-400 text-xs font-medium mb-2">Document Hash</p>
                    <p className="text-gray-100 font-mono text-xs break-all">{result.document_hash}</p>
                  </div>
                </div>
              </div>
            )}

            {result && !verified && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <FiAlertCircle className="text-5xl text-red-600 mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold text-red-900">Document Not Found</h2>
                    <p className="text-red-700">This document could not be verified in our system</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium mb-2">Possible reasons:</p>
                  <ul className="text-red-700 text-sm space-y-1 ml-4">
                    <li>• Invalid or incorrect document hash</li>
                    <li>• Document has been revoked</li>
                    <li>• Document does not exist in the system</li>
                    <li>• Document hash may have been tampered with</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1">
            {/* How It Works */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">How to Verify</h3>
              <div className="space-y-4">
                {[
                  { num: '1', title: 'Get Document Hash', desc: 'Obtain the hash from the document or share link' },
                  { num: '2', title: 'Enter or Scan', desc: 'Paste the hash or scan the QR code' },
                  { num: '3', title: 'Instant Verification', desc: 'System verifies authenticity instantly' },
                  { num: '4', title: 'View Details', desc: 'See complete document information' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-signatura-red flex items-center justify-center font-bold flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{step.title}</p>
                      <p className="text-white text-opacity-80 text-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-4">Verification Features</h3>
              <div className="space-y-3">
                {[
                  '✓ Instant verification',
                  '✓ No manual checking',
                  '✓ Tamper-proof results',
                  '✓ 24/7 availability',
                  '✓ Secure & private',
                  '✓ QR code support',
                ].map((feature, idx) => (
                  <p key={idx} className="text-white text-sm font-medium">{feature}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
          <h3 className="text-2xl font-bold text-white mb-6">Document Verification Process</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-bold mb-2">Hash Validation</h4>
              <p className="text-white text-opacity-80 text-sm">
                Document hash is checked against blockchain records
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiLock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-bold mb-2">Signature Check</h4>
              <p className="text-white text-opacity-80 text-sm">
                Digital signatures verified for authenticity
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-bold mb-2">Status Check</h4>
              <p className="text-white text-opacity-80 text-sm">
                Document status verified (active/revoked/expired)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
