// src/pages/IssuerDashboard.jsx
// Enhanced with Cryptographic Signature Engine + Existing Workflow

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiPlus, FiTrash2, FiKey, FiEye, FiEyeOff, FiCopy, FiDownload, FiFileText, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { generateKeyPair, signDocument, createSignedDocument } from '../services/signatureEngine';
import { issueCredential, batchIssueCredentials } from '../services/issuerService';

export default function IssuerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // State
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [issuedCredentials, setIssuedCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Issuer Keys (Cryptographic)
  const [issuerKeys, setIssuerKeys] = useState(() => {
    const stored = localStorage.getItem(`issuer_keys_${user?.id}`);
    return stored ? JSON.parse(stored) : null;
  });

  // Forms
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

  const [credentialForm, setCredentialForm] = useState({
    recipientEmail: '',
    recipientName: '',
    credentialType: 'diploma',
    credentialData: '',
    expiresAt: '',
  });

  const [batchForm, setBatchForm] = useState({
    uploadedFile: null,
    credentialType: 'diploma',
  });

  // Stats
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalRequests: 0,
    totalIssued: 0,
  });

  // Lifecycle
  useEffect(() => {
    if (role !== 'issuer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [role, navigate, user?.id]);

  // Auto-generate keys on first login
  useEffect(() => {
    if (!issuerKeys && user?.id) {
      handleGenerateKeys();
    }
  }, [user?.id, issuerKeys]);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchRequests();
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

      if (!res.ok) {
        setIncomingRequests([]);
        return;
      }

      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setIncomingRequests(data.data);
        updateStats(data.data);
      } else {
        setIncomingRequests([]);
      }
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setIncomingRequests([]);
    }
  };

  const updateStats = (requests = incomingRequests) => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;

    setStats({
      pendingRequests: pending,
      approvedRequests: approved,
      totalRequests: requests.length,
      totalIssued: issuedCredentials.length,
    });
  };

  // ===== CRYPTOGRAPHIC KEY MANAGEMENT =====

  const handleGenerateKeys = () => {
    try {
      const newKeys = generateKeyPair();
      setIssuerKeys(newKeys);
      localStorage.setItem(`issuer_keys_${user?.id}`, JSON.stringify(newKeys));
      toast.success('🔐 Cryptographic keys generated!');
    } catch (err) {
      console.error('Key generation error:', err);
      toast.error('Failed to generate keys');
    }
  };

  const handleDownloadPublicKey = () => {
    if (!issuerKeys) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(issuerKeys.publicKey));
    element.setAttribute('download', `issuer-public-key-${user?.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Public key downloaded');
  };

  const handleCopyPublicKey = () => {
    if (!issuerKeys) return;
    navigator.clipboard.writeText(issuerKeys.publicKey);
    toast.success('Public key copied');
  };

  const handleCopySecretKey = () => {
    if (!issuerKeys) return;
    navigator.clipboard.writeText(issuerKeys.secretKey);
    toast.success('Secret key copied (keep safe!)');
  };

  // ===== DOCUMENT MANAGEMENT (Existing) =====

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

      if (data.success) {
        toast.success('✅ Document created!');
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
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error deleting document');
    }
  };

  // ===== CREDENTIAL ISSUANCE (New) =====

  const handleIssueCredential = async (e) => {
    e.preventDefault();

    if (!credentialForm.recipientEmail || !credentialForm.recipientName) {
      toast.error('Please fill required fields');
      return;
    }

    if (!issuerKeys) {
      toast.error('Issuer keys not generated');
      return;
    }

    setSubmitting(true);

    try {
      const result = await issueCredential(
        {
          recipientEmail: credentialForm.recipientEmail,
          recipientName: credentialForm.recipientName,
          credentialType: credentialForm.credentialType,
          data: JSON.parse(credentialForm.credentialData || '{}'),
          expiresAt: credentialForm.expiresAt || null,
        },
        issuerKeys.secretKey,
        issuerKeys.publicKey
      );

      if (result.success) {
        toast.success('✓ Credential issued and signed!');
        setIssuedCredentials(prev => [result.credential, ...prev]);
        setShowCredentialModal(false);
        setCredentialForm({
          recipientEmail: '',
          recipientName: '',
          credentialType: 'diploma',
          credentialData: '',
          expiresAt: '',
        });
        updateStats();
      } else {
        toast.error(result.error || 'Failed to issue credential');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error issuing credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchIssuance = async (e) => {
    e.preventDefault();

    if (!batchForm.uploadedFile) {
      toast.error('Please upload a CSV file');
      return;
    }

    if (!issuerKeys) {
      toast.error('Issuer keys not generated');
      return;
    }

    setSubmitting(true);

    try {
      const text = await batchForm.uploadedFile.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');

      const credentials = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header.trim()] = values[idx]?.trim();
        });
        return {
          recipientEmail: obj.email,
          recipientName: obj.name,
          credentialType: batchForm.credentialType,
          data: obj,
        };
      });

      const result = await batchIssueCredentials(
        credentials,
        issuerKeys.secretKey,
        issuerKeys.publicKey
      );

      if (result.success) {
        toast.success(`✓ Issued ${result.summary.successful} credentials!`);
        setIssuedCredentials(prev => [...result.issued, ...prev]);
        setShowBatchModal(false);
        setBatchForm({ uploadedFile: null, credentialType: 'diploma' });
        updateStats();
      } else {
        toast.error(`${result.summary.failed} failed`);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error processing batch');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== REQUEST APPROVAL (Existing) =====

  const handleOpenApprovalModal = (request) => {
    let docType = request.items?.[0]?.document?.document_type || '';
    if (!docType && request.message) {
      const match = request.message.match(/Requesting (.+?) documents/);
      if (match) {
        docType = match[1].split(',')[0].trim();
      }
    }

    setSelectedRequest(request);
    setApprovalForm({
      dateRequested: new Date().toLocaleDateString(),
      signatureId: '',
      fullName: request.owner_name || request.owner_email || 'Unknown',
      documentType: docType,
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
        toast.error(`File too large! Max 10MB`);
        return;
      }

      const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error('Only PDF and image files allowed');
        return;
      }

      setApprovalForm((prev) => ({ ...prev, uploadedFile: file }));
    } else {
      setApprovalForm((prev) => ({ ...prev, [name]: value }));
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
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(approvalForm.uploadedFile);
      });

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

      if (!updateRes.ok) {
        throw new Error(`API Error ${updateRes.status}`);
      }

      const updateData = await updateRes.json();

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
      console.error('Error:', err);
      toast.error(err.message || 'Error approving request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Reject this request?')) return;

    try {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-signatura-dark">Issuer Dashboard</h1>
            <p className="text-gray-600 text-sm">{user?.organization_name || user?.email}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowKeysModal(true)}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
              title="Cryptographic key management"
            >
              <FiKey className="mr-2" size={16} />
              Keys
            </button>
            <button
              onClick={() => setShowCredentialModal(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              title="Issue signed credentials"
            >
              <FiCheck className="mr-2" size={16} />
              Issue
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              title="Batch issue from CSV"
            >
              <FiFileText className="mr-2" size={16} />
              Batch
            </button>
            <button
              onClick={() => setShowDocumentModal(true)}
              className="flex items-center bg-signatura-red text-white px-4 py-2 rounded-lg hover:bg-signatura-accent transition text-sm"
            >
              <FiPlus className="mr-2" />
              New Doc
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingRequests}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedRequests}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-600 text-sm font-medium">Credentials Issued</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalIssued}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <h3 className="text-gray-600 text-sm font-medium">Total Requests</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalRequests}</p>
          </div>
        </div>

        {/* Issued Credentials */}
        {issuedCredentials.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-signatura-dark">🎓 Issued Credentials</h2>
              <p className="text-sm text-gray-500 mt-1">Cryptographically signed digital credentials</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Recipient</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Issued</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {issuedCredentials.slice(0, 5).map((cred) => (
                    <tr key={cred.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{cred.recipientName}</p>
                        <p className="text-xs text-gray-500">{cred.recipientEmail}</p>
                      </td>
                      <td className="px-6 py-4 capitalize">{cred.credentialType}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(cred.signedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <FiCheck size={16} /> Valid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
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

      {/* ===== MODALS ===== */}

      {/* Keys Modal */}
      {showKeysModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">🔐 Cryptographic Keys</h2>
              <p className="text-sm text-gray-600 mt-2">Manage your Ed25519 signing keys for credential authentication</p>
            </div>

            <div className="p-6 space-y-6">
              {!issuerKeys ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-yellow-800 font-medium">No keys generated yet</p>
                  <p className="text-yellow-700 text-sm mt-1">Generate keys to start issuing credentials</p>
                </div>
              ) : (
                <>
                  {/* Public Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Public Key (Share with verifiers) 📤
                    </label>
                    <div className="relative bg-gray-50 border border-gray-300 rounded p-3">
                      <code className="text-xs break-all block pr-10">
                        {showPublicKey ? issuerKeys.publicKey : issuerKeys.publicKey.substring(0, 50) + '...'}
                      </code>
                      <button
                        onClick={() => setShowPublicKey(!showPublicKey)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPublicKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCopyPublicKey}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FiCopy size={14} /> Copy
                      </button>
                      <button
                        onClick={handleDownloadPublicKey}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FiDownload size={14} /> Download
                      </button>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key (Keep this secure!) 🔒
                    </label>
                    <div className="relative bg-gray-50 border border-gray-300 rounded p-3">
                      <code className="text-xs break-all block pr-10">
                        {showSecretKey ? issuerKeys.secretKey : issuerKeys.secretKey.substring(0, 50) + '...'}
                      </code>
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showSecretKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mt-2">⚠️ Never share your secret key. It's used to sign all your credentials.</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-6 border-t">
                <button
                  onClick={() => setShowKeysModal(false)}
                  className="flex-1 px-4 py-2 bg-signatura-red text-white rounded-lg hover:bg-signatura-accent font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Credential Modal */}
      {showCredentialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">🎓 Issue Credential</h2>
              <p className="text-sm text-gray-600 mt-2">Create a signed digital credential</p>
            </div>

            <form onSubmit={handleIssueCredential} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email *</label>
                <input
                  type="email"
                  value={credentialForm.recipientEmail}
                  onChange={(e) => setCredentialForm({ ...credentialForm, recipientEmail: e.target.value })}
                  placeholder="student@university.edu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name *</label>
                <input
                  type="text"
                  value={credentialForm.recipientName}
                  onChange={(e) => setCredentialForm({ ...credentialForm, recipientName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={credentialForm.credentialType}
                  onChange={(e) => setCredentialForm({ ...credentialForm, credentialType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                >
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                  <option value="license">License</option>
                  <option value="badge">Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data (JSON)</label>
                <textarea
                  value={credentialForm.credentialData}
                  onChange={(e) => setCredentialForm({ ...credentialForm, credentialData: e.target.value })}
                  placeholder='{"program": "CS", "date": "2024-01-15"}'
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none text-sm h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires (Optional)</label>
                <input
                  type="date"
                  value={credentialForm.expiresAt}
                  onChange={(e) => setCredentialForm({ ...credentialForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCredentialModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Issuing...' : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-signatura-dark">📊 Batch Issue</h2>
              <p className="text-sm text-gray-600 mt-2">Upload CSV to issue multiple credentials</p>
            </div>

            <form onSubmit={handleBatchIssuance} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded text-xs">
                <p className="font-medium mb-2">CSV Format:</p>
                <code>name,email,data1,data2</code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={batchForm.credentialType}
                  onChange={(e) => setBatchForm({ ...batchForm, credentialType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                  <option value="license">License</option>
                  <option value="badge">Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setBatchForm({ ...batchForm, uploadedFile: e.target.files?.[0] || null })}
                  className="w-full"
                  required
                />
                {batchForm.uploadedFile && (
                  <p className="text-xs text-green-600 mt-2">✓ {batchForm.uploadedFile.name}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !batchForm.uploadedFile}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Processing...' : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal (Existing) */}
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
                  Type *
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

      {/* Approval Modal (Existing) */}
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
                    Signature ID *
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
