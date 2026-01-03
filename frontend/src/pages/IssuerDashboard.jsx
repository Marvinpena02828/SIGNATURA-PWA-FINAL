import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createClient } from '@supabase/supabase-js';
import { FiLogOut, FiCheck, FiX, FiDownload, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // States
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalForm, setApprovalForm] = useState({
    dateRequested: new Date().toLocaleDateString(),
    signatureId: '',
    fullName: '',
    documentType: '',
    documentId: '',
    processedBy: user?.full_name || '',
    approvedBy: user?.full_name || '',
    uploadedFile: null,
  });
  const [submitting, setSubmitting] = useState(false);

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
      setError(null);
      console.log('📊 Fetching issuer data for:', user?.email);
      console.log('🆔 Issuer ID:', user?.id);

      if (!user || !user.id) {
        console.warn('⚠️ User ID not available');
        setLoading(false);
        return;
      }

      // ✅ Fetch incoming requests (document requests FOR this issuer)
      try {
        console.log('📋 Fetching requests for issuer:', user.id);
        const reqRes = await fetch(`/api/documents?endpoint=document-requests&issuerId=${user.id}`);
        
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          console.log('✅ Requests fetched:', reqData.data);
          if (reqData.success) {
            setIncomingRequests(reqData.data || []);
          }
        } else {
          console.error(`❌ Request fetch failed: ${reqRes.status}`);
          setIncomingRequests([]);
        }
      } catch (err) {
        console.error('⚠️ Error fetching requests:', err);
        setIncomingRequests([]);
      }

      // ✅ Fetch documents created by this issuer
      try {
        console.log('📄 Fetching documents for issuer:', user.id);
        const docsRes = await fetch(`/api/documents?issuerId=${user.id}`);
        
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          console.log('✅ Documents fetched:', docsData.data);
          if (docsData.success) {
            setDocuments(docsData.data || []);
          }
        } else {
          console.error(`❌ Documents fetch failed: ${docsRes.status}`);
          setDocuments([]);
        }
      } catch (err) {
        console.error('⚠️ Error fetching documents:', err);
        setDocuments([]);
      }
    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprovalModal = (request) => {
    setSelectedRequest(request);
    setApprovalForm({
      dateRequested: new Date().toLocaleDateString(),
      signatureId: '',
      fullName: request.owner_name || '',
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
      setApprovalForm(prev => ({
        ...prev,
        uploadedFile: files[0],
      }));
    } else {
      setApprovalForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();

    if (!approvalForm.signatureId || !approvalForm.documentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!approvalForm.uploadedFile) {
      toast.error('Please upload a document');
      return;
    }

    setSubmitting(true);

    try {
      console.log('📤 Approving request:', selectedRequest.id);
      console.log('📄 Uploading file:', approvalForm.uploadedFile.name);

      // Step 1: Upload file to Supabase Storage
      const fileName = `${selectedRequest.id}-${approvalForm.uploadedFile.name}`;
      const filePath = `documents/${user?.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issued-documents')
        .upload(filePath, approvalForm.uploadedFile, {
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Upload Error:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('issued-documents')
        .getPublicUrl(filePath);

      console.log('✅ Public URL:', publicUrl);

      // Step 2: Update request status to approved with file URL
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
          fileUrl: publicUrl,
          fileName: approvalForm.uploadedFile.name,
          fileSize: approvalForm.uploadedFile.size,
        }),
      });

      const updateData = await updateRes.json();
      console.log('✅ Approval response:', updateData);

      if (updateData.success) {
        toast.success('✅ Request approved!');
        toast.success('📄 Document issued successfully!');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        
        // Refresh data
        await fetchData();
      } else {
        throw new Error(updateData.error || 'Failed to approve');
      }
    } catch (err) {
      console.error('❌ Error approving request:', err);
      toast.error(err.message || 'Error approving request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

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
      console.log('✅ Rejection response:', data);

      if (data.success) {
        toast.success('Request rejected');
        setIncomingRequests(incomingRequests.map(r => 
          r.id === requestId ? {...r, status: 'rejected'} : r
        ));
      } else {
        throw new Error(data.error || 'Failed to reject');
      }
    } catch (err) {
      console.error('❌ Error rejecting request:', err);
      toast.error(err.message || 'Error rejecting request');
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
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = incomingRequests.filter(r => r.status === 'pending');
  const approvedRequests = incomingRequests.filter(r => r.status === 'approved');
  const rejectedRequests = incomingRequests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Issuer Dashboard</h1>
            <p className="text-gray-600 text-sm">{user?.organization_name || user?.email}</p>
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

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{approvedRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-600 text-sm font-medium">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{rejectedRequests.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Documents Created</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{documents.length}</p>
          </div>
        </div>

        {/* INCOMING REQUESTS */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-signatura-dark">📥 Document Requests from Owners</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve document requests</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No requests yet
                    </td>
                  </tr>
                ) : (
                  incomingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {request.owner_name || request.owner_email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {request.owner_email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {request.items && request.items.length > 0 
                          ? request.items.map(item => item.document?.document_type).join(', ') 
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          request.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
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

        {/* DOCUMENTS CREATED */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* APPROVAL MODAL */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-signatura-dark">
                📋 Approve Document Request
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                From: {selectedRequest.owner_name}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleApproveRequest} className="p-6 space-y-6">
              {/* Top row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Requested
                  </label>
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

              {/* Owner info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={approvalForm.fullName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              {/* Document info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <input
                    type="text"
                    name="documentType"
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

              {/* Processing info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processed By
                  </label>
                  <input
                    type="text"
                    name="processedBy"
                    value={approvalForm.processedBy}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved By
                  </label>
                  <input
                    type="text"
                    name="approvedBy"
                    value={approvalForm.approvedBy}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Digital Document Upload */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📄 Upload Digital Document *
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Upload the digital document (PDF). Owner can view and print, but cannot download to system.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-signatura-red transition">
                  <input
                    type="file"
                    name="uploadedFile"
                    onChange={handleApprovalFormChange}
                    accept=".pdf"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF files only (max 50MB)</p>
                    </div>
                  </label>
                  {approvalForm.uploadedFile && (
                    <div className="mt-4 text-left bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-700 font-medium">✓ File selected:</p>
                      <p className="text-sm text-green-600">{approvalForm.uploadedFile.name}</p>
                      <p className="text-xs text-green-500">
                        {(approvalForm.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
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
                  title={!approvalForm.uploadedFile ? 'Please upload a document first' : ''}
                >
                  {submitting ? '⏳ Issuing Document...' : '✓ Approve & Issue Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
