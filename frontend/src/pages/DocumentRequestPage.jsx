import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiCheckCircle, FiArrowRight, FiFileText, FiHome, FiCamera, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DocumentRequestPage() {
  const navigate = useNavigate();
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    documentType: 'diploma',
    organization: '', // Institution/Organization name
    fullName: '',
    email: '',
    idNumber: '', // Student ID, Employee ID, Member ID, etc.
    program: '', // Program, Department, Organization, etc.
    yearGraduated: new Date().getFullYear(),
    requirements: [],
    idImage: null,
    purpose: '', // Why requesting
  });
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // All document types from all sectors
  const documentTypes = [
    // Education
    { id: 'diploma', label: 'Diploma', category: 'Education', desc: 'Official graduation diploma' },
    { id: 'tor', label: 'Transcript of Records (TOR)', category: 'Education', desc: 'Academic transcript' },
    { id: 'alumni-id', label: 'Alumni ID', category: 'Education', desc: 'Alumni identification card' },
    { id: 'certificate', label: 'Certificate', category: 'Education', desc: 'Course or achievement certificate' },
    
    // Insurance
    { id: 'id-card', label: 'ID Card', category: 'Insurance', desc: 'Insurance member ID card' },
    { id: 'loa', label: 'Letter of Authority (LOA)', category: 'Insurance', desc: 'Authorization letter' },
    { id: 'insurance-cert', label: 'Insurance Certificate', category: 'Insurance', desc: 'Coverage certificate' },
    
    // Government
    { id: 'permit', label: 'Permit', category: 'Government', desc: 'Official permit' },
    { id: 'gov-cert', label: 'Certificate', category: 'Government', desc: 'Government issued certificate' },
    { id: 'clearance', label: 'Clearance', category: 'Government', desc: 'Official clearance document' },
    
    // Professional
    { id: 'membership-id', label: 'Membership ID', category: 'Professional', desc: 'Professional membership card' },
    { id: 'cpd-cert', label: 'CPD Certificate', category: 'Professional', desc: 'Continuing Professional Development' },
    { id: 'certification', label: 'Certification', category: 'Professional', desc: 'Professional certification' },
    
    // Religious
    { id: 'baptismal', label: 'Baptismal Certificate', category: 'Religious', desc: 'Baptismal certificate' },
    { id: 'marriage-cert', label: 'Marriage Certificate', category: 'Religious', desc: 'Marriage certificate' },
    { id: 'kumpil', label: 'Kumpil', category: 'Religious', desc: 'Marriage information document' },
  ];

  // Group by category
  const groupedTypes = {
    Education: documentTypes.filter(d => d.category === 'Education'),
    Insurance: documentTypes.filter(d => d.category === 'Insurance'),
    Government: documentTypes.filter(d => d.category === 'Government'),
    Professional: documentTypes.filter(d => d.category === 'Professional'),
    Religious: documentTypes.filter(d => d.category === 'Religious'),
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ...files.map(f => ({ file: f, name: f.name, type: 'file' }))]
    }));
    toast.success(`${files.length} file(s) uploaded`);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      toast.error('Could not access camera. Please check permissions.');
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = cameraRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], `id-card-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFormData(prev => ({
          ...prev,
          idImage: { file, preview: canvasRef.current.toDataURL() },
          requirements: [...prev.requirements, { file, name: `ID Card.jpg`, type: 'camera' }]
        }));
        
        stopCamera();
        setShowCamera(false);
        toast.success('ID card photo captured!');
      }, 'image/jpeg', 0.9);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current && cameraRef.current.srcObject) {
      cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.organization.trim()) {
      toast.error('Please enter your organization/institution');
      return;
    }
    if (!formData.idNumber.trim()) {
      toast.error('Please enter your ID number');
      return;
    }
    if (formData.requirements.length === 0) {
      toast.error('Please upload at least one requirement document or take an ID photo');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('organization', formData.organization);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('idNumber', formData.idNumber);
      formDataToSend.append('program', formData.program);
      formDataToSend.append('yearGraduated', formData.yearGraduated);
      formDataToSend.append('purpose', formData.purpose);

      formData.requirements.forEach((req, idx) => {
        formDataToSend.append(`requirement_${idx}`, req.file);
      });

      const res = await fetch('/api/document-requests', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (data.success) {
        setRequestId(data.data.id);
        setStep(3);
        toast.success('Request submitted successfully!');
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Error submitting request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentDocType = documentTypes.find(d => d.id === formData.documentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-signatura-red to-signatura-accent">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Request Digital Document</h1>
            <p className="text-white text-opacity-90 text-sm mt-1">Get your official documents digitally - instantly and securely</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-opacity-80 transition"
          >
            <FiHome className="mr-2" />
            Home
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Select Document' },
              { num: 2, label: 'Fill Details' },
              { num: 3, label: 'Submitted' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-white text-signatura-red'
                      : 'bg-white bg-opacity-20 text-white'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <p
                  className={`ml-3 font-medium ${
                    step >= s.num ? 'text-white' : 'text-white text-opacity-70'
                  }`}
                >
                  {s.label}
                </p>
                {idx < 2 && <div className="flex-1 h-1 mx-4 bg-white bg-opacity-20"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Document Type Selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-signatura-dark mb-2">What Document Do You Need?</h2>
            <p className="text-gray-600 mb-8">Select from any of our 16 document types across all sectors</p>

            {/* Category Tabs */}
            <div className="space-y-8">
              {Object.entries(groupedTypes).map(([category, types]) => (
                <div key={category}>
                  <h3 className="text-lg font-bold text-signatura-dark mb-4">📌 {category}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {types.map(docType => (
                      <button
                        key={docType.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, documentType: docType.id }));
                          setStep(2);
                        }}
                        className={`p-4 rounded-lg border-2 transition text-left hover:shadow-lg ${
                          formData.documentType === docType.id
                            ? 'border-signatura-red bg-red-50 shadow-lg'
                            : 'border-gray-200 hover:border-signatura-red'
                        }`}
                      >
                        <h3 className="font-bold text-gray-900">{docType.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{docType.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-8">
              <p className="text-blue-900 text-sm">
                <strong>📋 Process:</strong> Submit your request with valid ID. Your request will be reviewed and approved within 1-3 business days.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-signatura-dark mb-6">
              Request {currentDocType?.label}
            </h2>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Juan Dela Cruz"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Institution *</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="e.g., University of Manila, BIR, PRC"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      placeholder="Student/Employee/Member ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program/Department/Role</label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor of Science in Computer Science, Engineering Department"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year/Date</label>
                  <input
                    type="number"
                    name="yearGraduated"
                    value={formData.yearGraduated}
                    onChange={handleInputChange}
                    min="1990"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purpose of Request</h3>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Why do you need this document? (Optional)"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-signatura-red outline-none"
                />
              </div>

              {/* ID Photo Capture */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Valid ID Photo *</h3>
                
                {!showCamera && formData.idImage && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-900 font-medium mb-3">✓ ID Photo Captured</p>
                    <img src={formData.idImage.preview} alt="ID Card" className="w-full h-auto rounded max-h-64 object-contain" />
                  </div>
                )}

                {!showCamera && !formData.idImage && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-900 text-sm">📸 Take a photo of your valid ID (passport, SSS, driver's license, etc.)</p>
                  </div>
                )}

                {showCamera && (
                  <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                    <video ref={cameraRef} autoPlay playsInline className="w-full" />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="flex gap-2 p-4 bg-black">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
                      >
                        <FiCamera className="inline mr-2" />
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setShowCamera(false);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!showCamera && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCamera(true);
                      setTimeout(startCamera, 100);
                    }}
                    className="w-full border-2 border-signatura-red text-signatura-red py-3 rounded-lg hover:bg-red-50 transition font-medium flex items-center justify-center"
                  >
                    <FiCamera className="mr-2" />
                    {formData.idImage ? 'Retake Photo' : 'Take ID Photo'}
                  </button>
                )}
              </div>

              {/* File Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents (Optional)</h3>
                <div className="border-2 border-dashed border-signatura-red rounded-lg p-6 text-center bg-red-50">
                  <FiUpload className="w-12 h-12 text-signatura-red mx-auto mb-3" />
                  <p className="text-gray-900 font-medium mb-2">Upload additional documents</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Birth certificate, proof of enrollment, or other requirements
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="inline-block bg-signatura-red text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-signatura-accent transition"
                  >
                    Choose Files
                  </label>
                </div>

                {formData.requirements.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({formData.requirements.length})</h4>
                    <div className="space-y-2">
                      {formData.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <FiFileText className="w-5 h-5 text-signatura-red mr-2" />
                            <span className="text-gray-900 text-sm">{req.name}</span>
                            {req.type === 'camera' && <span className="ml-2 text-xs text-blue-600">(Camera)</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 mr-3" />
                  <span className="text-gray-700 text-sm">
                    I confirm that all information provided is accurate. I authorize the organization to verify my details and issue my digital document.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-signatura-red text-signatura-red px-6 py-3 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-signatura-red text-white px-6 py-3 rounded-lg hover:bg-signatura-accent transition font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                  {!loading && <FiArrowRight className="ml-2" />}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <FiCheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-signatura-dark mb-3">Request Submitted! ✓</h2>
            <p className="text-gray-600 text-lg mb-8">
              Your document request has been successfully submitted and is now under review.
            </p>

            {requestId && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
                <p className="text-green-900 text-sm font-medium mb-2">Request Reference ID</p>
                <p className="text-3xl font-bold text-green-600 font-mono">{requestId}</p>
                <p className="text-green-800 text-sm mt-2">Save this ID to track your request</p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">⏱️ Expected Timeline</h3>
              <div className="space-y-4">
                {[
                  { time: 'Now', title: 'Request Submitted', desc: 'Your request received and encrypted' },
                  { time: '12-24 hours', title: 'Under Review', desc: 'Organization verifies your documents' },
                  { time: '1-3 days', title: 'Approved & Signed', desc: 'Digital signature applied' },
                  { time: 'Instant', title: 'Ready to Use', desc: 'Share or verify anytime' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-signatura-red text-white flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                      {idx < 3 && <div className="w-1 h-12 bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                      <p className="text-xs text-signatura-red font-semibold mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <button
                onClick={() => {
                  setStep(1);
                  setFormData({
                    documentType: 'diploma',
                    organization: '',
                    fullName: '',
                    email: '',
                    idNumber: '',
                    program: '',
                    yearGraduated: new Date().getFullYear(),
                    requirements: [],
                    idImage: null,
                    purpose: '',
                  });
                  setRequestId(null);
                }}
                className="flex-1 border-2 border-signatura-red text-signatura-red px-6 py-3 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => navigate('/track-request')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Track Your Request
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-signatura-red text-white px-6 py-3 rounded-lg hover:bg-signatura-accent transition font-medium"
              >
                Go Home
              </button>
            </div>

            {/* Info Card */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left">
              <p className="text-blue-900 text-sm">
                <strong>📧 Confirmation Email:</strong> A confirmation has been sent to <span className="font-mono font-bold">{formData.email}</span> with your request reference ID and next steps.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
