import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiX, FiLogOut, FiPlus, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi';

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
  const [showAddIssuerModal, setShowAddIssuerModal] = useState(false);
  const [businessType, setBusinessType] = useState('corporation');
  const [logoPreview, setLogoPreview] = useState(null);
  const [generatedSignaturaId, setGeneratedSignaturaId] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessType: 'corporation',
    registeredName: '',
    tinNumber: '',
    registeredAddress: '',
    businessLastName: '',
    proprietorFirstName: '',
    proprietorMiddleName: '',
    proprietorLastName: '',
    proprietorAddress: '',
    proprietorTin: '',
    personFirstName: '',
    personMiddleName: '',
    personLastName: '',
    personEmail: '',
    personViber: '',
    personPhone: '',
    logoFile: null,
  });

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
      
      // Fetch issuers
      const issuersRes = await fetch('/api/users?role=issuer');
      const issuersData = await issuersRes.json();
      
      if (issuersData.success) {
        const issuersList = issuersData.data || [];
        setIssuers(issuersList);
        setStats({
          totalIssuers: issuersList.length,
          totalSubscribers: issuersList.reduce((sum, i) => sum + (i.subscriber_count || 0), 0),
          totalDocuments: issuersList.reduce((sum, i) => sum + (i.document_count || 0), 0),
          totalIssued: issuersList.reduce((sum, i) => sum + (i.issued_count || 0), 0),
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateSignaturaId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `SIG-${timestamp}-${random}`;
  };

  const handleOpenAddIssuerModal = () => {
    const newId = generateSignaturaId();
    setGeneratedSignaturaId(newId);
    setFormData({
      businessType: 'corporation',
      registeredName: '',
      tinNumber: '',
      registeredAddress: '',
      businessLastName: '',
      proprietorFirstName: '',
      proprietorMiddleName: '',
      proprietorLastName: '',
      proprietorAddress: '',
      proprietorTin: '',
      personFirstName: '',
      personMiddleName: '',
      personLastName: '',
      personEmail: '',
      personViber: '',
      personPhone: '',
      logoFile: null,
    });
    setBusinessType('corporation');
    setLogoPreview(null);
    setShowPassword(false);
    setShowAddIssuerModal(true);
  };

  const handleCloseModal = () => {
    setShowAddIssuerModal(false);
    setLogoPreview(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'businessType') {
      setBusinessType(value);
      setFormData({ ...formData, businessType: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({ ...formData, logoFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateIssuerAccount = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.registeredName.trim()) {
      toast.error('Registered name is required');
      return;
    }

    if (!formData.tinNumber.trim()) {
      toast.error('TIN number is required');
      return;
    }

    if (!formData.registeredAddress.trim()) {
      toast.error('Registered address is required');
      return;
    }

    if (businessType === 'sole_proprietor') {
      if (!formData.proprietorFirstName.trim() || !formData.proprietorLastName.trim()) {
        toast.error('Proprietor first and last name are required');
        return;
      }
    }

    if (!formData.personFirstName.trim() || !formData.personLastName.trim()) {
      toast.error('Authorized personnel first and last name are required');
      return;
    }

    if (!formData.personEmail.trim()) {
      toast.error('Authorized personnel email is required');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare logo base64 if exists
      let logoBase64 = null;
      if (formData.logoFile) {
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(formData.logoFile);
        });
      }

      // Generate password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();

      // Create issuer account
      const payload = {
        endpoint: 'create-issuer',
        businessType: formData.businessType,
        organizationName: formData.registeredName,
        tinNumber: formData.tinNumber,
        address: formData.registeredAddress,
        businessLastName: formData.businessLastName,
        proprietorFirstName: formData.proprietorFirstName,
        proprietorMiddleName: formData.proprietorMiddleName,
        proprietorLastName: formData.proprietorLastName,
        proprietorAddress: formData.proprietorAddress,
        proprietorTin: formData.proprietorTin,
        personFirstName: formData.personFirstName,
        personMiddleName: formData.personMiddleName,
        personLastName: formData.personLastName,
        personEmail: formData.personEmail,
        personViber: formData.personViber,
        personPhone: formData.personPhone,
        signaturaid: generatedSignaturaId,
        tempPassword: tempPassword,
        logoBase64: logoBase64,
      };

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('✅ Issuer account created successfully!');
        toast.success(`📧 Login credentials sent to ${formData.personEmail}`);
        
        // Refresh issuers list
        fetchData();
        
        // Close modal
        handleCloseModal();
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Error creating issuer:', err);
      toast.error('Error creating account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
    toast.success('Logged out!');
  };

  if (loading && issuers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🔐 ADMIN PORTAL</h1>
            <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Document Issuers - Orange */}
          <div className="bg-white rounded-xl border-4 border-orange-400 p-8 shadow-md hover:shadow-lg transition">
            <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Document Issuers</h3>
            <p className="text-5xl font-bold text-orange-600 mt-3">{stats.totalIssuers}</p>
            <button className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">
              VIEW
            </button>
          </div>

          {/* Subscribers - Green */}
          <div className="bg-white rounded-xl border-4 border-green-400 p-8 shadow-md hover:shadow-lg transition">
            <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Subscribers</h3>
            <p className="text-5xl font-bold text-green-600 mt-3">{stats.totalSubscribers}</p>
            <button className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">
              VIEW
            </button>
          </div>

          {/* Documents - Purple */}
          <div className="bg-white rounded-xl border-4 border-purple-400 p-8 shadow-md hover:shadow-lg transition">
            <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Documents</h3>
            <p className="text-5xl font-bold text-purple-600 mt-3">{stats.totalDocuments}</p>
            <button className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">
              VIEW
            </button>
          </div>

          {/* Issued Documents - Blue */}
          <div className="bg-white rounded-xl border-4 border-blue-400 p-8 shadow-md hover:shadow-lg transition">
            <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Issued Documents</h3>
            <p className="text-5xl font-bold text-blue-600 mt-3">{stats.totalIssued.toLocaleString()}</p>
            <button className="mt-6 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">
              VIEW
            </button>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAddIssuerModal}
          className="mb-8 px-8 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2 text-lg shadow-md hover:shadow-lg"
        >
          <FiPlus /> ADD DOCUMENT ISSUER
        </button>

        {/* Issuers Table - Desktop View */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hidden md:block">
          <div className="px-8 py-6 border-b-4 border-blue-900 bg-blue-900 text-white">
            <h2 className="text-2xl font-bold">LIST OF DOCUMENT ISSUERS</h2>
          </div>

          {issuers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No issuers added yet. Click "ADD DOCUMENT ISSUER" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase">SIGNATURA ID</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase">REGISTERED NAME</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase">ADDRESS</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase">DIGITAL DOCUMENTS</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {issuers.map((issuer) => (
                    <tr key={issuer.id} className="hover:bg-gray-50 transition">
                      <td className="px-8 py-5 text-sm font-mono font-bold text-gray-900">{issuer.signatura_id || 'N/A'}</td>
                      <td className="px-8 py-5 text-sm text-gray-900 font-semibold">{issuer.organization_name}</td>
                      <td className="px-8 py-5 text-sm text-gray-600">{issuer.address || 'N/A'}</td>
                      <td className="px-8 py-5 text-sm text-gray-600 font-semibold">{issuer.document_count || 0}</td>
                      <td className="px-8 py-5 text-sm flex gap-2">
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition">
                          UPDATE
                        </button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition">
                          ADD DOCUMENT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Issuers Cards - Mobile View */}
        <div className="md:hidden space-y-4">
          {issuers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No issuers added yet. Click "ADD DOCUMENT ISSUER" to create one.</p>
            </div>
          ) : (
            issuers.map((issuer) => (
              <div key={issuer.id} className="bg-white rounded-lg border-2 border-gray-300 p-4 shadow">
                <div className="font-bold text-gray-900">{issuer.signatura_id}</div>
                <div className="text-sm text-gray-600 mt-1">{issuer.organization_name}</div>
                <div className="text-sm text-gray-600 mt-1">{issuer.address || 'N/A'}</div>
                <div className="text-sm font-semibold text-gray-900 mt-2">Docs: {issuer.document_count || 0}</div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600">
                    UPDATE
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600">
                    ADD DOC
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Issuer Modal */}
      {showAddIssuerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-purple-600 text-white px-8 py-6 flex justify-between items-center border-b-4 border-purple-800">
              <h2 className="text-2xl font-bold uppercase tracking-wide">ADD DOCUMENT ISSUER</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-purple-700 rounded transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateIssuerAccount} className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Business Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 uppercase border-b-2 border-gray-300 pb-2">Business Information</h3>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Business Type *</label>
                      <select
                        name="businessType"
                        value={businessType}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none bg-white font-semibold"
                      >
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                        <option value="sole_proprietor">Sole Proprietor</option>
                      </select>
                      <p className="text-xs text-red-600 mt-1 font-semibold">Dropdown: Corporation, Partnership, Sole Proprietor</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Registered Name *</label>
                      <input
                        type="text"
                        name="registeredName"
                        value={formData.registeredName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">TIN Number *</label>
                      <input
                        type="text"
                        name="tinNumber"
                        value={formData.tinNumber}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Registered Address *</label>
                      <input
                        type="text"
                        name="registeredAddress"
                        value={formData.registeredAddress}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        required
                      />
                    </div>

                    {businessType !== 'sole_proprietor' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="businessLastName"
                          value={formData.businessLastName}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sole Proprietor Data (Conditional) */}
                  {businessType === 'sole_proprietor' && (
                    <div className="space-y-4 border-l-4 border-red-600 pl-4 py-4">
                      <h3 className="text-lg font-bold text-gray-900 uppercase">Sole Proprietor Data</h3>
                      <p className="text-xs text-red-600 font-semibold">*These fields will only appear if dropdown is sole proprietor</p>

                      <input
                        type="text"
                        name="proprietorFirstName"
                        placeholder="First Name *"
                        value={formData.proprietorFirstName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        required
                      />

                      <input
                        type="text"
                        name="proprietorMiddleName"
                        placeholder="Middle Name"
                        value={formData.proprietorMiddleName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                      />

                      <input
                        type="text"
                        name="proprietorLastName"
                        placeholder="Last Name *"
                        value={formData.proprietorLastName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                        required
                      />

                      <input
                        type="text"
                        name="proprietorAddress"
                        placeholder="Address"
                        value={formData.proprietorAddress}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                      />

                      <input
                        type="text"
                        name="proprietorTin"
                        placeholder="TIN Number"
                        value={formData.proprietorTin}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Logo Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 uppercase border-b-2 border-gray-300 pb-2">Business Logo</h3>

                    <div className="flex gap-4 items-start">
                      {logoPreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="h-24 w-24 object-contain border-2 border-gray-400 rounded p-2 bg-gray-50"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <span className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer transition flex items-center gap-2 w-fit">
                            <FiUpload /> Add Logo
                          </span>
                        </label>
                        <p className="text-xs text-gray-600 mt-2">Max: 5MB (JPG, PNG)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Authorized Personnel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 uppercase border-b-2 border-gray-300 pb-2">Authorized Personnel</h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="personFirstName"
                        value={formData.personFirstName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        name="personMiddleName"
                        value={formData.personMiddleName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="personLastName"
                        value={formData.personLastName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="personEmail"
                        value={formData.personEmail}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Viber #</label>
                      <input
                        type="text"
                        name="personViber"
                        value={formData.personViber}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Handphone #</label>
                      <input
                        type="text"
                        name="personPhone"
                        value={formData.personPhone}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded focus:border-purple-600 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* LOG-IN CREDENTIALS */}
                  <div className="bg-gray-100 rounded-lg p-6 space-y-4 border-2 border-gray-400">
                    <h3 className="text-lg font-bold text-gray-900 uppercase">LOG-IN CREDENTIALS</h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">SIGNATURA ID</label>
                      <input
                        type="text"
                        value={generatedSignaturaId}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded bg-gray-200 cursor-not-allowed font-mono font-bold"
                      />
                      <p className="text-xs text-red-600 mt-2 font-semibold">SIGNATURA ID is system generated</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-xs text-yellow-800 font-semibold">
                  ⚠️ After create issuer button - save to database and send login credential to authorized personnel email address
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-8 border-t-2 border-gray-300">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating Account...' : 'Create Issuer Account'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-bold text-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
