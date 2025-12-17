import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheckCircle, FiClock, FiAlertCircle, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RequestTrackingPage() {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/document-requests?studentEmail=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.data || []);
        if (data.data.length === 0) {
          toast.info('No requests found for this email');
        }
      } else {
        toast.error('Failed to fetch requests');
      }
    } catch (err) {
      toast.error('Error fetching requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      case 'issued':
        return <FiCheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <FiFileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Track Your Request</h1>
          <p className="text-white text-opacity-90">Check the status of your document request</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to track requests"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red focus:border-transparent outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signatura-red text-white py-3 rounded-lg font-semibold hover:bg-signatura-accent transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Request'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && requests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Requests Found</h2>
            <p className="text-gray-600">No document requests found for this email address.</p>
          </div>
        )}

        {/* Requests List */}
        {requests.length > 0 && (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.document_type.replace('-', ' ').toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Request ID: {request.request_id}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Student Name</p>
                    <p className="text-gray-900">{request.student_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Program</p>
                    <p className="text-gray-900">{request.program}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Student ID</p>
                    <p className="text-gray-900 font-mono">{request.student_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Year Graduated</p>
                    <p className="text-gray-900">{request.year_graduated}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-600">
                      Submitted on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {request.remarks && (
                    <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded text-sm">
                      {request.remarks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
