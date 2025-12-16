import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiPlus, FiEye, FiShare2, FiQrCode, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('degree');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (role !== 'issuer') {
      navigate('/');
      return;
    }
    fetchDocuments();
  }, [role, navigate]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/documents?issuerId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
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

  const generateShareLink = async (doc) => {
    try {
      setSelectedDoc(doc);
      const res = await fetch('/api/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          ownerId: user?.id,
          recipientEmail: 'verifier@example.com',
          permissions: ['view'],
          expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
          requireOTP: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShareLink(data.data.shareLink);
        toast.success('Share link created!');
      }
    } catch (err) {
      toast.error('Failed to generate share link');
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        <FiQrCode size={18} />
                      </button>
                      <button
                        onClick={() => generateShareLink(doc)}
                        className="text-signatura-red hover:bg-red-50 p-2 rounded transition"
                        title="Generate Share Link"
                      >
                        <FiShare2 size={18} />
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

        {/* Share Link Modal */}
        {shareLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-bold text-signatura-dark mb-4">Share Link</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1">{shareLink}</p>
                <button
                  onClick={() => copyToClipboard(shareLink, 'share')}
                  className="ml-2 text-signatura-red hover:text-signatura-accent"
                >
                  {copiedId === 'share' ? <FiCheck size={18} /> : <FiCopy size={18} />}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Link expires in 7 days. Recipients need OTP to verify.
              </p>
              <button
                onClick={() => setShareLink(null)}
                className="w-full bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
