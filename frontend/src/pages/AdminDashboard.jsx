import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiX, FiLogOut, FiPlus, FiUpload, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminPortal() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // State
  const [issuers, setIssuers] = useState([]);
  const [stats, setStats] = useState({
    totalIssuers: 0,
    totalSubscribers: 0,
    totalDocuments: 0,
    totalIssued: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showAddIssuer, setShowAddIssuer] = useState(false);
  const [showUpdateIssuer, setShowUpdateIssuer] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showViewList, setShowViewList] = useState(false);
  const [viewListType, setViewListType] = useState(null);

  // Selected Issuer
  const [selectedIssuer, setSelectedIssuer] = useState(null);

  // Form Data
  const [addIssuerForm, setAddIssuerForm] = useState({
    businessType: 'corporation',
    registeredName: '',
    tinNumber: '',
    registeredAddress: '',
    personFirstName: '',
    personLastName: '',
    personEmail: '',
    personPhone: '',
  });

  const [updateForm, setUpdateForm] = useState({
    registeredName: '',
    registeredAddress: '',
    tinNumber: '',
  });

  const [documentForm, setDocumentForm] = useState({
    documentName: '',
    documentType: 'certificate',
  });

  const [generatedSignaturaId, setGeneratedSignaturaId] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch Data
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get stats
      const statsRes = await fetch('/api/admin?action=stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data || {});
      }

      // Get issuers list
      const issuersRes = await fetch('/api/users?role=issuer');
      const issuersData = await issuersRes.json();

      if (issuersData.success) {
        setIssuers(issuersData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ===== ADD ISSUER =====
  const handleOpenAddIssuer = () => {
    setGeneratedSignaturaId(`SIG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`);
    setAddIssuerForm({
      businessType: 'corporation',
      registeredName: '',
      tinNumber: '',
      registeredAddress: '',
      personFirstName: '',
      personLastName: '',
      personEmail: '',
      personPhone: '',
    });
    setLogoPreview(null);
    setShowAddIssuer(true);
  };

  const handleCreateIssuer = async (e) => {
    e.preventDefault();

    if (!addIssuerForm.registeredName.trim()) {
      toast.error('Registered name required');
      return;
    }

    if (!addIssuerForm.tinNumber.trim()) {
      toast.error('TIN number required');
      return;
    }

    if (!addIssuerForm.personEmail.trim()) {
      toast.error('Email required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        endpoint: 'create-issuer',
        businessType: addIssuerForm.businessType,
        organizationName: addIssuerForm.registeredName,
        tinNumber: addIssuerForm.tinNumber,
        address: addIssuerForm.registeredAddress,
        personFirstName: addIssuerForm.personFirstName,
        personLastName: addIssuerForm.personLastName,
        personEmail: addIssuerForm.personEmail,
        personPhone: addIssuerForm.personPhone,
        signaturaid: generatedSignaturaId,
      };

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Issuer account created!');
        setShowAddIssuer(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error creating account');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== UPDATE ISSUER =====
  const handleOpenUpdateIssuer = (issuer) => {
    setSelectedIssuer(issuer);
    setUpdateForm({
      registeredName: issuer.organization_name || '',
      registeredAddress: issuer.address || '',
      tinNumber: issuer.tin_number || '',
    });
    setShowUpdateIssuer(true);
  };

  const handleUpdateIssuer = async (e) => {
    e.preventDefault();

    if (!updateForm.registeredName.trim()) {
      toast.error('Name required');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIssuer.id,
          organization_name: updateForm.registeredName,
          address: updateForm.registeredAddress,
          tin_number: updateForm.tinNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Issuer updated!');
        setShowUpdateIssuer(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error updating issuer');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== ADD DOCUMENT =====
  const handleOpenAddDocument = (issuer) => {
    setSelectedIssuer(issuer);
    setDocumentForm({
      documentName: '',
      documentType: 'certificate',
    });
    setShowAddDocument(true);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (!documentForm.documentName.trim()) {
      toast.error('Document name required');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-document',
          title: documentForm.documentName,
          document_type: documentForm.documentType,
          issuer_id: selectedIssuer.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Document created!');
        setShowAddDocument(false);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to create document');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error creating document');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== VIEW LIST =====
  const handleViewList = (type) => {
    setViewListType(type);
    setShowViewList(true);
  };

  const handleDeleteIssuer = async (issuerId) => {
    if (!window.confirm('Delete this issuer account?')) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-user',
          userId: issuerId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Issuer deleted');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error deleting issuer');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">🔐 ADMIN PORTAL</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl border-4 border-orange-400 p-8 shadow-md">
            <h3 className="text-gray-700 font-bold text-sm uppercase">Document Issuers</h3>
            <p className="text-5xl font-bold text-orange-600 mt-3">{stats.totalIssuers}</p>
            <button
              onClick={() => handleViewList('issuers')}
              className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              VIEW
            </button>
          </div>

          <div className="bg-white rounded-xl border-4 border-green-400 p-8 shadow-md">
            <h3 className="text-gray-700 font-bold text-sm uppercase">Subscribers</h3>
            <p className="text-5xl font-bold text-green-600 mt-3">{stats.totalSubscribers}</p>
            <button
              onClick={() => handleViewList('subscribers')}
              className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              VIEW
            </button>
          </div>

          <div className="bg-white rounded-xl border-4 border-purple-400 p-8 shadow-md">
            <h3 className="text-gray-700 font-bold text-sm uppercase">Documents</h3>
            <p className="text-5xl font-bold text-purple-600 mt-3">{stats.totalDocuments}</p>
            <button
              onClick={() => handleViewList('documents')}
              className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              VIEW
            </button>
          </div>

          <div className="bg-white rounded-xl border-4 border-blue-400 p-8 shadow-md">
            <h3 className="text-gray-700 font-bold text-sm uppercase">Issued Documents</h3>
            <p className="text-5xl font-bold text-blue-600 mt-3">{stats.totalIssued}</p>
            <button
              onClick={() => handleViewList('issued')}
              className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              VIEW
            </button>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAddIssuer}
          className="mb-8 px-8 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 flex items-center gap-2 text-lg shadow-md"
        >
          <FiPlus /> ADD DOCUMENT ISSUER
        </button>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b-4 border-blue-900 bg-blue-900 text-white">
            <h2 className="text-2xl font-bold">LIST OF DOCUMENT ISSUERS</h2>
          </div>

          {issuers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No issuers. Click "ADD DOCUMENT ISSUER" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold">SIGNATURA ID</th>
                    <th className="px-8 py-4 text-left text-sm font-bold">REGISTERED NAME</th>
                    <th className="px-8 py-4 text-left text-sm font-bold">ADDRESS</th>
                    <th className="px-8 py-4 text-left text-sm font-bold">DIGITAL DOCUMENTS</th>
                    <th className="px-8 py-4 text-left text-sm font-bold">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {issuers.map((issuer) => (
                    <tr key={issuer.id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 text-sm font-mono font-bold">{issuer.signatura_id || 'N/A'}</td>
                      <td className="px-8 py-5 text-sm font-semibold">{issuer.organization_name}</td>
                      <td className="px-8 py-5 text-sm">{issuer.address || 'N/A'}</td>
                      <td className="px-8 py-5 text-sm">{issuer.document_count || 0}</td>
                      <td className="px-8 py-5 text-sm flex gap-2">
                        <button
                          onClick={() => handleOpenUpdateIssuer(issuer)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center gap-1"
                        >
                          <FiEdit2 size={14} /> UPDATE
                        </button>
                        <button
                          onClick={() => handleOpenAddDocument(issuer)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"
                        >
                          + ADD DOCUMENT
                        </button>
                        <button
                          onClick={() => handleDeleteIssuer(issuer.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ===== MODALS ===== */}

      {/* Add Issuer Modal */}
      {showAddIssuer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-purple-600 text-white px-8 py-6 flex justify-between items-center border-b-4 border-purple-800">
              <h2 className="text-2xl font-bold">ADD DOCUMENT ISSUER</h2>
              <button onClick={() => setShowAddIssuer(false)} className="p-2 hover:bg-purple-700 rounded">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateIssuer} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Type *</label>
                <select
                  value={addIssuerForm.businessType}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, businessType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                >
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registered Name *</label>
                <input
                  type="text"
                  value={addIssuerForm.registeredName}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, registeredName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">TIN Number *</label>
                <input
                  type="text"
                  value={addIssuerForm.tinNumber}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, tinNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={addIssuerForm.registeredAddress}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, registeredAddress: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={addIssuerForm.personFirstName}
                    onChange={(e) => setAddIssuerForm({ ...addIssuerForm, personFirstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={addIssuerForm.personLastName}
                    onChange={(e) => setAddIssuerForm({ ...addIssuerForm, personLastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={addIssuerForm.personEmail}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, personEmail: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={addIssuerForm.personPhone}
                  onChange={(e) => setAddIssuerForm({ ...addIssuerForm, personPhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="bg-gray-100 p-4 rounded">
                <label className="block text-xs font-bold text-gray-700 mb-2">SIGNATURA ID (Auto-generated)</label>
                <input
                  type="text"
                  value={generatedSignaturaId}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded bg-gray-200 cursor-not-allowed font-mono"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Issuer Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIssuer(false)}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-bold text-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Issuer Modal */}
      {showUpdateIssuer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="bg-blue-600 text-white px-8 py-6 flex justify-between items-center border-b-4 border-blue-800">
              <h2 className="text-2xl font-bold">UPDATE ISSUER</h2>
              <button onClick={() => setShowUpdateIssuer(false)} className="p-2 hover:bg-blue-700 rounded">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateIssuer} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registered Name</label>
                <input
                  type="text"
                  value={updateForm.registeredName}
                  onChange={(e) => setUpdateForm({ ...updateForm, registeredName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">TIN Number</label>
                <input
                  type="text"
                  value={updateForm.tinNumber}
                  onChange={(e) => setUpdateForm({ ...updateForm, tinNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={updateForm.registeredAddress}
                  onChange={(e) => setUpdateForm({ ...updateForm, registeredAddress: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateIssuer(false)}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="bg-green-600 text-white px-8 py-6 flex justify-between items-center border-b-4 border-green-800">
              <h2 className="text-2xl font-bold">ADD DOCUMENT</h2>
              <button onClick={() => setShowAddDocument(false)} className="p-2 hover:bg-green-700 rounded">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Document Name *</label>
                <input
                  type="text"
                  value={documentForm.documentName}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-green-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                <select
                  value={documentForm.documentType}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-green-600 focus:outline-none"
                >
                  <option value="certificate">Certificate</option>
                  <option value="diploma">Diploma</option>
                  <option value="license">License</option>
                  <option value="credential">Credential</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Document'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDocument(false)}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View List Modal */}
      {showViewList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-indigo-600 text-white px-8 py-6 flex justify-between items-center border-b-4 border-indigo-800">
              <h2 className="text-2xl font-bold capitalize">{viewListType} List</h2>
              <button onClick={() => setShowViewList(false)} className="p-2 hover:bg-indigo-700 rounded">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="text-center text-gray-600">
                <p className="text-lg">Showing {viewListType} data</p>
                <p className="text-sm text-gray-500 mt-2">This view can be customized to show filtered lists</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
