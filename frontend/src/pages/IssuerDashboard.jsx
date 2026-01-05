import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [approvalForm, setApprovalForm] = useState({
    dateRequested: '',
    signatureId: '',
    fullName: '',
    documentType: '',
    documentId: '',
    processedBy: '',
    approvedBy: '',
    uploadedFile: null,
  });

  const [docForm, setDocForm] = useState({
    title: '',
    document_type: 'diploma',
  });

  useEffect(() => {
    if (role !== 'issuer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate, user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchRequests();
      // Skip document fetch for now - will fetch on demand
      setDocuments([]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      console.log('📋 Fetching requests for issuer:', user?.id);
      const res = await fetch(
        `/api/documents?endpoint=document-requests&issuerId=${user?.id}`
      );

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', res.status, errorText);
        setIncomingRequests([]);
        return;
      }

      const data = await res.json();
      console.log('✅ Requests data:', data);
      
      if (data && data.success && Array.isArray(data.data)) {
        setIncomingRequests(data.data);
      } else {
        console.warn('⚠️ Invalid response format:', data);
        setIncomingRequests([]);
      }
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setIncomingRequests([]);
    }
  };

  const fetchDocuments = async () => {
    // Skip for now - documents will be fetched after create
    setDocuments([]);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (!docForm.title.trim()) {
      toast.error('Please enter document title');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📄 Creating document:', docForm);

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'create-document',
          title: docForm.title,
          document_type: docForm.document_type,
          issuerId: user?.id,
        }),
      });

      const data = await res.json();
      console.log('Response:', data);

      if (data.success) {
        toast.success('✅ Document created!');
        // Add to local state
        setDocuments((prev) => [data.data, ...prev]);
        setShowDocumentModal(false);
        setDocForm({ title: '', document_type: 'diploma' });
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

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      console.log('🗑️ Deleting document:', docId);

      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'delete-document',
          id: docId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Document deleted!');
        // Remove from local state
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error deleting document');
    }
  };

  const handleOpenApprovalModal = (request) => {
    setSelectedRequest(request);
    setApprovalForm({
      dateRequested: new Date().toLocaleDateString(),
      signatureId: '',
      fullName: request.owner_name || request.owner_email || 'Unknown',
      documentType: request.items?.[0]?.document?.document_type || '',
      documentId: '',
      processedBy: user?.full_name || '',
      approvedBy: user?.full_name || '',
      uploadedFile: null,
    });
    setShowApprovalModal(true);
  };

  const handleApprovalFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `File too large! Max 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
        return;
      }

      const ALLOWED_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Only PDF and image files allowed');
        return;
      }

      setApprovalForm((prev) => ({
        ...prev,
        uploadedFile: file,
      }));
    } else {
      setApprovalForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();

    if (!approvalForm.signatureId || !approvalForm.documentId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!approvalForm.uploadedFile) {
      toast.error('Please upload a document');
      return;
    }

    setSubmitting(true);

    try {
      console.log('📤 Approving request:', selectedRequest.id);

      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result.split(',')[1];
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(approvalForm.uploadedFile);
      });

      console.log('✅ File converted to base64');

      const updateRes = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: 'approved',
          issuerMessage: `Approved by ${user?.full_name}`,
          signatureId: approvalForm.signatureId,
          documentId: approvalForm.documentId,
          processedBy: user?.full_name,
          approvedBy: user?.full_name,
          fileBase64: base64String,
          fileName: approvalForm.uploadedFile.name,
          fileSize: approvalForm.uploadedFile.size,
          ownerId: selectedRequest.owner_id,
          issuerId: user?.id,
        }),
      });

      console.log('📤 Request sent to API');

      if (!updateRes.ok) {
        const errorData = await updateRes.text();
        console.error('❌ API Error:', updateRes.status, errorData);
        throw new Error(`API Error ${updateRes.status}`);
      }

      const updateData = await updateRes.json();
      console.log('✅ Approval response:', updateData);

      if (updateData.success) {
        toast.success('✅ Request approved!');
        toast.success('📄 Document issued!');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalForm({
          dateRequested: '',
          signatureId: '',
          fullName: '',
          documentType: '',
          documentId: '',
          processedBy: '',
          approvedBy: '',
          uploadedFile: null,
        });
        await fetchRequests();
      } else {
        toast.error(updateData.error || 'Failed to approve');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error(err.message || 'Error approving request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Reject this request?')) return;

    try {
      console.log('🚫 Rejecting request:', requestId);

      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          status: 'rejected',
          issuerMessage: `Rejected by ${user?.full_name}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Request rejected');
        await fetchRequests();
      } else {
        toast.error(data.error || 'Failed to reject');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error rejecting request');
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-signatura-red"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = incomingRequests.filter((r) => r.status === 'pending');
  const approvedRequests = incomingRequests.filter((r) => r.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Issuer Dashboard</h1>
            <p className="text-gray-600 text-sm">{user?.organization_name || user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDocumentModal(true)}
              className="flex items-center bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition"
            >
              <FiPlus className="mr-2" />
              New Document
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{approvedRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Total Requests</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{incomingRequests.length}</p>
          </div>
        </div>

        {/* Documents Created */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📄 Documents Created</h2>
            <p className="text-sm text-gray-500 mt-1">Documents you have created in the system</p>
          </div>
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
                      No documents created yet
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{doc.title}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm capitalize">{doc.document_type}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📥 Document Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve document requests from owners</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No requests yet
                    </td>
                  </tr>
                ) : (
                  incomingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {request.owner_name || request.owner_email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{request.owner_email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleOpenApprovalModal(request)}
                              className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition font-medium text-sm"
                            >
                              Approve →
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition font-medium text-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {request.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </span>
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

      {/* Document Creation Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">📄 Create Document</h2>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g., Diploma 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={docForm.document_type}
                  onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                >
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                  <option value="license">License</option>
                  <option value="badge">Badge</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-signatura-dark">📋 Approve Document Request</h2>
              <p className="text-sm text-gray-600 mt-2">
                From: {selectedRequest.owner_name || selectedRequest.owner_email}
              </p>
            </div>

            <form onSubmit={handleApproveRequest} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Requested</label>
                  <input
                    type="text"
                    value={approvalForm.dateRequested}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signatura ID *
                  </label>
                  <input
                    type="text"
                    name="signatureId"
                    value={approvalForm.signatureId}
                    onChange={handleApprovalFormChange}
                    placeholder="S123-456-7890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                <input
                  type="text"
                  value={approvalForm.fullName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <input
                    type="text"
                    value={approvalForm.documentType}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document ID *
                  </label>
                  <input
                    type="text"
                    name="documentId"
                    value={approvalForm.documentId}
                    onChange={handleApprovalFormChange}
                    placeholder="DOC-2024-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📄 Upload Digital Document *
                </label>
                <p className="text-xs text-gray-600 mb-3">PDF or images (max 10MB)</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-signatura-red transition">
                  <input
                    type="file"
                    name="uploadedFile"
                    onChange={handleApprovalFormChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  </label>
                  {approvalForm.uploadedFile && (
                    <div className="mt-4 text-left bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-700 font-medium">✓ {approvalForm.uploadedFile.name}</p>
                      <p className="text-xs text-green-500">
                        {(approvalForm.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !approvalForm.uploadedFile}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? '⏳ Issuing...' : '✓ Approve & Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
