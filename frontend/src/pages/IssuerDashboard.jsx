import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import { FiPlus, FiDownload, FiTrash2, FiEye, FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }));
  
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  const [formData, setFormData] = useState({
    title: '',
    documentType: 'diploma',
    recipientEmail: '',
    expiryDate: '',
    metadata: {}
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('issuer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueDocument = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.recipientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      // Generate document hash
      const documentHash = require('crypto').createHash('sha256').update(formData.title).digest('hex');

      // Create document
      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          issuer_id: user.id,
          title: formData.title,
          document_type: formData.documentType,
          document_hash: documentHash,
          signed_credential: { metadata: formData.metadata },
          issuer_signature: 'signed-by-issuer',
          issuance_date: new Date(),
          expiry_date: formData.expiryDate ? new Date(formData.expiryDate) : null,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'document_issued',
        resource_type: 'document',
        resource_id: document.id,
        details: { title: formData.title, recipient: formData.recipientEmail }
      });

      toast.success('Document issued successfully!');
      setFormData({ title: '', documentType: 'diploma', recipientEmail: '', expiryDate: '', metadata: {} });
      setShowIssueForm(false);
      loadDocuments();
    } catch (error) {
      toast.error('Failed to issue document');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to revoke this document?')) return;

    try {
      setIsLoading(true);

      // Create revocation
      const { error: revokeError } = await supabase
        .from('revocations')
        .insert({
          document_id: documentId,
          revoked_by_id: user.id,
          reason: 'Revoked by issuer'
        });

      if (revokeError) throw revokeError;

      // Update document status
      await supabase
        .from('documents')
        .update({ status: 'revoked' })
        .eq('id', documentId);

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'document_revoked',
        resource_type: 'document',
        resource_id: documentId
      });

      toast.success('Document revoked successfully');
      loadDocuments();
    } catch (error) {
      toast.error('Failed to revoke document');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    revoked: documents.filter(d => d.status === 'revoked').length,
    expired: documents.filter(d => d.status === 'expired').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 fixed h-screen left-0 top-0 z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Signatura</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-800 rounded">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'documents' ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            <FiEye />
            {sidebarOpen && <span>Documents</span>}
          </button>
          <button
            onClick={() => { setShowIssueForm(true); setActiveTab('issue'); }}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'issue' ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            <FiPlus />
            {sidebarOpen && <span>Issue Document</span>}
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Issuer Portal</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={() => setShowIssueForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiPlus /> <span>Issue Document</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Total Documents</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Revoked</p>
            <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Expired</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.expired}</p>
          </div>
        </div>

        {/* Issue Form Modal */}
        {showIssueForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Issue New Document</h3>
              <form onSubmit={handleIssueDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BSc Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                    <option value="license">License</option>
                    <option value="badge">Badge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Issuing...' : 'Issue Document'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIssueForm(false)}
                    className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="p-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No documents issued yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Issued Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{doc.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doc.document_type}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.status === 'active' ? 'bg-green-100 text-green-800' :
                            doc.status === 'revoked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => window.alert(`Document ID: ${doc.id}\n\nHash: ${doc.document_hash}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye />
                          </button>
                          {doc.status === 'active' && (
                            <button
                              onClick={() => handleRevokeDocument(doc.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
