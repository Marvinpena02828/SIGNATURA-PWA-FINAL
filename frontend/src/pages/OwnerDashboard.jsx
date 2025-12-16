import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import { FiShare2, FiCheckCircle, FiXCircle, FiClock, FiLogOut, FiMenu, FiX, FiDownload, FiRefreshCw } from 'react-icons/fi';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }));

  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      // Load verification requests
      const { data: requests } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setDocuments(docs || []);
      setVerificationRequests(requests || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVerification = async (requestId, docId) => {
    try {
      setIsLoading(true);

      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          token_created_at: new Date(),
          token_expires_at: tokenExpiry
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'verification_approved',
        resource_type: 'verification_request',
        resource_id: requestId,
        document_id: docId
      });

      toast.success('Verification approved!');
      loadData();
    } catch (error) {
      toast.error('Failed to approve verification');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyVerification = async (requestId, docId) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('verification_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'verification_denied',
        resource_type: 'verification_request',
        resource_id: requestId,
        document_id: docId
      });

      toast.success('Verification request denied');
      loadData();
    } catch (error) {
      toast.error('Failed to deny verification');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareLink = (docId) => {
    const link = `${window.location.origin}/verify/${docId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
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

  const stats = {
    total: documents.length,
    pending: verificationRequests.filter(r => r.status === 'pending').length,
    approved: verificationRequests.filter(r => r.status === 'approved').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-green-900 text-white transition-all duration-300 fixed h-screen left-0 top-0 z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-green-800">
          {sidebarOpen && <h1 className="text-xl font-bold">My Wallet</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-green-800 rounded">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'documents' ? 'bg-green-700' : 'hover:bg-green-800'
            }`}
          >
            <FiDownload />
            {sidebarOpen && <span>My Documents</span>}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'requests' ? 'bg-green-700' : 'hover:bg-green-800'
            }`}
          >
            <FiClock />
            {sidebarOpen && <span>Verification Requests ({stats.pending})</span>}
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded hover:bg-green-800 transition"
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
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Document Wallet</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Documents</p>
            <p className="text-3xl font-bold text-green-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-600">Loading...</div>
              ) : documents.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-600">No documents in your wallet yet</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{doc.title}</h3>
                        <p className="text-gray-600 text-sm">
                          Issued: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Hash: {doc.document_hash.substring(0, 16)}...
                        </p>
                        {doc.expiry_date && (
                          <p className="text-gray-500 text-xs">
                            Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          doc.status === 'active' ? 'bg-green-100 text-green-800' :
                          doc.status === 'revoked' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status}
                        </span>
                        <button
                          onClick={() => generateShareLink(doc.id)}
                          className="p-2 hover:bg-gray-100 rounded transition"
                          title="Share document"
                        >
                          <FiShare2 className="text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-600">Loading...</div>
              ) : verificationRequests.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-600">No verification requests</p>
                </div>
              ) : (
                verificationRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-lg p-6 shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          Verification Request from {req.verifier_email || 'Unknown'}
                        </h3>
                        <p className="text-gray-600">Purpose: {req.purpose}</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Requested: {new Date(req.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Status: <span className={`font-medium ${
                            req.status === 'pending' ? 'text-yellow-600' :
                            req.status === 'approved' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveVerification(req.id, req.document_id)}
                            disabled={isLoading}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <FiCheckCircle /> <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleDenyVerification(req.id, req.document_id)}
                            disabled={isLoading}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                          >
                            <FiXCircle /> <span>Deny</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
