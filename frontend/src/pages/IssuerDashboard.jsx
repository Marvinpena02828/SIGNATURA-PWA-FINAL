import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore((state) => ({
    user: state.user,
    role: state.role,
  }));
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    documentType: '',
  });

  useEffect(() => {
    if (role !== 'issuer') {
      navigate('/');
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?issuerId=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.documentType) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issuerId: user?.id,
          title: formData.title,
          documentType: formData.documentType,
          documentHash: `hash_${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Document created successfully!');
        setDocuments([...documents, data.data]);
        setFormData({ title: '', documentType: '' });
        setShowForm(false);
      }
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Issuer Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.email}</p>
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

      {/* Main Content */}
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

        {/* Create Document Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent transition"
          >
            <FiPlus className="mr-2" />
            Issue New Document
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-signatura-red">
            <h2 className="text-xl font-bold text-signatura-dark mb-4">Issue New Document</h2>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="degree">Degree</option>
                  <option value="certificate">Certificate</option>
                  <option value="diploma">Diploma</option>
                  <option value="license">License</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-signatura-red text-white px-6 py-2 rounded-lg hover:bg-signatura-accent transition"
                >
                  Create Document
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-signatura-dark">{doc.title}</td>
                      <td className="px-6 py-4 text-gray-600">{doc.document_type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button className="text-signatura-red hover:bg-red-50 p-2 rounded transition">
                          <FiEye size={18} />
                        </button>
                        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded transition">
                          <FiEdit2 size={18} />
                        </button>
                        <button className="text-red-600 hover:bg-red-50 p-2 rounded transition">
                          <FiTrash2 size={18} />
                        </button>
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
