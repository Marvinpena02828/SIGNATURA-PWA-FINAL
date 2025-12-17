import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiClock, FiDownload, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SharedDocumentPage() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [share, setShare] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchShareData();
  }, [shareToken]);

  const fetchShareData = async () => {
    try {
      const res = await fetch(`/api/sharing?shareToken=${shareToken}`);
      const data = await res.json();

      if (data.success) {
        setShare(data.data.share);
        setDocument(data.data.document);
        
        if (data.data.share.require_otp) {
          setOtpRequired(true);
        }
      } else {
        toast.error('Share not found or expired');
        navigate('/');
      }
    } catch (err) {
      toast.error('Error loading shared document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: email.trim(),
          documentId: document.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('OTP sent to your email!');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Error sending OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: email.trim(),
          documentId: document.id,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAccessToken(data.accessToken);
        toast.success('Verified! You can now access the document.');
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Error verifying OTP');
    }
  };

  const handleDownload = () => {
    // Implement download logic
    const documentData = JSON.stringify(document);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(documentData));
    element.setAttribute('download', `${document.title}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Document downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (!share || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-signatura-dark mb-4">Document Not Found</h2>
          <p className="text-gray-600 mb-6">This share link has expired or is no longer valid.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(share.expires_at) < new Date();
  const getRemainingTime = () => {
    const remaining = new Date(share.expires_at) - new Date();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <FiClock className="text-6xl text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-signatura-dark mb-4">Share Link Expired</h2>
          <p className="text-gray-600 mb-6">This document share has expired and is no longer accessible.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-opacity-80 transition"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Shared Document</h1>
          <div></div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Document Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-signatura-dark">{document.title}</h2>
              <p className="text-gray-600 mt-2 capitalize">{document.document_type}</p>
            </div>
            {share.require_otp && (
              <span className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
                <FiLock size={18} className="mr-2" />
                OTP Protected
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-600 text-sm font-medium">Status</p>
              <p className="text-lg font-semibold text-signatura-dark capitalize">{document.status}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Issued Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Link Expires In</p>
              <p className="text-lg font-semibold text-signatura-red">{getRemainingTime()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Permissions</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {share.permissions?.join(', ') || 'View'}
              </p>
            </div>
          </div>

          {/* OTP Section */}
          {share.require_otp && !accessToken && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-signatura-dark mb-4">Verify Access</h3>
              <p className="text-gray-600 mb-4">
                This document requires OTP verification. Enter your email to receive a verification code.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                />
                <button
                  onClick={handleRequestOTP}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Send OTP Code
                </button>
              </div>

              {otp === '' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">Check your email for the OTP code (6 digits)</p>
                </div>
              )}

              {otp !== '' && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none text-center text-2xl tracking-widest"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Access Granted */}
          {(!share.require_otp || accessToken) && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-4">✓ Access Granted</h3>
              <p className="text-green-800 mb-6">You can now view and download this document.</p>

              {share.permissions?.includes('download') && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
                >
                  <FiDownload className="mr-2" />
                  Download Document
                </button>
              )}

              {!share.permissions?.includes('download') && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm">
                  Download is not permitted for this share.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h3 className="text-xl font-bold text-signatura-dark mb-4">Document Details</h3>
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div>
              <p className="text-gray-600 text-sm font-medium">Document Hash</p>
              <p className="text-gray-900 font-mono text-sm break-all mt-1">{document.document_hash}</p>
            </div>
            {document.signature && (
              <div>
                <p className="text-gray-600 text-sm font-medium">Digital Signature</p>
                <p className="text-gray-900 font-mono text-sm break-all mt-1">{document.signature.substring(0, 50)}...</p>
              </div>
            )}
            <div>
              <p className="text-gray-600 text-sm font-medium">Document ID</p>
              <p className="text-gray-900 font-mono text-sm">{document.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
