import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiLogOut, FiX, FiCheck, FiTrash2, FiHome, FiBell, FiUser, FiClock,
  FiAlertCircle, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'share_request',
      title: 'New Share Request',
      message: 'John Doe requested access to your Diploma credential',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: '📤',
      color: 'blue',
    },
    {
      id: '2',
      type: 'document_verified',
      title: 'Document Verified',
      message: 'Your Certificate has been verified successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      icon: '✓',
      color: 'green',
    },
    {
      id: '3',
      type: 'request_approved',
      title: 'Request Approved',
      message: 'Your request for Diploma from University has been approved',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      icon: '✓',
      color: 'green',
    },
    {
      id: '4',
      type: 'share_revoked',
      title: 'Share Revoked',
      message: 'Jane Smith revoked access to your License credential',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      icon: '🔒',
      color: 'red',
    },
  ]);

  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (role !== 'owner') {
      navigate('/');
      return;
    }
  }, [role, navigate]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success('All marked as read');
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    if (!window.confirm('Delete all notifications?')) return;
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filterType === 'all' ? notifications : notifications.filter((n) => !n.read);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    };
    return colors[color] || colors.blue;
  };

  const getIconColors = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner')}
              className="text-gray-600 hover:text-gray-900 transition"
              title="Back to Dashboard"
            >
              <FiHome size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-signatura-dark">🔔 Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-gray-600 text-sm">
                  You have <span className="font-bold text-signatura-red">{unreadCount}</span> unread notification
                  {unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => navigate('/owner')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition"
          >
            📋 Dashboard
          </button>
          <button
            className="px-4 py-2 text-signatura-red border-b-2 border-signatura-red font-medium"
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition"
          >
            👤 Profile
          </button>
        </div>

        {/* Filter & Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filterType === 'all'
                    ? 'bg-signatura-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filterType === 'unread'
                    ? 'bg-signatura-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                >
                  Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-gray-500 text-lg">
              {filterType === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border-2 p-4 transition ${getColorClasses(
                  notification.color
                )} ${!notification.read ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`text-3xl flex-shrink-0 ${getIconColors(notification.color)}`}>
                    {notification.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-base">{notification.title}</h3>
                      {!notification.read && (
                        <span className="inline-block w-3 h-3 bg-signatura-red rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm opacity-90 mb-2">{notification.message}</p>
                    <p className="text-xs opacity-75 flex items-center gap-1">
                      <FiClock size={12} />
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 hover:bg-black hover:bg-opacity-10 rounded transition"
                        title="Mark as read"
                      >
                        <FiCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 hover:bg-black hover:bg-opacity-10 rounded transition text-red-600"
                      title="Delete notification"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Types Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-bold text-blue-900 mb-4">📖 Notification Types</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex gap-3">
              <span className="text-xl">📤</span>
              <div>
                <strong>Share Request</strong>
                <p className="text-xs opacity-75">Someone requested access to your document</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">✓</span>
              <div>
                <strong>Document Verified</strong>
                <p className="text-xs opacity-75">Your document signature is verified</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">📥</span>
              <div>
                <strong>Request Approved</strong>
                <p className="text-xs opacity-75">Issuer approved your document request</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <strong>Share Revoked</strong>
                <p className="text-xs opacity-75">Someone revoked your access to their document</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
