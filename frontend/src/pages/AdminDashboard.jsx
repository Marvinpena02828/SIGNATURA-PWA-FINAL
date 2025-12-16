import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiTrendingUp, FiLogOut, FiMenu, FiX, FiTrash2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }));

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalRequests: 0,
    activeVerifications: 0
  });
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'statistics') {
        // Get statistics
        const [usersResult, docsResult, requestsResult, verifResult] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalDocuments: docsResult.count || 0,
          totalRequests: requestsResult.count || 0,
          activeVerifications: verifResult.count || 0
        });

        // Get recent audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        setAuditLogs(logs || []);
      } else if (activeTab === 'users') {
        const { data } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        setUsers(data || []);
      } else if (activeTab === 'documents') {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });
        
        setDocuments(data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and all their documents.')) return;

    try {
      setIsLoading(true);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'user_deleted',
        resource_type: 'user',
        resource_id: userId
      });

      toast.success('User deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDocument = async (docId) => {
    if (!window.confirm('Revoke this document?')) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('revocations')
        .insert({
          document_id: docId,
          revoked_by_id: user.id,
          reason: 'Admin revocation'
        });

      if (error) throw error;

      await supabase
        .from('documents')
        .update({ status: 'revoked' })
        .eq('id', docId);

      toast.success('Document revoked');
      loadData();
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-purple-900 text-white transition-all duration-300 fixed h-screen left-0 top-0 z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-purple-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-purple-800 rounded">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'statistics' ? 'bg-purple-700' : 'hover:bg-purple-800'
            }`}
          >
            <FiTrendingUp />
            {sidebarOpen && <span>Statistics</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'users' ? 'bg-purple-700' : 'hover:bg-purple-800'
            }`}
          >
            <FiUsers />
            {sidebarOpen && <span>Users</span>}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'documents' ? 'bg-purple-700' : 'hover:bg-purple-800'
            }`}
          >
            <FiFileText />
            {sidebarOpen && <span>Documents</span>}
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded hover:bg-purple-800 transition"
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
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'statistics' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalDocuments}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Verification Requests</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalRequests}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Pending Verifications</p>
                  <p className="text-3xl font-bold text-red-600">{stats.activeVerifications}</p>
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Resource</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{log.resource_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold">All Users ({users.length})</h3>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Organization</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.organization_name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold">All Documents ({documents.length})</h3>
              </div>
              {isLoading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Issued</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
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
                          <td className="px-6 py-4 text-sm">
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
          )}
        </div>
      </div>
    </div>
  );
}
