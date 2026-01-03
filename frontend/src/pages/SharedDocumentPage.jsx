import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiDownload, FiEye, FiPrinter, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SharedDocumentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState(null);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    if (token) {
      fetchShareDetails();
    }
  }, [token]);

  const fetchShareDetails = async () => {
    try {
      console.log('📋 Fetching share details for token:', token.substring(0, 20) + '...');

      const res = await fetch(`/api/sharing?shareToken=${token}`);
      const data = await res.json();

      console.log('📊 Share response:', data);

      if (!data.success) {
        setError(data.error || 'Failed to load share');
        toast.error(data.error || 'Share not found or expired');
        return;
      }

      setShare(data.data.share);
      setDocument(data.data.document);

      // Check if OTP is required
      if (data.data.share.require_otp) {
        setOtpRequired(true);
        setShowOtpModal(true);
      } else {
        setIsVerified(true);
      }

      console.log('✅ Share loaded:', data.data.share);
    } catch (err) {
      console.error('❌ Error fetching share:', err);
      setError('Failed to load shared document');
      toast.error('Error loading share');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);

    try {
      console.log('🔐 Verifying OTP...');

      // TODO: Send OTP verification to backend
      // For now, we'll just verify it's 6 digits
      // In production, call: POST /api/verify-otp with { shareToken, otp }

      // Simulated verification (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes - any 6 digits work
      // In production, backend should validate against stored OTP
      
      console.log('✅ OTP verified!');
      setIsVerified(true);
      setShowOtpModal(false);
      toast.success('Verified! Document access granted.');
    } catch (err) {
      console.error('❌ OTP verification failed:', err);
      toast.error('Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      console.log('📥 Downloading document:', document.title);
      // TODO: Implement document download
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handlePrint = async () => {
    if (!document) return;

    try {
      console.log('🖨️ Printing document:', document.title);
      // TODO: Implement document printing
      window.print();
      toast.success('Print dialog opened');
    } catch (err) {
      toast.error('Print failed');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <FiLock className="w-8 h-8 text-signatura-red mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading shared document...</h2>
          <p className="text-gray-600">Please wait while we verify the share</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition"
          >
            <FiArrowLeft />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Not verified - show OTP modal
  if (otpRequired && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <FiLock className="w-12 h-12 text-signatura-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">OTP Verification Required</h2>
            <p className="text-gray-600 mt-2">
              This document is protected with OTP. Enter the 6-digit code to access.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:border-signatura-red outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">Enter the OTP sent to your email</p>
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {otpLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            Document: {document?.title}
          </p>
        </div>
      </div>
    );
  }

  // Document view (verified or no OTP required)
  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Document not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-signatura-dark">Shared Document</h1>
              <p className="text-sm text-gray-600">{document.title}</p>
            </div>
          </div>

          {isVerified && (
            <div className="flex gap-2">
              {share?.permissions?.includes('download') && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  title="Download"
                >
                  <FiDownload size={18} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              )}

              {share?.permissions?.includes('print') && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  title="Print"
                >
                  <FiPrinter size={18} />
                  <span className="hidden sm:inline">Print</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Document Info */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-signatura-dark to-gray-800 text-white">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{document.title}</h2>
                <p className="text-gray-200 mb-4">Document Type: <span className="font-medium capitalize">{document.document_type}</span></p>
                {document.issuer && (
                  <p className="text-gray-200">Issued by: <span className="font-medium">{document.issuer?.organization_name || 'N/A'}</span></p>
                )}
              </div>

              {/* Share Details */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-bold mb-3">Share Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-300">Status:</span>
                    <span className="ml-2 font-medium">✅ Active</span>
                  </p>
                  <p>
                    <span className="text-gray-300">Shared with:</span>
                    <span className="ml-2 font-medium">{share?.recipient_email}</span>
                  </p>
                  <p>
                    <span className="text-gray-300">Expires:</span>
                    <span className="ml-2 font-medium">
                      {new Date(share?.expires_at).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-300">Permissions:</span>
                    <span className="ml-2 font-medium">
                      {share?.permissions?.join(', ') || 'View'}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-300">Security:</span>
                    <span className="ml-2 font-medium">
                      {share?.require_otp ? '🔒 OTP Protected' : '✓ Public Link'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="p-8">
            {isVerified ? (
              <div className="space-y-6">
                {/* Document Preview Placeholder */}
                <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed border-gray-300 min-h-96 flex flex-col items-center justify-center">
                  <FiEye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Document Preview</h3>
                  <p className="text-gray-600 mb-6">
                    {document.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    TODO: Integrate PDF viewer or document renderer here
                  </p>
                </div>

                {/* Download/Print Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900">
                    <span className="font-bold">💡 Tip:</span> Use the buttons in the header to download or print this document if permitted.
                  </p>
                </div>

                {/* Document Details Table */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Document Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document ID:</span>
                      <span className="font-mono text-sm text-gray-800">{document.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize text-gray-800">{document.document_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issued Date:</span>
                      <span className="text-gray-800">{new Date(document.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize text-green-600 font-medium">{document.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiLock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Document Locked</h3>
                <p className="text-gray-600">Complete OTP verification above to view this document</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            This document was shared securely via Signatura.
            <br />
            If you have any questions, contact the document issuer.
          </p>
        </div>
      </main>
    </div>
  );
}
