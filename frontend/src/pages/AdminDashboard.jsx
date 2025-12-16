import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiTrendingUp, FiLogOut, FiMenu, FiX, FiTrash2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

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
    if (role !== 'admin') navigate('/');
    loadData();
  }, [activeTab, role, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (activeTab === 'statistics') {
        // Get stats from API
        try {
          const statsRes = await fetch('/api/admin?action=stats');
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data || {});
          }
        } catch (err) {
          console.error('Error fetching stats:', err);
        }

        // Get audit logs
        try {
          const logsRes = await fetch('/api/admin?action=audit-logs');
          const logsData = await logsRes.json();
          if (logsData.success) {
            setAuditLogs(logsData.data?.slice(0, 10) || []);
          }
        } catch (err) {
          console.error('Error fetching logs:', err);
        }
      } 
      else if (activeTab === 'users') {
        try {
          const usersRes = await fetch('/api/users');
          const usersData = await usersRes.json();
          if (usersData.success) {
            setUsers(usersData.data || []);
          }
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      } 
      else if (activeTab === 'documents') {
        try {
          const docsRes = await fetch('/api/documents');
          const docsData = await docsRes.json();
          if (docsData.success) {
            setDocuments(docsData.data || []);
          }
        } catch (err) {
          console.error('Error fetching documents:', err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user.')) return;

    try {
      setIsLoading(true);

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-user', userId }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('User deleted');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDocument = async (docId) => {
    if (!window.confirm('Revoke this document?')) return;

    try {
      setIsLoading(true);

      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId, status: 'revoked' }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Document revoked');
        setDocuments(documents.map(d => d.id === docId ? {...d, status: 'revoked'} : d));
      } else {
        toast.error(data.error || 'Failed to revoke document');
      }
    } catch (error) {
      toast.error('Error revoking document');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-signatura-red text-white transition-all duration-300 fixed h-screen left-0 top-0 z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-signatura-accent">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-signatura-accent rounded">
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'statistics' ? 'bg-signatura-accent' : 'hover:bg-signatura-accent hover:bg-opacity-50'
            }`}
          >
            <FiTrendingUp />
            {sidebarOpen && <span>Statistics</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'users' ? 'bg-signatura-accent' : 'hover:bg-signatura-accent hover:bg-opacity-50'
            }`}
          >
            <FiUsers />
            {sidebarOpen && <span>Users</span>}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition ${
              activeTab === 'documents' ? 'bg-signatura-accent' : 'hover:bg-signatura-accent hover:bg-opacity-50'
            }`}
          >
            <FiFileText />
            {sidebarOpen && <span>Documents</span>}
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded hover:bg-signatura-accent transition"
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
            <h2 className="text-2xl font-bold text-signatura-dark">Admin Dashboard</h2>
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
                  <p className="text-3xl font-bold text-signatura-red">{stats.totalUsers || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalDocuments || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Verification Requests</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalRequests || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <p className="text-gray-600 text-sm">Pending Verifications</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.activeVerifications || 0}</p>
                </div>
              </div>

              {/* Recent Audit Logs */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-signatura-dark">Recent Activity</h3>
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
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No activity yet</td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{log.resource_type}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-signatura-dark">All Users ({users.length})</h3>
              </div>
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found</div>
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
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
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
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={isLoading}
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
                <h3 className="text-lg font-bold text-signatura-dark">All Documents ({documents.length})</h3>
              </div>
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : documents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No documents found</div>
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
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{doc.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">{doc.document_type}</td>
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
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={isLoading}
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
